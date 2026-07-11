# Routes

## Public

- `/` — home page, brand intro and entry cards
- `/qixi` — qixi campaign page
- `/custom` — daily birthday/custom cake page
- `/birthday` — Birthday Storybook: 10 themed chapters (5 for boys, 5 for girls), each backed by a
  `birthday-boy` / `birthday-girl` catalog collection. English routes mirror all of the above under `/en`.

## Admin

- `/admin/reservations` — reservation list
- `/admin/reservations/[id]` — reservation detail

## API

- `POST /api/reservations`
- `GET /api/reservations`
- `GET /api/reservations/[id]`
- `PATCH /api/reservations/[id]`
