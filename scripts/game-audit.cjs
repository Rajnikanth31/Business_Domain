const assert = require("node:assert/strict");
const {
  act,
  initialGame,
  metrics,
  settle,
  BUSINESSES,
} = require("../src/engine/game.ts");

let company = { ...initialGame(0), cash: 1000000 };
company = act(company, { type: "buy", index: 0 }, 0);
company = act(company, { type: "upgrade", index: 0 }, 0);
company = act(company, { type: "upgrade", index: 0 }, 0);
const invested = 1000000 - company.cash;
const sold = act(company, { type: "sellBusiness", index: 0 }, 0);
assert.equal(invested, 320000);
assert.equal(metrics(company).assets, 240000);
assert.equal(sold.cash - company.cash, 240000);

let history = act(initialGame(0), { type: "buy", index: 0 }, 0);
for (let second = 1; second <= 60; second++)
  history = settle(history, second * 1000).game;
assert.equal(history.transactions.length, 60);
assert.equal(
  history.transactions.some((t) => t.label.includes("Purchased")),
  false,
);

let progression = act(initialGame(0), { type: "buy", index: 0 }, 0);
let completedAt = 0;
for (let second = 1; second <= 14400; second++) {
  progression = settle(progression, second * 1000).game;
  for (let index = 1; index < BUSINESSES.length; index++) {
    if (
      !progression.levels[index] &&
      progression.cash >= BUSINESSES[index].cost
    )
      progression = act(progression, { type: "buy", index }, second * 1000);
  }
  if (progression.levels.every(Boolean)) {
    completedAt = second;
    break;
  }
}
assert.equal(completedAt, 8787);
console.log(
  JSON.stringify(
    {
      valuation: {
        investedDollars: invested / 100,
        reportedDollars: metrics(company).assets / 100,
        soldForDollars: (sold.cash - company.cash) / 100,
      },
      ledger: {
        secondsUntilPurchaseDisappears: 60,
        recordLimit: history.transactions.length,
      },
      progression: {
        firstBusinessPurchasedImmediately: true,
        allFiveBusinessesOwnedAtMinutes: completedAt / 60,
        extraTaps: 0,
        upgrades: 0,
      },
    },
    null,
    2,
  ),
);
// Characterization probes: passing means the reported observations reproduce,
// not that the observed bugs are acceptable. Update after each associated fix.
