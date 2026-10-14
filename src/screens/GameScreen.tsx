import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import Svg, { Polyline, Line } from "react-native-svg";
import {
  BUSINESSES,
  ITEMS,
  MARKETS,
  metrics,
  money,
  tapValue,
  tapUpgradeCost,
  upgradeCost,
  marketPrice,
} from "../engine/game";
import { useGame } from "../store/game";
import Icon from "../components/Icon";
import { dark, light, palette, Palette } from "../theme/theme";
type Page = "home" | "businesses" | "investments" | "property" | "empire";
const pageNames: Record<Page, string> = {
  home: "Earnings",
  businesses: "Business",
  investments: "Investing",
  property: "Items",
  empire: "Profile",
};
const businessIcons = ["shop", "coffee", "truck", "shop", "car"];
const colors = ["#DBA243", "#8B77CE", "#51A7C0", "#6BAD7F", "#678CCA"];
export default function GameScreen({ page }: { page: Page }) {
  const { game: g, busy, error, offline, dispatch, boot, dismiss } = useGame();
  const p = palette(g?.theme),
    s = g?.theme === "light" ? lightStyles : darkStyles;
  const [catalog, setCatalog] = useState(false),
    [business, setBusiness] = useState<number | null>(null),
    [market, setMarket] = useState<number | null>(null),
    [item, setItem] = useState<number | null>(null);
  const [marketTab, setMarketTab] = useState("Stocks"),
    [itemTab, setItemTab] = useState("Real estate"),
    [quantity, setQuantity] = useState(1);
  if (!g)
    return (
      <SafeAreaView style={s.root}>
        <View style={s.loading}>
          <Text style={s.title}>Business Empire: NextGen</Text>
          {error ? (
            <>
              <Text style={s.text}>{error}</Text>
              <Button
                p={p}
                title="Retry loading save"
                onPress={() => void boot()}
              />
            </>
          ) : (
            <ActivityIndicator color={p.accent} />
          )}
        </View>
      </SafeAreaView>
    );
  const m = metrics(g),
    owned = g.levels.filter((x) => x > 0).length;
  const perform = (action: Parameters<typeof dispatch>[0]) =>
    void dispatch(action);
  const confirmSale = (title: string, action: Parameters<typeof dispatch>[0]) =>
    Alert.alert("Confirm sale", title, [
      { text: "Cancel", style: "cancel" },
      { text: "Sell", onPress: () => perform(action) },
    ]);
  const investmentCost = (g.holdings ?? []).reduce((sum, h) => sum + h.cost, 0);
  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <Text style={s.title}>{pageNames[page]}</Text>
          {page !== "home" && (
            <Text style={s.headerBalance}>{money(g.cash)}</Text>
          )}
        </View>
        {(error || offline) && (
          <Pressable
            accessibilityRole="button"
            onPress={dismiss}
            style={s.notice}
          >
            <Text style={s.text}>{error || offline} · Dismiss</Text>
          </Pressable>
        )}
        {page === "home" && (
          <>
            <Animated.View entering={FadeIn.duration(300)} style={s.bankCard}>
              <View style={s.bankDecoration} />
              <View style={s.bankDecorationSmall} />
              <View style={s.spread}>
                <Text style={s.bankLabel}>Balance</Text>
                <Text style={s.bankBrand}>NEXTGEN</Text>
              </View>
              <Text accessibilityLiveRegion="polite" style={s.bankBalance}>
                {money(g.cash)}
              </Text>
              <View style={s.spread}>
                <Icon name="chip" size={38} color="#E9D7A6" />
                <Text style={s.bankNumber}>•••• •••• •••• 1729</Text>
              </View>
              <View style={s.spread}>
                <Text style={s.bankSmall}>EMPIRE ACCOUNT</Text>
                <Text style={s.bankSmall}>VIRTUAL CARD</Text>
              </View>
            </Animated.View>
            <View style={s.clickRate}>
              <Text style={s.caption}>Income per click</Text>
              <Text style={s.rate}>{money(tapValue(g))}</Text>
            </View>
            <View style={s.panel}>
              <View style={s.spread}>
                <Text style={s.text}>Level {g.tapLevel + 1}</Text>
                <Text style={s.caption}>
                  {g.tapLevel < 50
                    ? `Next: ${money(tapValue(g) + 1000)} / click`
                    : "Maximum level"}
                </Text>
              </View>
              <View
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: 100,
                  now: Math.min(
                    100,
                    Math.floor((g.cash / tapUpgradeCost(g)) * 100),
                  ),
                }}
                style={s.progress}
              >
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${Math.min(100, (g.cash / tapUpgradeCost(g)) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Button
                p={p}
                title={`Raise the level (${money(tapUpgradeCost(g))})`}
                disabled={
                  busy || g.cash < tapUpgradeCost(g) || g.tapLevel >= 50
                }
                onPress={() => perform({ type: "tapUpgrade" })}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Tap to earn ${money(tapValue(g))}`}
              accessibilityState={{ disabled: busy }}
              disabled={busy}
              onPress={() => perform({ type: "tap" })}
              style={({ pressed }) => [
                s.tapArea,
                {
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  opacity: busy ? 0.65 : 1,
                },
              ]}
            >
              <View style={s.tapOuter}>
                <View style={s.tapInner}>
                  <Icon name="tap" color={p.accent} size={86} />
                </View>
              </View>
              <Text style={s.tapHint}>Tap in this area to earn money</Text>
              <Text style={s.tapAmount}>+{money(tapValue(g))}</Text>
            </Pressable>
            <View style={s.spread}>
              <Text style={s.caption}>{g.taps.toLocaleString()} clicks</Text>
              <Text style={s.caption}>
                Passive: {money(m.profit * 3600)} / hour
              </Text>
            </View>
          </>
        )}
        {page === "businesses" && (
          <>
            <View style={s.summary}>
              <Text style={s.caption}>Total income per hour</Text>
              <Text style={s.total}>
                {money((m.revenue - m.expenses) * 3600)}
              </Text>
            </View>
            <Button
              p={p}
              title="Start a business"
              onPress={() => setCatalog(true)}
            />
            <View style={s.spread}>
              <Text style={s.section}>My companies</Text>
              <Text style={s.caption}>
                {owned} / {BUSINESSES.length}
              </Text>
            </View>
            {!owned ? (
              <View style={s.empty}>
                <Icon name="business" color={p.muted} size={56} />
                <Text style={s.section}>You don’t own any businesses</Text>
                <Text style={s.caption}>
                  Start a company and earn passive income.
                </Text>
              </View>
            ) : (
              BUSINESSES.map(
                (b, i) =>
                  g.levels[i] > 0 && (
                    <Row
                      key={b.id}
                      p={p}
                      icon={businessIcons[i]}
                      color={colors[i]}
                      title={b.name}
                      subtitle={`Level ${g.levels[i]} · ${money((b.revenue * g.levels[i] - b.expense * g.levels[i] ** 2) * 3600)} / hour`}
                      onPress={() => setBusiness(i)}
                    />
                  ),
              )
            )}
            <View style={s.panel}>
              <Text style={s.section}>Cash flow</Text>
              <Info
                s={s}
                label="Business revenue / hour"
                value={money(m.revenue * 3600)}
              />
              <Info
                s={s}
                label="Operating expenses / hour"
                value={money(m.expenses * 3600)}
              />
              <Text style={s.caption}>
                {m.profit < 0
                  ? "Your expenses exceed income. Sell or resize a company to recover."
                  : "Open a company to view upgrade costs and projected profit."}
              </Text>
            </View>
          </>
        )}
        {page === "investments" && (
          <>
            <View style={s.summary}>
              <Text style={s.caption}>Investment portfolio</Text>
              <Text style={s.total}>{money(m.portfolio)}</Text>
              <Text
                style={[
                  s.caption,
                  {
                    color:
                      m.portfolio - investmentCost >= 0 ? p.accent : p.negative,
                  },
                ]}
              >
                {money(m.portfolio - investmentCost)} unrealized gain / loss
              </Text>
            </View>
            <Segments
              p={p}
              values={["Stocks", "Crypto", "Portfolio"]}
              selected={marketTab}
              onSelect={setMarketTab}
            />
            {MARKETS.map((a, i) => {
              const h = g.holdings?.[i],
                price = marketPrice(i, g.lastSettlement, g.marketSeed);
              return (
                (marketTab === "Portfolio"
                  ? !!h?.quantity
                  : marketTab === "Stocks"
                    ? a.kind === "Stock"
                    : a.kind === "Crypto") && (
                  <Row
                    key={a.symbol}
                    p={p}
                    icon="investing"
                    color={colors[i]}
                    title={a.name}
                    subtitle={`${a.symbol} · ${h?.quantity ?? 0} owned`}
                    value={money(price)}
                    onPress={() => {
                      setQuantity(1);
                      setMarket(i);
                    }}
                  />
                )
              );
            })}
            {marketTab === "Portfolio" &&
              !(g.holdings ?? []).some((h) => h.quantity) && (
                <View style={s.empty}>
                  <Icon name="investing" color={p.muted} size={48} />
                  <Text style={s.section}>Your portfolio is empty</Text>
                  <Text style={s.caption}>
                    Choose a stock or crypto asset to place an order.
                  </Text>
                </View>
              )}
            <View style={s.panel}>
              <Info
                s={s}
                label="Realized profit / loss"
                value={money(g.realized ?? 0)}
              />
              <Text style={s.caption}>
                Fictional market · Prices update every 5 minutes · 1% trading
                fee. Crypto has larger price swings.
              </Text>
            </View>
          </>
        )}
        {page === "property" && (
          <>
            <View style={s.summary}>
              <Text style={s.caption}>Your possessions</Text>
              <Text style={s.total}>{money(m.properties + m.luxuries)}</Text>
              <Text style={s.caption}>
                Rent minus maintenance: {money((m.rent - m.maintenance) * 3600)}{" "}
                / hour
              </Text>
            </View>
            <Segments
              p={p}
              values={["Real estate", "Cars", "Yachts", "Aircraft"]}
              selected={itemTab}
              onSelect={setItemTab}
            />
            {ITEMS.map(
              (a, i) =>
                a.kind === itemTab && (
                  <Row
                    key={a.name}
                    p={p}
                    icon={
                      a.kind === "Cars"
                        ? "car"
                        : a.kind === "Yachts"
                          ? "yacht"
                          : a.kind === "Aircraft"
                            ? "aircraft"
                            : "items"
                    }
                    color={colors[i % 5]}
                    title={a.name}
                    subtitle={
                      g.items?.[i] ? `Owned · ${a.location}` : a.location
                    }
                    value={g.items?.[i] ? "View" : money(a.cost)}
                    onPress={() => setItem(i)}
                  />
                ),
            )}
          </>
        )}
        {page === "empire" && (
          <>
            <View style={s.avatar}>
              <Icon name="profile" color={p.accent} size={44} />
            </View>
            <Text style={s.profileName}>Entrepreneur</Text>
            <Text style={s.profileTag}>Business Empire: NextGen</Text>
            <View style={s.summary}>
              <Text style={s.caption}>Total fortune</Text>
              <Text style={s.total}>{money(m.netWorth)}</Text>
            </View>
            <View style={s.panel}>
              <Info s={s} label="Cash balance" value={money(g.cash)} />
              <Info s={s} label="Business valuation" value={money(m.assets)} />
              <Info s={s} label="Investments" value={money(m.portfolio)} />
              <Info s={s} label="Real estate" value={money(m.properties)} />
              <Info s={s} label="Luxury items" value={money(m.luxuries)} />
              <Info
                s={s}
                label="Passive income / hour"
                value={money(m.profit * 3600)}
              />
              <Info
                s={s}
                label="Lifetime passive income"
                value={money(g.earned)}
              />
            </View>
            <Text style={s.section}>Appearance</Text>
            <Segments
              p={p}
              values={["Light", "Dark"]}
              selected={g.theme === "light" ? "Light" : "Dark"}
              onSelect={(value) =>
                perform({
                  type: "theme",
                  value: value === "Light" ? "light" : "dark",
                })
              }
              disabled={busy}
            />
            <Text style={s.section}>Recent transactions</Text>
            {g.transactions.slice(0, 12).map((t) => (
              <View key={t.id} style={s.transaction}>
                <Text style={s.text}>{t.label}</Text>
                <Text
                  style={[
                    s.transactionValue,
                    { color: t.amount >= 0 ? p.accent : p.negative },
                  ]}
                >
                  {t.amount >= 0 ? "+" : ""}
                  {money(t.amount)}
                </Text>
              </View>
            ))}
            <Text style={s.caption}>
              Simulated dollars. Offline saves stay on this device. Offline
              earnings are capped at 8 hours; a backwards clock pauses
              settlement. No real trading or bank account.
            </Text>
          </>
        )}
      </ScrollView>
      <Sheet
        visible={catalog}
        title="Start a business"
        p={p}
        close={() => setCatalog(false)}
      >
        {BUSINESSES.map((b, i) => (
          <View key={b.id} style={s.panel}>
            <View style={s.spread}>
              <View style={[s.tile, { backgroundColor: colors[i] }]}>
                <Icon name={businessIcons[i]} size={28} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.section}>{b.name}</Text>
                <Text style={s.caption}>
                  {money((b.revenue - b.expense) * 3600)} / hour at level 1
                </Text>
              </View>
            </View>
            <Button
              p={p}
              title={
                g.levels[i] ? "Already owned" : `Open for ${money(b.cost)}`
              }
              disabled={busy || !!g.levels[i] || g.cash < b.cost}
              onPress={() => perform({ type: "buy", index: i })}
            />
          </View>
        ))}
      </Sheet>
      <Sheet
        visible={business !== null}
        title={business !== null ? BUSINESSES[business].name : ""}
        p={p}
        close={() => setBusiness(null)}
      >
        {business !== null &&
          (() => {
            const b = BUSINESSES[business],
              l = g.levels[business],
              cost = upgradeCost(business, l);
            return (
              <>
                <View style={s.summary}>
                  <Text style={s.caption}>Income per hour · Level {l}</Text>
                  <Text style={s.total}>
                    {money((b.revenue * l - b.expense * l * l) * 3600)}
                  </Text>
                </View>
                <View style={s.panel}>
                  <Info
                    s={s}
                    label="Revenue / hour"
                    value={money(b.revenue * l * 3600)}
                  />
                  <Info
                    s={s}
                    label="Expenses / hour"
                    value={money(b.expense * l * l * 3600)}
                  />
                  <Info s={s} label="Company value" value={money(b.cost * l)} />
                  <Info
                    s={s}
                    label="Next level net income / hour"
                    value={money(
                      (b.revenue * (l + 1) - b.expense * (l + 1) ** 2) * 3600,
                    )}
                  />
                  <Text style={s.caption}>
                    Revenue rises with level; operating costs rise faster. Check
                    the projected profit before expanding.
                  </Text>
                </View>
                <Button
                  p={p}
                  title={`Expand business (${money(cost)})`}
                  disabled={busy || g.cash < cost || l <= 0 || l >= 50}
                  onPress={() => perform({ type: "upgrade", index: business })}
                />
                <Button
                  p={p}
                  secondary
                  title={`Sell business for ${money(b.cost * l)}`}
                  disabled={busy || l <= 0}
                  onPress={() =>
                    confirmSale(`Sell ${b.name} for ${money(b.cost * l)}?`, {
                      type: "sellBusiness",
                      index: business,
                    })
                  }
                />
              </>
            );
          })()}
      </Sheet>
      <Sheet
        visible={market !== null}
        title={market !== null ? MARKETS[market].name : ""}
        p={p}
        close={() => setMarket(null)}
      >
        {market !== null &&
          (() => {
            const a = MARKETS[market],
              price = marketPrice(market, g.lastSettlement, g.marketSeed),
              h = g.holdings?.[market] ?? { quantity: 0, cost: 0 },
              value = price * quantity,
              fee = Math.ceil(value / 100);
            return (
              <>
                <View style={s.summary}>
                  <Text style={s.caption}>{a.symbol} · Current price</Text>
                  <Text style={s.total}>{money(price)}</Text>
                </View>
                <MarketChart
                  index={market}
                  time={g.lastSettlement}
                  seed={g.marketSeed}
                  p={p}
                />
                <View style={s.panel}>
                  <Info
                    s={s}
                    label="Shares / tokens owned"
                    value={h.quantity.toLocaleString()}
                  />
                  <Info
                    s={s}
                    label="Average purchase cost (incl. fees)"
                    value={money(
                      h.quantity ? Math.floor(h.cost / h.quantity) : 0,
                    )}
                  />
                  <Info
                    s={s}
                    label="Unrealized gain / loss"
                    value={money(price * h.quantity - h.cost)}
                  />
                </View>
                <Text style={s.section}>Order quantity</Text>
                <Segments
                  p={p}
                  values={["1", "10", "100"]}
                  selected={String(quantity)}
                  onSelect={(v) => setQuantity(Number(v))}
                />
                <Text style={s.caption}>
                  Order value {money(value)} · Fee {money(fee)}
                </Text>
                <Button
                  p={p}
                  title={`Buy ${quantity} · ${money(value + fee)}`}
                  disabled={busy || g.cash < value + fee}
                  onPress={() =>
                    perform({
                      type: "trade",
                      index: market,
                      side: "buy",
                      quantity,
                    })
                  }
                />
                <Button
                  p={p}
                  secondary
                  title={`Sell ${quantity} · ${money(value - fee)}`}
                  disabled={busy || h.quantity < quantity}
                  onPress={() =>
                    perform({
                      type: "trade",
                      index: market,
                      side: "sell",
                      quantity,
                    })
                  }
                />
              </>
            );
          })()}
      </Sheet>
      <Sheet
        visible={item !== null}
        title={item !== null ? ITEMS[item].name : ""}
        p={p}
        close={() => setItem(null)}
      >
        {item !== null &&
          (() => {
            const a = ITEMS[item],
              has = !!g.items?.[item];
            return (
              <>
                <View style={s.itemArt}>
                  <Icon
                    name={
                      a.kind === "Cars"
                        ? "car"
                        : a.kind === "Yachts"
                          ? "yacht"
                          : a.kind === "Aircraft"
                            ? "aircraft"
                            : "items"
                    }
                    color={p.accent}
                    size={110}
                  />
                </View>
                <View style={s.panel}>
                  <Info s={s} label="Location" value={a.location} />
                  <Info s={s} label="Asset value" value={money(a.cost)} />
                  <Info
                    s={s}
                    label="Rental income / hour"
                    value={money(a.rent * 3600)}
                  />
                  <Info
                    s={s}
                    label="Maintenance / hour"
                    value={money(a.expense * 3600)}
                  />
                  <Text style={s.caption}>
                    Items sell for 90% of their purchase value.
                  </Text>
                </View>
                {has ? (
                  <Button
                    p={p}
                    secondary
                    title={`Sell for ${money(Math.floor((a.cost * 9) / 10))}`}
                    disabled={busy}
                    onPress={() =>
                      confirmSale(`Sell ${a.name}?`, {
                        type: "sellItem",
                        index: item,
                      })
                    }
                  />
                ) : (
                  <Button
                    p={p}
                    title={`Buy for ${money(a.cost)}`}
                    disabled={busy || g.cash < a.cost}
                    onPress={() => perform({ type: "buyItem", index: item })}
                  />
                )}
              </>
            );
          })()}
      </Sheet>
    </SafeAreaView>
  );
}
function Info({
  s,
  label,
  value,
}: {
  s: ReturnType<typeof styles>;
  label: string;
  value: string;
}) {
  return (
    <View style={s.spread}>
      <Text style={[s.caption, { flex: 1 }]}>{label}</Text>
      <Text style={s.text}>{value}</Text>
    </View>
  );
}
function Button({
  p,
  title,
  onPress,
  disabled,
  secondary,
}: {
  p: Palette;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: secondary ? p.card : p.accent,
        borderRadius: 10,
        padding: 16,
        minHeight: 50,
        alignItems: "center",
        opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: secondary ? p.text : p.accentText,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
function Row({
  p,
  icon,
  color,
  title,
  subtitle,
  value,
  onPress,
}: {
  p: Palette;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subtitle}${value ? `, ${value}` : ""}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: p.panel,
        borderRadius: 12,
        padding: 15,
        minHeight: 86,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View
        style={{
          backgroundColor: color,
          width: 48,
          height: 48,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon name={icon} size={28} />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ fontSize: 16, color: p.text, fontWeight: "600" }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: p.muted }}>{subtitle}</Text>
      </View>
      {value && (
        <Text style={{ color: p.text, fontSize: 13, fontWeight: "600" }}>
          {value}
        </Text>
      )}
      <Text style={{ color: p.muted, fontSize: 24 }}>›</Text>
    </Pressable>
  );
}
function Segments({
  p,
  values,
  selected,
  onSelect,
  disabled,
}: {
  p: Palette;
  values: string[];
  selected: string;
  onSelect: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: p.panel,
        padding: 4,
        borderRadius: 10,
        gap: 3,
      }}
    >
      {values.map((v) => (
        <Pressable
          key={v}
          accessibilityRole="button"
          accessibilityState={{
            selected: selected === v,
            disabled: !!disabled,
          }}
          disabled={disabled}
          onPress={() => onSelect(v)}
          style={{
            flex: 1,
            backgroundColor: selected === v ? p.accent : p.panel,
            borderRadius: 7,
            paddingVertical: 12,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 48,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: selected === v ? p.accentText : p.muted,
              textAlign: "center",
            }}
          >
            {v}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
function Sheet({
  visible,
  title,
  p,
  close,
  children,
}: {
  visible: boolean;
  title: string;
  p: Palette;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }}>
        <View
          style={{
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            style={{ fontSize: 22, color: p.text, fontWeight: "600", flex: 1 }}
          >
            {title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close details"
            onPress={close}
            style={{
              padding: 10,
              minWidth: 48,
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24, color: p.muted }}>✕</Text>
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
function MarketChart({
  index,
  time,
  seed,
  p,
}: {
  index: number;
  time: number;
  seed?: number;
  p: Palette;
}) {
  const values = Array.from({ length: 24 }, (_, i) =>
      marketPrice(index, Math.max(0, time - (23 - i) * 300000), seed),
    ),
    min = Math.min(...values),
    range = Math.max(1, Math.max(...values) - min),
    points = values
      .map(
        (v, i) => `${(i * 300) / 23 + 10},${120 - ((v - min) / range) * 100}`,
      )
      .join(" ");
  return (
    <View style={{ backgroundColor: p.panel, padding: 12, borderRadius: 12 }}>
      <Text style={{ color: p.muted, fontSize: 12, marginBottom: 12 }}>
        Price history · Last 2 hours
      </Text>
      <Svg width="100%" height={140} viewBox="0 0 320 140">
        <Line x1={0} y1={120} x2={320} y2={120} stroke={p.border} />
        <Polyline
          points={points}
          fill="none"
          stroke={p.accent}
          strokeWidth={2.5}
        />
      </Svg>
    </View>
  );
}
function styles(p: Palette) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: p.background },
    content: { padding: 20, gap: 18, paddingBottom: 32 },
    loading: { padding: 24, gap: 20, marginTop: 70 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 6,
    },
    title: { fontSize: 27, fontWeight: "700", color: p.text },
    headerBalance: { fontSize: 15, fontWeight: "600", color: p.accent },
    text: { color: p.text, fontSize: 14, lineHeight: 21, flexShrink: 1 },
    caption: { color: p.muted, fontSize: 12, lineHeight: 19 },
    section: { color: p.text, fontSize: 17, fontWeight: "600" },
    spread: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },
    panel: { backgroundColor: p.panel, padding: 16, borderRadius: 12, gap: 14 },
    notice: {
      backgroundColor: p.panel,
      borderColor: p.accent,
      borderWidth: 1,
      borderRadius: 10,
      padding: 14,
    },
    bankCard: {
      backgroundColor: p.bank,
      borderRadius: 18,
      padding: 24,
      gap: 16,
      overflow: "hidden",
      minHeight: 210,
    },
    bankDecoration: {
      position: "absolute",
      right: -60,
      top: -80,
      width: 240,
      height: 350,
      backgroundColor: p.bankEnd,
      transform: [{ rotate: "30deg" }],
    },
    bankDecorationSmall: {
      position: "absolute",
      right: -40,
      bottom: -80,
      width: 140,
      height: 210,
      borderWidth: 1,
      borderColor: "#FFFFFF25",
      transform: [{ rotate: "30deg" }],
    },
    bankLabel: { color: "#FFFFFFB0", fontSize: 13 },
    bankBrand: {
      color: "#FFFFFFCC",
      fontWeight: "700",
      fontSize: 13,
      letterSpacing: 2,
    },
    bankBalance: { color: "#FFFFFF", fontSize: 34, fontWeight: "600" },
    bankNumber: { color: "#FFFFFFDD", fontSize: 15, letterSpacing: 2 },
    bankSmall: { color: "#FFFFFF99", fontSize: 9, letterSpacing: 1.4 },
    clickRate: { alignItems: "center", gap: 7, paddingTop: 4 },
    rate: { color: p.text, fontSize: 29, fontWeight: "600" },
    progress: {
      height: 5,
      borderRadius: 3,
      backgroundColor: p.border,
      overflow: "hidden",
    },
    progressFill: { backgroundColor: p.accent, height: "100%" },
    tapArea: {
      minHeight: 230,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    tapOuter: {
      width: 148,
      height: 148,
      borderRadius: 74,
      borderWidth: 1,
      borderColor: p.border,
      alignItems: "center",
      justifyContent: "center",
    },
    tapInner: {
      width: 124,
      height: 124,
      borderRadius: 62,
      backgroundColor: p.panel,
      alignItems: "center",
      justifyContent: "center",
    },
    tapHint: { color: p.muted, fontSize: 13 },
    tapAmount: { color: p.accent, fontSize: 17, fontWeight: "600" },
    summary: { alignItems: "center", paddingVertical: 22, gap: 10 },
    total: { color: p.text, fontSize: 32, fontWeight: "600" },
    empty: { alignItems: "center", padding: 30, gap: 16 },
    tile: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: p.panel,
      marginTop: 10,
    },
    profileName: {
      color: p.text,
      fontSize: 24,
      fontWeight: "600",
      textAlign: "center",
    },
    profileTag: {
      color: p.muted,
      fontSize: 12,
      textAlign: "center",
      marginTop: -12,
    },
    transaction: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
      borderBottomColor: p.border,
      borderBottomWidth: 1,
    },
    transactionValue: { fontSize: 13, fontWeight: "500" },
    itemArt: {
      alignItems: "center",
      padding: 40,
      backgroundColor: p.panel,
      borderRadius: 16,
    },
  });
}
const darkStyles = styles(dark),
  lightStyles = styles(light);
