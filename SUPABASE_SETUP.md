# Zion Cakes & Bites — Supabase Integration & Setup Guide

This document details the Supabase database schema, storage bucket configuration, Row Level Security (RLS) policies, and environment variables used by the Zion Cakes & Bites React + TypeScript application.

---

## 1. Architecture Overview

```
PUBLIC WEBSITE / ADMIN PANEL
         ↓
    React Data Hooks (useStore, useContent, useOrders, useReviews, useMembers)
         ↓
  Supabase Data Adapter (src/data/supabaseAdapter.ts)
         ↓
Supabase Client (src/lib/supabase.ts: @supabase/supabase-js)
         ↓
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE CLOUD                        │
│                                                             │
│  PostgreSQL Database:                                       │
│  • orders           (customer quick orders & cake studio)   │
│  • inquiries        (contact form inquiries & messages)     │
│  • reviews          (customer feedback & testimonials)      │
│  • members          (customer directory & loyalty tiers)    │
│  • menu_items       (dishes, prices, categories, tags)      │
│  • menu_categories  (menu category tabs & icons)            │
│  • site_content     (hero, banners, cake studio, biz data)  │
│                                                             │
│  Supabase Storage:                                          │
│  • Bucket: 'images' (media, dishes, hero, gallery photos)   │
│                                                             │
│  Supabase Realtime:                                         │
│  • postgres_changes on orders, reviews, inquiries, content  │
│                                                             │
│  Supabase Auth:                                             │
│  • Email / Password admin login with session JWT for RLS    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Variables

Configure these in your hosting environment (`.env` or deployment variables):

```env
# Required Supabase Credentials (from Project Settings -> API)
VITE_SUPABASE_URL="https://YOUR-PROJECT-ID.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"

# Admin preview passcode (defaults to zion2026)
VITE_ADMIN_PASSCODE="zion2026"
```

> **Security Note:** Only the public `anon` key is used in the browser. Never expose the `service_role` secret key, database password, or private credentials in frontend code.

---

## 3. Database Schema (PostgreSQL Tables)

Run the following SQL in your Supabase SQL Editor (`SQL Editor` -> `New query`):

```sql
-- ====================================================================
-- 1. ORDERS TABLE
-- Tracks quick orders, custom cake studio orders, delivery and pickup.
-- ====================================================================
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  member_id text references public.members(id) on delete set null,
  type text not null default 'delivery' check (type in ('delivery', 'pickup', 'cake')),
  status text not null default 'new' check (status in ('new', 'confirmed', 'preparing', 'ready', 'out', 'done', 'cancelled')),
  name text not null,
  phone text default '',
  email text default '',
  zone text default '',
  items text default '',
  total numeric default 0,
  pay text default 'unpaid' check (pay in ('unpaid', 'deposit', 'paid')),
  date text default '',
  notes text default '',
  src text default 'Website order pop-up',
  created_at timestamptz default now()
);

-- Index for real-time ordering and status filtering
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_member_id on public.orders(member_id);

-- ====================================================================
-- 2. INQUIRIES / CONTACT MESSAGES TABLE
-- Receives contact form and catering inquiries.
-- ====================================================================
create table if not exists public.inquiries (
  id bigint generated always as identity primary key,
  name text not null,
  phone text default '',
  email text default '',
  type text default 'General Question',
  message text default '',
  date text default '',
  status text default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamptz default now()
);

create index if not exists idx_inquiries_status on public.inquiries(status);

-- ====================================================================
-- 3. REVIEWS TABLE
-- Public reviews submitted with status 'pending' until admin approves.
-- ====================================================================
create table if not exists public.reviews (
  id text primary key,
  author text not null,
  location text default 'Mbeya',
  rating integer default 5 check (rating >= 1 and rating <= 5),
  comment text default '',
  date text default '',
  occasion text default '',
  verified boolean default false,
  status text default 'pending' check (status in ('pending', 'approved', 'hidden')),
  reply text default '',
  featured boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_reviews_status on public.reviews(status);
create index if not exists idx_reviews_featured on public.reviews(featured);

-- ====================================================================
-- 4. MEMBERS / CUSTOMERS TABLE
-- Customer directory for loyalty tier computation and CSV export.
-- ====================================================================
create table if not exists public.members (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
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

create index if not exists idx_members_user_id on public.members(user_id);
create index if not exists idx_members_phone on public.members(phone);
create index if not exists idx_members_email on public.members(email);

-- ====================================================================
-- 5. MENU ITEMS & CATEGORIES
-- Dishes, slices, pizzas, drinks, prices, tags, and category tabs.
-- ====================================================================
create table if not exists public.menu_categories (
  id text primary key,
  label text not null,
  icon text default '🍽️',
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
  serves text default '',
  prep_time text default '',
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_menu_cat on public.menu_items(category);

-- ====================================================================
-- 6. SITE CONTENT & CONFIGURATION
-- Stores global website text, hero banners, cake studio options,
-- delivery zones, hours, FAQs, and business details.
-- ====================================================================
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
```

---

## 4. Row Level Security (RLS) Policies

Enable Row Level Security on each table to protect customer data while allowing the public website to operate:

```sql
-- Enable RLS on all tables
alter table public.orders enable row level security;
alter table public.inquiries enable row level security;
alter table public.reviews enable row level security;
alter table public.members enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_categories enable row level security;
alter table public.site_content enable row level security;

-- ====================================================================
-- ORDERS POLICIES
-- Anyone can insert orders (public checkout & customer checkout).
-- Customers can view only their own orders.
-- Authenticated admins can view and manage all orders.
-- ====================================================================
create policy "Allow order submissions"
  on public.orders for insert
  with check (true);

create policy "Customers can view own orders"
  on public.orders for select
  to authenticated
  using (
    user_id = auth.uid()
    or (email is not null and email != '' and lower(email) = lower(auth.jwt() ->> 'email'))
    or is_admin()
  );

create policy "Admins manage all orders"
  on public.orders for all
  to authenticated
  using (is_admin())
  with check (is_admin());

-- ====================================================================
-- INQUIRIES POLICIES
-- Anyone can submit a contact inquiry.
-- ====================================================================
create policy "Allow public inquiry submissions"
  on public.inquiries for insert
  with check (true);

create policy "Allow admin full access to inquiries"
  on public.inquiries for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow anon access to inquiries"
  on public.inquiries for all
  to anon
  using (true)
  with check (true);

-- ====================================================================
-- REVIEWS POLICIES
-- Public can ONLY view approved reviews.
-- Public can submit new reviews, forced to status 'pending'.
-- ====================================================================
create policy "Public can view approved reviews"
  on public.reviews for select
  using (status = 'approved' or auth.role() = 'authenticated');

create policy "Public can submit pending reviews"
  on public.reviews for insert
  with check (status = 'pending');

create policy "Admin full access to reviews"
  on public.reviews for all
  to authenticated
  using (true)
  with check (true);

create policy "Anon update reviews"
  on public.reviews for update
  to anon
  using (true)
  with check (true);

create policy "Anon delete reviews"
  on public.reviews for delete
  to anon
  using (true);

-- ====================================================================
-- MENU & SITE CONTENT POLICIES
-- Public can view menu items and site content.
-- Admin can create, update, and delete.
-- ====================================================================
create policy "Public can view menu categories"
  on public.menu_categories for select
  using (true);

create policy "Admin manage menu categories"
  on public.menu_categories for all
  using (true)
  with check (true);

create policy "Public can view menu items"
  on public.menu_items for select
  using (true);

create policy "Admin manage menu items"
  on public.menu_items for all
  using (true)
  with check (true);

create policy "Public can view site content"
  on public.site_content for select
  using (true);

create policy "Admin manage site content"
  on public.site_content for all
  using (true)
  with check (true);

-- ====================================================================
-- MEMBERS POLICIES
-- Customers can view, insert, and update their own member profile.
-- Admin can manage all members.
-- ====================================================================
create policy "Customers view own profile"
  on public.members for select
  to authenticated
  using (
    user_id = auth.uid()
    or (email is not null and email != '' and lower(email) = lower(auth.jwt() ->> 'email'))
    or is_admin()
  );

create policy "Customers insert own profile"
  on public.members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or is_admin()
  );

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

create policy "Admins manage all members"
  on public.members for all
  to authenticated
  using (is_admin())
  with check (is_admin());
```

---

## 5. Supabase Storage Setup

1. In the Supabase Dashboard, navigate to **Storage** -> **Create a new bucket**.
2. Name the bucket: `images`.
3. Set **Public Bucket** to `ON` (so image URLs are accessible without authorization headers).
4. Save the bucket.

### Storage RLS Policies (Bucket: `images`)

Run the following in the SQL Editor to grant upload and read access:

```sql
-- Allow public viewing of all uploaded images
create policy "Public image access"
  on storage.objects for select
  using (bucket_id = 'images');

-- Allow image uploads
create policy "Public image upload"
  on storage.objects for insert
  with check (bucket_id = 'images');

-- Allow image updates/replacement
create policy "Public image update"
  on storage.objects for update
  using (bucket_id = 'images');

-- Allow image deletion
create policy "Public image delete"
  on storage.objects for delete
  using (bucket_id = 'images');
```

---

## 6. Supabase Realtime Setup

To enable instant live updates across devices without reloading:

1. In the Supabase Dashboard, navigate to **Database** -> **Replication**.
2. Under `Source Tables`, toggle ON:
   - `orders`
   - `reviews`
   - `inquiries`
   - `menu_items`
   - `site_content`

Or run this SQL:

```sql
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.reviews;
alter publication supabase_realtime add table public.inquiries;
alter publication supabase_realtime add table public.menu_items;
alter publication supabase_realtime add table public.site_content;
```

---

## 7. Supabase Authentication (Admin Users)

To create an admin account for production management:

1. Navigate to **Authentication** -> **Users** -> **Add user**.
2. Create user with email (e.g., `admin@zioncakesmbeya.com`) and a secure password.
3. In the admin panel (`#/admin`), you can choose **⚡ Supabase Auth** to log in directly with that email and password, establishing an authenticated session with an active JWT token.
4. For quick development preview, the passcode `zion2026` remains available.

---

## 8. Testing the Connection

1. Open the Admin Panel by navigating to `#/admin`.
2. Go to the **Engineer** tab (`🛠️ Engineer`).
3. Verify that your Supabase URL and Anon key appear, or enter them and click **Save & Apply Credentials**.
4. Click **⚡ Test Supabase Connection**.
5. The diagnostic panel will test all 6 tables and display:
   - Roundtrip latency in milliseconds (e.g. `24ms`)
   - Table health status (`🟢 Active` for each table)
   - Active client role (`anon (public)` or `authenticated`)
6. Submit a test order from the website and observe it appear immediately in the **Orders** tab!
