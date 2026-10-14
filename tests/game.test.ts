import {
  act,
  initialGame,
  metrics,
  settle,
  validate,
  CAP_SECONDS,
} from "../src/engine/game";
describe("financial engine", () => {
  test("starting capital and tapping use integer cents", () => {
    const g = act(initialGame(1000), { type: "tap" }, 1000);
    expect(g.cash).toBe(101000);
    expect(g.taps).toBe(1);
  });
  test("purchase records asset and cash together", () => {
    const g = act(initialGame(0), { type: "buy", index: 0 }, 0);
    expect(g.cash).toBe(20000);
    expect(g.levels[0]).toBe(1);
    expect(metrics(g).netWorth).toBe(100000);
  });
  test("insufficient funds do not mutate original", () => {
    const g = initialGame(0);
    expect(() => act(g, { type: "buy", index: 4 }, 0)).toThrow("Not enough");
    expect(g.cash).toBe(100000);
  });
  test("duplicate purchase rejected", () => {
    const g = act(initialGame(0), { type: "buy", index: 0 }, 0);
    expect(() => act(g, { type: "buy", index: 0 }, 0)).toThrow("Ownership");
  });
  test("upgrade has increasing expenses and records capital", () => {
    const g = { ...initialGame(0), cash: 1000000, levels: [1, 0, 0, 0, 0] };
    const n = act(g, { type: "upgrade", index: 0 }, 0);
    expect(n.cash).toBe(920000);
    expect(metrics(n).profit).toBe(200);
  });
  test("eight-hour cap and duplicate settlement", () => {
    const g = { ...initialGame(0), levels: [1, 0, 0, 0, 0] };
    const r = settle(g, 24 * 3600000);
    expect(r.amount).toBe(140 * CAP_SECONDS);
    expect(settle(r.game, 24 * 3600000).amount).toBe(0);
  });
  test("backwards clock does not reset settlement timestamp", () => {
    const g = initialGame(10000);
    const r = settle(g, 1000);
    expect(r.anomaly).toBe(true);
    expect(r.game.lastSettlement).toBe(10000);
  });
  test("fractional cents are independent of tick frequency", () => {
    const g = { ...initialGame(0), levels: [1, 0, 0, 0, 0] };
    let n = g;
    for (let t = 1; t <= 1000; t++) n = settle(n, t).game;
    expect(n.cash).toBe(settle(g, 1000).game.cash);
  });
  test("negative profit floors wallet at zero without debt exploit", () => {
    const g = { ...initialGame(0), cash: 10, levels: [10, 0, 0, 0, 0] };
    expect(metrics(g).profit).toBeLessThan(0);
    expect(settle(g, 100000).game.cash).toBe(0);
  });
  test("invalid upgrades and unsafe money rejected", () => {
    expect(() =>
      act(initialGame(0), { type: "upgrade", index: 0 }, 0),
    ).toThrow();
    expect(() =>
      settle(
        {
          ...initialGame(0),
          cash: Number.MAX_SAFE_INTEGER,
          levels: [1, 0, 0, 0, 0],
        },
        1000,
      ),
    ).toThrow();
  });
  test("save round trip preserves timestamp and holdings", () => {
    const g = act(initialGame(0), { type: "buy", index: 0 }, 0);
    expect(validate(JSON.parse(JSON.stringify(g)))).toEqual(g);
  });
  test("corrupted save rejected", () => {
    expect(() => validate({ ...initialGame(0), cash: 1.1 })).toThrow();
    expect(() => validate({ ...initialGame(0), levels: [-1] })).toThrow();
  });
  test("first business is immediately reachable without unlocking all", () => {
    const g = initialGame(0);
    expect(() => act(g, { type: "buy", index: 0 }, 0)).not.toThrow();
    expect(() => act(g, { type: "buy", index: 1 }, 0)).toThrow();
  });
});
