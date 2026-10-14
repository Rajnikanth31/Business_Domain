import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import {
  BUSINESSES,
  metrics,
  money,
  tapValue,
  tapUpgradeCost,
  upgradeCost,
} from "../engine/game";
import { useGame } from "../store/game";
const titles = {
  home: "Your next chapter.",
  businesses: "Build something lasting.",
  investments: "Capital, with purpose.",
  property: "A place in your empire.",
  empire: "The bigger picture.",
};
export default function GameScreen({ page }: { page: keyof typeof titles }) {
  const { game: g, busy, error, offline, dispatch, boot, dismiss } = useGame();
  if (!g)
    return (
      <SafeAreaView style={s.root}>
        <View style={s.card}>
          <Text style={s.title}>BUSINESS EMPIRE</Text>
          {error ? (
            <>
              <Text style={s.text}>{error}</Text>
              <Button title="Retry loading save" onPress={() => void boot()} />
            </>
          ) : (
            <ActivityIndicator color="#E8C47B" />
          )}
        </View>
      </SafeAreaView>
    );
  const m = metrics(g);
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.row}>
          <Text style={s.brand}>N / G • NEXTGEN</Text>
          <Text style={s.badge}>OFFLINE EMPIRE</Text>
        </View>
        <Text style={s.title}>{titles[page]}</Text>
        <Text style={s.sub}>From a first idea to an enduring empire.</Text>
        {(error || offline) && (
          <Pressable
            accessibilityRole="button"
            onPress={dismiss}
            style={s.notice}
          >
            <Text style={s.text}>{error || offline} · Tap to dismiss</Text>
          </Pressable>
        )}
        {page === "home" && (
          <>
            <Animated.View
              entering={FadeIn.duration(400)}
              style={[s.card, s.hero]}
            >
              <Text style={s.label}>AVAILABLE CAPITAL</Text>
              <Text accessibilityLiveRegion="polite" style={s.balance}>
                {money(g.cash)}
              </Text>
              <View style={s.row}>
                <Text style={s.green}>{money(m.profit)} / sec</Text>
                <Text style={s.sub}>Net worth {money(m.netWorth)}</Text>
              </View>
            </Animated.View>
            <View style={s.row}>
              <Stat title="REVENUE / SEC" value={money(m.revenue)} />
              <Stat title="COSTS / SEC" value={money(m.expenses)} />
            </View>
            <View style={s.card}>
              <Text style={s.label}>THE ENTREPRENEUR HUSTLE</Text>
              <Text style={s.heading}>Every empire starts with action.</Text>
              <Button
                title={`Earn ${money(tapValue(g))}`}
                disabled={busy}
                onPress={() => void dispatch({ type: "tap" })}
              />
              <Button
                secondary
                title={`Upgrade hustle · ${money(tapUpgradeCost(g))}`}
                disabled={
                  busy || g.cash < tapUpgradeCost(g) || g.tapLevel >= 50
                }
                onPress={() => void dispatch({ type: "tapUpgrade" })}
              />
              <Text style={s.sub}>
                {g.taps} taps · Hustle level {g.tapLevel + 1}
              </Text>
            </View>
            <View style={s.card}>
              <Text style={s.label}>YOUR OFFLINE ADVISOR</Text>
              <Text style={s.text}>
                {m.profit < 0
                  ? "Operating costs exceed revenue. Pause upgrades and rebuild cash through tapping."
                  : g.levels.every((l) => !l)
                    ? "Your first opportunity: a Lemonade Stand. Invest ¤800 to start earning ¤1.40 per second."
                    : "Compare the extra revenue with rising expenses before upgrading. Bigger is not always more profitable."}
              </Text>
            </View>
            <Text style={s.heading}>Recent activity</Text>
            {g.transactions.length ? (
              g.transactions.slice(0, 8).map((t) => (
                <View style={s.transaction} key={t.id}>
                  <Text style={s.text}>{t.label}</Text>
                  <Text style={t.amount >= 0 ? s.green : s.sub}>
                    {t.amount >= 0 ? "+" : ""}
                    {money(t.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={s.sub}>
                Your story starts with the first transaction.
              </Text>
            )}
          </>
        )}
        {page === "businesses" && (
          <>
            <Text style={s.sub}>
              Revenue rises linearly. Operating costs rise with the square of
              the level. Choose your scale carefully.
            </Text>
            {BUSINESSES.map((b, i) => {
              const l = g.levels[i],
                cost = upgradeCost(i, l);
              return (
                <View key={b.id} style={s.card}>
                  <View style={s.row}>
                    <Text style={s.heading}>
                      {b.icon} {b.name}
                    </Text>
                    <Text style={s.badge}>
                      {l ? `LEVEL ${l}` : "OPPORTUNITY"}
                    </Text>
                  </View>
                  <Text style={s.text}>
                    {money(b.revenue * l - b.expense * l * l)} net / sec
                  </Text>
                  <Text style={s.sub}>
                    Revenue {money(b.revenue * l)} · Expenses{" "}
                    {money(b.expense * l * l)}
                  </Text>
                  <Text style={s.sub}>
                    Next level net:{" "}
                    {money(b.revenue * (l + 1) - b.expense * (l + 1) * (l + 1))}{" "}
                    / sec
                  </Text>
                  <Button
                    title={`${l ? "Upgrade" : "Acquire"} · ${money(cost)}`}
                    disabled={busy || g.cash < cost || l >= 50}
                    onPress={() =>
                      void dispatch({ type: l ? "upgrade" : "buy", index: i })
                    }
                  />
                </View>
              );
            })}
          </>
        )}
        {page === "investments" && (
          <>
            <Stat title="PORTFOLIO VALUE" value={money(0)} />
            <View style={s.card}>
              <Text style={s.heading}>The exchange opens in Phase 3.</Text>
              <Text style={s.text}>
                Fictional stocks, digital assets and seeded market simulation
                are on the roadmap. For now, deploy your capital into operating
                businesses.
              </Text>
            </View>
          </>
        )}
        {page === "property" && (
          <>
            <Stat title="PROPERTY VALUE" value={money(0)} />
            <View style={s.card}>
              <Text style={s.heading}>Your future address.</Text>
              <Text style={s.text}>
                Property ownership, rent and banking arrive in Phase 4. Grow
                your cash reserve and business income first.
              </Text>
            </View>
          </>
        )}
        {page === "empire" && (
          <>
            <View style={s.card}>
              <Text style={s.label}>EMPIRE OVERVIEW</Text>
              <Text style={s.balance}>{money(m.netWorth)}</Text>
              <Text style={s.sub}>Cash + business valuation − liabilities</Text>
            </View>
            <Stat title="BUSINESS VALUATION" value={money(m.assets)} />
            <Stat title="LIFETIME PASSIVE EARNINGS" value={money(g.earned)} />
            <View style={s.card}>
              <Text style={s.text}>
                Businesses owned: {g.levels.filter((l) => l > 0).length} / 5
              </Text>
              <Text style={s.text}>
                Active loans: 0 · Investments: {money(0)}
              </Text>
              <Text style={s.text}>Economic condition: Stable</Text>
              <Text style={s.text}>
                Player level: 1 · Progression arrives in Phase 6
              </Text>
              <Text style={s.sub}>
                Currency is fictional. Saves stay on this device. Offline income
                is capped at eight hours; backwards clock changes pause
                settlement. Offline saves cannot prevent all device
                manipulation.
              </Text>
            </View>
          </>
        )}
        <Text style={s.footer}>BUSINESS EMPIRE: NEXTGEN / FOUNDATIONS</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
function Stat({ title, value }: { title: string; value: string }) {
  return (
    <View style={[s.card, { flex: 1 }]}>
      <Text style={s.label}>{title}</Text>
      <Text style={s.heading}>{value}</Text>
    </View>
  );
}
function Button({
  title,
  onPress,
  disabled,
  secondary,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: "#E8C47B" }]}>
        {title}
      </Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#090F1B" },
  content: { padding: 20, gap: 16, paddingBottom: 36 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  brand: {
    color: "#E8C47B",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },
  badge: { color: "#94A8C4", fontSize: 10, letterSpacing: 1 },
  title: { color: "#F4F1E8", fontSize: 30, fontWeight: "700", marginTop: 18 },
  sub: { color: "#94A3B8", fontSize: 12, lineHeight: 20 },
  card: {
    backgroundColor: "#121E30",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#26344A",
    gap: 12,
  },
  hero: { backgroundColor: "#18283C", borderColor: "#6B5B38" },
  label: {
    color: "#A5B4CA",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  balance: { color: "#F3DEAF", fontSize: 34, fontWeight: "700" },
  green: { color: "#71DDB1", fontSize: 12, fontWeight: "600" },
  heading: { color: "#F4F1E8", fontSize: 18, fontWeight: "600" },
  text: { color: "#D4DCE9", fontSize: 14, lineHeight: 22, flexShrink: 1 },
  button: {
    backgroundColor: "#E8C47B",
    padding: 16,
    borderRadius: 12,
    minHeight: 48,
    alignItems: "center",
  },
  secondary: {
    backgroundColor: "#1C2C41",
    borderWidth: 1,
    borderColor: "#786645",
  },
  buttonText: { color: "#122033", fontSize: 14, fontWeight: "700" },
  notice: { backgroundColor: "#39402C", borderRadius: 12, padding: 14 },
  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderColor: "#202C40",
    paddingBottom: 12,
  },
  footer: {
    color: "#60718A",
    fontSize: 9,
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 20,
  },
});
