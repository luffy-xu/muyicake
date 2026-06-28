# Loop: Foundation

## Objective

Set up the technical foundation for MuYi Cakes SG MVP.

## Tasks

- Create or verify Next.js 15 App Router project.
- Set up TypeScript.
- Set up Tailwind CSS.
- Set up shadcn/ui.
- Set up Drizzle ORM.
- Set up PostgreSQL database connection.
- Set up Playwright.
- Create environment example file.
- Create base layout and global style.
- Create product configuration.
- Create shared utility functions.

## Required Files

- `app/layout.tsx`
- `app/globals.css`
- `lib/products.ts`
- `lib/whatsapp.ts`
- `lib/reservation-id.ts`
- `lib/validations.ts`
- `lib/db.ts`
- `lib/analytics.ts`
- `db/schema.ts`
- `.env.example`
- `playwright.config.ts`

## Product Config Requirements

Qixi products:
- `qixi_4_inch`, Qixi Mini Cake 4", S$77
- `qixi_6_inch`, Qixi Signature Cake 6", S$117, Most Popular

Custom products:
- `birthday_4_inch`, From S$77
- `birthday_6_inch`, From S$117
- `kids_theme`, From S$157
- `celebration`, From S$157
- `corporate`, From S$177

## Verification

Run:
- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Completion Criteria

- Project boots locally.
- Product config is typed.
- Database schema exists.
- Utility functions have tests.
- No TypeScript errors.
