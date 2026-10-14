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
export const MARKETS = [
  {
    name: "Northstar Tech",
    symbol: "NST",
    kind: "Stock",
    base: 1400,
    spread: 4000,
  },
  {
    name: "Meridian Energy",
    symbol: "MRD",
    kind: "Stock",
    base: 3200,
    spread: 3000,
  },
  {
    name: "Atlas Logistics",
    symbol: "ATL",
    kind: "Stock",
    base: 8700,
    spread: 4000,
  },
  {
    name: "Nova Coin",
    symbol: "NOVA",
    kind: "Crypto",
    base: 6500,
    spread: 9000,
  },
  {
    name: "Orbit Token",
    symbol: "ORBT",
    kind: "Crypto",
    base: 2500,
    spread: 8000,
  },
] as const;
export const ITEMS = [
  {
    name: "Harbor studio",
    kind: "Real estate",
    cost: 85000,
    rent: 30,
    expense: 6,
    location: "Harbor City",
  },
  {
    name: "Garden house",
    kind: "Real estate",
    cost: 450000,
    rent: 125,
    expense: 30,
    location: "Greenfield",
  },
  {
    name: "Skyline apartment",
    kind: "Real estate",
    cost: 1200000,
    rent: 380,
    expense: 90,
    location: "Metro Bay",
  },
  {
    name: "Seaside villa",
    kind: "Real estate",
    cost: 4200000,
    rent: 1300,
    expense: 400,
    location: "Azure Coast",
  },
  {
    name: "City office tower",
    kind: "Real estate",
    cost: 15000000,
    rent: 5800,
    expense: 1900,
    location: "Metro Bay",
  },
  {
    name: "Summit GT",
    kind: "Cars",
    cost: 1800000,
    rent: 0,
    expense: 20,
    location: "Garage",
  },
  {
    name: "Apex V12",
    kind: "Cars",
    cost: 7500000,
    rent: 0,
    expense: 70,
    location: "Garage",
  },
  {
    name: "Horizon yacht",
    kind: "Yachts",
    cost: 28000000,
    rent: 0,
    expense: 200,
    location: "Marina",
  },
  {
    name: "Cloudline jet",
    kind: "Aircraft",
    cost: 90000000,
    rent: 0,
    expense: 800,
    location: "Private hangar",
  },
] as const;
export function marketPrice(index: number, time: number, seed = 1729) {
  const asset = MARKETS[index];
  if (!asset || !Number.isSafeInteger(time) || time < 0)
    throw new Error("Invalid market.");
  let n =
    (Math.floor(time / 300000) ^ Math.imul(index + 1, 2654435761) ^ seed) >>> 0;
  n ^= n << 13;
  n ^= n >>> 17;
  n ^= n << 5;
  return Math.floor(
    (asset.base * (10000 + ((n >>> 0) % asset.spread) - asset.spread / 2)) /
      10000,
  );
}
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
  theme?: "dark" | "light";
  holdings?: { quantity: number; cost: number }[];
  items?: number[];
  realized?: number;
  marketSeed?: number;
};
export type Action =
  | { type: "tap" }
  | { type: "buy" | "upgrade"; index: number }
  | { type: "tapUpgrade" }
  | { type: "theme"; value: "dark" | "light" }
  | { type: "sellBusiness"; index: number }
  | { type: "buyItem" | "sellItem"; index: number }
  | { type: "trade"; index: number; side: "buy" | "sell"; quantity: number };
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
  if (g.theme !== undefined && g.theme !== "dark" && g.theme !== "light")
    throw new Error("Invalid theme.");
  if (
    g.holdings !== undefined &&
    (!Array.isArray(g.holdings) ||
      g.holdings.length !== MARKETS.length ||
      g.holdings.some(
        (h) =>
          !h ||
          !Number.isSafeInteger(h.quantity) ||
          h.quantity < 0 ||
          !Number.isSafeInteger(h.cost) ||
          h.cost < 0 ||
          (h.quantity === 0 && h.cost !== 0),
      ))
  )
    throw new Error("Invalid portfolio.");
  if (
    g.items !== undefined &&
    (!Array.isArray(g.items) ||
      g.items.length !== ITEMS.length ||
      g.items.some((v) => v !== 0 && v !== 1))
  )
    throw new Error("Invalid items.");
  if (g.realized !== undefined && !Number.isSafeInteger(g.realized))
    throw new Error("Invalid realized gains.");
  if (g.marketSeed !== undefined && !Number.isSafeInteger(g.marketSeed))
    throw new Error("Invalid market seed.");
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
  let portfolio = 0,
    properties = 0,
    luxuries = 0,
    rent = 0,
    maintenance = 0;
  MARKETS.forEach((_, i) => {
    portfolio = integer(
      portfolio +
        (g.holdings?.[i].quantity ?? 0) *
          marketPrice(i, g.lastSettlement, g.marketSeed),
    );
  });
  ITEMS.forEach((a, i) => {
    if (g.items?.[i]) {
      if (a.kind === "Real estate") properties += a.cost;
      else luxuries += a.cost;
      rent += a.rent;
      maintenance += a.expense;
    }
  });
  return {
    revenue: integer(revenue),
    expenses: integer(expenses),
    profit: integer(revenue - expenses + rent - maintenance),
    assets: integer(assets),
    portfolio: integer(portfolio),
    properties: integer(properties),
    luxuries: integer(luxuries),
    rent: integer(rent),
    maintenance: integer(maintenance),
    netWorth: integer(g.cash + assets + portfolio + properties + luxuries),
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
  if (action.type === "theme") {
    if (action.value !== "dark" && action.value !== "light")
      throw new Error("Invalid theme.");
    return { ...next, theme: action.value };
  }
  if (action.type === "trade") {
    const a = MARKETS[action.index];
    if (
      !a ||
      !Number.isSafeInteger(action.quantity) ||
      action.quantity <= 0 ||
      (action.side !== "buy" && action.side !== "sell")
    )
      throw new Error("Invalid order.");
    const holdings = (
      next.holdings ?? MARKETS.map(() => ({ quantity: 0, cost: 0 }))
    ).map((h) => ({ ...h }));
    const h = holdings[action.index],
      value = integer(
        marketPrice(action.index, next.lastSettlement, next.marketSeed) *
          action.quantity,
      ),
      fee = Math.ceil(value / 100);
    if (action.side === "buy") {
      const total = integer(value + fee);
      if (next.cash < total) throw new Error("Not enough cash.");
      h.quantity = integer(h.quantity + action.quantity);
      h.cost = integer(h.cost + total);
      return record(
        { ...next, holdings, marketSeed: next.marketSeed ?? 1729 },
        `Bought ${action.quantity} ${a.symbol}`,
        -total,
        now,
      );
    }
    if (h.quantity < action.quantity) throw new Error("Not enough shares.");
    const basis =
      action.quantity === h.quantity
        ? h.cost
        : Math.floor(integer(h.cost * action.quantity) / h.quantity);
    h.quantity -= action.quantity;
    h.cost -= basis;
    return record(
      {
        ...next,
        holdings,
        realized: integer((next.realized ?? 0) + value - fee - basis),
      },
      `Sold ${action.quantity} ${a.symbol}`,
      value - fee,
      now,
    );
  }
  if (action.type === "buyItem" || action.type === "sellItem") {
    const a = ITEMS[action.index];
    if (!a) throw new Error("Invalid item.");
    const items = [...(next.items ?? ITEMS.map(() => 0))];
    if (action.type === "buyItem") {
      if (items[action.index]) throw new Error("Already owned.");
      if (next.cash < a.cost) throw new Error("Not enough cash.");
      items[action.index] = 1;
      return record({ ...next, items }, `Purchased ${a.name}`, -a.cost, now);
    }
    if (!items[action.index]) throw new Error("Item not owned.");
    items[action.index] = 0;
    return record(
      { ...next, items },
      `Sold ${a.name}`,
      Math.floor((a.cost * 9) / 10),
      now,
    );
  }
  if (action.type === "sellBusiness") {
    const b = BUSINESSES[action.index];
    if (!b || !next.levels[action.index])
      throw new Error("Business not owned.");
    const value = integer(b.cost * next.levels[action.index]),
      levels = [...next.levels];
    levels[action.index] = 0;
    return record({ ...next, levels }, `Sold ${b.name}`, value, now);
  }
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
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
