# Loop: E2E and Audit

## Objective

Verify that the whole MVP works end-to-end and satisfies product requirements.

## Required E2E Tests

### Test 1: Qixi reservation flow

- Go to `/qixi`
- Select Qixi Signature Cake 6"
- Fill WhatsApp
- Fill customer name
- Select delivery date
- Fill delivery area
- Submit
- Verify success modal
- Verify reservation ID is shown
- Verify WhatsApp button exists

### Test 2: Custom birthday flow

- Go to `/custom`
- Select Signature Birthday Cake 6"
- Fill WhatsApp
- Fill customer name
- Select delivery date
- Fill delivery area
- Fill birthday message
- Submit
- Verify success modal

### Test 3: Admin flow

- Go to `/admin/reservations`
- Pass admin gate
- Verify reservation list
- Open latest reservation
- Change status to contacted
- Select delivery slot
- Add admin note
- Save
- Verify update persisted
- Verify WhatsApp button exists

## Required Audit Checklist

### Product Audit

- Qixi page exists.
- Custom page exists.
- Home page links to both.
- No payment flow exists.
- No cart exists.
- No password user login exists.
- WhatsApp is the main conversion channel.
- Delivery time is confirmed later, not during checkout.

### UX Audit

- Mobile-first layout works.
- Primary CTA visible on first screen.
- Sticky CTA works.
- Form is short enough.
- Success modal explains next steps.

### Technical Audit

- Product config not hardcoded in UI.
- API uses Zod validation.
- DB schema matches reservation model.
- TypeScript passes.
- No obvious any abuse.
- Error handling exists.

### Admin Audit

- Admin route is protected.
- Reservation list works.
- Detail page works.
- Status update works.
- WhatsApp customer contact works.

### Security Audit

- No payment info collected.
- No sensitive ID collected.
- Admin password not hardcoded.
- API validates input.
- Basic spam protection exists or is documented as TODO.

## Commands

Run:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

## Completion Criteria

- All tests pass.
- Audit has no critical or high severity issues.
- Remaining known limitations are documented in README.
