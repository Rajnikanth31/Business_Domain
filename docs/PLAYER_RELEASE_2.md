# Player release 2.0

Verified 31 October 2026 against the eleven supplied screenshot references. This is an original offline tycoon game with the requested screen organization and working player systems; its balance and business rules are independently implemented.

## Playable features

- Earnings: teal/navy header, dark world-style bank card, large animated tap area, upgrade progress, tap feedback and optional Android vibration. New players start at $0 with $2.50 per click; the first $1,000 upgrade raises income to $4.10. There are 30 clicker upgrades.
- Investing: Shares / Real Estate / Cryptocurrency sections, portfolio valuation and current-holdings return, hourly dividends, market entry, dividend recommendations, property market and owned-property views.
- Exchange: eight fictional stocks and eleven simulated crypto assets, Hot/Gainers/Losers/Highest Cap/Lowest Cap filters, price history, custom quantities, buy maximum and sell all. Crypto uses integer micro-units for up to six decimal places. Orders include a 1% fee, rounded up to cents. Quoted prices are simulated, not market data.
- Companies: eleven purchasable categories and three merger industries, a two-column category grid, ten independent company slots, player-supplied company names, paid timed expansions, staff capacity, recruitment, salary costs, training and employee release.
- Industry management: shop and factory production; taxi and shipping fleets; construction projects and resources; dealership resale contracts; IT developers and software projects; bank vault capital, simulated deposits, loan demand and configurable interest; sports matches and squad training; oil/gas production wells; airline aircraft.
- Mergers: Clothing brand, Space agency and Holding company. Eligibility comes from actual company stages, fleet counts, cash and (for holding companies) portfolio value. Selected companies are consumed atomically, and their invested capital is carried into the new company. Active projects/expansions must finish first. The Clothing brand requirements and starting hourly income follow the provided screenshot.
- Property: five rentable properties, maintenance, five paid improvements, increased rent/valuation and a 90% resale return.
- Items: cars, yachts, aircraft, an island, art and jewelry, with catalog/collection views, ownership, maintenance and resale.
- Profile: editable name, sector and avatar color, total fortune breakdown, saved light/dark preferences, three card styles, five one-time collectible milestone rewards, and an offline wealth ranking with a top-three podium and the player's actual net worth. Rivals are fictional fixed benchmarks, clearly labeled.
- Boost: free +30% positive company income for four hours, available once per 24-hour interval. No advertisement or payment is required.

## Money and timing rules

All wallet amounts use safe integer cents. Crypto quantity is fixed-point. Simulation rates use integer cents per game hour; temporary multiplication uses BigInt and only safe integers are persisted. Dividends are game-hour yields on nominal share value, rounded to cents per hour. Bank offers are explicitly expressed per game hour. These rates are game balance parameters, not real-world returns.

Settlement splits elapsed time at project completion, expansion completion and boost expiry. Closed Android requires no background JavaScript. Earned simulation time is capped at eight hours per settlement. Reopening cannot duplicate a committed payout. Backwards device time pauses settlement until the prior timestamp is reached; an offline game cannot fully prevent deliberate clock or save manipulation.

Company value is actual recorded investment plus vault capital, unconsumed resources and work in progress. A sale returns the displayed company value. Periodic income and tapping records are coalesced so routine ticks do not displace purchases after a minute. Financial actions save atomically before confirmed state is published. Legitimate taps queue during writes; duplicate financial button submissions are blocked while an action is pending.

## Existing players and recovery

The Android package and database filename remain unchanged. Schema 2 migrates earlier five-business saves into named company instances, keeps their cash, holdings, owned items and tap income, and preserves their original asset pricing. New-player property prices use the new balance. Original snapshots are retained before migration. A manual recovery backup can be saved from Profile. The loading error screen can restore the latest usable backup while retaining the unreadable snapshot. Backups remain in the device database and do not protect against uninstalling the app or losing the database file.

## Verification status

- TypeScript, lint and 81 Jest tests passed locally.
- Android JavaScript/Hermes bundle export passed with both original property images included.
- CI builds ARM64/x86_64 release-mode APKs and runs an installed-app Android smoke test: launch, starting cash, eleven credited taps, force-stop/relaunch persistence, category/opening screens, property navigation and Profile.
- [Cloud APK build and Android emulator checks passed](https://github.com/Rajnikanth31/Business_Domain/actions/runs/41226894591). API 35 / x86_64: launch, eleven taps, $27.50 after force-stop/reopen, company screens, property, Profile, dark-theme selection and relaunch. Corrected Earnings/property screenshots were inspected.
- [Download the verified APK](https://github.com/Rajnikanth31/Business_Domain/releases/download/v2.0.0-preview/Business-Empire-NextGen-2.0.0.apk). SHA-256: `6e396dbe05ab5694fed43293906b79aa6c8de56e4acad77dedf3b79a2810cb25`. The package and signing certificate match the previous 1.1 APK. Migration/backup tests use a transactional mock; an in-place 1.1 native upgrade and physical handset acceptance remain unverified. Production store signing remains separate.
- The clean dependency install reports 53 audit advisories (6 low, 42 moderate, 5 high). Runtime reachability has not been reviewed. Do not force incompatible SDK upgrades; dependency security review remains part of production release acceptance.

## Player acceptance route

1. Open a new game and tap; balance must increase by $2.50 per accepted click. Try rapid taps.
2. Reach the first upgrade target and raise click income to $4.10.
3. Open Business, choose a category, name and buy a company. Inspect expenses before hiring or expanding.
4. Buy vehicles/resources or start a project appropriate to the industry. Close/reopen and check the completed job/expansion is credited once.
5. Buy shares and fractional coins. Check fees, holdings, gain/loss, sell-all, filtering and dividend income.
6. Buy/improve/sell property in Investing; manage luxury collections in Items.
7. Inspect merger requirements and only confirm a merger after reviewing the actual companies and capital involved.
8. Edit Profile, switch theme/card style, collect eligible milestones once, create a backup and inspect wealth ranking.

Future additions outside the supplied screenshot flows include an online leaderboard/backend, broader country catalogs, player loans, daily/weekly missions, research and global expansion. No Play Store production signing, online financial service or advertisement SDK is included in this release.
