<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->
# AGENTS.md

## Project
MuYi Cakes SG ToC MVP.

This is a mobile-first custom cake reservation website for Singapore users.

## Current Phase
Launch Readiness / Production Hardening.

The MVP routes and reservation flow already exist. Do not rebuild the MVP from scratch.

## Deployment Status
- Neon/PostgreSQL storage is configured locally via `.env.local`.
- Required Vercel environment variables have been configured by the project owner.
- Drizzle migrations have been applied successfully to the configured database.
- Before launch, verify the Vercel preview URL manually against `docs/launch-qa-checklist.md`.

## Core Product Constraints
- Do not add online payment yet.
- Do not add cart.
- Do not add password login for public users.
- Do not merge `/qixi` and `/custom`.
- Keep WhatsApp-first reservation workflow.
- Keep mobile-first UX.
- Preserve existing product prices:
  - Qixi 4" S$77
  - Qixi 6" S$117
  - Birthday 4" From S$77
  - Birthday 6" From S$117
  - Theme cakes From S$157

## Required Quality Gates
Before claiming completion, run:
- npm run lint
- npm run typecheck
- npm run test
- npm run test:e2e
- npm run build

## Current Priorities
1. Verify Vercel preview deployment.
2. Run launch QA checklist on mobile Safari and Android Chrome.
3. Confirm reservation writes appear in Neon/PostgreSQL.
4. Confirm admin login and WhatsApp follow-up from preview.
5. Enable optional Resend notification when ready.
