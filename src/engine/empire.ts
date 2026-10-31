import {
  Action,
  BUSINESSES,
  CAP_SECONDS,
  Game,
  ITEMS,
  MARKETS,
  businessValue,
  initialGame,
  integer,
  ledger,
  marketPrice,
  money,
  record,
  tapUpgradeCost,
  tapValue,
  validate,
} from "./game";
import {
  Company,
  INDUSTRIES,
  MERGERS,
  RIVALS,
  Industry,
} from "../data/catalog";
const HOUR = 3600000;
export type EmpireAction =
  | { type: "openCompany"; kind: string; name?: string }
  | {
      type:
        | "companyUpgrade"
        | "companySell"
        | "hire"
        | "fire"
        | "train"
        | "buyCity"
        | "buyIntercity"
        | "buyResource"
        | "startProject"
        | "fundBank"
        | "withdrawBank"
        | "runMatch";
      id: number;
    }
  | { type: "renameCompany"; id: number; name: string }
  | { type: "bankRates"; id: number; deposit: number; lending: number }
  | { type: "merge"; kind: string }
  | { type: "boost" }
  | { type: "improveProperty"; index: number }
  | { type: "profile"; name: string; sector: string; avatar: number }
  | { type: "cardSkin"; value: "world" | "emerald" | "ocean" }
  | { type: "haptics"; value: boolean }
  | { type: "claimMilestone"; id: string };
export function mulDiv(a: number, b: number, d: number) {
  const result = (BigInt(integer(a)) * BigInt(integer(b))) / BigInt(integer(d));
  return integer(Number(result));
}
export function marketUnits(index: number) {
  return MARKETS[index].kind === "Crypto" ? 1000000 : 1;
}
export function quantityText(index: number, quantity: number) {
  const units = marketUnits(index);
  if (units === 1) return quantity.toLocaleString("en-US");
  return `${Math.floor(quantity / units)}${
    quantity % units
      ? "." +
        String(quantity % units)
          .padStart(6, "0")
          .replace(/0+$/, "")
      : ""
  }`;
}
export function parseQuantity(index: number, value: string) {
  const units = marketUnits(index);
  if (!new RegExp(units === 1 ? "^\\d+$" : "^\\d+(\\.\\d{1,6})?$").test(value))
    throw new Error("Enter a valid quantity.");
  const [whole, fraction = ""] = value.split(".");
  const q = integer(
    Number(
      BigInt(whole) * BigInt(units) +
        (units === 1 ? 0n : BigInt(fraction.padEnd(6, "0"))),
    ),
  );
  if (q > 100000000 * units)
    throw new Error("Quantity exceeds available supply.");
  return q;
}
export function orderValue(
  index: number,
  quantity: number,
  time: number,
  seed?: number,
  buy = false,
) {
  const n = BigInt(marketPrice(index, time, seed)) * BigInt(integer(quantity)),
    d = BigInt(marketUnits(index));
  return integer(Number((n + (buy ? d - 1n : 0n)) / d));
}
export function maxTrade(g: Game, index: number) {
  const price = marketPrice(index, g.lastSettlement, g.marketSeed),
    units = marketUnits(index);
  return Math.min(
    integer(
      Number(
        (BigInt(Math.max(0, g.cash - 2)) * 100n * BigInt(units)) /
          (BigInt(price) * 101n),
      ),
    ),
    100000000 * units - (g.holdings?.[index]?.quantity ?? 0),
  );
}
function requireText(value: string, max: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw new Error(`Enter 1–${max} characters.`);
  return value.trim();
}
export function definition(c: Company): Industry {
  if (c.kind.startsWith("legacy-")) {
    const b = BUSINESSES[Number(c.kind.slice(7))];
    if (!b) throw new Error("Unknown company.");
    return {
      id: c.kind,
      name: b.name,
      cost: b.cost,
      revenue: b.revenue * 3600,
      expense: b.expense * 3600,
      stages: 50,
      mode: "retail",
      icon: "shop",
      color: "#5D92AB",
      unitCost: 50000,
      duration: 1200,
    };
  }
  const d = INDUSTRIES.find((x) => x.id === c.kind);
  if (!d) throw new Error("Unknown company.");
  return d;
}
export function migrate(g: Game): Game {
  validate(g);
  if (g.version === 2) return g;
  const companies = g.levels.flatMap((level, index) =>
    level
      ? [
          {
            id: index + 1,
            kind: `legacy-${index}`,
            name: BUSINESSES[index].name,
            level,
            capital: businessValue(index, level),
            staff: 0,
            training: 0,
            city: 0,
            intercity: 0,
            resources: 0,
            vault: 0,
            depositRate: 3,
            lendingRate: 9,
            wins: 0,
          },
        ]
      : [],
  );
  return validate({
    ...g,
    version: 2,
    companies,
    nextCompanyId: 6,
    levels: [0, 0, 0, 0, 0],
    remainder: g.remainder * 3600,
    holdings: MARKETS.map((_, i) => ({
      quantity: integer((g.holdings?.[i]?.quantity ?? 0) * marketUnits(i)),
      cost: g.holdings?.[i]?.cost ?? 0,
    })),
    items: ITEMS.map((_, i) => g.items?.[i] ?? 0),
    improvements: ITEMS.map(() => 0),
    dividendsEarned: 0,
    dividendRemainder: 0,
    xp: g.taps,
    profile: {
      name: "Entrepreneur",
      sector: "Business & Investments",
      avatar: 0,
    },
    marketSeed: g.marketSeed ?? 1729,
    legacyTapBase: 1000,
    legacyAssets: true,
  });
}
export function newPlayer(now: number): Game {
  const g = migrate(initialGame(now));
  return {
    ...g,
    cash: 0,
    nextCompanyId: 1,
    legacyTapBase: undefined,
    legacyAssets: false,
    theme: "light",
  };
}
export function validateEmpire(g: Game) {
  if (
    !Array.isArray(g.companies) ||
    g.companies.length > 10 ||
    !Number.isSafeInteger(g.nextCompanyId) ||
    g.nextCompanyId! < 1
  )
    throw new Error("Invalid company save.");
  const ids = new Set<number>();
  for (const c of g.companies) {
    const d = definition(c);
    if (
      ids.has(c.id) ||
      !Number.isSafeInteger(c.id) ||
      c.id < 1 ||
      c.id >= g.nextCompanyId!
    )
      throw new Error("Invalid company ID.");
    ids.add(c.id);
    requireText(c.name, 40);
    for (const key of [
      "level",
      "capital",
      "staff",
      "training",
      "city",
      "intercity",
      "resources",
      "vault",
      "depositRate",
      "lendingRate",
      "wins",
    ] as const)
      if (!Number.isSafeInteger(c[key]) || c[key] < 0)
        throw new Error("Invalid company state.");
    if (
      c.level < 1 ||
      c.level > d.stages ||
      c.staff > c.level * 10 ||
      c.training > 10 ||
      c.city + c.intercity > c.level * 50 ||
      c.resources > 1000 ||
      c.depositRate > 8 ||
      c.lendingRate > 16 ||
      c.lendingRate <= c.depositRate
    )
      throw new Error("Invalid company limits.");
    if (c.upgrade) {
      if (
        !Number.isSafeInteger(c.upgrade.endsAt) ||
        c.upgrade.endsAt < 0 ||
        c.upgrade.target !== c.level + 1 ||
        c.upgrade.target > d.stages ||
        !Number.isSafeInteger(c.upgrade.cost) ||
        c.upgrade.cost <= 0
      )
        throw new Error("Invalid upgrade.");
    }
    if (c.project) {
      for (const key of ["endsAt", "cost", "payout"] as const)
        if (!Number.isSafeInteger(c.project[key]) || c.project[key] < 0)
          throw new Error("Invalid project.");
      requireText(c.project.name, 40);
    }
  }
  for (const key of [
    "dividendsEarned",
    "dividendRemainder",
    "boostUntil",
    "lastBoost",
    "xp",
    "legacyTapBase",
  ] as const)
    if (g[key] !== undefined && (!Number.isSafeInteger(g[key]) || g[key]! < 0))
      throw new Error("Invalid player state.");
  if ((g.dividendRemainder ?? 0) >= HOUR)
    throw new Error("Invalid dividend remainder.");
  if (
    g.improvements !== undefined &&
    (!Array.isArray(g.improvements) ||
      g.improvements.length !== ITEMS.length ||
      g.improvements.some((x) => !Number.isInteger(x) || x < 0 || x > 5))
  )
    throw new Error("Invalid property improvements.");
  if (g.profile) {
    requireText(g.profile.name, 30);
    requireText(g.profile.sector, 40);
    if (
      !Number.isInteger(g.profile.avatar) ||
      g.profile.avatar < 0 ||
      g.profile.avatar > 7
    )
      throw new Error("Invalid avatar.");
  }
  if (
    g.cardSkin !== undefined &&
    !["world", "emerald", "ocean"].includes(g.cardSkin)
  )
    throw new Error("Invalid card style.");
  if (g.haptics !== undefined && typeof g.haptics !== "boolean")
    throw new Error("Invalid haptics setting.");
  if (
    g.milestones !== undefined &&
    (!Array.isArray(g.milestones) ||
      g.milestones.length > 5 ||
      new Set(g.milestones).size !== g.milestones.length ||
      g.milestones.some(
        (x) =>
          ![
            "founder",
            "millionaire",
            "billionaire",
            "investor",
            "empire",
          ].includes(x),
      ))
  )
    throw new Error("Invalid milestone rewards.");
  if (g.legacyAssets !== undefined && typeof g.legacyAssets !== "boolean")
    throw new Error("Invalid asset economy.");
}
export function companyRates(c: Company) {
  const d = definition(c);
  let revenue = d.revenue * c.level,
    expense = d.expense * c.level;
  if (c.kind.startsWith("legacy-")) expense = d.expense * c.level * c.level;
  else if (d.mode === "retail" || d.mode === "factory" || d.mode === "merged")
    revenue = Math.round(d.revenue * Math.pow(1.42, c.level - 1));
  if (d.mode === "fleet") {
    revenue =
      (c.city * (c.kind === "taxi" ? 45000 : 85000) +
        c.intercity * (c.kind === "taxi" ? 130000 : 290000)) *
      c.level;
    expense += c.city * 9000 + c.intercity * 28000;
  }
  if (d.mode === "bank") {
    const bank = bankDetails(c);
    revenue = bank.interest;
    expense += bank.funding;
  }
  if (d.mode === "oil") {
    revenue = c.resources * 90000000 * c.level;
    expense += c.resources * 15000000;
  }
  if (d.mode === "airline") {
    revenue = c.intercity * 250000000 * c.level;
    expense += c.intercity * 90000000;
  }
  if (d.mode === "sport") {
    revenue += c.wins * 4000000;
    expense += c.staff * 120000;
  }
  revenue = mulDiv(integer(revenue), 100 + c.staff * 4 + c.training * 6, 100);
  expense = integer(expense + c.staff * (d.mode === "it" ? 15000 : 3000));
  return { revenue, expenses: expense, profit: integer(revenue - expense) };
}
export function bankDetails(c: Company) {
  const deposits = mulDiv(c.vault, c.depositRate * 20, 100),
    utilization = Math.max(20, 100 - (c.lendingRate - 8) * 8),
    loans = mulDiv(c.vault + deposits, utilization, 100);
  return {
    deposits,
    utilization,
    loans,
    interest: mulDiv(loans, c.lendingRate, 100),
    funding: mulDiv(deposits, c.depositRate, 100),
  };
}
export function companyValue(c: Company) {
  return integer(
    c.capital +
      c.vault +
      c.resources *
        (definition(c).mode === "oil" ? 0 : definition(c).unitCost) +
      (c.project?.cost ?? 0),
  );
}
export function companyUpgradeCost(c: Company) {
  const d = definition(c);
  return c.kind.startsWith("legacy-")
    ? integer(d.cost * c.level)
    : integer(Math.round(d.cost * 0.3 * Math.pow(1.35, c.level - 1)));
}
export function upgradeSeconds(c: Company) {
  return Math.min(4 * 3600, definition(c).duration * c.level);
}
export function dividendYield(index: number) {
  return MARKETS[index]?.kind === "Stock" ? ([532, 640, 420][index] ?? 400) : 0;
}
export function dividendHourly(g: Game) {
  let total = 0;
  MARKETS.forEach((a, i) => {
    if (a.kind === "Stock")
      total = integer(
        total +
          mulDiv(
            mulDiv(g.holdings?.[i]?.quantity ?? 0, a.base, 1),
            dividendYield(i),
            10000,
          ),
      );
  });
  return total;
}
export function assetPrice(g: Game, index: number) {
  return integer(
    ITEMS[index].cost *
      (ITEMS[index].kind === "Real estate" && !g.legacyAssets ? 100 : 1),
  );
}
export function propertyValue(g: Game, index: number) {
  const price = assetPrice(g, index);
  return integer(
    price + (g.improvements?.[index] ?? 0) * Math.floor(price / 10),
  );
}
export function propertyHourly(g: Game, index: number) {
  const a = ITEMS[index],
    l = g.improvements?.[index] ?? 0;
  return {
    rent: mulDiv(a.rent * 3600, 100 + 20 * l, 100),
    expenses: a.expense * 3600,
  };
}
export function empireMetrics(g: Game, at = g.lastSettlement) {
  let revenue = 0,
    expenses = 0,
    assets = 0;
  for (const c of g.companies ?? []) {
    const r = companyRates(c);
    revenue = integer(revenue + r.revenue);
    expenses = integer(expenses + r.expenses);
    assets = integer(assets + companyValue(c));
  }
  let bonus = 0;
  if ((g.boostUntil ?? 0) > at && revenue > expenses)
    bonus = mulDiv(revenue - expenses, 30, 100);
  revenue = integer(revenue + bonus);
  let portfolio = 0,
    properties = 0,
    luxuries = 0,
    rent = 0,
    maintenance = 0,
    propertyMaintenance = 0;
  MARKETS.forEach((_, i) => {
    portfolio = integer(
      portfolio +
        orderValue(
          i,
          g.holdings?.[i]?.quantity ?? 0,
          g.lastSettlement,
          g.marketSeed,
        ),
    );
  });
  ITEMS.forEach((a, i) => {
    if (g.items?.[i]) {
      const v = propertyValue(g, i),
        r = propertyHourly(g, i);
      if (a.kind === "Real estate") {
        properties = integer(properties + v);
        propertyMaintenance = integer(propertyMaintenance + r.expenses);
      } else luxuries = integer(luxuries + v);
      rent = integer(rent + r.rent);
      maintenance = integer(maintenance + r.expenses);
    }
  });
  const dividends = dividendHourly(g),
    hourlyProfit = integer(revenue - expenses + rent - maintenance + dividends);
  return {
    revenue: revenue / 3600,
    expenses: expenses / 3600,
    profit: hourlyProfit / 3600,
    assets,
    portfolio,
    properties,
    luxuries,
    rent: rent / 3600,
    maintenance: maintenance / 3600,
    netWorth: integer(g.cash + assets + portfolio + properties + luxuries),
    hourlyRevenue: revenue,
    hourlyExpenses: expenses,
    hourlyProfit,
    businessHourly: revenue - expenses,
    rentHourly: rent - propertyMaintenance,
    dividendsHourly: dividends,
    bonusHourly: bonus,
  };
}
function completeAt(g: Game, time: number): Game {
  let next = { ...g, companies: (g.companies ?? []).map((c) => ({ ...c })) };
  for (const c of next.companies) {
    if (c.upgrade && c.upgrade.endsAt <= time) {
      c.level = c.upgrade.target;
      c.upgrade = undefined;
      next = { ...next, xp: (next.xp ?? 0) + 20 };
      next = ledger(
        next,
        `${c.name}: expansion complete`,
        0,
        time,
      ) as typeof next;
    }
    if (c.project && c.project.endsAt <= time) {
      const project = c.project;
      c.project = undefined;
      if (project.name === "Match prize") c.wins++;
      next = record(
        { ...next, xp: (next.xp ?? 0) + 50 },
        `${c.name}: ${project.name}`,
        project.payout,
        time,
      ) as typeof next;
    }
  }
  return next;
}
export function settleEmpire(g: Game, now: number) {
  integer(now);
  if (now < g.lastSettlement)
    return { game: g, amount: 0, seconds: 0, anomaly: true };
  const elapsed = now - g.lastSettlement,
    end = g.lastSettlement + Math.min(elapsed, CAP_SECONDS * 1000);
  let cursor = g.lastSettlement,
    next = completeAt(g, cursor),
    passive = 0;
  while (cursor < end) {
    let boundary = end;
    for (const c of next.companies ?? []) {
      if (c.upgrade && c.upgrade.endsAt > cursor)
        boundary = Math.min(boundary, c.upgrade.endsAt);
      if (c.project && c.project.endsAt > cursor)
        boundary = Math.min(boundary, c.project.endsAt);
    }
    if ((next.boostUntil ?? 0) > cursor)
      boundary = Math.min(boundary, next.boostUntil!);
    const ms = boundary - cursor,
      r = empireMetrics(next, cursor),
      numerator = BigInt(r.hourlyProfit) * BigInt(ms) + BigInt(next.remainder),
      den = BigInt(HOUR),
      raw = Number(
        numerator >= 0 ? numerator / den : (numerator - den + 1n) / den,
      ),
      amount = Math.max(-next.cash, integer(raw));
    const divNumerator =
        BigInt(r.dividendsHourly) * BigInt(ms) +
        BigInt(next.dividendRemainder ?? 0),
      div = integer(Number(divNumerator / den));
    next = {
      ...next,
      cash: integer(next.cash + amount),
      remainder: raw === amount ? Number(numerator - BigInt(raw) * den) : 0,
      earned: integer(next.earned + Math.max(0, amount)),
      dividendsEarned: integer((next.dividendsEarned ?? 0) + div),
      dividendRemainder: Number(divNumerator % den),
    };
    passive = integer(passive + amount);
    cursor = boundary;
    next = completeAt(next, cursor);
  }
  next = { ...next, lastSettlement: now };
  if (passive) next = ledger(next, "Passive income", passive, now);
  return {
    game: validate(next),
    amount: integer(next.cash - g.cash),
    seconds: Math.floor((end - g.lastSettlement) / 1000),
    anomaly: elapsed > CAP_SECONDS * 1000,
  };
}
export function mergerStatus(g: Game, kind: string) {
  const merger = MERGERS.find((m) => m.id === kind);
  if (!merger) throw new Error("Unknown merger.");
  const chosen: Company[] = [];
  const rows: { label: string; complete: boolean; progress: number }[] = [];
  for (const req of merger.requirements) {
    const candidates = (g.companies ?? []).filter((c) => c.kind === req.kind),
      matches = (c: Company) =>
        c.level >= req.stage &&
        (!("city" in req) || c.city >= req.city) &&
        (!("intercity" in req) || c.intercity >= req.intercity) &&
        !c.project &&
        !c.upgrade;
    const eligible = candidates.find(matches),
      score = (c: Company) =>
        Math.min(1, c.level / req.stage) +
        ("city" in req ? Math.min(1, c.city / req.city) : 0) +
        ("intercity" in req ? Math.min(1, c.intercity / req.intercity) : 0),
      best = eligible ?? candidates.sort((a, b) => score(b) - score(a))[0],
      name = INDUSTRIES.find((d) => d.id === req.kind)!.name;
    if (eligible) chosen.push(eligible);
    rows.push({
      label: `${name} · stage ${best?.level ?? 0}/${req.stage}`,
      complete: (best?.level ?? 0) >= req.stage,
      progress: Math.min(1, (best?.level ?? 0) / req.stage),
    });
    if ("city" in req)
      rows.push({
        label: `${name} · city vehicles: ${best?.city ?? 0}/${req.city}`,
        complete: (best?.city ?? 0) >= req.city,
        progress: Math.min(1, (best?.city ?? 0) / req.city),
      });
    if ("intercity" in req)
      rows.push({
        label: `${name} · intercity vehicles: ${best?.intercity ?? 0}/${req.intercity}`,
        complete: (best?.intercity ?? 0) >= req.intercity,
        progress: Math.min(1, (best?.intercity ?? 0) / req.intercity),
      });
    if (best?.project || best?.upgrade)
      rows.push({
        label: `${name} · finish active project or expansion`,
        complete: false,
        progress: 0,
      });
  }
  rows.push({
    label: `Opening capital · ${money(merger.cash)}`,
    complete: g.cash >= merger.cash,
    progress: Math.min(1, g.cash / merger.cash),
  });
  if (merger.portfolio)
    rows.push({
      label: `Portfolio value · ${money(merger.portfolio)}`,
      complete: empireMetrics(g).portfolio >= merger.portfolio,
      progress: Math.min(1, empireMetrics(g).portfolio / merger.portfolio),
    });
  return { merger, chosen, rows, eligible: rows.every((r) => r.complete) };
}
export function projectOffer(c: Company) {
  const d = definition(c),
    base = d.unitCost;
  return {
    name:
      d.mode === "construction"
        ? "Property development"
        : d.mode === "dealer"
          ? "Vehicle sale"
          : d.mode === "it"
            ? "Software delivery"
            : "Production contract",
    cost: integer(
      base *
        c.level *
        (d.mode === "construction" ? 5 : d.mode === "it" ? 2 : 1),
    ),
    payout: integer(
      Math.round(
        base *
          c.level *
          (d.mode === "construction"
            ? 8
            : d.mode === "it"
              ? 4
              : d.mode === "factory"
                ? 2.6
                : 1.25) *
          (1 + c.training * 0.06),
      ),
    ),
    seconds: Math.max(
      60,
      Math.floor(d.duration / (1 + c.staff * 0.1 + c.training * 0.1)),
    ),
  };
}
export function empireAct(g: Game, action: Action, now: number): Game {
  let next = settleEmpire(g, now).game;
  const pay = (cost: number, label: string) => {
    if (next.cash < cost) throw new Error("Not enough cash.");
    next = record(next, label, -cost, now);
  };
  if (action.type === "tap") {
    return validate(
      record(
        { ...next, taps: next.taps + 1, xp: (next.xp ?? 0) + 1 },
        "Entrepreneur hustle",
        tapValue(next),
        now,
      ),
    );
  }
  if (action.type === "tapUpgrade") {
    if (next.tapLevel >= 30) throw new Error("Maximum tap level reached.");
    pay(tapUpgradeCost(next), "Clicker level upgrade");
    return { ...next, tapLevel: next.tapLevel + 1, xp: (next.xp ?? 0) + 10 };
  }
  if (action.type === "trade") {
    const a = MARKETS[action.index];
    if (
      !a ||
      !Number.isSafeInteger(action.quantity) ||
      action.quantity <= 0 ||
      (action.side !== "buy" && action.side !== "sell")
    )
      throw new Error("Enter a valid order.");
    const holdings = next.holdings!.map((h) => ({ ...h })),
      h = holdings[action.index],
      value = orderValue(
        action.index,
        action.quantity,
        next.lastSettlement,
        next.marketSeed,
        action.side === "buy",
      ),
      fee = Math.ceil(value / 100);
    if (action.side === "buy") {
      if (h.quantity + action.quantity > 100000000 * marketUnits(action.index))
        throw new Error("This order exceeds the available supply.");
      pay(
        integer(value + fee),
        `Bought ${quantityText(action.index, action.quantity)} ${a.symbol}`,
      );
      h.quantity = integer(h.quantity + action.quantity);
      h.cost = integer(h.cost + value + fee);
      return validate({ ...next, holdings });
    }
    if (h.quantity < action.quantity)
      throw new Error("Not enough shares or coins.");
    const basis =
      action.quantity === h.quantity
        ? h.cost
        : mulDiv(h.cost, action.quantity, h.quantity);
    h.quantity -= action.quantity;
    h.cost -= basis;
    return validate(
      record(
        {
          ...next,
          holdings,
          realized: integer((next.realized ?? 0) + value - fee - basis),
        },
        `Sold ${quantityText(action.index, action.quantity)} ${a.symbol}`,
        value - fee,
        now,
      ),
    );
  }
  if (action.type === "openCompany") {
    const d = INDUSTRIES.find(
      (x) => x.id === action.kind && x.mode !== "merged",
    );
    if (!d) throw new Error("Choose a business category.");
    if (next.companies!.length >= 10)
      throw new Error("All 10 company slots are in use.");
    const name = action.name
      ? requireText(action.name, 40)
      : `${d.name} ${next.nextCompanyId}`;
    pay(d.cost, `Opened ${name}`);
    const c: Company = {
      id: next.nextCompanyId!,
      kind: d.id,
      name,
      level: 1,
      capital: d.cost,
      staff: 0,
      training: 0,
      city: 0,
      intercity: 0,
      resources: 0,
      vault: 0,
      depositRate: 3,
      lendingRate: 9,
      wins: 0,
    };
    return validate({
      ...next,
      companies: [...next.companies!, c],
      nextCompanyId: c.id + 1,
      xp: (next.xp ?? 0) + 100,
    });
  }
  if (action.type === "boost") {
    if (next.lastBoost !== undefined && now - next.lastBoost < 24 * HOUR)
      throw new Error(
        "The next free boost is available 24 hours after activation.",
      );
    return ledger(
      { ...next, lastBoost: now, boostUntil: now + 4 * HOUR },
      "Activated 4-hour business boost",
      0,
      now,
    );
  }
  if (action.type === "profile")
    return validate({
      ...next,
      profile: {
        name: requireText(action.name, 30),
        sector: requireText(action.sector, 40),
        avatar: action.avatar,
      },
    });
  if (action.type === "cardSkin")
    return validate({ ...next, cardSkin: action.value });
  if (action.type === "haptics")
    return validate({ ...next, haptics: action.value });
  if (action.type === "claimMilestone") {
    const milestone = milestoneStatus(next).find((m) => m.id === action.id);
    if (!milestone || !milestone.eligible || milestone.claimed)
      throw new Error("This milestone reward is unavailable.");
    return validate(
      record(
        {
          ...next,
          milestones: [...(next.milestones ?? []), milestone.id],
          xp: (next.xp ?? 0) + 100,
        },
        `Milestone: ${milestone.name}`,
        milestone.reward,
        now,
      ),
    );
  }
  if (action.type === "improveProperty") {
    const a = ITEMS[action.index],
      levels = [...(next.improvements ?? ITEMS.map(() => 0))];
    if (!a || a.kind !== "Real estate" || !next.items?.[action.index])
      throw new Error("You must own this property.");
    if (levels[action.index] >= 5)
      throw new Error("All property improvements are complete.");
    pay(Math.floor(assetPrice(next, action.index) / 10), `Improved ${a.name}`);
    levels[action.index]++;
    return { ...next, improvements: levels };
  }
  if (action.type === "merge") {
    const status = mergerStatus(next, action.kind);
    if (!status.eligible)
      throw new Error("Complete every merger requirement first.");
    const d = INDUSTRIES.find((x) => x.id === action.kind)!;
    const inherited = status.chosen.reduce(
      (n, c) => integer(n + companyValue(c)),
      0,
    );
    pay(status.merger.cash, `Created ${d.name}`);
    const c: Company = {
      id: next.nextCompanyId!,
      kind: d.id,
      name: d.name,
      level: 1,
      capital: integer(status.merger.cash + inherited),
      staff: 0,
      training: 0,
      city: 0,
      intercity: 0,
      resources: 0,
      vault: 0,
      depositRate: 3,
      lendingRate: 9,
      wins: 0,
    };
    return validate({
      ...next,
      companies: [
        ...next.companies!.filter(
          (c) => !status.chosen.some((s) => s.id === c.id),
        ),
        c,
      ],
      nextCompanyId: c.id + 1,
      xp: (next.xp ?? 0) + 1000,
    });
  }
  if ("id" in action) {
    const companies = next.companies!.map((c) => ({ ...c })),
      c = companies.find((c) => c.id === action.id);
    if (!c) throw new Error("Company not found.");
    next = { ...next, companies };
    const d = definition(c);
    switch (action.type) {
      case "companySell":
        if (c.project || c.upgrade)
          throw new Error(
            "Wait for the active project or expansion before selling.",
          );
        return record(
          { ...next, companies: companies.filter((x) => x.id !== c.id) },
          `Sold ${c.name}`,
          companyValue(c),
          now,
        );
      case "renameCompany":
        c.name = requireText(action.name, 40);
        return validate(next);
      case "companyUpgrade":
        if (c.upgrade) throw new Error("Expansion already in progress.");
        if (c.level >= d.stages) throw new Error("Maximum stage reached.");
        {
          const cost = companyUpgradeCost(c);
          pay(cost, `Expanding ${c.name}`);
          c.capital = integer(c.capital + cost);
          c.upgrade = {
            endsAt: now + upgradeSeconds(c) * 1000,
            target: c.level + 1,
            cost,
          };
          break;
        }
      case "hire":
        if (c.staff >= c.level * 10)
          throw new Error("Expand the company to increase staff capacity.");
        pay(100000, `Recruited staff at ${c.name}`);
        c.staff++;
        break;
      case "fire":
        if (!c.staff) throw new Error("There are no employees to release.");
        if (c.project)
          throw new Error(
            "Finish the active project before changing the team.",
          );
        c.staff--;
        next = ledger(next, `Released employee at ${c.name}`, 0, now);
        break;
      case "train":
        if (!c.staff) throw new Error("Hire staff before training.");
        if (c.training >= 10) throw new Error("Maximum training reached.");
        pay(50000 * (c.training + 1), `Trained ${c.name} staff`);
        c.training++;
        break;
      case "buyCity":
      case "buyIntercity":
        if (d.mode !== "fleet" && d.mode !== "airline")
          throw new Error("This company does not use vehicles.");
        if (c.city + c.intercity >= c.level * 50)
          throw new Error("Expand to increase fleet capacity.");
        if (d.mode === "airline" && action.type === "buyCity")
          throw new Error("Airlines use aircraft.");
        {
          const cost =
            d.unitCost *
            (action.type === "buyIntercity" && d.mode !== "airline" ? 3 : 1);
          pay(
            cost,
            `Added ${action.type === "buyCity" ? "city vehicle" : d.mode === "airline" ? "aircraft" : "intercity vehicle"} to ${c.name}`,
          );
          c.capital = integer(c.capital + cost);
          if (action.type === "buyCity") c.city++;
          else c.intercity++;
          break;
        }
      case "buyResource":
        if (
          d.mode !== "construction" &&
          d.mode !== "factory" &&
          d.mode !== "oil"
        )
          throw new Error("This industry does not use resources.");
        if (c.resources >= 1000) throw new Error("Resource storage is full.");
        pay(
          d.unitCost,
          `Purchased ${d.mode === "oil" ? "production well" : "resources"} for ${c.name}`,
        );
        c.resources++;
        if (d.mode === "oil") c.capital = integer(c.capital + d.unitCost);
        break;
      case "startProject":
        if (!["construction", "dealer", "it", "factory"].includes(d.mode))
          throw new Error("This industry has no project contracts.");
        if (c.project) throw new Error("A project is already running.");
        if (d.mode === "it" && !c.staff)
          throw new Error("Hire a developer before accepting projects.");
        if ((d.mode === "construction" || d.mode === "factory") && !c.resources)
          throw new Error("Buy resources first.");
        {
          const offer = projectOffer(c);
          pay(offer.cost, `Started ${offer.name} at ${c.name}`);
          const stock =
            d.mode === "construction" || d.mode === "factory" ? d.unitCost : 0;
          if (stock) c.resources--;
          c.project = {
            endsAt: now + offer.seconds * 1000,
            cost: integer(offer.cost + stock),
            payout: offer.payout,
            name: offer.name,
          };
          break;
        }
      case "fundBank":
        if (d.mode !== "bank") throw new Error("Choose a bank.");
        pay(d.unitCost, `Funded ${c.name} vault`);
        c.vault = integer(c.vault + d.unitCost);
        break;
      case "withdrawBank":
        if (d.mode !== "bank" || c.vault < d.unitCost)
          throw new Error("No withdrawable bank capital.");
        c.vault -= d.unitCost;
        next = record(
          next,
          `Withdrew ${c.name} vault capital`,
          d.unitCost,
          now,
        );
        break;
      case "bankRates":
        if (
          d.mode !== "bank" ||
          !Number.isInteger(action.deposit) ||
          !Number.isInteger(action.lending) ||
          action.deposit < 1 ||
          action.deposit > 8 ||
          action.lending <= action.deposit ||
          action.lending > 16
        )
          throw new Error("Choose valid bank rates.");
        c.depositRate = action.deposit;
        c.lendingRate = action.lending;
        break;
      case "runMatch":
        if (d.mode !== "sport") throw new Error("Choose a sports club.");
        if (c.project) throw new Error("A match is already scheduled.");
        pay(50000000, `Scheduled ${c.name} match`);
        c.project = {
          name: "Match prize",
          endsAt: now + 1800000,
          cost: 50000000,
          payout: integer(55000000 + c.staff * 3000000 + c.training * 10000000),
        };
        break;
      default:
        throw new Error("Unknown company action.");
    }
    return validate(next);
  }
  if (action.type === "sellItem") {
    const a = ITEMS[action.index];
    if (!a || !next.items?.[action.index]) throw new Error("Item not owned.");
    const items = [...next.items],
      improvements = [...next.improvements!],
      value = mulDiv(propertyValue(next, action.index), 90, 100);
    items[action.index] = 0;
    improvements[action.index] = 0;
    return record(
      { ...next, items, improvements },
      `Sold ${a.name}`,
      value,
      now,
    );
  }
  if (action.type === "theme")
    return validate({ ...next, theme: action.value });
  if (action.type === "buyItem") {
    const a = ITEMS[action.index];
    if (!a) throw new Error("Choose an item.");
    if (next.items?.[action.index]) throw new Error("Already owned.");
    pay(assetPrice(next, action.index), `Purchased ${a.name}`);
    const items = [...next.items!];
    items[action.index] = 1;
    return validate({ ...next, items });
  }
  throw new Error("Use the company management screen for this action.");
}
export function ranking(g: Game) {
  return [
    ...RIVALS.map((r) => ({ ...r, player: false })),
    {
      name: g.profile?.name ?? "Entrepreneur",
      sector: g.profile?.sector ?? "Business & Investments",
      wealth: empireMetrics(g).netWorth,
      color: [
        "#4B99BA",
        "#6B8D58",
        "#996EAB",
        "#B89B5A",
        "#6BA8A0",
        "#C17D7D",
        "#647CA9",
        "#8E8E8E",
      ][g.profile?.avatar ?? 0],
      player: true,
    },
  ].sort((a, b) => b.wealth - a.wealth);
}
export function marketChange(index: number, time: number, seed?: number) {
  const price = marketPrice(index, time, seed),
    old = marketPrice(index, Math.max(0, time - 300000), seed);
  return ((price - old) / old) * 100;
}
export function marketCap(index: number, time: number, seed?: number) {
  return mulDiv(
    marketPrice(index, time, seed),
    MARKETS[index].kind === "Stock" ? 100000000 : 21000000,
    1,
  );
}
export function milestoneStatus(g: Game) {
  const m = empireMetrics(g);
  return [
    {
      id: "founder",
      name: "First company",
      eligible: !!g.companies?.length,
      reward: 100000,
    },
    {
      id: "millionaire",
      name: "Millionaire",
      eligible: m.netWorth >= 100000000,
      reward: 1000000,
    },
    {
      id: "billionaire",
      name: "Billionaire",
      eligible: m.netWorth >= 100000000000,
      reward: 100000000,
    },
    {
      id: "investor",
      name: "Income investor",
      eligible: (g.dividendsEarned ?? 0) > 0,
      reward: 50000,
    },
    {
      id: "empire",
      name: "Empire builder",
      eligible: !!g.companies?.some((c) =>
        ["clothing", "space", "holding"].includes(c.kind),
      ),
      reward: 10000000,
    },
  ].map((b) => ({ ...b, claimed: !!g.milestones?.includes(b.id) }));
}
