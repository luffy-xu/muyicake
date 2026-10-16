"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BOARD,
  GROUP_COLORS,
  JAIL_FINE,
  PLAYER_COLORS,
  SPACE_ICONS,
  TOKENS,
  TOKEN_ICONS,
  isOwnable,
  priceOf,
  type TokenId,
} from "@/lib/game/board";
import {
  canBuild,
  canMortgage,
  canSellHouse,
  canUnmortgage,
  createGame,
  groupHasBuildings,
  hotelsInBank,
  housesInBank,
  mortgageValue,
  reduce,
  rollDice,
  unmortgageCost,
  validateTrade,
  type Action,
  type Deck,
  type Dice,
  type GameState,
  type LogEntry,
  type TradeOffer,
} from "@/lib/game/engine";
import { fmt, localizedPath, type Locale, type getDictionary } from "@/lib/i18n";
import {
  getEntry,
  pullRoom,
  pushRoom,
  resetRoom,
  resolveConflict,
  setRoomState,
  useRoom,
  type RoomEntry,
} from "@/components/game/room-store";
import {
  useDiceRoll,
  useGameFx,
  useTokenWalk,
  type CashFx,
  type CellFx,
  type Toast,
} from "@/components/game/use-game-fx";

type Dictionary = ReturnType<typeof getDictionary>;
type GameText = Dictionary["game"];

// ---------- board geometry ----------

function cellPosition(pos: number) {
  if (pos <= 10) return { row: 11, col: 11 - pos };
  if (pos <= 20) return { row: 11 - (pos - 10), col: 1 };
  if (pos <= 30) return { row: 1, col: 1 + (pos - 20) };
  return { row: 1 + (pos - 30), col: 11 };
}

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function money(t: GameText, amount: number) {
  return fmt(t.cash, { amount });
}

// ---------- main component ----------

export function WildlifeGame({ locale, dictionary, room }: { locale: Locale; dictionary: Dictionary; room: string }) {
  const t = dictionary.game;
  const entry = useRoom(room);
  const game = entry === undefined ? undefined : entry.state;
  const [detail, setDetail] = useState<number | null>(null);
  const [manageFor, setManageFor] = useState<number | null>(null);
  const [tradeOpen, setTradeOpen] = useState(false);

  useEffect(() => {
    void pullRoom(room);
  }, [room]);

  const dispatch = (action: Action) => {
    const current = getEntry(room).state;
    if (!current) return;
    const next = reduce(current, action);
    if (next !== current) setRoomState(room, next);
  };

  const { rollingFaces, roll } = useDiceRoll((dice) => dispatch({ type: "ROLL", dice }));
  const { display, walking } = useTokenWalk(game);
  const busy = !!rollingFaces || walking;
  const fx = useGameFx(game, busy);

  const otherLocalePath = localizedPath(`/game/${room}`, locale === "zh" ? "en" : "zh");

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-16 pt-4 text-[#2B1E1A]">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">🦧 {t.title}</h1>
          <p className="text-xs text-[#6B5A50]">{t.subtitle}</p>
          <p className="text-[11px] text-[#8A7A70]">{fmt(t.roomLabel, { room })}</p>
        </div>
        <div className="flex gap-2">
          <Link href={otherLocalePath} className="rounded-full border border-[#2B1E1A]/20 px-3 py-1.5 text-sm">
            {t.language}
          </Link>
          {game ? (
            <button
              type="button"
              data-testid="reset-room"
              className="rounded-full border border-[#E2342D]/40 px-3 py-1.5 text-sm text-[#B3261E]"
              onClick={() => {
                if (window.confirm(t.confirmReset)) void resetRoom(room);
              }}
            >
              {t.resetProgress}
            </button>
          ) : null}
        </div>
      </header>

      {entry ? <SyncBar t={t} entry={entry} room={room} /> : null}

      {game === undefined ? (
        <div className="aspect-square w-full max-w-[720px] animate-pulse rounded-xl bg-[#E9F2E4]" />
      ) : game === null ? (
        <Setup t={t} onStart={(players) => setRoomState(room, createGame(players))} />
      ) : (
        <div className="lg:grid lg:grid-cols-[minmax(0,720px)_1fr] lg:gap-4">
          <Board t={t} game={game} positions={display ?? []} cells={fx.cells} onSelect={setDetail}>
            <ActionPanel
              t={t}
              game={game}
              dispatch={dispatch}
              onManage={setManageFor}
              busy={busy}
              rollingFaces={rollingFaces}
              onRoll={() => roll(rollDice())}
            />
          </Board>
          <div className="mt-4 space-y-4 lg:mt-0">
            <Players
              t={t}
              game={game}
              cash={fx.cash}
              onManage={setManageFor}
              onTrade={() => setTradeOpen(true)}
              onSelect={setDetail}
            />
            <GameLog t={t} game={game} />
          </div>
        </div>
      )}

      <Rules t={t} />
      <p className="mt-4 text-center text-[11px] text-[#8A7A70]">{t.disclaimer}</p>

      {game ? <Toasts t={t} game={game} toasts={fx.toasts} /> : null}
      {game?.phase.t === "over" && !busy ? <Confetti /> : null}
      {game && detail !== null ? <SpaceDetail t={t} game={game} pos={detail} onClose={() => setDetail(null)} /> : null}
      {game && manageFor !== null ? (
        <Manage t={t} game={game} player={manageFor} dispatch={dispatch} onClose={() => setManageFor(null)} />
      ) : null}
      {game && tradeOpen ? <Trade t={t} game={game} dispatch={dispatch} onClose={() => setTradeOpen(false)} /> : null}
    </main>
  );
}

// ---------- cloud sync ----------

function SyncBar({ t, entry, room }: { t: GameText; entry: RoomEntry; room: string }) {
  if (entry.status === "conflict") {
    return (
      <div className="mb-3 rounded-xl border border-[#F39A1E] bg-[#FFF3DD] p-3 text-sm" data-testid="sync-conflict">
        <p className="font-semibold">{t.sync.conflict}</p>
        <p className="mb-2 text-xs">{t.conflictHint}</p>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => void resolveConflict(room, "cloud")}>{t.useCloud}</Btn>
          <Btn tone="secondary" onClick={() => void resolveConflict(room, "local")}>
            {t.useLocal}
          </Btn>
        </div>
      </div>
    );
  }
  if (!entry.state) return null;
  return (
    <div className="mb-3 flex items-center justify-between gap-2 text-xs">
      <span data-testid="sync-status" className={entry.status === "offline" ? "text-[#B3261E]" : "text-[#4A6B5A]"}>
        {t.sync[entry.status]}
      </span>
      <button
        type="button"
        data-testid="upload-room"
        disabled={entry.status === "saving"}
        className="rounded-full border border-[#1F5E3A]/40 px-3 py-1 font-semibold text-[#1F5E3A] disabled:opacity-40"
        onClick={() => void pushRoom(room)}
      >
        ⬆️ {t.upload}
      </button>
    </div>
  );
}

// ---------- effects overlays ----------

function Toasts({ t, game, toasts }: { t: GameText; game: GameState; toasts: Toast[] }) {
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-40 flex flex-col items-center gap-1.5 px-4" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="game-toast max-w-sm rounded-full bg-[#1F5E3A] px-4 py-2 text-center text-xs font-semibold text-white shadow-lg sm:text-sm"
        >
          {toastIcon(toast.entry)} {formatLog(t, game, toast.entry)}
        </div>
      ))}
    </div>
  );
}

function toastIcon(entry: LogEntry) {
  switch (entry.k) {
    case "passGo":
    case "collected":
      return "💰";
    case "bought":
    case "auctionWon":
      return "🎉";
    case "built":
      return entry.a === 5 ? "🏨" : "🏠";
    case "toJail":
    case "threeDoubles":
      return "🚨";
    case "jailDoubles":
      return "🔓";
    case "bankrupt":
      return "💥";
    case "trade":
      return "🤝";
    default:
      return "💸";
  }
}

const CONFETTI = ["🎉", "🦧", "🐘", "🦜", "🐢", "✨", "🎊", "🐼"];

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          className="game-confetti text-2xl"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDuration: `${2.4 + ((i * 7) % 10) / 5}s`,
            animationDelay: `${((i * 13) % 20) / 10}s`,
          }}
        >
          {CONFETTI[i % CONFETTI.length]}
        </span>
      ))}
    </div>
  );
}

// ---------- setup ----------

function Setup({ t, onStart }: { t: GameText; onStart: (players: { name: string; token: TokenId }[]) => void }) {
  const [count, setCount] = useState(2);
  const [names, setNames] = useState<string[]>(() => Array.from({ length: 6 }, () => ""));
  const [tokens, setTokens] = useState<TokenId[]>([...TOKENS]);

  const chosen = tokens.slice(0, count);
  const duplicateTokens = new Set(chosen).size !== chosen.length;

  return (
    <section className="rounded-2xl border border-[#2B1E1A]/10 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">{t.setupTitle}</h2>
      <label className="mb-3 flex items-center gap-3 text-sm">
        {t.playerCount}
        <select
          className="rounded-lg border px-2 py-1"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          data-testid="player-count"
        >
          {[2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <div className="space-y-2">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: PLAYER_COLORS[i] }} />
            <input
              aria-label={t.nameLabel}
              className="min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-sm"
              placeholder={fmt(t.playerDefault, { n: i + 1 })}
              value={names[i]}
              maxLength={16}
              onChange={(e) => setNames((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
            />
            <select
              aria-label={t.tokenLabel}
              className="rounded-lg border px-2 py-1.5 text-sm"
              value={tokens[i]}
              onChange={(e) => setTokens((prev) => prev.map((v, j) => (j === i ? (e.target.value as TokenId) : v)))}
            >
              {TOKENS.map((token) => (
                <option key={token} value={token}>
                  {TOKEN_ICONS[token]} {t.tokens[token]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={duplicateTokens}
        className="mt-4 w-full rounded-full bg-[#1F9E55] py-3 font-semibold text-white disabled:opacity-40"
        onClick={() =>
          onStart(
            Array.from({ length: count }, (_, i) => ({
              name: names[i].trim() || fmt(t.playerDefault, { n: i + 1 }),
              token: tokens[i],
            })),
          )
        }
      >
        {t.startGame}
      </button>
    </section>
  );
}

// ---------- board ----------

function Board({
  t,
  game,
  positions,
  cells,
  onSelect,
  children,
}: {
  t: GameText;
  game: GameState;
  positions: number[];
  cells: Record<number, CellFx>;
  onSelect: (pos: number) => void;
  children: ReactNode;
}) {
  const active = game.phase.t === "over" ? -1 : game.current;
  return (
    <div
      className="grid aspect-square w-full max-w-[720px] gap-px rounded-xl border-2 border-[#1F5E3A] bg-[#1F5E3A]"
      style={{ gridTemplateColumns: "1.4fr repeat(9, 1fr) 1.4fr", gridTemplateRows: "1.4fr repeat(9, 1fr) 1.4fr" }}
      data-testid="game-board"
    >
      {BOARD.map((space, pos) => {
        const { row, col } = cellPosition(pos);
        const deed = game.deeds[pos];
        const ownerColor = deed && deed.owner !== null ? PLAYER_COLORS[deed.owner] : undefined;
        const here = game.players.filter((pl) => !pl.bankrupt && (positions[pl.id] ?? pl.pos) === pos);
        const cellFx = cells[pos];
        return (
          <button
            key={pos}
            type="button"
            onClick={() => onSelect(pos)}
            className={`relative flex min-w-0 flex-col items-center justify-start overflow-hidden bg-[#F4F9EE] text-center leading-none ${
              cellFx === "own" ? "game-cell-own" : cellFx === "rent" ? "game-cell-rent" : ""
            }`}
            style={{ gridRow: row, gridColumn: col, boxShadow: ownerColor ? `inset 0 0 0 2px ${ownerColor}` : undefined }}
          >
            {space.kind === "property" ? (
              <span className="block h-[18%] w-full shrink-0" style={{ background: GROUP_COLORS[space.group] }} />
            ) : null}
            {deed && deed.houses > 0 ? (
              <span
                key={`${deed.houses}-${cellFx === "build" ? "fx" : ""}`}
                className={`absolute left-0 right-0 top-0 text-[7px] sm:text-[10px] ${cellFx === "build" ? "game-pop" : ""}`}
              >
                {deed.houses === 5 ? "🏨" : "🏠".repeat(deed.houses)}
              </span>
            ) : null}
            <span className="mt-[2px] text-[11px] sm:text-lg">{SPACE_ICONS[pos]}</span>
            <span className="w-full truncate px-[1px] text-[6px] font-medium sm:text-[9px]">{t.shortSpaces[pos]}</span>
            {isOwnable(pos) ? (
              <span className={`text-[6px] sm:text-[9px] ${deed?.mortgaged ? "line-through opacity-50" : "text-[#6B5A50]"}`}>
                ${priceOf(pos)}
              </span>
            ) : null}
            {here.length ? (
              <span className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center">
                {here.map((pl) => (
                  <span
                    key={`${pl.id}-${pos}`}
                    className={`game-hop relative rounded-full text-[10px] sm:text-base ${pl.id === active ? "z-10 game-glow" : ""}`}
                    style={{ outline: `2px solid ${PLAYER_COLORS[pl.id]}`, background: "#fff" }}
                    title={pl.name}
                  >
                    {TOKEN_ICONS[pl.token]}
                  </span>
                ))}
              </span>
            ) : null}
          </button>
        );
      })}
      <div className="flex min-h-0 flex-col items-center justify-center overflow-auto bg-[#E9F2E4] p-2" style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}>
        {children}
      </div>
    </div>
  );
}

// ---------- action panel ----------

function Btn({
  children,
  onClick,
  disabled,
  tone = "primary",
  testId,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "danger";
  testId?: string;
}) {
  const tones = {
    primary: "bg-[#1F9E55] text-white",
    secondary: "border border-[#2B1E1A]/25 bg-white",
    danger: "bg-[#E2342D] text-white",
  };
  return (
    <button
      type="button"
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-40 sm:px-4 sm:py-2 sm:text-sm ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function ActionPanel({
  t,
  game,
  dispatch,
  onManage,
  busy,
  rollingFaces,
  onRoll,
}: {
  t: GameText;
  game: GameState;
  dispatch: (a: Action) => void;
  onManage: (player: number) => void;
  busy: boolean;
  rollingFaces: Dice | null;
  onRoll: () => void;
}) {
  const ph = game.phase;
  const pl = game.players[game.current];
  const name = (id: number) => game.players[id].name;

  let body: ReactNode = null;
  switch (ph.t) {
    case "roll":
      body = (
        <>
          {pl.inJail ? <p className="text-xs">{fmt(t.inJail, { turns: pl.jailTurns + 1 })}</p> : null}
          <div className="flex flex-wrap justify-center gap-2">
            <Btn testId="roll" onClick={onRoll}>
              🎲 {game.rollAgain ? t.rollAgain : t.roll}
            </Btn>
            {pl.inJail ? (
              <>
                <Btn tone="secondary" disabled={pl.cash < JAIL_FINE} onClick={() => dispatch({ type: "PAY_JAIL" })}>
                  {fmt(t.payJail, { fine: JAIL_FINE })}
                </Btn>
                {pl.jailCards.length ? (
                  <Btn tone="secondary" onClick={() => dispatch({ type: "USE_JAIL_CARD" })}>
                    {t.useJailCard}
                  </Btn>
                ) : null}
              </>
            ) : null}
          </div>
        </>
      );
      break;
    case "buy": {
      const price = priceOf(ph.pos);
      body = (
        <>
          <p className="text-sm font-semibold">
            {SPACE_ICONS[ph.pos]} {t.spaces[ph.pos]}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Btn testId="buy" disabled={pl.cash < price} onClick={() => dispatch({ type: "BUY" })}>
              {fmt(t.buy, { price })}
            </Btn>
            <Btn testId="decline" tone="secondary" onClick={() => dispatch({ type: "DECLINE" })}>
              {t.decline}
            </Btn>
          </div>
          {pl.cash < price ? (
            <button type="button" className="text-[11px] underline" onClick={() => onManage(pl.id)}>
              {t.cannotAfford}
            </button>
          ) : null}
        </>
      );
      break;
    }
    case "card": {
      const text = ph.deck === "chance" ? t.chanceCards[ph.card] : t.chestCards[ph.card];
      body = (
        <div
          key={`${ph.deck}-${ph.card}-${game.logSeq ?? game.log.length}`}
          className={`game-flip w-full max-w-[240px] rounded-lg border-2 p-2 text-center shadow ${
            ph.deck === "chance" ? "border-[#F39A1E] bg-[#FFF3DD]" : "border-[#1E4FA1] bg-[#E3EEFF]"
          }`}
        >
          <p className="text-[11px] font-bold uppercase">{t.decks[ph.deck]}</p>
          <p className="my-2 text-xs sm:text-sm">{text}</p>
          <Btn testId="card-ok" onClick={() => dispatch({ type: "RESOLVE_CARD", dice: rollDice() })}>
            {t.cardOk}
          </Btn>
        </div>
      );
      break;
    }
    case "auction": {
      const bidder = game.players[ph.bidders[ph.turn]];
      body = (
        <>
          <p className="text-sm font-semibold">{fmt(t.auctionTitle, { space: t.spaces[ph.pos] })}</p>
          <p className="text-xs">
            {ph.highBidder === null ? t.noBids : fmt(t.highBid, { amount: ph.high, name: name(ph.highBidder) })}
          </p>
          <p className="text-xs font-semibold" style={{ color: PLAYER_COLORS[bidder.id] }}>
            {fmt(t.bidderTurn, { name: bidder.name, cash: bidder.cash })}
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {[1, 10, 50, 100].map((step) => (
              <Btn
                key={step}
                disabled={ph.high + step > bidder.cash}
                onClick={() => dispatch({ type: "BID", amount: ph.high + step })}
              >
                {fmt(t.bid, { step })}
              </Btn>
            ))}
            <Btn testId="pass-bid" tone="secondary" onClick={() => dispatch({ type: "PASS_BID" })}>
              {t.passBid}
            </Btn>
          </div>
        </>
      );
      break;
    }
    case "debt": {
      const debt = game.debts[0];
      const debtor = game.players[debt.debtor];
      body = (
        <>
          <p className="text-sm font-semibold text-[#B3261E]">
            {fmt(t.debtTitle, {
              name: debtor.name,
              amount: debt.amount,
              creditor: debt.creditor === "bank" ? t.bank : name(debt.creditor),
            })}
          </p>
          <p className="text-[11px]">{t.debtHint}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Btn disabled={debtor.cash < debt.amount} onClick={() => dispatch({ type: "PAY_DEBT" })}>
              {fmt(t.payDebt, { amount: debt.amount })}
            </Btn>
            <Btn tone="secondary" onClick={() => onManage(debtor.id)}>
              {t.manage}
            </Btn>
            <Btn
              tone="danger"
              onClick={() => {
                if (window.confirm(t.confirmBankrupt)) dispatch({ type: "BANKRUPT" });
              }}
            >
              {t.declareBankrupt}
            </Btn>
          </div>
        </>
      );
      break;
    }
    case "postRoll":
      body = (
        <Btn testId="end-turn" onClick={() => dispatch({ type: "END_TURN" })}>
          {t.endTurn}
        </Btn>
      );
      break;
    case "over":
      body = <p className="text-lg font-bold">{fmt(t.winner, { name: name(ph.winner) })}</p>;
      break;
  }

  return (
    <div className="flex w-full flex-col items-center gap-1.5 text-center sm:gap-3">
      <p className="hidden text-base font-bold text-[#1F5E3A] sm:block">{t.title}</p>
      {ph.t !== "over" ? (
        <p className="text-xs font-semibold sm:text-sm" style={{ color: PLAYER_COLORS[pl.id] }} data-testid="turn">
          {TOKEN_ICONS[pl.token]} {fmt(t.turnOf, { name: pl.name })} · {money(t, pl.cash)}
        </p>
      ) : null}
      {rollingFaces ? (
        <p className="flex gap-2 text-4xl leading-none sm:text-6xl" data-testid="dice-rolling" aria-hidden>
          <span className="game-shake">{DICE_FACES[rollingFaces[0]]}</span>
          <span className="game-shake">{DICE_FACES[rollingFaces[1]]}</span>
        </p>
      ) : game.lastDice ? (
        <p
          key={game.logSeq ?? game.log.length}
          className="flex gap-2 text-4xl leading-none sm:text-6xl"
          aria-label={`${game.lastDice[0]} + ${game.lastDice[1]}`}
        >
          <span className="game-pop">{DICE_FACES[game.lastDice[0]]}</span>
          <span className="game-pop">{DICE_FACES[game.lastDice[1]]}</span>
        </p>
      ) : null}
      {busy ? null : body}
    </div>
  );
}

// ---------- players ----------

function DeedChip({ t, game, pos, onClick }: { t: GameText; game: GameState; pos: number; onClick?: () => void }) {
  const space = BOARD[pos];
  const deed = game.deeds[pos];
  const color = space.kind === "property" ? GROUP_COLORS[space.group] : "#6B5A50";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-1.5 py-0.5 text-[11px] ${deed.mortgaged ? "opacity-40" : ""}`}
      style={{ borderLeft: `4px solid ${color}`, background: "#F7F3EE" }}
    >
      {SPACE_ICONS[pos]} {t.shortSpaces[pos]}
      {deed.houses ? ` ${deed.houses === 5 ? "🏨" : `🏠${deed.houses}`}` : ""}
    </button>
  );
}

function Players({
  t,
  game,
  cash,
  onManage,
  onTrade,
  onSelect,
}: {
  t: GameText;
  game: GameState;
  cash: CashFx[];
  onManage: (id: number) => void;
  onTrade: () => void;
  onSelect: (pos: number) => void;
}) {
  return (
    <section className="space-y-2">
      {game.players.map((pl) => {
        const deeds = Object.keys(game.deeds)
          .map(Number)
          .filter((pos) => game.deeds[pos].owner === pl.id);
        const active = game.current === pl.id && game.phase.t !== "over";
        return (
          <div
            key={pl.id}
            className={`rounded-xl border bg-white p-2.5 ${pl.bankrupt ? "opacity-50" : ""}`}
            style={{ borderColor: active ? PLAYER_COLORS[pl.id] : "rgba(43,30,26,0.1)", borderWidth: active ? 2 : 1 }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold" style={{ color: PLAYER_COLORS[pl.id] }}>
                {TOKEN_ICONS[pl.token]} {pl.name}
                {pl.bankrupt ? ` · ${t.bankrupted}` : ""}
                {pl.inJail ? " 🔒" : ""}
              </p>
              <p className="relative text-sm font-bold" data-testid={`cash-${pl.id}`}>
                {money(t, pl.cash)}
                {cash
                  .filter((c) => c.player === pl.id)
                  .map((c) => (
                    <span
                      key={c.id}
                      className={`game-float-up pointer-events-none absolute -top-1 right-0 whitespace-nowrap text-xs font-bold ${
                        c.delta > 0 ? "text-[#1F9E55]" : "text-[#E2342D]"
                      }`}
                    >
                      {c.delta > 0 ? "+" : "−"}
                      {money(t, Math.abs(c.delta))}
                    </span>
                  ))}
              </p>
            </div>
            {pl.jailCards.length ? <p className="text-[11px]">🎫 {fmt(t.jailCards, { count: pl.jailCards.length })}</p> : null}
            {deeds.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {deeds.map((pos) => (
                  <DeedChip key={pos} t={t} game={game} pos={pos} onClick={() => onSelect(pos)} />
                ))}
              </div>
            ) : null}
            {!pl.bankrupt && game.phase.t !== "over" ? (
              <button type="button" className="mt-1.5 text-xs font-semibold text-[#1F5E3A] underline" onClick={() => onManage(pl.id)}>
                {t.manage}
              </button>
            ) : null}
          </div>
        );
      })}
      {game.phase.t !== "over" && game.phase.t !== "auction" && game.phase.t !== "card" ? (
        <button
          type="button"
          className="w-full rounded-full border border-[#1F5E3A] py-2 text-sm font-semibold text-[#1F5E3A]"
          onClick={onTrade}
        >
          🤝 {t.trade}
        </button>
      ) : null}
      <p className="text-center text-[11px] text-[#6B5A50]">
        {fmt(t.bankSupply, { houses: housesInBank(game), hotels: hotelsInBank(game) })}
      </p>
    </section>
  );
}

// ---------- log ----------

function formatLog(t: GameText, game: GameState, e: LogEntry) {
  const name = (id?: number) => (id === undefined ? t.bank : game.players[id]?.name ?? "");
  const card = e.deck && e.c !== undefined ? (e.deck === "chance" ? t.chanceCards[e.c] : t.chestCards[e.c]) : "";
  return fmt(t.log[e.k], {
    p: name(e.p),
    o: name(e.o),
    s: e.s !== undefined ? t.spaces[e.s] : "",
    a: e.a ?? "",
    d: e.d ? `${e.d[0]} + ${e.d[1]}` : "",
    deck: e.deck ? t.decks[e.deck] : "",
    card,
  });
}

function GameLog({ t, game }: { t: GameText; game: GameState }) {
  const recent = useMemo(() => game.log.slice(-40).reverse(), [game.log]);
  return (
    <section className="rounded-xl border border-[#2B1E1A]/10 bg-white p-3">
      <h2 className="mb-1 text-sm font-semibold">{t.logTitle}</h2>
      <ol className="max-h-56 space-y-0.5 overflow-auto text-xs text-[#4A3A32]" data-testid="game-log">
        {recent.map((entry, i) => (
          <li key={game.log.length - i}>{formatLog(t, game, entry)}</li>
        ))}
      </ol>
    </section>
  );
}

function Rules({ t }: { t: GameText }) {
  return (
    <details className="mt-4 rounded-xl border border-[#2B1E1A]/10 bg-white p-3 text-sm">
      <summary className="cursor-pointer font-semibold">{t.rulesTitle}</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
        {t.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </details>
  );
}

// ---------- sheets ----------

function Sheet({ title, onClose, closeLabel, children }: { title: string; onClose: () => void; closeLabel: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="max-h-[85vh] w-full max-w-md overflow-auto rounded-t-2xl bg-white p-4 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" className="text-sm underline" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SpaceDetail({ t, game, pos, onClose }: { t: GameText; game: GameState; pos: number; onClose: () => void }) {
  const space = BOARD[pos];
  const deed = game.deeds[pos];
  return (
    <Sheet title={`${SPACE_ICONS[pos]} ${t.spaces[pos]}`} onClose={onClose} closeLabel={t.close}>
      {space.kind === "property" ? (
        <div className="mb-2 h-3 rounded" style={{ background: GROUP_COLORS[space.group] }} />
      ) : null}
      <div className="space-y-1 text-sm">
        {deed ? (
          <>
            <p>{fmt(t.price, { price: priceOf(pos) })}</p>
            <p>
              {deed.owner === null ? t.unowned : fmt(t.owner, { name: game.players[deed.owner].name })}
              {deed.mortgaged ? ` · ${t.mortgagedTag}` : ""}
            </p>
            <p>{fmt(t.mortgageValue, { value: mortgageValue(pos) })}</p>
          </>
        ) : null}
        {space.kind === "property" ? (
          <>
            <table className="w-full text-xs">
              <tbody>
                {space.rent.map((rent, i) => (
                  <tr key={i} className={deed.houses === i && deed.owner !== null ? "font-bold" : ""}>
                    <td>{t.rentTable[i]}</td>
                    <td className="text-right">${rent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs">{fmt(t.houseCost, { cost: space.houseCost })}</p>
          </>
        ) : null}
        {space.kind === "railroad" ? <p className="text-xs">{t.railroadRent}</p> : null}
        {space.kind === "utility" ? <p className="text-xs">{t.utilityRent}</p> : null}
        {space.kind === "tax" ? <p>{fmt(t.taxText, { amount: space.amount })}</p> : null}
      </div>
    </Sheet>
  );
}

function Manage({
  t,
  game,
  player,
  dispatch,
  onClose,
}: {
  t: GameText;
  game: GameState;
  player: number;
  dispatch: (a: Action) => void;
  onClose: () => void;
}) {
  const pl = game.players[player];
  const deeds = Object.keys(game.deeds)
    .map(Number)
    .filter((pos) => game.deeds[pos].owner === player);
  return (
    <Sheet title={fmt(t.manageFor, { name: pl.name })} onClose={onClose} closeLabel={t.close}>
      <p className="mb-2 text-sm font-semibold">{money(t, pl.cash)}</p>
      {deeds.length === 0 ? <p className="text-sm">{t.noDeeds}</p> : null}
      <ul className="space-y-2">
        {deeds.map((pos) => {
          const space = BOARD[pos];
          const deed = game.deeds[pos];
          return (
            <li key={pos} className="rounded-lg border p-2">
              <div className="flex items-center justify-between gap-2">
                <DeedChip t={t} game={game} pos={pos} />
                <span className="text-[11px]">
                  {deed.mortgaged ? t.mortgagedTag : deed.houses === 5 ? t.hotel : deed.houses ? fmt(t.houses, { count: deed.houses }) : ""}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {space.kind === "property" ? (
                  <>
                    <Btn disabled={!canBuild(game, player, pos)} onClick={() => dispatch({ type: "BUILD", player, pos })}>
                      {fmt(t.build, { cost: space.houseCost })}
                    </Btn>
                    <Btn
                      tone="secondary"
                      disabled={!canSellHouse(game, player, pos)}
                      onClick={() => dispatch({ type: "SELL_HOUSE", player, pos })}
                    >
                      {fmt(t.sellHouse, { refund: space.houseCost / 2 })}
                    </Btn>
                  </>
                ) : null}
                {deed.mortgaged ? (
                  <Btn
                    tone="secondary"
                    disabled={!canUnmortgage(game, player, pos)}
                    onClick={() => dispatch({ type: "UNMORTGAGE", player, pos })}
                  >
                    {fmt(t.unmortgage, { cost: unmortgageCost(pos) })}
                  </Btn>
                ) : (
                  <Btn
                    tone="secondary"
                    disabled={!canMortgage(game, player, pos)}
                    onClick={() => dispatch({ type: "MORTGAGE", player, pos })}
                  >
                    {fmt(t.mortgage, { value: mortgageValue(pos) })}
                  </Btn>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-[#6B5A50]">
        {fmt(t.bankSupply, { houses: housesInBank(game), hotels: hotelsInBank(game) })}
      </p>
    </Sheet>
  );
}

function Trade({
  t,
  game,
  dispatch,
  onClose,
}: {
  t: GameText;
  game: GameState;
  dispatch: (a: Action) => void;
  onClose: () => void;
}) {
  const active = game.players.filter((pl) => !pl.bankrupt);
  const [from, setFrom] = useState(game.current);
  const [to, setTo] = useState(active.find((pl) => pl.id !== game.current)?.id ?? 0);
  const [cash, setCash] = useState<[number, number]>([0, 0]);
  const [deeds, setDeeds] = useState<[number[], number[]]>([[], []]);
  const [cards, setCards] = useState<[Deck[], Deck[]]>([[], []]);

  const reset = () => {
    setCash([0, 0]);
    setDeeds([[], []]);
    setCards([[], []]);
  };

  const offer: TradeOffer = {
    from,
    to,
    giveCash: cash[0],
    getCash: cash[1],
    giveDeeds: deeds[0],
    getDeeds: deeds[1],
    giveCards: cards[0],
    getCards: cards[1],
  };
  const valid = validateTrade(game, offer);

  const side = (idx: 0 | 1, playerId: number) => {
    const pl = game.players[playerId];
    const owned = Object.keys(game.deeds)
      .map(Number)
      .filter((pos) => game.deeds[pos].owner === playerId);
    const toggleDeed = (pos: number) =>
      setDeeds((prev) => {
        const next: [number[], number[]] = [[...prev[0]], [...prev[1]]];
        next[idx] = next[idx].includes(pos) ? next[idx].filter((p) => p !== pos) : [...next[idx], pos];
        return next;
      });
    return (
      <div className="min-w-0 flex-1 rounded-lg border p-2">
        <p className="mb-1 text-xs font-semibold" style={{ color: PLAYER_COLORS[playerId] }}>
          {fmt(t.gives, { name: pl.name })}
        </p>
        <label className="mb-1 block text-[11px]">
          {t.cashAmount}
          <input
            type="number"
            min={0}
            max={pl.cash}
            step={10}
            value={cash[idx]}
            onChange={(e) => {
              const v = Math.max(0, Math.min(pl.cash, Math.floor(Number(e.target.value) || 0)));
              setCash((prev) => (idx === 0 ? [v, prev[1]] : [prev[0], v]));
            }}
            className="mt-0.5 w-full rounded border px-1 py-0.5 text-sm"
          />
        </label>
        <div className="space-y-0.5">
          {owned.map((pos) => (
            <label key={pos} className={`flex items-center gap-1 text-[11px] ${groupHasBuildings(game, pos) ? "opacity-40" : ""}`}>
              <input
                type="checkbox"
                disabled={groupHasBuildings(game, pos)}
                checked={deeds[idx].includes(pos)}
                onChange={() => toggleDeed(pos)}
              />
              {SPACE_ICONS[pos]} {t.spaces[pos]}
            </label>
          ))}
          {pl.jailCards.map((deck, i) => (
            <label key={`${deck}-${i}`} className="flex items-center gap-1 text-[11px]">
              <input
                type="checkbox"
                checked={cards[idx].filter((d) => d === deck).length > pl.jailCards.slice(0, i).filter((d) => d === deck).length}
                onChange={(e) =>
                  setCards((prev) => {
                    const next: [Deck[], Deck[]] = [[...prev[0]], [...prev[1]]];
                    if (e.target.checked) next[idx].push(deck);
                    else next[idx].splice(next[idx].indexOf(deck), 1);
                    return next;
                  })
                }
              />
              🎫 {fmt(t.jailCard, { deck: t.decks[deck] })}
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Sheet title={t.tradeTitle} onClose={onClose} closeLabel={t.close}>
      <div className="mb-2 flex gap-2 text-xs">
        <label className="flex-1">
          {t.tradeFrom}
          <select
            className="mt-0.5 w-full rounded border px-1 py-1"
            value={from}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFrom(v);
              if (v === to) setTo(active.find((pl) => pl.id !== v)?.id ?? 0);
              reset();
            }}
          >
            {active.map((pl) => (
              <option key={pl.id} value={pl.id}>
                {pl.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          {t.tradeWith}
          <select
            className="mt-0.5 w-full rounded border px-1 py-1"
            value={to}
            onChange={(e) => {
              setTo(Number(e.target.value));
              reset();
            }}
          >
            {active
              .filter((pl) => pl.id !== from)
              .map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        {side(0, from)}
        {side(1, to)}
      </div>
      {!valid ? <p className="mt-2 text-[11px] text-[#6B5A50]">{t.tradeInvalid}</p> : null}
      <button
        type="button"
        disabled={!valid}
        className="mt-3 w-full rounded-full bg-[#1F9E55] py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        onClick={() => {
          dispatch({ type: "TRADE", offer });
          onClose();
        }}
      >
        {fmt(t.acceptTrade, { name: game.players[to].name })}
      </button>
    </Sheet>
  );
}
