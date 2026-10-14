# Business Empire: NextGen

First playable milestone, Android-first Expo SDK 57 application. Starting cash ¤1,000, tap income ¤10, five purchasable beginner businesses, progressive upgrades, revenue/expense accounting, passive and capped offline income, atomic SQLite persistence and five working navigation tabs. Investments and properties are clearly identified future-phase views.

## Launch on Android

```powershell
cd E:\Projests\Business_Domain
npm ci
npm run android
```

Use a connected Android emulator/device, or run `npm start` and scan the QR code in the SDK-compatible Expo Go app. If the installed Expo Go does not support SDK 57, use a development build. Development builds require `npx expo install expo-dev-client`, EAS account configuration and `npx eas-cli build --platform android --profile development`, then `npx expo start --dev-client`.

## Verification

```powershell
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo export --platform android
```

TypeScript and lint passed. Jest: 22 tests passed in four suites. Save adapter tests use a transactional mock; they do not substitute for native SQLite device QA. Android Hermes bundle export passed. Expo dependency compatibility check passed. Compatible dependency fixes were applied; npm audit still reports 66 advisories (50 high, 16 moderate), including transitive tooling dependencies. No forced major SDK changes were applied. Review audit.json before release. No Android device/emulator was available for native runtime QA.

## Android packaging

```powershell
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

Preview produces an APK; production produces an AAB. Signing is configured with EAS during setup. No APK/AAB has been generated or signing verified here. Package ID: `com.nextgen.businessempire` (change to your owned namespace before release). Cloud build requires your account and network access.

## Device acceptance checklist

1. Launch: cash ¤1,000 and no assets. Buy Lemonade Stand: cash ¤200, net income ¤1.40/sec, net worth ¤1,000.
2. Tap and upgrade; insufficient funds disables the purchase button. Compare next-level revenue and expenses.
3. Force stop and reopen after a minute: capped elapsed income appears once. Reopen again immediately: no duplicate payout.
4. Background and foreground the app; inspect income and transaction history.
5. Test airplane mode, process termination during writes, low-storage errors and a backwards device clock.
6. Verify screen sizes, large text, TalkBack and Android navigation in a development build.

## Scope and files

`src/engine/game.ts` holds pure economic rules; `src/db/save.ts` holds migrations and atomic saves; `src/store/game.ts` coordinates actions; `src/app` holds routes; `src/screens/GameScreen.tsx` provides the dashboard and management screens. `tests` covers finance, persistence boundaries and a UI action. Original geometric artwork is in `assets/images/nextgen-*.png`. `eas.json` and `.github/workflows/checks.yml` provide build profiles and CI. Design, architecture and phase status are in `docs`.

This is not the complete production game. Stocks/crypto, property, banking, employees, economy events, achievements, research, expansion, charts and advanced progression remain later phases. No backend or real-money services. Offline clock and modified saves cannot be fully secured.



## GitHub Actions (no EAS account required)

Pushes to main run checks and build a standalone ARM64 Android test APK; pull requests run checks only. You can also open Actions > Android checks and test APK > Run workflow; turn off build_apk to run only the checks. Builds use standard Ubuntu runners with 10/45-minute job timeouts, cancellation of superseded runs and seven-day artifact retention.

Download the business-empire-nextgen-arm64 artifact from a successful run and unzip it. Install the APK on an ARM64 Android phone; Metro and Expo Go are not required. This release-mode test APK uses Expo's generated debug signing key, not a production release identity. Store publication still requires your own signing key and release review. Standard hosted runners are free for public repositories; private repositories use the account's included allowance.
