# Architecture

Expo SDK 57, Expo Router tabs, TypeScript, Zustand, Expo SQLite and Reanimated. Android first; no backend.

- `src/engine/game.ts`: shared money, legacy economy, validation and action dispatch.
- `src/engine/empire.ts`: pure schema-2 economy, migration, company actions, markets, projects, milestones and elapsed settlement.
- `src/data/catalog.ts`: company categories, merger rules and fictional ranking benchmarks.
- `src/db/save.ts`: schema-2 singleton snapshot, WAL and exclusive transactions. Wallet/assets save together. Original migration snapshots, manual backups and unreadable recovery snapshots are retained. Future schemas are refused.
- `src/store/game.ts`: serialized persistence before publishing, queued legitimate taps, duplicate financial submission guard and recoverable errors.
- `src/screens`: five player screen modules; shared components in `src/components/GameUI.tsx`.
- `src/app`: navigation and foreground settlement. Closed Android needs no background timer.

Money uses integer cents, crypto integer micro-units and elapsed rates integer cents per game hour. BigInt arithmetic carries fractional income without saving unsafe values. Settlement splits at timed events and caps earned elapsed time at eight hours. Offline clock or save manipulation cannot be fully prevented without a server.

The bounded ledger coalesces routine income. Device backups do not survive uninstall. Engine, persistence and UI tests run locally; GitHub Actions builds the APK and checks launch and actual SQLite persistence on an emulator. This remains preview signing, not a Play Store production release.
