# Launch QA Checklist

## Devices

- [ ] iPhone Safari loads `/`, `/qixi`, `/custom`, `/en`, `/en/qixi`, `/en/custom`.
- [ ] Android Chrome loads the same routes.
- [ ] Mobile sticky CTA remains visible and does not cover form submission feedback.

## Public Reservation Flows

- [ ] Chinese Qixi reservation submits successfully from `/qixi`.
- [ ] English Qixi reservation submits successfully from `/en/qixi`.
- [ ] Chinese custom reservation submits successfully from `/custom`.
- [ ] English custom reservation submits successfully from `/en/custom`.
- [ ] Success modal explains WhatsApp follow-up and no online payment.
- [ ] WhatsApp business link opens with the correct language template.
- [ ] No cart or payment step appears.

## Admin

- [ ] `/admin/reservations` redirects to `/admin/login` when logged out.
- [ ] Correct admin password logs in.
- [ ] Logout clears the session.
- [ ] Admin list shows locale and source attribution.
- [ ] Admin detail shows locale, attribution, notes, status, and delivery slot.
- [ ] Admin status update saves.
- [ ] WhatsApp customer contact uses the reservation locale.

## Attribution and Notification

- [ ] `/qixi?utm_source=xiaohongshu&utm_campaign=qixi_preheat` stores source and campaign.
- [ ] `/en/qixi?utm_source=instagram&utm_campaign=qixi_preheat` stores English locale and attribution.
- [ ] `/custom?utm_source=whatsapp_group` stores source.
- [ ] New-order email is received when `RESEND_API_KEY` and `ADMIN_NOTIFICATION_EMAIL` are configured.
- [ ] Reservation still succeeds when notification env vars are missing.

## Vercel Preview

- [ ] Preview URL loads all public routes.
- [ ] Required env vars are configured in Vercel.
- [ ] `npm run db:migrate` has been run against the production database.
- [ ] `POST /api/reservations` works on preview.
- [ ] Admin login works on preview.
- [ ] Runtime logs have no `DATABASE_URL` or auth secret errors.

## Required Env Vars

- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE`
- [ ] `ADMIN_PASSWORD`
- [ ] `ADMIN_SESSION_SECRET`

## Optional Env Vars

- [ ] `RESEND_API_KEY`
- [ ] `ADMIN_NOTIFICATION_EMAIL`
