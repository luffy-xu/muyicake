# Goal: Launch Readiness + i18n + Production Hardening

## Objective

Prepare MuYi Cakes SG ToC MVP for launch without rebuilding the MVP or changing the WhatsApp-first reservation workflow.

## Scope

- Production PostgreSQL readiness with Drizzle migrations.
- Server-side admin authentication with HttpOnly session cookie.
- Chinese default UI with English `/en` routes.
- Reservation locale and attribution tracking.
- Optional new-order email notification.
- Launch QA checklist and Vercel deployment audit.

## Product Constraints

- No online payment.
- No cart.
- No public user password login.
- Keep `/qixi` and `/custom` separate.
- Keep WhatsApp-first follow-up.
- Preserve existing prices.

## Required Quality Gates

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`
