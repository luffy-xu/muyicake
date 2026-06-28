# Vercel Deployment Audit

## Local Validation

Completed before deployment audit:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

## MCP Result

Vercel MCP is available in this Codex environment, and Vercel documentation lookup was used for deployment workflow guidance.

Deployment/project status could not be inspected because this repository is not linked to Vercel locally. There is no `.vercel/project.json`, so the required `projectId` and `teamId` for deployment/log MCP tools are unavailable.

## Manual Deployment Steps

1. Connect the GitHub repository to Vercel or run `vercel link`.
2. Provision PostgreSQL using Vercel Marketplace, Supabase, or Neon.
3. Set required env vars for Preview and Production:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
4. Optional notification env vars:
   - `RESEND_API_KEY`
   - `ADMIN_NOTIFICATION_EMAIL`
5. Deploy a preview.
6. Run production migration:

```bash
DATABASE_URL="postgres://..." npm run db:migrate
```

7. Verify preview routes:
   - `/`
   - `/en`
   - `/qixi`
   - `/en/qixi`
   - `/custom`
   - `/en/custom`
   - `/admin/login`
   - `/admin/reservations`
   - `POST /api/reservations`
8. Inspect Vercel build logs if deployment fails.
9. Inspect runtime logs for API errors after preview verification.

## Current Blocker

Deployment verification is not complete until the repo is linked to a Vercel project or the project/team IDs are provided.
