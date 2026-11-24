-- =====================================================================
-- Gorpat — migration 003: operations modules
-- Run AFTER 002_head_admin_access.sql, once, in Supabase → SQL Editor. Safe to re-run.
--
-- Adds record types for: Pipeline (deals), Returns & credit notes, Warehouses,
-- Stock & batches, Transfers, Deliveries, Drivers & routes, Cost ledger,
-- Staff (employees), Attendance and Payroll — and lets the head admin grant
-- each of them per admin (No access / View / Edit) like the existing sections.
-- P&L, Cash flow and VAT summary are calculated pages under the "Reports" section.
-- =====================================================================

-- 1. allow the new record types
alter table public.records drop constraint if exists records_col_check;
alter table public.records add constraint records_col_check check (col in (
  'clients','vendors','invoices','quotations','procurement','payments','expenses','enquiries',
  'deals','returns','credit_notes','warehouses','stock','transfers','deliveries','drivers',
  'cost_ledger','employees','attendance','payroll'));

-- 2. which access section controls each record type
create or replace function public._sec(c text) returns text
language sql immutable as $$
  select case c when 'credit_notes' then 'returns' else c end
$$;

-- 3. read / write rules (head admin = everything; admins = their access map)
create or replace function public.can_read(c text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare r text; a jsonb;
begin
  select role, access into r, a from public.staff where id = auth.uid();
  if r = 'Owner' then return true; end if;
  if r is distinct from 'Staff' then return false; end if;
  return public._lvl(a, public._sec(c)) >= 1
    -- records another section needs in order to display properly
    or (c = 'clients' and greatest(public._lvl(a,'invoices'), public._lvl(a,'quotations'), public._lvl(a,'procurement'),
                                   public._lvl(a,'payments'), public._lvl(a,'returns'), public._lvl(a,'deliveries'), public._lvl(a,'deals')) >= 1)
    or (c = 'vendors' and greatest(public._lvl(a,'procurement'), public._lvl(a,'expenses'), public._lvl(a,'stock'), public._lvl(a,'cost_ledger')) >= 1)
    or (c in ('invoices', 'credit_notes') and greatest(public._lvl(a,'invoices'), public._lvl(a,'payments'), public._lvl(a,'reports'),
                                                     public._lvl(a,'returns'), public._lvl(a,'deliveries')) >= 1)
    or (c in ('payments', 'expenses', 'procurement', 'payroll') and public._lvl(a,'reports') >= 1)
    or (c = 'warehouses' and greatest(public._lvl(a,'stock'), public._lvl(a,'transfers')) >= 1)
    or (c = 'stock' and public._lvl(a,'warehouses') >= 1)
    or (c = 'drivers' and public._lvl(a,'deliveries') >= 1)
    or (c = 'employees' and greatest(public._lvl(a,'attendance'), public._lvl(a,'payroll')) >= 1);
end $$;

create or replace function public.can_write(c text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare r text; a jsonb;
begin
  select role, access into r, a from public.staff where id = auth.uid();
  if r = 'Owner' then return true; end if;
  return r = 'Staff' and public._lvl(a, public._sec(c)) = 2;
end $$;

-- 4. accept the new sections in each admin's access map
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
    new.access := coalesce((
      select jsonb_object_agg(k, v) from jsonb_each_text(coalesce(new.access, '{}'::jsonb)) as e(k, v)
      where k in ('clients','enquiries','deals','quotations','invoices','returns','payments','procurement','vendors',
                  'warehouses','stock','transfers','deliveries','drivers','expenses','cost_ledger','reports',
                  'employees','attendance','payroll')
        and v in ('none','view','edit')), '{}'::jsonb);
  end if;
  return new;
end $$;

-- 5. function permissions (re-applied because new functions were created)
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.submit_quote(jsonb), public.submit_enquiry(jsonb), public.needs_setup() to anon, authenticated;
grant execute on function public.my_role(), public.can_read(text), public.can_write(text), public.clear_records() to authenticated;
