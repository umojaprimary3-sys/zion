# Zion Admin Panel & Data Architecture

This app includes a complete, production-ready admin panel located at `#/admin`.
Normal visitors never download the admin code because it is dynamically lazy-loaded using `React.lazy` and `Suspense`.

## 1. Quick Access
- Route: Append `#/admin` to the URL.
- Authentication:
  - **⚡ Supabase Auth:** Sign in with email and password for verified Row Level Security (RLS) write permissions.
  - **🔑 Preview Passcode:** `zion2026` (configurable via `VITE_ADMIN_PASSCODE`).

---

## 2. Direct Supabase Architecture & Data Layer

All app content, menu dishes, prices, custom cake configurations, reviews, orders, messages, and members flow through the `SupabaseDataAdapter` defined in `src/data/supabaseAdapter.ts`.

### Architecture:
```
PUBLIC WEBSITE / ADMIN PANEL
         ↓
    React Data Hooks (useStore, useContent, useOrders, useReviews, useMembers)
         ↓
  Supabase Data Adapter (src/data/supabaseAdapter.ts)
         ↓
Supabase Client (src/lib/supabase.ts: @supabase/supabase-js)
         ↓
Supabase Cloud (PostgreSQL + Storage 'images' + Realtime)
```

### Connected Tables:
| Table | Description |
|---|---|
| `orders` | Quick order modal and custom cake studio orders |
| `inquiries` | Contact form and catering inquiries |
| `reviews` | Public customer reviews (defaults to `pending` until approved) |
| `members` | Customer list and loyalty tier management |
| `menu_items` | Dishes, prices, categories, tags |
| `menu_categories` | Menu category tabs and icons |
| `site_content` | Global website text, hero banners, cake studio options, hours, zones |
| `storage.objects` (bucket: `images`) | Photo uploads for dishes, hero banners, and gallery |

For complete SQL schema, RLS policies, and setup instructions, see **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**.

---

## 3. Environment Variables

```env
# Required Supabase Credentials (from Project Settings -> API)
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"

# Preview passcode for #/admin
VITE_ADMIN_PASSCODE="zion2026"
```

---

## 4. Email Center & Delivery

The admin panel allows composing emails with `{{name}}` variable replacement and audience segmentation (All, Tier, Birthday, Custom).
- Sent emails are recorded with delivery status.
- External email delivery can be wired to a Supabase Edge Function or custom provider.
- No email provider secrets (e.g. Resend, SendGrid) are placed in client code.
