# Loop: Production DB and Drizzle migrations

## Objective

Make reservation persistence production-ready for PostgreSQL and Vercel.

## Tasks

- Generate Drizzle migrations from `db/schema.ts`.
- Add `db:generate`, `db:migrate`, and `db:studio` scripts.
- Commit migrations under `db/migrations`.
- Keep local JSON fallback only for development/tests.
- Fail fast in production when `DATABASE_URL` is missing.
- Document production DB setup in README.

## Acceptance Criteria

- `npm run db:generate` works.
- `npm run db:migrate` works when `DATABASE_URL` is configured.
- Production mode does not silently use JSON fallback.
- README explains Vercel Postgres, Supabase, or Neon setup.
