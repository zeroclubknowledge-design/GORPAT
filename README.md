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
2. Open `/admin/` and create the **Owner** account straight away (the first account created becomes the Owner). Confirm it from the email Supabase sends.
3. In Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://zeroclubknowledge-design.github.io/GORPAT/admin/`
   - **Redirect URLs**: add the same URL (and `http://localhost:5520/admin/` for local testing).

   This makes the confirmation and password-reset emails link back to the admin.
4. In the admin, open **Staff & settings** and enter your real bank details (they print on invoices).

## Adding staff

Staff open the admin, choose **Create a staff account**, and confirm their email. They then show up under Staff & settings as **Needs role**; the Owner clicks them and assigns a role. To remove access, set their role to **Disabled**.

| Role | Can do |
|---|---|
| Owner | Everything, including staff roles, settings, loading demo data, deleting all records |
| Procurement | Clients, enquiries, quotations, procurement orders, vendors (can view invoices) |
| Finance | Invoices, quotations, payments, expenses, reports, clients |

These rules are enforced inside the database (Row Level Security), not just hidden in the menu.

## How the website and admin connect

- **Request a quotation** → `submit_quote` → appears in admin **Quotations** as "Website request".
- **Client enquiries** → `submit_enquiry` → appears in **Clients › Enquiries**.

Visitors can only call those two functions: input is validated, submissions are rate-limited per visitor, and a hidden field traps spam bots. They cannot read any data.

## Security notes

- `config.js` contains the **anon** key, which is public by design. Never put the `service_role` key or the database password in this repo.
- Supabase stores passwords (hashed) and handles sign-in; sessions refresh automatically.
- Every change to business records is written to the `audit` table (Owner can read it in Supabase).
- If the wrong account ever becomes Owner, run in the SQL Editor:
  `update public.staff set role = 'Owner' where email = 'you@example.com';`

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
