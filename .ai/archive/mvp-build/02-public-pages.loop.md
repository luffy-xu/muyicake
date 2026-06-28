# Loop: Public Pages

## Objective

Build the public mobile-first pages:

- `/`
- `/qixi`
- `/custom`

## Design Requirements

Style:
- warm
- romantic
- premium but friendly
- mobile-first
- soft cream and blush pink palette
- large rounded cards
- clear CTA
- sticky bottom CTA

Colors:
- Warm Cream `#FFF7EC`
- Warm White `#FFFCF7`
- Blush Pink `#F7B6C8`
- Rose Pink `#E97796`
- Champagne Gold `#D8A95D`
- Warm Brown `#6B3F2A`
- Butter Yellow `#FFE4A3`
- Soft Lavender `#D9C7F2`
- Baby Blue `#CFE8FF`

## Tasks

### Home page `/`

Must include:
- Header
- Hero
- Qixi entry card
- Custom cake entry card
- How it works
- WhatsApp CTA
- Footer

### Qixi page `/qixi`

Must include:
- Qixi hero
- Product cards for 4" and 6"
- Photo frame gift section
- Reservation form in qixi mode
- FAQ
- Sticky CTA
- Success modal

### Custom page `/custom`

Must include:
- Custom hero
- Birthday product cards
- Custom theme product cards
- Photo memory gift section
- Reservation form in custom mode
- FAQ
- Sticky CTA
- Success modal

## Interactions

- Product card click scrolls to form.
- Product card click preselects product.
- Sticky CTA scrolls to form.
- WhatsApp CTA opens wa.me link.
- No payment UI should appear anywhere.

## Verification

Run:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

## Completion Criteria

- All public routes render.
- Mobile layout works at 390px width.
- User can reach form within one click.
- No payment or cart appears.
