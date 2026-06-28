# Loop: Admin

## Objective

Build the minimal admin reservation management flow.

## Routes

- `/admin/reservations`
- `/admin/reservations/[id]`

## Tasks

- Implement simple admin password gate using `ADMIN_PASSWORD`.
- Build reservation list.
- Build reservation detail page.
- Add status update.
- Add confirmed delivery slot update.
- Add admin note update.
- Add WhatsApp contact button.

## Reservation List Columns

- Reservation ID
- Created At
- Customer Name
- WhatsApp
- Category
- Product
- Base Price
- Delivery Date
- Delivery Area
- Status
- Actions

## Detail Page Sections

- Basic info
- Customer info
- Cake info
- Delivery info
- Operation info

## Status Values

- `new`
- `contacted`
- `design_confirmed`
- `price_confirmed`
- `delivery_time_confirmed`
- `in_production`
- `out_for_delivery`
- `completed`
- `cancelled`

## Delivery Slots

- 10:00 AM – 1:00 PM
- 1:00 PM – 4:00 PM
- 4:00 PM – 7:00 PM
- 7:00 PM – 9:00 PM

## Verification

Run:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

## Completion Criteria

- Admin can view reservations.
- Admin can update status.
- Admin can update delivery slot.
- Admin can save admin note.
- Admin can open WhatsApp chat to customer.
