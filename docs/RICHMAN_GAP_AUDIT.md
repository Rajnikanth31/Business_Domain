# RichMan comparison and current-game audit

Audited 14 October 2026. Current application: Business Empire: NextGen 1.1.0. Scope: automated engine/store/component checks, source inspection, deterministic economy probes, and comparison with published RichMan documentation. This is not a native Android playthrough or an assertion of feature parity.

## Results

- Strict TypeScript: passed.
- ESLint: passed.
- Jest: 38 tests passed in six suites (wallet, transactions, business/item purchases and sales, investing, theme, offline settlement, save adapter, UI actions).
- Additional audit probes: reproduced the valuation defect, transaction-history loss, and short business-content progression.
- No local Android SDK/adb/emulator was found in the checked executable and standard SDK locations. Native force-stop/reopen, phone performance, TalkBack, and real SQLite interruption behavior remain unverified. Save adapter tests use mocks.
- Existing successfully built APK is not changed by this audit. No new APK was generated.

The current game resembles RichMan's menu structure, but remains substantially smaller in business management, progression, catalog depth and presentation. Passing the current tests does not establish parity with RichMan.

## Confirmed defects and reproducible observations

### P1 — Company valuation and sale do not return invested capital

Buy the Lemonade Stand for $800, upgrade to level 2 for $800, then to level 3 for $1,600. Total invested: $3,200. The reported valuation and sale proceeds are $2,400. Starting with $10,000 leaves reported net worth $9,200 after these purchases, despite documentation promising invested-capital valuation and full capital recovery.

Cause: upgrade cost is base cost × current level, but valuation and sale use base cost × final level. For level L, accumulated investment is base cost × (1 + L × (L − 1) / 2). The UI repeats the same incorrect valuation. Define one shared valuation rule and test levels 3–50. RichMan's version history describes business sale at 100% of company value; the defect here is also a mismatch with our own documented rule. [Official version history](https://apps.apple.com/us/app/business-empire-richman/id6451208928)

### P2 — Passive settlements erase meaningful transaction history

After buying a profitable business and advancing 60 one-second ticks, the purchase disappears from the 60-entry ledger. The Profile screen displays only the latest 12 entries, so meaningful actions can disappear from view much sooner. Aggregate routine settlement records or separate financial actions from periodic income history.

### P2 — Progression lacks depth and long-term goals

A deterministic strategy that purchases each affordable unowned business reaches all five business types after 146.45 minutes, without further taps or upgrades. This is catalog acquisition, not maximum upgrades or purchase of every item. Every business is purchasable immediately when affordable; no player-level, industry or merger gates exist. First-level business payback is approximately 9.5–19.2 minutes. These are measurements of our game, not verified RichMan timing targets.

### Risks found by inspection; Android behavior still needs measurement

- Every action waits for SQLite. A second tap during a save is discarded, even if it is a legitimate independent player tap. Existing concurrency tests deliberately verify this policy; they do not measure responsiveness on a phone. Queue legitimate tap input while retaining financial-action deduplication.
- Errors are displayed on the underlying main screen, while purchases/trades happen inside modal sheets. Financial failures need visible feedback inside the open sheet.
- Settlement writes a save every second even when income is zero, repeatedly toggling busy state and clearing errors. Measure disk activity and input impact; preserve error visibility until resolved or dismissed.
- Offline forward time is capped per settlement, but repeated clock advances still cannot be treated as trusted elapsed time. Backwards-time handling exists. Strong online competition would require authoritative server time/state.
- Corrupt saves are preserved but cannot be recovered through backup/import/restore controls.
- The tap progress bar shows available cash relative to upgrade cost, not tap experience, but has no explanation of that distinction.

## Feature comparison

| Area                | Current game                                                                    | Gap to close                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Businesses          | Five original types; one company per type; instant level upgrades               | Additional industry types, multiple company instances, naming, slots and timed upgrades                                               |
| Industry management | Same revenue/expense formula for every company                                  | Taxi/shipping fleet operations, construction jobs/resources, factory stages, IT staffing/projects, sports-club and oil/gas management |
| Banks               | No bank business                                                                | Bank-specific management and profitability controls                                                                                   |
| Mergers             | None                                                                            | Prerequisite businesses/assets, merger eligibility, asset consumption and merged-company upgrades                                     |
| Stocks/crypto       | Three fictional stocks, two crypto assets; quantities 1/10/100; one price chart | Larger catalog, dividends, search/sort, custom quantity, sell-all, price-range and portfolio tools                                    |
| Real estate         | Five fixed-price properties with fixed rent and maintenance                     | Location catalog, property improvements, richer demand/valuation and sale-detail flows                                                |
| Collections         | Two cars, one yacht, one jet; geometric icons                                   | Larger illustrated catalogs, garage/hangar/fleet views, other collectible categories and prestige goals                               |
| Earnings            | Dollar card, tapping, direct tap-income upgrade                                 | Temporary boosts, richer clicker progression, card skins, counter/tap feedback and haptics                                            |
| Profile/progression | Fixed name, net-worth breakdown, theme selector                                 | Editable profile, level/experience progression, milestones/insignias and meaningful long-term goals                                   |
| Presentation        | Light/dark themes and similar five tabs                                         | Detailed business-specific screens, item imagery, animations and closer screen-by-screen matching                                     |

Source confidence matters: the [official Android listing](https://play.google.com/store/apps/details?id=com.ttterbagames.businesssimulator) confirms business categories including banks, hiring, investments, real estate and luxury fleets/hangars. The [official iOS version history](https://apps.apple.com/us/app/business-empire-richman/id6451208928) documents mergers, construction resources, taxi/transport car management, sports clubs, levels/slots, card skins, sorting and boosts. Those versions can differ from the Android build you play. The community [business catalog and timed shop upgrades](https://businessempire.fandom.com/wiki/Shop), [merger prerequisites](https://businessempire.fandom.com/wiki/Clothing_Brand) and [insignias](https://businessempire.fandom.com/wiki/Insignias) provide supplemental detail; they are not a verified specification for every current release. Dividends are also described in store user reviews rather than the developer's core description. Exact balance and complete screen parity need a reference Android version/playthrough.

## Recommended implementation sequence

1. Fix valuation/sale consistency, preserve useful transaction history, and make errors/input behavior reliable. Run native Android acceptance checks.
2. Replace the fixed five-element ownership model with versioned company instances while preserving existing cash and ownership; add naming, slots and timed upgrade state.
3. Add bank and taxi/shipping mechanics first, then factory/construction/IT and other industry-specific management.
4. Add actual merger prerequisite checks and late-game companies with meaningful progression gates.
5. Expand market tools and dividends, property improvements and item catalogs; retain integer accounting and atomic saves.
6. Add profile progression/insignias and polish business/item screens, animations and accessibility.
7. Run a full phone playthrough covering progression, airplane mode, force stop, save interruption and upgrades from the existing APK.

Features requested in the original master brief but not established as RichMan parity requirements include an offline advisor, daily/weekly missions, research, global regions and economic events. Some are still absent from NextGen; track them separately rather than treating a broad store description as proof of identical mechanics.

## Reproduce the probes

Run the supplied audit script with Node 25 (the installed development runtime): `node scripts/game-audit.cjs`. Passing assertions mean the documented observations reproduce. This script is intentionally separate from regression tests and does not endorse the observed defects.
