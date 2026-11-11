# Bakery Website + Admin

React 19 + Vite + Tailwind 4 + Supabase. Every piece of business information (name, phone, WhatsApp, address,
hours, delivery zones, menu, cakes, texts, images, legal pages, SEO, analytics) is edited in the **Admin panel** and
saved to the database. Visitors receive changes live (Supabase Realtime) — no redeploy needed.

## Setup
1. `npm install`
2. Create a Supabase project. In **SQL Editor** run `supabase/schema.sql` once (safe to re-run).
3. **Authentication → Users → Add user** (your admin email + strong password). Then run the commented
   "CREATE YOUR FIRST ADMIN" statement at the bottom of `schema.sql` with that email.
4. Copy `.env.example` to `.env`, fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. `npm run dev` (local) or `npm run build` (deploy the `dist/` folder).
6. Open `/#/admin`, sign in with Supabase Auth, then fill in **Business** (see the Setup checklist).

## Deploying to Netlify (Fix "The website is not connected to the database yet")
Because Vite embeds `VITE_` variables into client code **at build time**, you must define your Supabase credentials in Netlify and then rebuild:

1. In your **Netlify Dashboard**, click your site.
2. Go to **Site configuration** (or **Site settings**) → **Environment variables**.
3. Add the two required variables:
   - **`VITE_SUPABASE_URL`**: Your Supabase project URL (e.g. `https://your-project-id.supabase.co`)
   - **`VITE_SUPABASE_ANON_KEY`**: Your Supabase anon public API key (from Supabase Dashboard → *Project Settings* → *API* → *anon public*)
4. **Trigger a new build**:
   - Go to the **Deploys** tab in Netlify.
   - Click **Trigger deploy** → **Clear cache and deploy site**.
5. Once deployment completes, your site will connect to Supabase and customers can sign up/log in immediately!

## Optional: sending emails (Admin → Mail)
1. Create a free Resend account and verify your sending domain.
2. `supabase functions deploy send-email`
3. `supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL="Your Bakery <orders@your-domain.com>"`
Only signed-in admins can call the function. Leave "Email API URL" blank in the admin to use it.

## Notes
- Admin rights are decided only by the database (`public.admins` / `is_admin()`); there is no passcode in production.
- Anything left blank in Admin → Business is hidden on the public site (e.g. no WhatsApp number = no WhatsApp buttons;
  orders are still saved).
- Orders that fail to save (offline) are queued in the browser and retried automatically.
- Scripts: `npm run lint` (type-check), `npm test`, `npm run build`. CI runs all three (`.github/workflows/ci.yml`).
- Spam protection: the database limits public orders, messages and reviews per hour (section 8 of `schema.sql`).
