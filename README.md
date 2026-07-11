# MuYi Cakes SG ToC MVP

Mobile-first cake reservation MVP for MuYi Cakes SG / 沐伊蛋糕新加坡.

This is not an ecommerce checkout. The app has no online payment, no cart, and no public user password login. Customers reserve a cake and MuYi follows up on WhatsApp.

## Architecture

- Next.js App Router with React client components for the reservation/admin interactions.
- Public pages render Chinese by default and English under `/en`.
- `POST /api/reservations` validates payloads with Zod, stores reservations through Drizzle/PostgreSQL, and optionally sends an admin email notification.
- Admin pages are protected by a server-side HttpOnly signed session cookie.
- Drizzle schema lives in `db/schema.ts`; migrations live in `db/migrations`.
- Local JSON reservation storage is only for development/tests. Production requires `DATABASE_URL`.

## Routes

- `/` - Chinese home page
- `/qixi` - Chinese Qixi reservation page
- `/custom` - Chinese birthday/custom reservation page
- `/birthday` - Chinese Birthday Storybook (10 themed chapters, 5 for boys / 5 for girls)
- `/en` - English home page
- `/en/qixi` - English Qixi reservation page
- `/en/custom` - English birthday/custom reservation page
- `/en/birthday` - English Birthday Storybook
- `/admin/login` - admin login
- `/admin/reservations` - admin reservation list
- `/admin/reservations/[id]` - admin reservation detail

## API

- `POST /api/reservations`
- `GET /api/reservations`
- `GET /api/reservations/[id]`
- `PATCH /api/reservations/[id]`
- `POST /api/admin/login`
- `POST /api/admin/logout`

Admin API reads and updates require the admin session cookie created by `/admin/login`.

## Environment

Copy `.env.example` to `.env.local` for local work.

Required in production:

```bash
DATABASE_URL="postgres://user:password@host:5432/muyicake"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE="6591234567"
ADMIN_PASSWORD="change-me-before-launch"
ADMIN_SESSION_SECRET="generate-with-openssl-rand-base64-32"
```

Optional:

```bash
RESEND_API_KEY=""
ADMIN_NOTIFICATION_EMAIL=""
```

Development/test only:

```bash
RESERVATION_STORE_FILE=".data/reservations.json"
ALLOW_JSON_RESERVATION_STORE="true"
```

Generate a session secret with:

```bash
openssl rand -base64 32
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If `DATABASE_URL` is absent in development, the app can use the local JSON store. Do not rely on JSON storage in production.

## Database

Use any hosted PostgreSQL provider such as Vercel Postgres/Marketplace Postgres, Supabase, or Neon.

1. Create a PostgreSQL database.
2. Copy its connection string into `DATABASE_URL`.
3. Generate migrations after schema changes:

```bash
npm run db:generate
```

4. Apply migrations:

```bash
npm run db:migrate
```

5. Optional local inspection:

```bash
npm run db:studio
```

## i18n

Chinese is the default language:

- `/`
- `/qixi`
- `/custom`
- `/birthday`

English routes:

- `/en`
- `/en/qixi`
- `/en/custom`
- `/en/birthday`

The language switcher preserves equivalent routes, and reservations store `locale` as `zh` or `en`.

## Admin Login

Visit `/admin/login`, enter `ADMIN_PASSWORD`, and the server sets an HttpOnly session cookie signed with `ADMIN_SESSION_SECRET`.

Logout is available from the admin reservation list.

## Attribution and Notifications

The reservation form captures these fields when available:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `referrer`
- `landingPath`

If `RESEND_API_KEY` and `ADMIN_NOTIFICATION_EMAIL` are configured, new reservations trigger an admin email. Missing notification env vars do not block reservation creation.

## Vercel Deployment

1. Connect the GitHub repository to Vercel.
2. Add required env vars in Vercel Project Settings for Production and Preview.
3. Provision a PostgreSQL database via Vercel Marketplace, Supabase, or Neon.
4. Set `DATABASE_URL` to the production connection string.
5. Deploy a preview.
6. Run migrations against the production DB:

```bash
DATABASE_URL="postgres://..." npm run db:migrate
```

7. Verify:

- `/`
- `/en`
- `/qixi`
- `/en/qixi`
- `/custom`
- `/en/custom`
- `/birthday`
- `/en/birthday`
- `/admin/login`
- `/admin/reservations`
- `POST /api/reservations`

Check Vercel build and runtime logs if any route or API fails.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```
