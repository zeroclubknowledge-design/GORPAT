-- =====================================================================
-- Gorpat Trading Limited — Supabase schema
-- Run once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: it only creates what is missing and replaces functions.
--
-- Security model
--   * The website uses the public "anon" key. Anonymous visitors can ONLY
--     call submit_quote() and submit_enquiry() (validated, rate limited).
--   * Staff sign in with Supabase Auth (email + password).
--   * The FIRST account created becomes Owner. Every later sign-up is
--     "Pending" with no access until the Owner gives it a role.
--   * Row Level Security enforces each role's access in the database.
-- =====================================================================

-- ---------- staff profiles & roles ----------
create table if not exists public.staff (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  role text not null default 'Pending'
    check (role in ('Owner', 'Procurement', 'Finance', 'Pending', 'Disabled')),
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.staff where id = auth.uid()
$$;

create or replace function public.can_read(c text) returns boolean
language sql stable as $$
  select case public.my_role()
    when 'Owner' then true
    when 'Procurement' then c in ('clients','vendors','invoices','quotations','procurement','enquiries')
    when 'Finance' then c in ('clients','vendors','invoices','quotations','procurement','payments','expenses','enquiries')
    else false end
$$;

create or replace function public.can_write(c text) returns boolean
language sql stable as $$
  select case public.my_role()
    when 'Owner' then true
    when 'Procurement' then c in ('clients','vendors','quotations','procurement','enquiries')
    when 'Finance' then c in ('clients','invoices','quotations','payments','expenses')
    else false end
$$;

-- new auth user → staff profile (first ever = Owner, the rest Pending)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(7340001);
  insert into public.staff (id, name, email, role)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'name', ''), 120), new.email,
          case when exists (select 1 from public.staff) then 'Pending' else 'Owner' end)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep email in sync if a user changes it
create or replace function public.handle_user_email() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.staff set email = new.email where id = new.id;
  return new;
end $$;
drop trigger if exists on_auth_user_email on auth.users;
create trigger on_auth_user_email after update of email on auth.users
  for each row execute function public.handle_user_email();

-- guard: Owner-only role changes, never zero Owners
-- runs with the caller's rights: API users can't change id/email/created_at,
-- while the email-sync trigger (database owner) can update email.
create or replace function public.staff_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.id := old.id; new.created_at := old.created_at;
    if current_user in ('anon', 'authenticated') then new.email := old.email; end if;
    if old.role = 'Owner' and new.role <> 'Owner'
       and (select count(*) from public.staff where role = 'Owner') <= 1 then
      raise exception 'There must be at least one Owner' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists staff_guard on public.staff;
create trigger staff_guard before update on public.staff
  for each row execute function public.staff_guard();

drop policy if exists staff_select on public.staff;
create policy staff_select on public.staff for select to authenticated
  using (id = auth.uid() or public.my_role() = 'Owner');
drop policy if exists staff_update on public.staff;
create policy staff_update on public.staff for update to authenticated
  using (public.my_role() = 'Owner') with check (public.my_role() = 'Owner');
revoke insert, delete on public.staff from anon, authenticated;
revoke all on public.staff from anon;

-- ---------- settings ----------
create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);
alter table public.settings enable row level security;
insert into public.settings (key, value) values ('settings', '{
  "currency": "NGN", "taxRate": 7.5, "invoicePrefix": "GT-INV-", "quotePrefix": "GT-QT-",
  "bank": {"name": "Bank name", "account": "Account name — Gorpat Trading Limited", "number": "0000000000"},
  "defaultNotes": "Thank you for choosing Gorpat Trading Limited."
}'::jsonb) on conflict (key) do nothing;

drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings for select to authenticated
  using (public.my_role() in ('Owner', 'Procurement', 'Finance'));
drop policy if exists settings_update on public.settings;
create policy settings_update on public.settings for update to authenticated
  using (public.my_role() = 'Owner') with check (public.my_role() = 'Owner');
revoke all on public.settings from anon;
revoke insert, delete on public.settings from authenticated;

-- ---------- business records ----------
-- One table, one row per record; "col" is the collection
-- (clients, vendors, invoices, quotations, procurement, payments, expenses, enquiries).
create table if not exists public.records (
  col text not null check (col in ('clients','vendors','invoices','quotations','procurement','payments','expenses','enquiries')),
  id text not null check (id ~ '^[a-z]{2}_[A-Za-z0-9]{1,40}$'),
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) < 200000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_by uuid default auth.uid(),
  primary key (col, id)
);
create index if not exists records_col_created on public.records (col, created_at desc);
alter table public.records enable row level security;

drop policy if exists rec_select on public.records;
create policy rec_select on public.records for select to authenticated using (public.can_read(col));
drop policy if exists rec_insert on public.records;
create policy rec_insert on public.records for insert to authenticated with check (public.can_write(col));
drop policy if exists rec_update on public.records;
create policy rec_update on public.records for update to authenticated
  using (public.can_write(col)) with check (public.can_write(col));
drop policy if exists rec_delete on public.records;
create policy rec_delete on public.records for delete to authenticated using (public.can_write(col));
revoke all on public.records from anon;

-- numbering, consistency and validation
create or replace function public.records_before() returns trigger
language plpgsql security definer set search_path = public as $$
declare s jsonb; prefix text; n bigint;
begin
  new.data := jsonb_set(new.data, '{id}', to_jsonb(new.id));
  if tg_op = 'UPDATE' then
    new.col := old.col; new.id := old.id;
    new.created_at := old.created_at; new.created_by := old.created_by;
    new.updated_at := now(); new.updated_by := auth.uid();
  end if;

  if new.col in ('invoices', 'quotations') then
    perform pg_advisory_xact_lock(hashtext('gt_number_' || new.col));
    if tg_op = 'INSERT' and (coalesce(new.data->>'number', '') = ''
        or exists (select 1 from public.records where col = new.col and data->>'number' = new.data->>'number')) then
      select value into s from public.settings where key = 'settings';
      prefix := case when new.col = 'quotations' then coalesce(s->>'quotePrefix', 'GT-QT-') else coalesce(s->>'invoicePrefix', 'GT-INV-') end;
      select coalesce(max(nullif(left(regexp_replace(data->>'number', '\D', '', 'g'), 15), '')::bigint), 0) + 1
        into n from public.records where col = new.col;
      new.data := jsonb_set(new.data, '{number}', to_jsonb(prefix || lpad(n::text, 4, '0')));
    elsif tg_op = 'UPDATE' and exists (select 1 from public.records
        where col = new.col and id <> new.id and data->>'number' = new.data->>'number') then
      raise exception 'Number % is already used', new.data->>'number' using errcode = 'P0001';
    end if;
  end if;

  if new.col = 'payments' and not exists (
      select 1 from public.records where col = 'invoices' and id = new.data->>'invoiceId') then
    raise exception 'Payment must belong to an existing invoice' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists records_before on public.records;
create trigger records_before before insert or update on public.records
  for each row execute function public.records_before();

-- deleting an invoice deletes its payments
create or replace function public.records_after_delete() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.col = 'invoices' then
    delete from public.records where col = 'payments' and data->>'invoiceId' = old.id;
  end if;
  return old;
end $$;
drop trigger if exists records_after_delete on public.records;
create trigger records_after_delete after delete on public.records
  for each row execute function public.records_after_delete();

-- ---------- audit log (Owner can read) ----------
create table if not exists public.audit (
  at timestamptz not null default now(),
  user_id uuid,
  action text not null,
  col text,
  rec_id text
);
alter table public.audit enable row level security;
drop policy if exists audit_select on public.audit;
create policy audit_select on public.audit for select to authenticated using (public.my_role() = 'Owner');
revoke all on public.audit from anon;
revoke insert, update, delete on public.audit from authenticated;

create or replace function public.records_audit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit (user_id, action, col, rec_id)
  values (auth.uid(), lower(tg_op), coalesce(new.col, old.col), coalesce(new.id, old.id));
  return null;
end $$;
drop trigger if exists records_audit on public.records;
create trigger records_audit after insert or update or delete on public.records
  for each row execute function public.records_audit();

-- ---------- public website submissions ----------
create table if not exists public.rate_hits (key text not null, at timestamptz not null default now());
create index if not exists rate_hits_key_at on public.rate_hits (key, at);
alter table public.rate_hits enable row level security;          -- no policies: nobody can read/write directly
revoke all on public.rate_hits from anon, authenticated;

create or replace function public._client_ip() returns text
language sql stable as $$
  select coalesce(nullif(trim(split_part(
    coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1)), ''), 'unknown')
$$;

create or replace function public._rate_limit(bucket text, max_hits int, win interval) returns void
language plpgsql security definer set search_path = public as $$
declare k text := bucket || ':' || public._client_ip();
begin
  delete from public.rate_hits where at < now() - interval '1 day';
  if (select count(*) from public.rate_hits where key = k and at > now() - win) >= max_hits then
    raise exception 'Too many submissions. Please try again later or call us.' using errcode = 'P0001';
  end if;
  insert into public.rate_hits (key) values (k);
end $$;

create or replace function public._txt(v text, maxlen int) returns text
language sql immutable as $$ select left(trim(coalesce(v, '')), maxlen) $$;

create or replace function public.submit_quote(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_name text := public._txt(p->>'name', 120);
  v_email text := lower(public._txt(p->>'email', 200));
  v_phone text := public._txt(p->>'phone', 40);
  v_city text := public._txt(p->>'city', 120);
  v_cat text := public._txt(p->>'category', 80);
  v_cond text := coalesce(nullif(public._txt(p->>'condition', 40), ''), 'New');
  v_item text := public._txt(p->>'item', 1000);
  v_qty int;
  s jsonb;
begin
  if public._txt(p->>'website', 10) <> '' then return; end if;  -- honeypot
  if v_name = '' or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    raise exception 'Please enter your name and a valid email.' using errcode = 'P0001';
  end if;
  if v_item = '' or v_cat = '' or v_phone = '' then
    raise exception 'Please fill in the item, category and phone number.' using errcode = 'P0001';
  end if;
  v_qty := greatest(1, least(1000000, coalesce(nullif(regexp_replace(coalesce(p->>'qty', '1'), '\D', '', 'g'), '')::bigint, 1)))::int;
  perform public._rate_limit('pub', 8, interval '1 hour');
  select value into s from public.settings where key = 'settings';
  insert into public.records (col, id, data, created_by, updated_by) values ('quotations', 'qt_' || substr(md5(gen_random_uuid()::text), 1, 16),
    jsonb_build_object(
      'number', '', 'clientId', '', 'date', to_char(now() at time zone 'Africa/Lagos', 'YYYY-MM-DD'),
      'terms', 'Valid 30 days', 'status', 'Request', 'source', 'Website',
      'request', jsonb_build_object('name', v_name, 'email', v_email, 'phone', v_phone, 'city', v_city,
                                    'category', v_cat, 'condition', v_cond, 'qty', v_qty::text, 'item', v_item),
      'items', jsonb_build_array(jsonb_build_object('desc', v_item || ' (' || v_cat || ', ' || v_cond || ')', 'qty', v_qty, 'rate', 0)),
      'discount', jsonb_build_object('type', 'percent', 'value', 0),
      'taxOn', true, 'taxRate', coalesce((s->>'taxRate')::numeric, 7.5), 'notes', ''), null, null);
end $$;

create or replace function public.submit_enquiry(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_name text := public._txt(p->>'name', 120);
  v_email text := lower(public._txt(p->>'email', 200));
  v_msg text := public._txt(p->>'message', 4000);
begin
  if public._txt(p->>'website', 10) <> '' then return; end if;  -- honeypot
  if v_name = '' or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    raise exception 'Please enter your name and a valid email.' using errcode = 'P0001';
  end if;
  if v_msg = '' then raise exception 'Please write a message.' using errcode = 'P0001'; end if;
  perform public._rate_limit('pub', 8, interval '1 hour');
  insert into public.records (col, id, data, created_by, updated_by) values ('enquiries', 'en_' || substr(md5(gen_random_uuid()::text), 1, 16),
    jsonb_build_object('name', v_name, 'email', v_email, 'phone', public._txt(p->>'phone', 40),
      'subject', public._txt(p->>'subject', 200), 'message', v_msg,
      'date', to_char(now() at time zone 'Africa/Lagos', 'YYYY-MM-DD'), 'status', 'New'), null, null);
end $$;

-- does the admin still need its first (Owner) account?
create or replace function public.needs_setup() returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.staff)
$$;

-- Owner: wipe all business records (staff and settings are kept)
create or replace function public.clear_records() returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.my_role() is distinct from 'Owner' then
    raise exception 'Only the Owner can do this' using errcode = '42501';
  end if;
  delete from public.records where true;
end $$;

-- function permissions: lock everything down, then open only what is needed
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.submit_quote(jsonb), public.submit_enquiry(jsonb), public.needs_setup() to anon, authenticated;
grant execute on function public.my_role(), public.can_read(text), public.can_write(text), public.clear_records() to authenticated;

-- ---------------------------------------------------------------------
-- Recovery: if the wrong account ever ends up as Owner, run (with your email):
--   update public.staff set role = 'Owner' where email = 'you@example.com';
-- ---------------------------------------------------------------------
