# Goal: MuYi Cakes SG ToC MVP

You are building the full MuYi Cakes SG ToC MVP.

## Product Goal

Build a mobile-first custom cake reservation website for Singapore users.

The MVP has two separated public flows:

1. Qixi campaign reservation page
   - Route: `/qixi`
   - Products:
     - Qixi Mini Cake 4" — S$77
     - Qixi Signature Cake 6" — S$117
   - Includes cake, photo frame, printed photo, gift box.
   - No online payment.
   - User reserves with WhatsApp number.

2. Daily custom cake reservation page
   - Route: `/custom`
   - Products:
     - Classic Birthday Cake 4" — From S$77
     - Signature Birthday Cake 6" — From S$117
     - Kids Theme Cake — From S$157
     - Family / Couple Celebration Cake — From S$157
     - Corporate Celebration Cake — From S$177
   - No online payment.
   - User reserves with WhatsApp number.

The homepage route `/` introduces the brand and links to `/qixi` and `/custom`.

The admin route `/admin/reservations` allows the operator to view and manage reservations.

## Key MVP Principle

This is not an ecommerce checkout.

There is:
- no payment
- no cart
- no password user login
- no complex account system

The reservation flow is:

User sees social media post
→ opens website
→ chooses Qixi cake or daily custom cake
→ fills WhatsApp number, name, delivery date, delivery area
→ submits reservation
→ sees success modal
→ merchant follows up on WhatsApp

## Tech Stack

Use:
- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- PostgreSQL
- Drizzle ORM
- Playwright

## Required Routes

Public:
- `/`
- `/qixi`
- `/custom`

Admin:
- `/admin/reservations`
- `/admin/reservations/[id]`

API:
- `POST /api/reservations`
- `GET /api/reservations`
- `GET /api/reservations/[id]`
- `PATCH /api/reservations/[id]`

## Required Quality Gates

The project is not complete until all of these pass:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

If any script is missing, create it.

## Required E2E Tests

1. Qixi reservation flow
2. Custom birthday reservation flow
3. Admin reservation management flow

## Required Audit

Run final audit against:
- product requirements
- mobile UX
- design style
- form validation
- API validation
- database persistence
- admin workflow
- WhatsApp workflow
- no-payment constraint
- security baseline

Do not claim complete until audit issues are fixed.
