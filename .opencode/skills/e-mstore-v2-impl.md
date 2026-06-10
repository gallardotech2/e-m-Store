---
name: e-mstore-v2-impl
description: Implementación completa de E-M Store V2.0 con Next.js + Supabase
---

# E-M Store V2.0 — Implementation Guide

Stack: Next.js App Router + TypeScript + TailwindCSS + Shadcn/UI + Supabase + lucide-react

## Phase 0: Fix Security in v1.5.8

Fix these in the PHP v1.5.8 code before migrating:

1. `register2.php:30-31` — Replace string interpolation with prepared statements
2. `afiliado/panel.php:105-106` — Replace string interpolation with prepared statements
3. `e$pro154/dashboard.php:116,117,129` — Replace string interpolation with prepared statements
4. `index.php:3` — Move hardcoded DB credentials to config.php or .env

## Phase 1: Project Scaffolding

```bash
npx create-next-app@latest "e-mstore V2.0" --typescript --tailwind --eslint --app --src-dir
npx shadcn@latest init
npm install @supabase/supabase-js @supabase/ssr zod lucide-react
npx shadcn@latest add button card input label form table dialog dropdown-menu avatar badge select textarea toast
```

## Phase 2: Supabase Schema + RLS

Create `supabase/migrations/00001_schema.sql` with 8 tables:
- profiles, categories, products, banners, affiliate_links, affiliate_cookies, orders, system_config
- RLS policies for each table

## Phase 3: Supabase Client Setup

Create lib files:
- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — server client (cookies)
- `lib/supabase/admin.ts` — admin client (service_role)
- `lib/utils.ts` — cn, formatPrice, formatDate
- `lib/validations/*.ts` — Zod schemas
- `types/index.ts` — TypeScript interfaces

## Phase 4: Auth (Supabase Auth)

- Login page at `app/auth/login/`
- Register page at `app/auth/register/`
- Auth callback route
- Logout route
- Middleware for route protection

## Phase 5: Storefront (Public)

- Layout with header, nav, search, footer
- Home page with banners + categories + featured products
- Products page with category filtering
- Product detail page
- Affiliate tracking via URL param `?a=` + 90-day cookie

## Phase 6: WhatsApp Buy Flow + Orders

- Buy button triggers modal
- Modal collects client name + phone
- Server Action: INSERT into `orders` (status=pendiente)
- Redirect to `wa.me/591{telefono_afiliado}?text={mensaje}`
- Message includes: product name, price, order ID

## Phase 7: Admin Panel (`/admin/*`)

- Dashboard with stats
- CRUD products + image upload to Supabase Storage
- CRUD categories
- CRUD banners
- Affiliates management (activate/deactivate, generate codes)
- Orders management (view all, change status)
- System config (WhatsApp fallback number)

## Phase 8: Affiliate Panel (`/affiliate/*`)

- Dashboard with personal stats
- Links management
- Orders list (own orders only)
- Profile (edit phone, personal data)

## Phase 9: Security

- Zod validation on all inputs
- RLS policies enforced
- Server-only queries (service_role key never in client)
- Error boundaries per route segment
- Input sanitization

## Phase 10: Deployment

- `.env.local.example` with all variables
- README with Vercel deploy instructions
- Connect repo to Vercel
- Set env vars in Vercel dashboard
- Run Supabase migration
- Deploy

## Constants

- WhatsApp prefix: +591 (Bolivia, hardcoded for now)
- Affiliate cookie duration: 90 days
- Default admin credentials: configured via Supabase Auth
- Currency: Bs (Bolivianos)
