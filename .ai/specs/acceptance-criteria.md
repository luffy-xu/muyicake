# Acceptance Criteria

## User Side

- `/` renders and links to `/qixi` and `/custom`.
- `/qixi` supports Qixi 4" and 6" reservation.
- `/custom` supports daily birthday/custom reservation.
- User can submit with only required fields:
  - WhatsApp
  - name
  - delivery date
  - delivery area
  - product selection
- No payment flow exists.
- No cart exists.
- No login/password is required.
- Success modal explains WhatsApp follow-up.
- WhatsApp link opens with reservation ID.

## Admin Side

- Admin can view reservations.
- Admin can open reservation details.
- Admin can update status.
- Admin can update delivery slot.
- Admin can add admin note.
- Admin can open WhatsApp link to customer.

## Quality

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run test:e2e` passes.
