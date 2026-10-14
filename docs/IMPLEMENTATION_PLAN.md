# Implementation checklist

- [x] Phase 1: Expo, strict TypeScript, five tabs, dark theme, Zustand, SQLite schema migration.
- [x] Phase 2 first milestone: cash, taps, five businesses, upgrades, passive income, eight-hour offline cap, persistence and financial statistics.
- [ ] Android device verification: close/reopen, force stop, purchase, offline summary and accessibility.
- [x] Original geometric app icon, adaptive icon and splash artwork.
- [ ] Phase 3: seeded stocks and crypto.
- [ ] Phase 4: property, savings and loans.
- [ ] Phase 5: employees, advanced industry, research and regions.
- [ ] Phase 6: economic events, missions, achievements and levels.
- [ ] Phase 7: charts, onboarding, haptics and deeper animation polish.
- [ ] Phase 8: device QA, release signing and completed APK/AAB builds.

Validation results are recorded in README after executing checks. The first milestone is not an assertion of production readiness.

Validation: strict TypeScript, lint, 22 Jest tests and Android Hermes bundle export passed. Expo compatibility check passed. Native device QA and APK/AAB builds remain unverified. npm audit retains 66 advisories after compatible fixes; release dependency review remains open.



## RichMan-inspired redesign and dollar currency

Completed: dark charcoal/green and light/blue appearances; saved theme preference; Investing/Business/Earnings/Items/Profile navigation; virtual bank-card balance; large tap area; company catalog/detail and sale; hourly income presentation; dollar formatting preserving existing cents.

Added playable feature subsets: seeded fictional stocks and crypto with fees, positions, average cost, realized/unrealized gains and price charts; five rental properties and four luxury items with maintenance and resale. Existing version-1 snapshots remain valid; new fields are optional and validated. Advanced industries, staff, loans, missions and mergers still remain future work; the complete RichMan feature set is not claimed.

Validation: TypeScript, lint, 38 tests in six suites and Android bundle export passed. Android 1.1.0 / version code 2 preserves the same package and database for upgrades. Cloud APK build succeeded in run 38592733694; artifact 11908163902 contains app-release.apk. Native device QA is still pending.

