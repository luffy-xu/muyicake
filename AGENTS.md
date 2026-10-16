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

## i18n Rules
All user-visible text **must** be maintained in `lib/i18n.ts`.

- Never hardcode UI strings (labels, buttons, messages, badges, dividers, eyebrows) outside `lib/i18n.ts`.
- Both `zh` and `en` entries are required for every new key. They must be siblings under the same path.
- Use the `dictionary` prop (passed down from page → layout components) to access strings. Do not use inline `locale === "en" ? "..." : "..."` conditionals for text that belongs in the dictionary.
- For interpolated strings (e.g. `"仅剩 {remaining} 席"`), use the `{key}` placeholder syntax and a `fmt(template, vars)` helper — do not concatenate localized substrings.
- Do not add new top-level i18n sections without noting them in this file.
- `game` section: copy for the pass-and-play car board game at `/game/[slug]` and `/en/game/[slug]` (board spaces, cards, rules, log templates). Rules engine lives in `lib/game/`.

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
