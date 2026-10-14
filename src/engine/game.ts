export const CAP_SECONDS = 8 * 60 * 60;
export const BUSINESSES = [
  {
    id: "lemonade",
    name: "Lemonade Stand",
    cost: 80000,
    revenue: 180,
    expense: 40,
    icon: "◈",
  },
  {
    id: "coffee",
    name: "Coffee Shop",
    cost: 350000,
    revenue: 700,
    expense: 220,
    icon: "☕",
  },
  {
    id: "truck",
    name: "Food Truck",
    cost: 1200000,
    revenue: 2300,
    expense: 850,
    icon: "▣",
  },
  {
    id: "grocery",
    name: "Grocery Store",
    cost: 4500000,
    revenue: 7800,
    expense: 3400,
    icon: "▦",
  },
  {
    id: "wash",
    name: "Car Wash",
    cost: 15000000,
    revenue: 22000,
    expense: 9000,
    icon: "◇",
  },
] as const;
export type Transaction = {
  id: number;
  label: string;
  amount: number;
  time: number;
};
export type Game = {
  version: 1;
  cash: number;
  levels: number[];
  taps: number;
  tapLevel: number;
  lastSettlement: number;
  remainder: number;
  sequence: number;
  transactions: Transaction[];
  earned: number;
};
export type Action =
  | { type: "tap" }
  | { type: "buy" | "upgrade"; index: number }
  | { type: "tapUpgrade" };
export function initialGame(now: number): Game {
  return {
    version: 1,
    cash: 100000,
    levels: [0, 0, 0, 0, 0],
    taps: 0,
    tapLevel: 0,
    lastSettlement: now,
    remainder: 0,
    sequence: 0,
    transactions: [],
    earned: 0,
  };
}
export function integer(value: number) {
  if (!Number.isSafeInteger(value))
    throw new Error("Currency exceeds the safe integer limit.");
  return value;
}
export function validate(g: Game): Game {
  if (
    !g ||
    g.version !== 1 ||
    !Array.isArray(g.levels) ||
    g.levels.length !== 5 ||
    g.levels.some((x) => !Number.isInteger(x) || x < 0 || x > 50) ||
    !Array.isArray(g.transactions) ||
    g.transactions.length > 60
  )
    throw new Error("Invalid save. Your original save has been preserved.");
  for (const key of [
    "cash",
    "taps",
    "tapLevel",
    "lastSettlement",
    "remainder",
    "sequence",
    "earned",
  ] as const)
    if (!Number.isSafeInteger(g[key]) || g[key] < 0)
      throw new Error("Invalid save. Your original save has been preserved.");
  if (g.remainder >= 1000 || g.tapLevel > 50) throw new Error("Invalid save.");
  for (const t of g.transactions)
    if (
      !Number.isSafeInteger(t.id) ||
      !Number.isSafeInteger(t.amount) ||
      !Number.isSafeInteger(t.time) ||
      typeof t.label !== "string"
    )
      throw new Error("Invalid transaction record.");
  return g;
}
export function metrics(g: Game) {
  let revenue = 0,
    expenses = 0,
    assets = 0;
  BUSINESSES.forEach((b, i) => {
    const l = g.levels[i];
    if (l) {
      revenue += b.revenue * l;
      expenses += b.expense * l * l;
      assets += b.cost + b.cost * (l - 1);
    }
  });
  return {
    revenue: integer(revenue),
    expenses: integer(expenses),
    profit: integer(revenue - expenses),
    assets: integer(assets),
    netWorth: integer(g.cash + assets),
  };
}
export function upgradeCost(index: number, level: number) {
  const b = BUSINESSES[index];
  if (!b || !Number.isInteger(level) || level < 0 || level > 50)
    throw new Error("Invalid business.");
  return integer(b.cost * Math.max(1, level));
}
export function tapValue(g: Game) {
  return 1000 * (g.tapLevel + 1);
}
export function tapUpgradeCost(g: Game) {
  return 50000 * (g.tapLevel + 1);
}
function record(g: Game, label: string, amount: number, now: number): Game {
  return {
    ...g,
    cash: integer(g.cash + amount),
    sequence: g.sequence + 1,
    transactions: [
      { id: g.sequence + 1, label, amount, time: now },
      ...g.transactions,
    ].slice(0, 60),
  };
}
export function settle(
  g: Game,
  now: number,
): { game: Game; amount: number; seconds: number; anomaly: boolean } {
  integer(now);
  if (now < g.lastSettlement)
    return { game: g, amount: 0, seconds: 0, anomaly: true };
  const elapsed = now - g.lastSettlement,
    ms = Math.min(elapsed, CAP_SECONDS * 1000);
  const numerator = integer(metrics(g).profit * ms + g.remainder);
  const raw = Math.floor(numerator / 1000),
    amount = Math.max(-g.cash, raw);
  let next = {
    ...g,
    lastSettlement: now,
    remainder: raw === amount ? numerator - raw * 1000 : 0,
    earned: integer(g.earned + Math.max(0, amount)),
  };
  if (amount) next = record(next, "Business settlement", amount, now);
  return {
    game: next,
    amount,
    seconds: Math.floor(ms / 1000),
    anomaly: elapsed > CAP_SECONDS * 1000,
  };
}
export function act(g: Game, action: Action, now: number): Game {
  let next = settle(g, now).game;
  if (action.type === "tap")
    return record(
      { ...next, taps: next.taps + 1 },
      "Entrepreneur hustle",
      tapValue(next),
      now,
    );
  if (action.type === "tapUpgrade") {
    if (next.tapLevel >= 50) throw new Error("Maximum tap level reached.");
    const cost = tapUpgradeCost(next);
    if (next.cash < cost) throw new Error("Not enough cash.");
    return record(
      { ...next, tapLevel: next.tapLevel + 1 },
      "Hustle upgrade",
      -cost,
      now,
    );
  }
  const b = BUSINESSES[action.index];
  if (!b) throw new Error("Invalid business.");
  const level = next.levels[action.index];
  if ((action.type === "buy" && level) || (action.type === "upgrade" && !level))
    throw new Error("Ownership changed. Please try again.");
  if (level >= 50) throw new Error("Maximum business level reached.");
  const cost = upgradeCost(action.index, level);
  if (next.cash < cost) throw new Error("Not enough cash.");
  const levels = [...next.levels];
  levels[action.index]++;
  return record(
    { ...next, levels },
    `${action.type === "buy" ? "Purchased" : "Upgraded"} ${b.name}`,
    -cost,
    now,
  );
}
export const money = (cents: number) =>
  `¤${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
