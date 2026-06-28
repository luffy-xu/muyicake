# Product Audit

Check the implementation against the MVP product goal.

## Must Pass

- User can reserve Qixi cake from `/qixi`.
- User can reserve daily custom cake from `/custom`.
- User only needs WhatsApp, name, delivery date and delivery area to submit.
- No online payment appears.
- No cart appears.
- No password registration appears.
- Success modal clearly says merchant will follow up on WhatsApp.
- Delivery time is confirmed one day before via WhatsApp.
- Qixi prices are exactly:
  - 4" S$77
  - 6" S$117
- Custom prices show:
  - 4" From S$77
  - 6" From S$117
  - Theme cakes From S$157

## Fail Conditions

The audit fails if:
- User is asked to pay online.
- User is forced to create account.
- Qixi and custom flows are mixed into one confusing page.
- Submitted reservations are not persisted.
- Admin cannot contact customer via WhatsApp.
