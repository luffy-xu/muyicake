# MuYi Cakes SG ToC MVP

Mobile-first cake reservation MVP for MuYi Cakes SG / 沐伊蛋糕新加坡.

## Routes

- `/` - brand home page with Qixi and custom cake entry points
- `/qixi` - Qixi campaign reservation page
- `/custom` - daily birthday/custom cake reservation page
- `/admin/reservations` - admin reservation list behind password gate
- `/admin/reservations/[id]` - admin reservation detail and operations

## API

- `POST /api/reservations`
- `GET /api/reservations`
- `GET /api/reservations/[id]`
- `PATCH /api/reservations/[id]`

Admin API reads require the `x-admin-password` header matching `ADMIN_PASSWORD`.

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
DATABASE_URL="postgres://user:password@localhost:5432/muyicake"
ADMIN_PASSWORD="change-me-before-launch"
NEXT_PUBLIC_MERCHANT_WHATSAPP="6591234567"
RESERVATION_STORE_FILE=".data/reservations.json"
```

When `DATABASE_URL` is absent, the app uses a local JSON reservation store for development and tests.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
```

## Known Limitations

- No payment, cart, customer login, CMS, or real AI image generation is implemented by design.
- PostgreSQL schema and Drizzle config are present, but migrations are not generated/applied automatically.
- Local JSON fallback persistence is for development and CI only; production should set `DATABASE_URL`.
- `next build` currently emits a non-failing Turbopack trace warning because of the development JSON fallback.
- Playwright E2E uses HTTP/API flows in this sandbox because local Chromium launch is blocked by macOS permissions.
