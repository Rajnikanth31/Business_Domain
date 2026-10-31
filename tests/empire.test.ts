import {
  act,
  businessValue,
  initialGame,
  ITEMS,
  MARKETS,
  metrics,
  money,
  settle,
  validate,
} from "../src/engine/game";
import {
  dividendYield,
  assetPrice,
  bankDetails,
  companyRates,
  companyValue,
  dividendHourly,
  empireMetrics,
  marketUnits,
  mergerStatus,
  migrate,
  newPlayer,
  orderValue,
  parseQuantity,
  propertyValue,
  quantityText,
  ranking,
} from "../src/engine/empire";
import { INDUSTRIES } from "../src/data/catalog";
function rich() {
  return { ...newPlayer(0), cash: 100000000000000 };
}
function open(kind = "shop") {
  return act(rich(), { type: "openCompany", kind }, 0);
}
test("new player has reference click values and a zero dollar balance", () => {
  const g = newPlayer(0);
  expect(g.version).toBe(2);
  expect(g.cash).toBe(0);
  expect(money(act(g, { type: "tap" }, 0).cash)).toBe("$2.50");
});
test("migration preserves cash, holdings, items and corrected company capital", () => {
  const old = {
    ...initialGame(100),
    cash: 123456,
    levels: [3, 0, 0, 0, 0],
    holdings: Array.from({ length: 5 }, (_, i) => ({
      quantity: i === 3 ? 2 : 0,
      cost: i === 3 ? 10000 : 0,
    })),
    items: [1, 0, 0, 0, 0, 1, 0, 0, 0],
  };
  const g = migrate(old);
  expect(g.cash).toBe(123456);
  expect(g.companies![0].capital).toBe(320000);
  expect(g.holdings![3].quantity).toBe(2000000);
  expect(empireMetrics(g).portfolio).toBe(metrics(old).portfolio);
  expect(g.items![5]).toBe(1);
  expect(migrate(g)).toBe(g);
  expect(validate(JSON.parse(JSON.stringify(g)))).toEqual(g);
});
test("cumulative legacy business valuation is correct at high stages", () => {
  expect(businessValue(0, 3)).toBe(320000);
  expect(businessValue(0, 50)).toBe(80000 * (1 + (50 * 49) / 2));
});
test("each screenshot business category can be purchased", () => {
  for (const d of INDUSTRIES.filter((x) => x.mode !== "merged")) {
    const g = act(rich(), { type: "openCompany", kind: d.id }, 0);
    expect(g.companies![0].kind).toBe(d.id);
    expect(g.cash).toBe(100000000000000 - d.cost);
  }
});
test("multiple same-type companies have independent IDs and names", () => {
  let g = open();
  g = act(g, { type: "openCompany", kind: "shop", name: "Second shop" }, 0);
  expect(g.companies).toHaveLength(2);
  expect(g.companies![0].id).not.toBe(g.companies![1].id);
  expect(g.companies![1].name).toBe("Second shop");
});
test("ten company slots are enforced without deducting money", () => {
  let g = rich();
  for (let i = 0; i < 10; i++)
    g = act(g, { type: "openCompany", kind: "shop" }, 0);
  const before = JSON.stringify(g);
  expect(() => act(g, { type: "openCompany", kind: "shop" }, 0)).toThrow("10");
  expect(JSON.stringify(g)).toBe(before);
});
test("timed expansion charges once and changes stage at completion", () => {
  const g = open(),
    c = g.companies![0],
    n = act(g, { type: "companyUpgrade", id: c.id }, 0),
    end = n.companies![0].upgrade!.endsAt;
  expect(n.companies![0].level).toBe(1);
  expect(() => act(n, { type: "companyUpgrade", id: c.id }, 0)).toThrow();
  expect(settle(n, end - 1).game.companies![0].level).toBe(1);
  const done = settle(n, end).game;
  expect(done.companies![0].level).toBe(2);
  expect(done.companies![0].upgrade).toBeUndefined();
  expect(settle(done, end).amount).toBe(0);
});
test("upgrade income is split at the completion timestamp", () => {
  const n = act(
      open(),
      { type: "companyUpgrade", id: open().companies![0].id },
      0,
    ),
    end = n.companies![0].upgrade!.endsAt;
  const once = settle(n, end + 3600000).game,
    part = settle(settle(n, end).game, end + 3600000).game;
  expect(once.cash).toBe(part.cash);
  expect(once.remainder).toBe(part.remainder);
});
test("company sale returns invested capital and prevents duplicate sale", () => {
  const g = open(),
    c = g.companies![0],
    sold = act(g, { type: "companySell", id: c.id }, 0);
  expect(sold.cash).toBe(100000000000000);
  expect(sold.companies).toHaveLength(0);
  expect(() => act(sold, { type: "companySell", id: c.id }, 0)).toThrow();
});
test("fleets generate revenue and retain their purchase value", () => {
  let g = open("shipping"),
    c = g.companies![0];
  const before = companyRates(c).profit;
  g = act(g, { type: "buyCity", id: c.id }, 0);
  g = act(g, { type: "buyIntercity", id: c.id }, 0);
  c = g.companies![0];
  expect(c.city).toBe(1);
  expect(c.intercity).toBe(1);
  expect(companyRates(c).profit).toBeGreaterThan(before);
  expect(companyValue(c)).toBe(1989900 + 600000 + 1800000);
});
test("employees have salaries and training affects productivity", () => {
  let g = open();
  const before = companyRates(g.companies![0]);
  g = act(g, { type: "hire", id: g.companies![0].id }, 0);
  const hired = companyRates(g.companies![0]);
  expect(hired.expenses).toBeGreaterThan(before.expenses);
  g = act(g, { type: "train", id: g.companies![0].id }, 0);
  expect(companyRates(g.companies![0]).revenue).toBeGreaterThan(hired.revenue);
});
test("IT projects require developers and finish exactly once", () => {
  let g = open("it"),
    id = g.companies![0].id;
  expect(() => act(g, { type: "startProject", id }, 0)).toThrow("Hire");
  g = act(g, { type: "hire", id }, 0);
  g = act(g, { type: "startProject", id }, 0);
  const end = g.companies![0].project!.endsAt;
  expect(() => act(g, { type: "startProject", id }, 0)).toThrow("already");
  const done = settle(g, end).game;
  expect(done.companies![0].project).toBeUndefined();
  expect(
    done.transactions.some((t) => t.label.includes("Software delivery")),
  ).toBe(true);
  expect(settle(done, end).amount).toBe(0);
});
test("construction contracts consume resources and preserve work in progress", () => {
  let g = open("construction"),
    id = g.companies![0].id;
  expect(() => act(g, { type: "startProject", id }, 0)).toThrow("resources");
  g = act(g, { type: "buyResource", id }, 0);
  const before = empireMetrics(g).netWorth;
  g = act(g, { type: "startProject", id }, 0);
  expect(g.companies![0].resources).toBe(0);
  expect(empireMetrics(g).netWorth).toBe(before);
});
test("bank funding and withdrawals preserve net worth", () => {
  let g = open("bank"),
    id = g.companies![0].id;
  const before = empireMetrics(g).netWorth;
  g = act(g, { type: "fundBank", id }, 0);
  expect(empireMetrics(g).netWorth).toBe(before);
  expect(bankDetails(g.companies![0]).loans).toBeGreaterThan(0);
  expect(companyRates(g.companies![0]).revenue).toBeGreaterThan(0);
  g = act(g, { type: "withdrawBank", id }, 0);
  expect(empireMetrics(g).netWorth).toBe(before);
  expect(() => act(g, { type: "withdrawBank", id }, 0)).toThrow();
});
test("bank policies change income and validate the interest spread", () => {
  let g = open("bank"),
    id = g.companies![0].id;
  g = act(g, { type: "fundBank", id }, 0);
  const before = companyRates(g.companies![0]).profit;
  g = act(g, { type: "bankRates", id, deposit: 5, lending: 10 }, 0);
  expect(companyRates(g.companies![0]).profit).not.toBe(before);
  expect(() =>
    act(g, { type: "bankRates", id, deposit: 8, lending: 3 }, 0),
  ).toThrow();
});
test("oil wells and airline aircraft produce industry-specific income", () => {
  for (const kind of ["oil", "airline"]) {
    let g = open(kind),
      id = g.companies![0].id;
    const before = companyRates(g.companies![0]).profit;
    g = act(
      g,
      { type: kind === "oil" ? "buyResource" : "buyIntercity", id },
      0,
    );
    expect(companyRates(g.companies![0]).profit).toBeGreaterThan(before);
  }
});
test("sports match is completed before the win is counted", () => {
  let g = open("sport"),
    id = g.companies![0].id;
  g = act(g, { type: "runMatch", id }, 0);
  expect(g.companies![0].wins).toBe(0);
  expect(
    settle(g, g.companies![0].project!.endsAt).game.companies![0].wins,
  ).toBe(1);
});
test("four-hour boost expires correctly across offline settlement", () => {
  const g = act(open(), { type: "boost" }, 0),
    once = settle(g, 6 * 3600000).game,
    part = settle(settle(g, 4 * 3600000).game, 6 * 3600000).game;
  expect(once.cash).toBe(part.cash);
  expect(once.remainder).toBe(part.remainder);
  expect(() => act(g, { type: "boost" }, 1000)).toThrow("24 hours");
  expect(empireMetrics(once).bonusHourly).toBe(0);
});
test("offline income retains the eight-hour cap and clock guard", () => {
  const g = open();
  const result = settle(g, 24 * 3600000);
  expect(result.seconds).toBe(28800);
  expect(result.anomaly).toBe(true);
  expect(settle(result.game, 24 * 3600000).amount).toBe(0);
  expect(settle(result.game, 100).game.lastSettlement).toBe(24 * 3600000);
});
test("small ticks and one settlement produce identical currency", () => {
  let g = open();
  const before = g;
  for (let i = 1; i <= 100; i++) g = settle(g, i * 10).game;
  expect(g.cash).toBe(settle(before, 1000).game.cash);
  expect(g.remainder).toBe(settle(before, 1000).game.remainder);
});
test("passive settlements do not bury the opening purchase", () => {
  let g = open();
  for (let i = 1; i <= 60; i++) g = settle(g, i * 1000).game;
  expect(g.transactions.some((t) => t.label.startsWith("Opened"))).toBe(true);
  expect(g.transactions.length).toBeLessThan(5);
});
test("mergers consume only eligible companies and retain their capital", () => {
  let g = rich();
  for (const kind of ["shop", "shipping", "factory"])
    g = act(g, { type: "openCompany", kind }, 0);
  g = {
    ...g,
    companies: g.companies!.map((c) => ({
      ...c,
      level: c.kind === "shop" ? 10 : c.kind === "factory" ? 20 : 1,
      city: c.kind === "shipping" ? 8 : 0,
      intercity: c.kind === "shipping" ? 2 : 0,
    })),
  };
  expect(mergerStatus(g, "clothing").eligible).toBe(true);
  const before = empireMetrics(g).netWorth,
    n = act(g, { type: "merge", kind: "clothing" }, 0);
  expect(n.companies).toHaveLength(1);
  expect(n.companies![0].kind).toBe("clothing");
  expect(empireMetrics(n).netWorth).toBe(before);
  expect(companyRates(n.companies![0]).profit).toBe(42130000);
  expect(() => act(n, { type: "merge", kind: "clothing" }, 0)).toThrow();
});
test("ineligible merger does not consume cash or assets", () => {
  const g = open(),
    old = JSON.stringify(g);
  expect(() => act(g, { type: "merge", kind: "clothing" }, 0)).toThrow(
    "requirement",
  );
  expect(JSON.stringify(g)).toBe(old);
});
test("dividends are paid once through elapsed-time settlement", () => {
  let g = rich();
  g = act(g, { type: "trade", index: 0, side: "buy", quantity: 1000000 }, 0);
  expect(dividendYield(0)).toBe(532);
  const rate = dividendHourly(g),
    result = settle(g, 3600000);
  expect(rate).toBeGreaterThan(0);
  expect(result.amount).toBe(rate);
  expect(result.game.dividendsEarned).toBe(rate);
  expect(settle(result.game, 3600000).amount).toBe(0);
});
test("fractional crypto orders use integer micro-units without free rounding gains", () => {
  const i = MARKETS.findIndex((a) => a.symbol === "BTC"),
    q = parseQuantity(i, "0.0025"),
    old = rich();
  expect(q).toBe(2500);
  expect(quantityText(i, q)).toBe("0.0025");
  const bought = act(
    old,
    { type: "trade", index: i, side: "buy", quantity: q },
    0,
  );
  expect(bought.holdings![i].quantity).toBe(q);
  expect(orderValue(i, q, 0)).toBeGreaterThan(0);
  const sold = act(
    bought,
    { type: "trade", index: i, side: "sell", quantity: q },
    0,
  );
  expect(sold.cash).toBeLessThan(old.cash);
  expect(sold.holdings![i].cost).toBe(0);
  expect(marketUnits(i)).toBe(1000000);
});
test("invalid fractional orders and huge numeric inputs are rejected", () => {
  const i = MARKETS.findIndex((a) => a.symbol === "BTC");
  for (const text of [
    "-1",
    "1.0000001",
    "abc",
    "1e10",
    "999999999999999999999999",
  ])
    expect(() => parseQuantity(i, text)).toThrow();
  expect(() => parseQuantity(0, "1.5")).toThrow();
});
test("property improvements change valuation and rent and are sold once", () => {
  let g = act(rich(), { type: "buyItem", index: 0 }, 0),
    old = empireMetrics(g);
  g = act(g, { type: "improveProperty", index: 0 }, 0);
  expect(g.improvements![0]).toBe(1);
  expect(propertyValue(g, 0)).toBe(
    assetPrice(g, 0) + Math.floor(assetPrice(g, 0) / 10),
  );
  expect(empireMetrics(g).rentHourly).toBeGreaterThan(old.rentHourly);
  const proceeds = Math.floor(propertyValue(g, 0) * 0.9),
    cash = g.cash;
  g = act(g, { type: "sellItem", index: 0 }, 0);
  expect(g.cash - cash).toBe(proceeds);
  expect(g.improvements![0]).toBe(0);
});
test("profile, themes and card skins persist and player rank uses actual net worth", () => {
  let g = act(
    newPlayer(0),
    { type: "profile", name: "Raja", sector: "Technology", avatar: 3 },
    0,
  );
  g = act(g, { type: "theme", value: "dark" }, 0);
  g = act(g, { type: "cardSkin", value: "ocean" }, 0);
  expect(validate(JSON.parse(JSON.stringify(g)))).toEqual(g);
  const board = ranking(g);
  expect(board.find((r) => r.player)!.name).toBe("Raja");
  expect(board.find((r) => r.player)!.wealth).toBe(empireMetrics(g).netWorth);
});
test("corrupt company timers and duplicate IDs cannot be saved", () => {
  const g = open(),
    c = g.companies![0];
  expect(() => validate({ ...g, companies: [c, c] })).toThrow();
  expect(() =>
    validate({
      ...g,
      companies: [{ ...c, upgrade: { endsAt: 1, target: 99, cost: 1 } }],
    }),
  ).toThrow();
});
test("milestone rewards are persisted and cannot be collected twice", () => {
  const g = open(),
    cash = g.cash,
    n = act(g, { type: "claimMilestone", id: "founder" }, 0);
  expect(n.cash).toBe(cash + 100000);
  expect(n.milestones).toContain("founder");
  expect(() => act(n, { type: "claimMilestone", id: "founder" }, 0)).toThrow();
  expect(() =>
    act(newPlayer(0), { type: "claimMilestone", id: "founder" }, 0),
  ).toThrow();
});
test("releasing staff reduces salary expense and cannot create negative staff", () => {
  let g = open(),
    id = g.companies![0].id;
  expect(() => act(g, { type: "fire", id }, 0)).toThrow();
  g = act(g, { type: "hire", id }, 0);
  const before = companyRates(g.companies![0]).expenses;
  g = act(g, { type: "fire", id }, 0);
  expect(g.companies![0].staff).toBe(0);
  expect(companyRates(g.companies![0]).expenses).toBeLessThan(before);
});
