# Business Empire: NextGen

Original offline idle tycoon. Fictional currency uses integer hundredths ($1 = 100). Start with $1,000; each tap earns $10; the first tap upgrade costs $500. Buy five progressively more expensive beginner businesses. Level increases revenue linearly and expenses quadratically, so overexpansion can lose money. Bankrupt operations stop consuming cash at zero; tapping provides a recovery route.

Business valuation is original purchase cost plus capital spent on upgrades. Net worth = cash + business valuation; unimplemented asset classes and liabilities are zero. Markets remain stable in this milestone. No invented levels or portfolio performance.

Settle using elapsed milliseconds, integer arithmetic and carried fractional cents. Limit each absent interval to eight hours. Advance the settlement timestamp even when capped. Backwards time retains the previous timestamp and earns nothing until the clock catches up. Offline manipulation cannot be fully prevented. UI waits for each atomic save and rejects concurrent actions.

Later phases: seeded investments; properties and loans; staff and research; economy and progression; visual polish; release readiness. Later systems are clearly labeled roadmap views rather than fake controls.

The revised interface uses simulated US dollar amounts with a selectable light or dark theme. Internal values remain integer cents. Hourly income in the UI equals per-second simulation income multiplied by 3,600. Stock and crypto prices are deterministic hash functions of a saved seed and five-minute time buckets; this bounded-price first implementation is not a realistic stochastic exchange model. Trades have a 1% fee and persist total cost basis. Properties earn fixed rent; luxury assets incur maintenance. Item resale returns 90% of purchase value; company resale returns all invested capital. These simplified mechanics have explicit tests and can expand independently.

