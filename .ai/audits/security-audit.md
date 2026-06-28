# Security Audit

## Must Pass

- No payment/card data is collected.
- No NRIC/passport/sensitive ID is collected.
- Admin password is read from `ADMIN_PASSWORD`.
- APIs validate user input.
- Admin route is protected.
- Environment variables are documented in `.env.example`.
- Uploaded files, if implemented, restrict type and size.

## Should Have

- Basic spam protection:
  - honeypot field, or
  - simple per-phone cooldown, or
  - documented TODO for MVP.
