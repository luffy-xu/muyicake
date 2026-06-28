# Loop: Admin authentication hardening

## Objective

Replace browser-stored admin password access with a server-side admin session.

## Tasks

- Add `/admin/login`.
- Keep `ADMIN_PASSWORD` server-side only.
- Set an HttpOnly session cookie on successful login.
- Protect `/admin/reservations` and `/admin/reservations/[id]`.
- Add logout.
- Cover protected access and login flow in tests.
- Track brute-force protection as launch hardening if not implemented.

## Acceptance Criteria

- Unauthenticated admin users redirect to `/admin/login`.
- Correct password creates a session.
- Logout clears the session.
- Admin list/detail/API remain protected.
