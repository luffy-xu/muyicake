# Code Audit

Check implementation quality.

## Must Pass

- TypeScript passes.
- Lint passes.
- Product data lives in `lib/products.ts`.
- Reservation schema lives in `db/schema.ts`.
- Zod validation exists.
- WhatsApp helpers are tested.
- Reservation ID helper is tested.
- API returns meaningful errors.

## Fail Conditions

- Hardcoded duplicated product data across pages.
- API accepts arbitrary invalid product codes.
- Many implicit any types.
- Environment secrets hardcoded.
- Admin data publicly accessible without gate.
