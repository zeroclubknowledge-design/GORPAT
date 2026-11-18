# Gorpat Trading Limited — website, admin and API

Public website, staff admin dashboard (clients, procurement, invoices, quotations, expenses, payments, vendors, reports) and a backend API, all served by one small Node.js server. There are **no dependencies to install**: the server only uses what ships with Node, including its built-in SQLite database.

| Path | What it is |
|---|---|
| `index.html` | Public website |
| `admin/` | Admin dashboard (staff sign-in required) |
| `server/server.js` | Web server + JSON API, sign-in, roles |
| `server/seed.js` | Optional demo data |
| `server/data/gorpat.db` | The database (created on first run, **not** in git) |
| `assets/` | Logo (vector, from the brand PDF), styles and scripts |

## Run it

Requires Node.js 22.13 or newer.

```bash
npm start
```

Open http://localhost:5520 for the website and http://localhost:5520/admin/ for the dashboard.

The first time you open the admin you'll see **Set up your admin**: create the Owner account (optionally with demo data to explore). After that, the setup screen is gone for good and everyone signs in. The Owner adds other staff in **Staff & settings**.

## Roles

| Role | Can do |
|---|---|
| Owner | Everything, including staff accounts, settings, loading demo data and deleting all records |
| Procurement | Clients, enquiries, quotations, procurement orders, vendors (can view invoices) |
| Finance | Invoices, quotations, payments, expenses, reports, clients |

Permissions are checked by the server on every request, not just hidden in the menu.

## How the website and admin connect

- Website **Request a quotation** → `POST /api/public/quote` → appears in admin **Quotations** as "Website request".
- Website **Client enquiries** → `POST /api/public/enquiry` → appears in admin **Clients › Enquiries**.

Both public endpoints validate input, are rate-limited per visitor, and have a hidden spam-trap field.

## Security notes

- Passwords are hashed with scrypt; sessions are random tokens stored hashed, sent as `HttpOnly`, `SameSite=Strict` cookies, valid 7 days.
- Sign-in attempts are rate-limited; requests from other websites are rejected.
- Only `index.html`, `admin/` and `assets/` are served — the server code and database are never reachable from the web.
- Every change is written to an `audit` table (who, what, when).

## Deploying

Any host that runs a long-lived Node process with a persistent disk works (a VPS, Render, Railway, Fly.io, etc.):

1. Start command: `npm start`
2. Environment variables:
   - `PORT` — the port the host gives you
   - `DATA_DIR` — a folder on a **persistent disk** (otherwise the database is lost on redeploy)
   - `COOKIE_SECURE=1` — when the site is on HTTPS (it should be)
   - `TRUST_PROXY=1` — when running behind the host's proxy/load balancer
3. Back up `DATA_DIR/gorpat.db` regularly — it holds all business records.

Serverless static hosts (GitHub Pages, Netlify static) can't run the API by themselves.

## Before going live

- Set your real bank details in **Staff & settings** (they print on invoices).
- Replace the stock hero photo (Unsplash) with your own photography.
