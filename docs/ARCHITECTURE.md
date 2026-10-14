# Architecture

Expo SDK selected by the current official default template; Expo Router tabs, strict TypeScript, Zustand, Expo SQLite and Reanimated. Android first. No backend.

`src/engine/game.ts`: pure integer economy, validation, purchases, upgrades, elapsed settlement and financial metrics.
`src/db/save.ts`: SQLite schema version 1, WAL, singleton snapshot and exclusive atomic transactions. The snapshot contains wallet, ownership, upgrade levels, timestamps, remainder and bounded transaction ledger together. Unsupported versions or corrupt saves stop loading without overwriting the row.
`src/store/game.ts`: one operation at a time, persist before publishing state, recoverable errors.
`src/app`: Router navigation and active-app settlement. Closed Android requires no background timers.
`src/screens/GameScreen.tsx`: accessible dark interface and actual financial metrics.

Known ceiling: singleton save and bounded ledger are sufficient for the first milestone; detailed accounting history and normalized feature tables come with later reporting needs. A lost app process during an unconfirmed action may roll it back; committed actions persist atomically. No reset control, to protect corrupted saves from accidental replacement.
