# Data Model

Use one `reservations` table.

## Reservation Fields

- `id text primary key`
- `sourcePage text not null` — home | qixi | custom
- `reservationCategory text not null` — qixi | birthday | custom
- `productCode text not null`
- `productName text not null`
- `basePrice integer not null`
- `currency text default "SGD" not null`
- `whatsapp text not null`
- `customerName text not null`
- `deliveryDate text not null`
- `deliveryArea text not null`
- `deliveryAddress text nullable`
- `confirmedDeliverySlot text nullable`
- `cakeMessage text nullable`
- `recipientName text nullable`
- `age text nullable`
- `flavourPreference text nullable`
- `preferredColor text nullable`
- `stylePreference text nullable`
- `budgetRange text nullable`
- `photoService text nullable`
- `referenceImageUrl text nullable`
- `allergyNote text nullable`
- `notes text nullable`
- `isInterestedInMembership boolean default false`
- `status text default "new" not null`
- `adminNote text nullable`
- `createdAt timestamp defaultNow not null`
- `updatedAt timestamp defaultNow not null`

## Status Values

- new
- contacted
- design_confirmed
- price_confirmed
- delivery_time_confirmed
- in_production
- out_for_delivery
- completed
- cancelled
