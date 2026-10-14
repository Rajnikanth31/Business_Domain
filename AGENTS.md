# Repository conventions

Use Ponytail: minimal working implementation, no speculative infrastructure. Preserve integer currency and pure engine functions. Never update wallet separately from purchased assets. Validate save boundaries and retain broken saves. Use compatible dependencies installed through Expo. No real trading and no embedded secrets.

Before completing a meaningful change run `npm run typecheck`, `npm run lint`, `npm test -- --runInBand` and Android bundle export (`npx expo export --platform android`). Add economic regression tests. Never claim a device test or APK build unless actually completed. Update docs/IMPLEMENTATION_PLAN.md honestly.
