# Business Empire: NextGen

Android offline tycoon game, player release 2.0. All money is displayed in dollars. New players start at $0 and earn $2.50 per click. Existing saves keep their balances and original tap income.

The five tabs provide Earnings, Investing, Business, Items and Profile. Play with eleven business categories, ten named company slots, staff, fleets, timed projects, banking, three mergers, shares, fractional crypto, rental properties, luxury collections and collectible milestones. Both light and dark themes are saved. See [player release details](docs/PLAYER_RELEASE_2.md) for rules and scope.

## Download the Android APK

[Download the verified 2.0 Android APK](https://github.com/Rajnikanth31/Business_Domain/releases/download/v2.0.0-preview/Business-Empire-NextGen-2.0.0.apk).

Alternatively, open the latest successful [Android Actions run](https://github.com/Rajnikanth31/Business_Domain/actions), then download the `business-empire-nextgen-<run number>` artifact and unzip it. Install `app-release.apk` on an ARM64 Android phone. Metro and Expo Go are not required. The 2.0 APK and installed-app checks passed in [workflow run 5](https://github.com/Rajnikanth31/Business_Domain/actions/runs/41226894591).

Main-branch pushes run checks, build ARM64/x86_64 and test the installed APK on an Android emulator. The workflow uses standard Ubuntu runners, no paid EAS service, cancellation of superseded runs and seven-day artifact retention. The release-mode preview uses Expo's generated debug signing key; production store signing and physical-phone acceptance testing remain separate.

## Development

```powershell
npm ci
npm run android
```

## Verification

```powershell
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo export --platform android
```

The local suite has 81 passing tests covering finance, industry actions, migration, backups, queued taps and screen flows. Android API 35 emulator checks also passed: launch, eleven credited taps, force-stop/reopen persistence, category/opening screens, property navigation, Profile and saved dark-theme relaunch. Native screenshots were inspected and the artwork bounds corrected.

## Save data and assets

SQLite schema 2 migrates earlier saves atomically and retains the original snapshot. Profile includes a device-local recovery backup. Do not uninstall to update if you want to retain your game. Backups inside the database cannot survive uninstall or loss of the database.

Property photos were generated as original artwork for this project. Supplied RichMan screenshots are reference material and are not bundled. Markets and ranking rivals are simulated offline; there are no real-money services, ads or online leaderboard. See [implementation status](docs/IMPLEMENTATION_PLAN.md).
