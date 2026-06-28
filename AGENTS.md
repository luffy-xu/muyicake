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
1. Generate and apply Drizzle migrations.
2. Remove production dependency on local JSON fallback.
3. Improve admin auth with HttpOnly session cookie.
4. Add UTM/referrer tracking.
5. Add optional new-order email notification.
6. Add launch QA checklist.
7. Prepare Vercel deployment.