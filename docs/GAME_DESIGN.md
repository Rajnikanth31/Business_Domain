# Business Empire: NextGen

Original offline idle tycoon. Fictional currency uses integer hundredths (¤1 = 100). Start with ¤1,000; each tap earns ¤10; the first tap upgrade costs ¤500. Buy five progressively more expensive beginner businesses. Level increases revenue linearly and expenses quadratically, so overexpansion can lose money. Bankrupt operations stop consuming cash at zero; tapping provides a recovery route.

Business valuation is original purchase cost plus capital spent on upgrades. Net worth = cash + business valuation; unimplemented asset classes and liabilities are zero. Markets remain stable in this milestone. No invented levels or portfolio performance.

Settle using elapsed milliseconds, integer arithmetic and carried fractional cents. Limit each absent interval to eight hours. Advance the settlement timestamp even when capped. Backwards time retains the previous timestamp and earns nothing until the clock catches up. Offline manipulation cannot be fully prevented. UI waits for each atomic save and rejects concurrent actions.

Later phases: seeded investments; properties and loans; staff and research; economy and progression; visual polish; release readiness. Later systems are clearly labeled roadmap views rather than fake controls.
