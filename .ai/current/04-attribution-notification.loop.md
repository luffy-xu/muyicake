# Loop: Attribution tracking + new order notification

## Objective

Make launch operations measurable and reduce missed orders.

## Attribution Fields

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `referrer`
- `landingPath`

## Tasks

- Capture attribution fields from public pages.
- Store attribution fields on reservations.
- Show attribution in admin list/detail.
- Add optional Resend email notification.
- Ensure missing notification env vars never block reservation creation.

## Acceptance Criteria

- Reservation stores UTM/referrer/landing path when present.
- Admin can inspect source info.
- Email sends when configured.
- Missing email config is a no-op.
