-- ====================================================================
-- ZION CAKES & BITES — CUSTOMER ACCOUNTS & RLS SECURITY MIGRATION
-- Safe, non-destructive migration to add Customer Accounts and RLS
-- ====================================================================

-- 1. ADD USER_ID & MEMBER_ID COLUMNS TO ORDERS TABLE
alter table public.orders 
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.orders 
  add column if not exists member_id text references public.members(id) on delete set null;

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_member_id on public.orders(member_id);

-- 2. ADD USER_ID COLUMN TO MEMBERS TABLE
alter table public.members 
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_members_user_id on public.members(user_id);

-- 3. CREATE ADMINS TABLE TO SEPARATE CUSTOMERS FROM ADMINS
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text default '',
  created_at timestamptz default now()
);

-- 4. CREATE IS_ADMIN() SECURITY DEFINER FUNCTION
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select (
    -- Registered in public.admins
    exists (select 1 from public.admins where user_id = auth.uid())
    -- Or has admin claim in auth jwt
    or coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    or coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
    -- Or verified admin email
    or coalesce((auth.jwt() ->> 'email'), '') in ('admin@zioncakesmbeya.com', 'orders@zioncakesmbeya.com')
  );
$$;

-- 5. ORDER EVENTS TABLE (FOR STATUS TIMELINE HISTORY)
create table if not exists public.order_events (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  status text not null check (status in ('new', 'confirmed', 'preparing', 'ready', 'out', 'done', 'cancelled')),
  notes text default '',
  created_at timestamptz default now()
);

create index if not exists idx_order_events_order on public.order_events(order_id);

-- 6. CONFIGURE ROW LEVEL SECURITY (RLS) POLICIES
alter table public.orders enable row level security;
alter table public.members enable row level security;
alter table public.order_events enable row level security;
alter table public.admins enable row level security;

-- --------------------------------------------------------------------
-- A. ORDERS POLICIES
-- --------------------------------------------------------------------
drop policy if exists "Allow public order submissions" on public.orders;
drop policy if exists "Allow anon select orders" on public.orders;
drop policy if exists "Allow anon update orders" on public.orders;
drop policy if exists "Allow authenticated admin full access to orders" on public.orders;
drop policy if exists "Customers can view own orders" on public.orders;
drop policy if exists "Admins manage all orders" on public.orders;

-- 1. Anyone (guests & logged in customers) can submit orders
create policy "Allow order submissions"
  on public.orders for insert
  with check (true);

-- 2. Authenticated customers can view ONLY their own orders
create policy "Customers can view own orders"
  on public.orders for select
  to authenticated
  using (
    user_id = auth.uid()
    or (email is not null and email != '' and lower(email) = lower(auth.jwt() ->> 'email'))
    or is_admin()
  );

-- 3. Admins have full access to view, update status, and manage all orders
create policy "Admins manage all orders"
  on public.orders for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- --------------------------------------------------------------------
-- B. MEMBERS / CUSTOMERS POLICIES
-- --------------------------------------------------------------------
drop policy if exists "Admin access to members" on public.members;
drop policy if exists "Customers view own profile" on public.members;
drop policy if exists "Customers insert own profile" on public.members;
drop policy if exists "Customers update own profile" on public.members;
drop policy if exists "Admins manage all members" on public.members;

-- 1. Customers can view their own profile
create policy "Customers view own profile"
  on public.members for select
  to authenticated
  using (
    user_id = auth.uid()
    or (email is not null and email != '' and lower(email) = lower(auth.jwt() ->> 'email'))
    or is_admin()
  );

-- 2. Customers can register their profile
create policy "Customers insert own profile"
  on public.members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or is_admin()
  );

-- 3. Customers can update their own profile (name, phone, area, birthday)
create policy "Customers update own profile"
  on public.members for update
  to authenticated
  using (
    user_id = auth.uid()
    or is_admin()
  )
  with check (
    user_id = auth.uid()
    or is_admin()
  );

-- 4. Admins have full access to all members
create policy "Admins manage all members"
  on public.members for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- --------------------------------------------------------------------
-- C. ORDER EVENTS POLICIES
-- --------------------------------------------------------------------
drop policy if exists "Customers view own order events" on public.order_events;
drop policy if exists "Admins manage order events" on public.order_events;

create policy "Customers view own order events"
  on public.order_events for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_events.order_id
      and (
        o.user_id = auth.uid()
        or (o.email is not null and lower(o.email) = lower(auth.jwt() ->> 'email'))
        or is_admin()
      )
    )
  );

create policy "Admins manage order events"
  on public.order_events for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- --------------------------------------------------------------------
-- D. ADMINS TABLE POLICIES
-- --------------------------------------------------------------------
drop policy if exists "Admins view admin list" on public.admins;

create policy "Admins view admin list"
  on public.admins for select
  to authenticated
  using (is_admin());

-- --------------------------------------------------------------------
-- E. REALTIME PUBLICATION
-- --------------------------------------------------------------------
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_events;
