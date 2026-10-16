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
