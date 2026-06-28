# Loop: Vercel Deployment Audit

## Objective

Audit Vercel deployment readiness after local validation passes.

## Tasks

- Run local quality gates before deployment audit.
- Use Vercel MCP if available to inspect project/deployment/log status.
- If Vercel MCP is unavailable, document manual deployment steps.
- Check build/runtime logs if a deployment fails.

## Acceptance Criteria

- Local build passes before deploy audit.
- Vercel status/logs are checked when MCP is available.
- Final report includes preview URL or clear blocker/manual checklist.
