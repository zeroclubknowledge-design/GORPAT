-- =====================================================================
-- Gorpat — migration 002: head admin + per-section access control
-- Run AFTER schema.sql, once, in Supabase → SQL Editor. Safe to re-run.
--
-- After running it, make yourself head admin (replace the email):
--   select public.make_head_admin('you@example.com');
--
-- Model
--   * Exactly one HEAD ADMIN (role 'Owner'): full access, approves new admins,
--     sets each admin's access, manages settings.
--   * Every other account is an ADMIN (role 'Staff') with its own access map:
--       { "<section>": "none" | "view" | "edit", ... }
--     sections: clients, enquiries, procurement, invoices, quotations,
--               expenses, payments, vendors, reports
--   * New sign-ups are 'Pending' (no access) until the head admin approves them.
--   * 'Disabled' removes all access.
-- =====================================================================

-- ---------- private config (head admin email lives here, not in code) ----------
create table if not exists public.app_config (key text primary key, value text not null);
alter table public.app_config enable row level security;   -- no policies: not readable through the API
revoke all on public.app_config from anon, authenticated;

-- ---------- staff: access map + new role set ----------
alter table public.staff add column if not exists access jsonb not null default '{}'::jsonb;

do $$
declare c text;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.staff'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.staff drop constraint %I', c);
  end loop;
end $$;

-- convert the old fixed roles into the new per-section access
update public.staff set role = 'Staff', access = '{"clients":"edit","enquiries":"edit","procurement":"edit","vendors":"edit","quotations":"edit","invoices":"view"}'::jsonb
  where role = 'Procurement';
update public.staff set role = 'Staff', access = '{"clients":"edit","enquiries":"view","procurement":"view","vendors":"view","quotations":"edit","invoices":"edit","payments":"edit","expenses":"edit","reports":"view"}'::jsonb
  where role = 'Finance';

alter table public.staff add constraint staff_role_check check (role in ('Owner', 'Staff', 'Pending', 'Disabled'));

-- if several Owners exist from before, keep the earliest as head, the rest become full-access admins
update public.staff s set role = 'Staff',
  access = '{"clients":"edit","enquiries":"edit","procurement":"edit","invoices":"edit","quotations":"edit","expenses":"edit","payments":"edit","vendors":"edit","reports":"view"}'::jsonb
where s.role = 'Owner'
  and s.id <> (select id from public.staff where role = 'Owner' order by created_at limit 1);

create unique index if not exists staff_one_head on public.staff ((true)) where role = 'Owner';

-- ---------- access helpers ----------
create or replace function public._lvl(a jsonb, k text) returns int
language sql immutable as $$
  select case coalesce(a->>k, 'none') when 'edit' then 2 when 'view' then 1 else 0 end
$$;

create or replace function public.can_read(c text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare r text; a jsonb;
begin
  select role, access into r, a from public.staff where id = auth.uid();
  if r = 'Owner' then return true; end if;
  if r is distinct from 'Staff' then return false; end if;
  return public._lvl(a, c) >= 1
    -- records a section needs to display properly
    or (c = 'clients'  and greatest(public._lvl(a,'invoices'), public._lvl(a,'quotations'), public._lvl(a,'procurement'), public._lvl(a,'payments')) >= 1)
    or (c = 'vendors'  and greatest(public._lvl(a,'procurement'), public._lvl(a,'expenses')) >= 1)
    or (c = 'invoices' and greatest(public._lvl(a,'payments'), public._lvl(a,'reports')) >= 1)
    or (c in ('payments', 'expenses') and public._lvl(a,'reports') >= 1);
end $$;

create or replace function public.can_write(c text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare r text; a jsonb;
begin
  select role, access into r, a from public.staff where id = auth.uid();
  if r = 'Owner' then return true; end if;
  return r = 'Staff' and public._lvl(a, c) = 2;
end $$;

-- settings readable by any approved account, editable by head admin only
drop policy if exists settings_select on public.settings;
create policy settings_select on public.settings for select to authenticated
  using (public.my_role() in ('Owner', 'Staff'));

-- ---------- new sign-ups ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare head_email text;
begin
  perform pg_advisory_xact_lock(7340001);
  select value into head_email from public.app_config where key = 'head_admin_email';
  if head_email is not null and lower(new.email) = lower(head_email) then
    update public.staff set role = 'Staff',
      access = '{"clients":"edit","enquiries":"edit","procurement":"edit","invoices":"edit","quotations":"edit","expenses":"edit","payments":"edit","vendors":"edit","reports":"view"}'::jsonb
      where role = 'Owner';
    insert into public.staff (id, name, email, role)
    values (new.id, left(coalesce(new.raw_user_meta_data->>'name', ''), 120), new.email, 'Owner')
    on conflict (id) do update set role = 'Owner';
  else
    insert into public.staff (id, name, email, role)
    values (new.id, left(coalesce(new.raw_user_meta_data->>'name', ''), 120), new.email,
            case when exists (select 1 from public.staff) then 'Pending' else 'Owner' end)
    on conflict (id) do nothing;
  end if;
  return new;
end $$;

-- ---------- guard: the head admin role can't be given away or removed from the app ----------
create or replace function public.staff_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.id := old.id; new.created_at := old.created_at;
    if current_user in ('anon', 'authenticated') then
      new.email := old.email;
      if old.role = 'Owner' and new.role <> 'Owner' then
        raise exception 'The head admin role can only be transferred with make_head_admin() in the SQL Editor' using errcode = 'P0001';
      end if;
      if new.role = 'Owner' and old.role <> 'Owner' then
        raise exception 'There can only be one head admin' using errcode = 'P0001';
      end if;
    end if;
    -- keep the access map tidy: only known sections and levels
    new.access := coalesce((
      select jsonb_object_agg(k, v) from jsonb_each_text(coalesce(new.access, '{}'::jsonb)) as e(k, v)
      where k in ('clients','enquiries','procurement','invoices','quotations','expenses','payments','vendors','reports')
        and v in ('none','view','edit')), '{}'::jsonb);
  end if;
  return new;
end $$;

-- ---------- make / transfer the head admin (SQL Editor only) ----------
create or replace function public.make_head_admin(p_email text) returns text
language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  insert into public.app_config (key, value) values ('head_admin_email', lower(trim(p_email)))
    on conflict (key) do update set value = excluded.value;
  select id into target from public.staff where lower(email) = lower(trim(p_email));
  if target is null then
    return 'Saved. No account with that email yet: it becomes head admin automatically when it signs up.';
  end if;
  update public.staff set role = 'Staff',
    access = '{"clients":"edit","enquiries":"edit","procurement":"edit","invoices":"edit","quotations":"edit","expenses":"edit","payments":"edit","vendors":"edit","reports":"view"}'::jsonb
    where role = 'Owner' and id <> target;
  update public.staff set role = 'Owner' where id = target;
  return 'Done. ' || p_email || ' is now the head admin.';
end $$;

-- ---------- head admin: number of accounts waiting for approval ----------
-- (head admin can already read all staff rows; this is just a convenience)

-- ---------- function permissions ----------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.submit_quote(jsonb), public.submit_enquiry(jsonb), public.needs_setup() to anon, authenticated;
grant execute on function public.my_role(), public.can_read(text), public.can_write(text), public.clear_records() to authenticated;
-- make_head_admin is intentionally NOT granted: only the SQL Editor (database owner) can run it.
