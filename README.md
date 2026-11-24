# Gorpat Trading Limited — website and admin

Public website plus a staff admin dashboard (clients, procurement, invoices, quotations, expenses, payments, vendors, reports), backed by **Supabase** (Postgres database + sign-in). The site itself is plain HTML/CSS/JS with no build step and no libraries, so it can be hosted for free on GitHub Pages.

| Path | What it is |
|---|---|
| `index.html` | Public website |
| `admin/` | Admin dashboard (staff sign-in) |
| `assets/js/config.js` | Supabase project URL and **public** anon key |
| `assets/js/store.js` | Talks to Supabase (database + auth) |
| `supabase/schema.sql` | Tables, roles and security rules — run once in the Supabase SQL Editor |
| `assets/logo-*.svg`, `assets/mark*.svg` | Vector logo extracted from the brand PDF |

## First-time setup

1. In Supabase → **SQL Editor** → New query, paste all of `supabase/schema.sql` and **Run**.
2. Run `supabase/002_head_admin_access.sql`, then `select public.make_head_admin('you@example.com');` with your email (see below).
3. In Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://zeroclubknowledge-design.github.io/GORPAT/admin/`
   - **Redirect URLs**: add the same URL (and `http://localhost:5520/admin/` for local testing).

   This makes the confirmation and password-reset emails link back to the admin.
4. In the admin, open **Admins & settings** and enter your real bank details (they print on invoices).

## Head admin and admin access

Run `supabase/002_head_admin_access.sql` in the SQL Editor (after `schema.sql`), then make yourself head admin:

```sql
select public.make_head_admin('you@example.com');
```

- There is exactly **one head admin**. Only the head admin approves new admins, sets what each admin can access, and changes settings. The role can only be transferred by running `make_head_admin` again in the SQL Editor.
- New admins open the admin page, choose **Request admin access**, and confirm their email. They wait with no access until the head admin reviews them under **Admins & settings**.
- For each admin, the head admin sets every section to **No access**, **View** or **Edit**: Clients, Website enquiries, Procurement, Quotations, Invoices, Payments, Expenses, Vendors, Reports. Presets (Full access, Procurement, Finance, View only) fill the grid in one tap. Set an admin to **Disabled** to remove all access.
- These limits are enforced in the database (Row Level Security), not just hidden in the menu.

## Admin modules

The admin sidebar is grouped into:

- **Sales & CRM**: Clients (and website enquiries), Pipeline (deal board by stage), Quotations, Invoices, Returns & credit notes (applied credit notes reduce the invoice balance), Payments
- **Procurement & logistics**: Procurement, Vendors, Warehouses (capacity and how full each site is), Stock & batches (sorted by expiry), Transfers, Deliveries (with proof of delivery), Drivers & routes
- **Financials**: Expenses (with optional input VAT), P&L statement, Cash flow, VAT summary, Cost ledger (unit-cost changes in Stock & batches are logged automatically), Reports
- **HR & payroll**: Staff, Attendance (daily marking), Payroll (monthly runs; marking a run as paid logs a salary expense)
- **Admin**: Admins & settings (approvals, per-section access, business settings, starting cash balance, payroll deduction %)

Run  in the SQL Editor (after 002) to enable these modules. Every module is a section in the access editor (No access / View / Edit).

## How the website and admin connect

- **Request a quotation** → `submit_quote` → appears in admin **Quotations** as "Website request".
- **Client enquiries** → `submit_enquiry` → appears in **Clients › Enquiries**.

Visitors can only call those two functions: input is validated, submissions are rate-limited per visitor, and a hidden field traps spam bots. They cannot read any data.

## Security notes

- `config.js` contains the **anon** key, which is public by design. Never put the `service_role` key or the database password in this repo.
- Supabase stores passwords (hashed) and handles sign-in; sessions refresh automatically.
- Every change to business records is written to the `audit` table (Owner can read it in Supabase).
- If the wrong account ever becomes head admin, run `select public.make_head_admin('you@example.com');` in the SQL Editor.

## Hosting

GitHub Pages serves the site from the `main` branch: website at `https://zeroclubknowledge-design.github.io/GORPAT/`, admin at `.../GORPAT/admin/`. Any static host (Netlify, Vercel, Cloudflare Pages) works the same way.

## Run locally

```bash
python -m http.server 5520
```

Then open http://localhost:5520 — it uses the same Supabase project as the live site.

## Before going live

- Replace the stock hero photo (Unsplash) with your own photography.
- Supabase's built-in email sender is limited to a few emails per hour; for many staff sign-ups, add your own SMTP under Authentication → Emails.

## Sign-in screen background

The admin sign-in screen has an animated brand backdrop built in CSS (no download cost, respects "reduce motion"). To add a video (for example one made in Higgsfield) underneath it:

1. Export a short seamless loop (8–12 s), MP4 (H.264), 1920×1080, ideally under 4 MB, no audio.
2. Put it in the repo as `assets/video/signin.mp4`.
3. In `assets/js/config.js` set `signinVideo: 'assets/video/signin.mp4'`, then push.
