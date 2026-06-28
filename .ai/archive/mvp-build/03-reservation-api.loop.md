# Loop: Reservation API

## Objective

Implement the full reservation creation and retrieval backend.

## Tasks

- Implement reservations database table.
- Implement Zod validation.
- Implement `POST /api/reservations`.
- Implement `GET /api/reservations`.
- Implement `GET /api/reservations/[id]`.
- Implement `PATCH /api/reservations/[id]`.
- Connect `ReservationForm` to POST API.
- Show `SuccessModal` after successful submission.
- Generate WhatsApp URL for success modal.

## Required Validation

`POST /api/reservations` must require:
- `sourcePage`
- `reservationCategory`
- `productCode`
- `productName`
- `basePrice`
- `whatsapp`
- `customerName`
- `deliveryDate`
- `deliveryArea`

Qixi `productCode` must be:
- `qixi_4_inch`
- `qixi_6_inch`

Custom `productCode` must be one of:
- `birthday_4_inch`
- `birthday_6_inch`
- `kids_theme`
- `celebration`
- `corporate`
- `custom_theme`

## Reservation ID

Format:
`MUYI-YYYYMMDD-XXXX`

## Status Defaults

New reservations must start with:
`status = "new"`

## Verification

Run:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

## Completion Criteria

- Qixi reservation saves to DB.
- Custom reservation saves to DB.
- Success modal shows reservation summary.
- WhatsApp link includes reservation ID.
- Invalid payload returns proper error.
