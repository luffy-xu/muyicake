# Wildlife board game (`/game/<room>`)

A pass-and-play (one device, 2-6 players) property trading board game themed on
the Singapore Zoo "Monopoly: Mandai" edition sold in Mandai Wildlife Reserve shops.

- Routes: `/game/<any-room-name>` (中文) and `/en/game/<any-room-name>` (English).
  Each room name keeps its own saved game in the browser's localStorage.
- Rules engine: `lib/game/engine.ts` (pure reducer, unit-tested in `tests/unit/game-engine.test.ts`).
- Board numbers (prices, rents, house costs, card effects): `lib/game/board.ts`.
- All text (space names, card text, rules, log): `lib/i18n.ts` → `game`.

## What is confirmed vs adapted

Confirmed from public coverage of the Mandai edition (Hasbro, 2022):
classic rules; "Act for Wildlife" / "Care for Wildlife" decks replace Chance /
Community Chest; tokens orangutan, pangolin, turtle, cockatoo, walkie talkie,
gumboot; spaces include Siamese Crocodile, Asian Elephant and the souvenir shop.

The full space-by-space list and the card wording are not published online, so
the other space names and the card text are adapted. To match a physical box
exactly, edit `game.spaces` / `game.shortSpaces` / `game.chanceCards` /
`game.chestCards` in `lib/i18n.ts` (index = board position 0-39, starting at GO)
and, if a number differs, the matching entry in `lib/game/board.ts`.

Fan-made and unofficial; not affiliated with Hasbro or Mandai Wildlife Group.

## Cloud save & reset

- Progress is saved to localStorage instantly and uploaded to the server
  (`PUT /api/game/<room>`) about a second after each move; the "上传进度 / Upload"
  button forces an immediate upload. Opening the room on another device loads it
  from the server (`GET`).
- Each save carries the revision it was based on. If two devices diverge, the
  page asks which copy to keep (cloud or this device).
- "重置进度 / Reset progress" deletes the room locally and on the server (`DELETE`).
- Storage: table `game_rooms` (migration `db/migrations/0003_game_rooms.sql`).
  Run `npm run db:migrate` against Neon before deploying. Without
  `DATABASE_URL` (local dev / e2e) rooms are stored in `.data/game-rooms.json`
  (override with `GAME_STORE_FILE`).
- Anyone who knows a room name can load or overwrite it, so use unguessable room
  names for private games.

## Animations

Dice tumble, tokens walk space by space, cards flip in, bought deeds flash,
new houses/hotels pop, rent shakes the cell, cash changes float over player
cards, toasts announce key events and confetti marks the winner. All of it is
presentation-only (`components/game/use-game-fx.ts`) and turns off under
`prefers-reduced-motion`.
