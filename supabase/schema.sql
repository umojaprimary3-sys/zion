-- ====================================================================
-- WEBSITE DATABASE — SINGLE, ORDERED, SECURE SETUP
-- Run this ONCE in Supabase → SQL Editor. It is safe to re-run.
-- Replaces SUPABASE_SETUP.md section 3-6 and CUSTOMER_ACCOUNTS_MIGRATION.sql.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ADMINS + is_admin()  (the ONLY source of truth for admin rights)
--    A user is an admin only if listed in public.admins, or if the
--    server-controlled app_metadata.role = 'admin'.
--    (user_metadata and email guessing are NOT trusted: users can edit those.)
-- --------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text default '',
  created_at timestamptz default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    exists (select 1 from public.admins where user_id = auth.uid())
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- --------------------------------------------------------------------
-- 2. TABLES
-- --------------------------------------------------------------------
create table if not exists public.members (
  id text primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  phone text default '',
  email text default '',
  area text default '',
  joined text default '',
  birthday text default '',
  consent boolean default true,
  status text default 'active' check (status in ('active', 'paused', 'blocked')),
  notes text default '',
  created_at timestamptz default now()
);
create index if not exists idx_members_phone on public.members(phone);
create index if not exists idx_members_email on public.members(email);

create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  member_id text references public.members(id) on delete set null,
  type text not null default 'delivery' check (type in ('delivery', 'pickup', 'cake')),
  status text not null default 'new' check (status in ('new','confirmed','preparing','ready','out','done','cancelled')),
  name text not null check (char_length(name) <= 200),
  phone text default '' check (char_length(phone) <= 40),
  email text default '' check (char_length(email) <= 200),
  zone text default '',
  items text default '' check (char_length(items) <= 5000),
  total numeric default 0,
  pay text default 'unpaid' check (pay in ('unpaid', 'deposit', 'paid')),
  date text default '',
  notes text default '' check (char_length(notes) <= 5000),
  src text default 'Website order pop-up',
  created_at timestamptz default now()
);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_member_id on public.orders(member_id);

create table if not exists public.order_events (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  status text not null check (status in ('new','confirmed','preparing','ready','out','done','cancelled')),
  notes text default '',
  created_at timestamptz default now()
);
create index if not exists idx_order_events_order on public.order_events(order_id);

create table if not exists public.inquiries (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 200),
  phone text default '' check (char_length(phone) <= 40),
  email text default '' check (char_length(email) <= 200),
  type text default 'General Question',
  message text default '' check (char_length(message) <= 5000),
  date text default '',
  status text default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamptz default now()
);
create index if not exists idx_inquiries_status on public.inquiries(status);

create table if not exists public.reviews (
  id text primary key,
  author text not null check (char_length(author) <= 200),
  location text default '',
  rating integer default 5 check (rating >= 1 and rating <= 5),
  comment text default '' check (char_length(comment) <= 3000),
  date text default '',
  occasion text default '',
  verified boolean default false,
  status text default 'pending' check (status in ('pending', 'approved', 'hidden')),
  reply text default '',
  featured boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_reviews_status on public.reviews(status);

create table if not exists public.menu_categories (
  id text primary key,
  label text not null,
  icon text default '',
  sort_order integer default 0
);

create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  category text not null,
  description text default '',
  price numeric default 0,
  image text default '',
  popular boolean default false,
  dietary text[] default '{}',
  serves text default '',
  prep_time text default '',
  sort_order integer default 0,
  created_at timestamptz default now()
);
create index if not exists idx_menu_cat on public.menu_items(category);
-- for databases created from the older guide:
alter table public.menu_items add column if not exists dietary text[] default '{}';

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- --------------------------------------------------------------------
-- 3. TRIGGERS
-- --------------------------------------------------------------------
-- 3a. Create a members row automatically when a customer signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'role', '') = 'customer' then
    insert into public.members (id, user_id, name, phone, email, area, joined, birthday, consent, status, notes)
    values (
      'M-' || substr(replace(new.id::text, '-', ''), 1, 10),
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Customer'),
      coalesce(new.raw_user_meta_data ->> 'phone', ''),
      coalesce(new.email, ''),
      coalesce(new.raw_user_meta_data ->> 'area', ''),
      to_char(now(), 'YYYY-MM-DD'),
      coalesce(new.raw_user_meta_data ->> 'birthday', ''),
      true,
      'active',
      'Registered customer account'
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3b. Customers may edit only their own contact details, never status/notes/ownership
create or replace function public.protect_member_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.user_id := old.user_id;
    new.status := old.status;
    new.notes := old.notes;
    new.email := old.email;
    new.id := old.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_member_fields on public.members;
create trigger trg_protect_member_fields
  before update on public.members
  for each row execute function public.protect_member_fields();

-- 3c. Record order status history automatically
create or replace function public.log_order_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_events (order_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_order_event on public.orders;
create trigger trg_log_order_event
  after insert or update of status on public.orders
  for each row execute function public.log_order_event();

-- --------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY — every write that is not a public form needs is_admin()
-- --------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.members enable row level security;
alter table public.orders enable row level security;
alter table public.order_events enable row level security;
alter table public.inquiries enable row level security;
alter table public.reviews enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.site_content enable row level security;

-- Drop every older policy name so this file fully replaces earlier setups
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('admins','members','orders','order_events','inquiries','reviews','menu_categories','menu_items','site_content')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- admins: you can see your own row; admins see all
create policy "admins read own" on public.admins for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- orders
create policy "public can place orders" on public.orders for insert to anon, authenticated
  with check (
    status = 'new' and pay = 'unpaid'
    and (user_id is null or user_id = auth.uid())
  );
create policy "customers read own orders" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "admins manage orders" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- order events
create policy "customers read own order events" on public.order_events for select to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.orders o where o.id = order_events.order_id and o.user_id = auth.uid()
    )
  );
create policy "admins manage order events" on public.order_events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- inquiries (contact form): public can send, only admins can read/manage
create policy "public can send inquiries" on public.inquiries for insert to anon, authenticated
  with check (status = 'unread');
create policy "admins manage inquiries" on public.inquiries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- reviews: public sees approved only; public can submit pending only
create policy "public reads approved reviews" on public.reviews for select to anon, authenticated
  using (status = 'approved' or public.is_admin());
create policy "public submits pending reviews" on public.reviews for insert to anon, authenticated
  with check (status = 'pending' and featured = false and verified = false and coalesce(reply, '') = '');
create policy "admins manage reviews" on public.reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- menu + site content: public read, admin write
create policy "public reads menu categories" on public.menu_categories for select to anon, authenticated using (true);
create policy "admins manage menu categories" on public.menu_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public reads menu items" on public.menu_items for select to anon, authenticated using (true);
create policy "admins manage menu items" on public.menu_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public reads site content" on public.site_content for select to anon, authenticated using (true);
create policy "admins manage site content" on public.site_content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- members
create policy "customers read own profile" on public.members for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "customers insert own profile" on public.members for insert to authenticated
  with check ((user_id = auth.uid() and status = 'active') or public.is_admin());
create policy "customers update own profile" on public.members for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "admins manage members" on public.members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- --------------------------------------------------------------------
-- 5. STORAGE — public can view images, ONLY admins can upload/change/delete
-- --------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/x-icon','image/vnd.microsoft.icon'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/x-icon','image/vnd.microsoft.icon'];

drop policy if exists "Public image access" on storage.objects;
drop policy if exists "Public image upload" on storage.objects;
drop policy if exists "Public image update" on storage.objects;
drop policy if exists "Public image delete" on storage.objects;
drop policy if exists "images public read" on storage.objects;
drop policy if exists "images admin insert" on storage.objects;
drop policy if exists "images admin update" on storage.objects;
drop policy if exists "images admin delete" on storage.objects;

create policy "images public read" on storage.objects for select using (bucket_id = 'images');
create policy "images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'images' and public.is_admin());
create policy "images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'images' and public.is_admin());
create policy "images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'images' and public.is_admin());

-- --------------------------------------------------------------------
-- 6. REALTIME — so admin edits reach every open browser instantly
-- --------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['orders','order_events','reviews','inquiries','menu_items','menu_categories','site_content','members']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- --------------------------------------------------------------------
-- 7. CREATE YOUR FIRST ADMIN  (do this ONCE, after creating the user in
--    Authentication → Users → Add user). Replace the email, then run:
-- --------------------------------------------------------------------
-- insert into public.admins (user_id, email)
-- select id, email from auth.users where email = 'YOUR-ADMIN-EMAIL@example.com'
-- on conflict (user_id) do nothing;

-- --------------------------------------------------------------------
-- 8. ANTI-SPAM LIMITS (server-side, cannot be bypassed from the browser)
--    Admins are never limited. Adjust the numbers to taste.
-- --------------------------------------------------------------------
create or replace function public.limit_public_inserts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent integer;
begin
  if public.is_admin() then
    return new;
  end if;

  if tg_table_name = 'orders' then
    select count(*) into recent from public.orders
      where created_at > now() - interval '1 hour'
        and ((new.phone <> '' and phone = new.phone) or (new.user_id is not null and user_id = new.user_id));
    if recent >= 8 then raise exception 'Too many orders from this number. Please try again later.' using errcode = 'P0001'; end if;

  elsif tg_table_name = 'inquiries' then
    select count(*) into recent from public.inquiries
      where created_at > now() - interval '1 hour'
        and ((new.phone <> '' and phone = new.phone) or (new.email <> '' and email = new.email));
    if recent >= 5 then raise exception 'Too many messages. Please try again later.' using errcode = 'P0001'; end if;

  elsif tg_table_name = 'reviews' then
    select count(*) into recent from public.reviews
      where created_at > now() - interval '1 hour' and author = new.author;
    if recent >= 3 then raise exception 'Too many reviews. Please try again later.' using errcode = 'P0001'; end if;
  end if;

  -- global safety net: no more than 200 public rows per hour in each table
  execute format('select count(*) from public.%I where created_at > now() - interval ''1 hour''', tg_table_name) into recent;
  if recent >= 200 then raise exception 'Service busy. Please try again later.' using errcode = 'P0001'; end if;

  return new;
end;
$$;

drop trigger if exists trg_limit_orders on public.orders;
create trigger trg_limit_orders before insert on public.orders
  for each row execute function public.limit_public_inserts();

drop trigger if exists trg_limit_inquiries on public.inquiries;
create trigger trg_limit_inquiries before insert on public.inquiries
  for each row execute function public.limit_public_inserts();

drop trigger if exists trg_limit_reviews on public.reviews;
create trigger trg_limit_reviews before insert on public.reviews
  for each row execute function public.limit_public_inserts();
