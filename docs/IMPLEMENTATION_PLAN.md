# Player implementation checklist

## Implemented for 2.0

- [x] Original screenshot-based Earnings layout, world-style card, animated tapping and dollar currency.
- [x] New-player clicker progression and preservation of older player balances/income.
- [x] Independent named companies, ten slots and migration from the original ownership arrays.
- [x] All eleven shown business categories and their working management controls.
- [x] Staff recruitment, training, release and salary effects.
- [x] Timed expansion, fleets, projects, resources, banking, matches, wells and aircraft.
- [x] Clothing brand, Space agency and Holding company mergers with actual prerequisite checks.
- [x] Shares / Real Estate / Cryptocurrency navigation and working landing pages.
- [x] Portfolio returns, hourly dividends, exchange filters, custom orders and fractional crypto.
- [x] Property ownership, improvements, rental income, maintenance and resale.
- [x] Six luxury collection categories with purchases and sales.
- [x] Editable Profile, player levels, one-time milestone rewards and offline wealth ranking.
- [x] Saved light/dark themes, card styles, haptic preference and daily free income boost.
- [x] Correct cumulative business valuation and useful retained transaction history.
- [x] Atomic schema-2 migration, original snapshot backup and player recovery backup.
- [x] Original property banner artwork bundled into the app.
- [x] TypeScript, lint, 81 regression tests and Android bundle export.
- [x] Free standard-runner GitHub Actions configuration for APK and installed-app smoke checks.
- [ ] Confirm the 2.0 cloud APK build and Android emulator smoke run.
- [ ] Physical Android handset acceptance testing and production store signing.

See PLAYER_RELEASE_2.md for the implemented rules, test scope and player acceptance route. Earlier audits document the historical 1.1 version and should not be interpreted as the current feature inventory.

## Later scope

Online/server-authoritative features, broader catalogs/regions, player loans, missions, research and global expansion are separate work beyond these supplied screen flows. An offline game cannot fully prevent device clock manipulation or edited saves.
