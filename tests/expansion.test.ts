import {
  act,
  initialGame,
  ITEMS,
  MARKETS,
  marketPrice,
  metrics,
  money,
  settle,
  validate,
} from "../src/engine/game";
test("dollars include cents and negative signs", () => {
  expect(money(123456)).toBe("$1,234.56");
  expect(money(-140)).toBe("-$1.40");
});
test("theme persists without altering stored dollar cents", () => {
  const old = initialGame(0);
  const next = act(old, { type: "theme", value: "light" }, 0);
  expect(next.cash).toBe(old.cash);
  expect(validate(JSON.parse(JSON.stringify(next))).theme).toBe("light");
  expect(validate(old)).toEqual(old);
});
test("business sale returns capital and prevents duplicate sale", () => {
  const g = act(initialGame(0), { type: "buy", index: 0 }, 0);
  const next = act(g, { type: "sellBusiness", index: 0 }, 0);
  expect(next.cash).toBe(100000);
  expect(next.levels[0]).toBe(0);
  expect(() => act(next, { type: "sellBusiness", index: 0 }, 0)).toThrow();
});
test("stock buy and sell charge fees and track cost basis", () => {
  const old = initialGame(0),
    price = marketPrice(0, 0),
    fee = Math.ceil(price / 100);
  const bought = act(
    old,
    { type: "trade", index: 0, side: "buy", quantity: 1 },
    0,
  );
  expect(bought.cash).toBe(old.cash - price - fee);
  expect(bought.holdings?.[0]).toEqual({ quantity: 1, cost: price + fee });
  expect(metrics(bought).netWorth).toBe(old.cash - fee);
  const sold = act(
    bought,
    { type: "trade", index: 0, side: "sell", quantity: 1 },
    0,
  );
  expect(sold.cash).toBe(old.cash - fee * 2);
  expect(sold.realized).toBe(-fee * 2);
  expect(sold.holdings?.[0]).toEqual({ quantity: 0, cost: 0 });
});
test("partial sale keeps the remaining cost basis", () => {
  const g = act(
      initialGame(0),
      { type: "trade", index: 0, side: "buy", quantity: 10 },
      0,
    ),
    cost = g.holdings![0].cost;
  const next = act(
    g,
    { type: "trade", index: 0, side: "sell", quantity: 1 },
    0,
  );
  expect(next.holdings![0]).toEqual({
    quantity: 9,
    cost: cost - Math.floor(cost / 10),
  });
});
test("invalid orders and overselling cannot create money", () => {
  for (const quantity of [0, -1, 1.5, Number.MAX_SAFE_INTEGER])
    expect(() =>
      act(
        initialGame(0),
        { type: "trade", index: 0, side: "buy", quantity },
        0,
      ),
    ).toThrow();
  expect(() =>
    act(
      initialGame(0),
      { type: "trade", index: 0, side: "sell", quantity: 1 },
      0,
    ),
  ).toThrow();
});
test("market simulation is deterministic, positive and seeded", () => {
  for (let i = 0; i < MARKETS.length; i++) {
    expect(marketPrice(i, 1000000, 1729)).toBe(marketPrice(i, 1000000, 1729));
    expect(marketPrice(i, 1000000)).toBeGreaterThan(0);
  }
  expect(marketPrice(0, 0, 1729)).not.toBe(marketPrice(0, 0, 1730));
});
test("property contributes to valuation and rental income", () => {
  const g = act(initialGame(0), { type: "buyItem", index: 0 }, 0);
  expect(g.cash).toBe(15000);
  expect(metrics(g).properties).toBe(85000);
  expect(metrics(g).netWorth).toBe(100000);
  expect(settle(g, 1000).amount).toBe(ITEMS[0].rent - ITEMS[0].expense);
  expect(() => act(g, { type: "buyItem", index: 0 }, 0)).toThrow();
});
test("property sale deducts ten percent and prevents duplicate sale", () => {
  const g = act(initialGame(0), { type: "buyItem", index: 0 }, 0),
    sold = act(g, { type: "sellItem", index: 0 }, 0);
  expect(sold.cash).toBe(91500);
  expect(sold.items?.[0]).toBe(0);
  expect(() => act(sold, { type: "sellItem", index: 0 }, 0)).toThrow();
});
test("luxury maintenance reduces profit", () => {
  const g = act(
    { ...initialGame(0), cash: 2000000 },
    { type: "buyItem", index: 5 },
    0,
  );
  expect(metrics(g).luxuries).toBe(ITEMS[5].cost);
  expect(metrics(g).profit).toBe(-ITEMS[5].expense);
});
test("corrupted optional saved feature fields are rejected", () => {
  expect(() => validate({ ...initialGame(0), items: [1] })).toThrow();
  expect(() =>
    validate({ ...initialGame(0), holdings: [{ quantity: -1, cost: 0 }] }),
  ).toThrow();
});
