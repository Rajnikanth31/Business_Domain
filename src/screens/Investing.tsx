import { useState } from "react";
import { View, Pressable } from "react-native";
import Svg, { Polyline, Line } from "react-native-svg";
import { Game, ITEMS, MARKETS, marketPrice, money } from "../engine/game";
import {
  assetPrice,
  dividendYield,
  dividendHourly,
  empireMetrics,
  marketCap,
  marketChange,
  marketUnits,
  maxTrade,
  mulDiv,
  orderValue,
  parseQuantity,
  propertyHourly,
  quantityText,
} from "../engine/empire";
import { useGame } from "../store/game";
import { AssetSheet, itemColors } from "./Items";
import {
  Banner,
  Button,
  Card,
  Empty,
  Gradient,
  Info,
  Input,
  Page,
  Row,
  Section,
  Sheet,
  Tabs,
  Txt,
  usePalette,
} from "../components/GameUI";
export default function Investing({ g }: { g: Game }) {
  const [tab, setTab] = useState("Shares"),
    [market, setMarket] = useState<"stock" | "crypto" | null>(null),
    [portfolio, setPortfolio] = useState(false),
    [propertyList, setPropertyList] = useState<"market" | "owned" | null>(null),
    [asset, setAsset] = useState<number | null>(null),
    [property, setProperty] = useState<number | null>(null),
    [filter, setFilter] = useState("Hot"),
    p = usePalette(),
    m = empireMetrics(g);
  const kind = tab === "Shares" ? "Stock" : "Crypto";
  let value = 0,
    basis = 0;
  MARKETS.forEach((a, i) => {
    if (a.kind === kind) {
      const h = g.holdings?.[i];
      value += orderValue(i, h?.quantity ?? 0, g.lastSettlement, g.marketSeed);
      basis += h?.cost ?? 0;
    }
  });
  const gain = value - basis,
    pct = basis ? (gain / basis) * 100 : 0;
  let offers = MARKETS.map((a, i) => ({
    a,
    i,
    change: marketChange(i, g.lastSettlement, g.marketSeed),
  })).filter(({ a }) => a.kind === (market === "crypto" ? "Crypto" : "Stock"));
  if (filter === "Gainers")
    offers = offers
      .filter((o) => o.change > 0)
      .sort((a, b) => b.change - a.change);
  else if (filter === "Losers")
    offers = offers
      .filter((o) => o.change < 0)
      .sort((a, b) => a.change - b.change);
  else if (filter === "Highest Cap")
    offers.sort(
      (a, b) =>
        marketCap(b.i, g.lastSettlement, g.marketSeed) -
        marketCap(a.i, g.lastSettlement, g.marketSeed),
    );
  else if (filter === "Lowest Cap")
    offers.sort(
      (a, b) =>
        marketCap(a.i, g.lastSettlement, g.marketSeed) -
        marketCap(b.i, g.lastSettlement, g.marketSeed),
    );
  else if (filter === "Dividend yield")
    offers.sort((a, b) => dividendYield(b.i) - dividendYield(a.i));
  else offers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const held = MARKETS.map((a, i) => ({ a, i, h: g.holdings?.[i] })).filter(
    ({ a, h }) => a.kind === kind && !!h?.quantity,
  );
  const showMarket = (type: "stock" | "crypto") => {
    setFilter("Hot");
    setMarket(type);
  };
  return (
    <>
      <Page title="Investing" balance={g.cash}>
        <Tabs
          underline
          values={["Shares", "Real Estate", "Cryptocurrency"]}
          selected={tab}
          onSelect={setTab}
        />
        {tab === "Shares" && (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="My stock portfolio"
              onPress={() => setPortfolio(true)}
              style={{ borderRadius: 22, overflow: "hidden" }}
            >
              <View style={{ backgroundColor: "#4C93EF", padding: 18 }}>
                <Txt color="#FFFFFF" size={19}>
                  ▣ My stock portfolio ›
                </Txt>
              </View>
              <View style={{ padding: 20, gap: 15, minHeight: 240 }}>
                <Gradient
                  colors={
                    p.background === "#FFFFFF"
                      ? ["#F1FCFF", "#CEEAFF"]
                      : ["#293A4E", "#284E6B"]
                  }
                />
                <Txt muted>Value of stock portfolio</Txt>
                <Txt size={34} bold>
                  {money(value)}
                </Txt>
                <Txt color={gain >= 0 ? "#38B88B" : p.negative}>
                  {gain >= 0 ? "+" : ""}
                  {money(gain)} ({pct.toFixed(2)}%) · current holdings
                </Txt>
                <View style={{ height: 8 }} />
                <Txt muted>Estimated dividend yield per hour</Txt>
                <Txt size={29} bold>
                  {money(dividendHourly(g))}
                </Txt>
              </View>
            </Pressable>
            <Banner
              kind="market"
              title="Stock market"
              subtitle="View all available offers"
              onPress={() => showMarket("stock")}
            />
            <Section>Stable income</Section>
            <Txt muted>Shares with the highest hourly game dividend yields</Txt>
            {MARKETS.map((a, i) => ({ a, i }))
              .filter((x) => x.a.kind === "Stock")
              .sort((a, b) => dividendYield(b.i) - dividendYield(a.i))
              .slice(0, 3)
              .map(({ a, i }) => (
                <Row
                  key={a.symbol}
                  title={a.name}
                  subtitle={`${(dividendYield(i) / 100).toFixed(2)}% hourly game yield`}
                  icon="investing"
                  color={itemColors[i % 6]}
                  value="Buy"
                  onPress={() => setAsset(i)}
                />
              ))}
            <Button
              title="Show all shares →"
              secondary
              onPress={() => {
                showMarket("stock");
                setFilter("Dividend yield");
              }}
            />
          </>
        )}
        {tab === "Real Estate" && (
          <>
            <View
              style={{
                borderRadius: 22,
                padding: 28,
                overflow: "hidden",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Gradient
                colors={
                  p.background === "#FFFFFF"
                    ? ["#EFF5FC", "#81A9E2"]
                    : ["#29405B", "#305F96"]
                }
              />
              <Txt size={34} bold>
                {money(m.rentHourly)}
              </Txt>
              <Txt muted>Net rental income per hour</Txt>
            </View>
            <Banner
              title="Real estate market"
              subtitle="Buy properties and earn rental income"
              kind="city"
              onPress={() => setPropertyList("market")}
            />
            <Banner
              title="My property"
              subtitle="View and improve your properties"
              kind="house"
              onPress={() => setPropertyList("owned")}
            />
          </>
        )}
        {tab === "Cryptocurrency" && (
          <>
            <View
              style={{
                borderRadius: 22,
                padding: 24,
                gap: 16,
                overflow: "hidden",
              }}
            >
              <Gradient colors={["#426DB1", "#172744"]} />
              <Txt color="#FFFFFFCC">Total cryptocurrency value</Txt>
              <Txt color="#FFFFFF" size={34} bold>
                {money(value)}
              </Txt>
              <Txt color={gain >= 0 ? "#58D1A5" : "#FFABAB"}>
                {gain >= 0 ? "▲" : "▼"} {money(gain)} ({pct.toFixed(2)}%)
              </Txt>
              <Button
                title="Buy"
                secondary
                onPress={() => showMarket("crypto")}
              />
            </View>
            <Section>Coins</Section>
            {held.length ? (
              held.map(({ a, i, h }) => (
                <Row
                  key={a.symbol}
                  title={a.name}
                  subtitle={`${quantityText(i, h!.quantity)} ${a.symbol}`}
                  value={money(
                    orderValue(i, h!.quantity, g.lastSettlement, g.marketSeed),
                  )}
                  color={itemColors[i % 6]}
                  icon="coin"
                  onPress={() => setAsset(i)}
                />
              ))
            ) : (
              <Txt muted>You don’t own cryptocurrency.</Txt>
            )}
          </>
        )}
        <Txt muted size={11}>
          All prices, assets and returns are simulated. Prices update every five
          minutes. No real-money trading.
        </Txt>
      </Page>
      <Sheet
        visible={market !== null}
        title={market === "crypto" ? "Cryptoexchange" : "Stock market"}
        onClose={() => setMarket(null)}
      >
        <Tabs
          values={
            market === "crypto"
              ? ["Hot", "Gainers", "Losers", "Highest Cap", "Lowest Cap"]
              : [
                  "Hot",
                  "Gainers",
                  "Losers",
                  "Highest Cap",
                  "Lowest Cap",
                  "Dividend yield",
                ]
          }
          selected={filter}
          onSelect={setFilter}
        />
        {offers.map(({ a, i, change }) => (
          <Row
            key={a.symbol}
            title={a.name}
            subtitle={`${a.symbol} · ${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%${a.kind === "Stock" ? ` · ${(dividendYield(i) / 100).toFixed(2)}% yield` : ""}`}
            value={money(marketPrice(i, g.lastSettlement, g.marketSeed))}
            icon={a.kind === "Crypto" ? "coin" : "investing"}
            color={itemColors[i % 6]}
            onPress={() => setAsset(i)}
          />
        ))}
        {!offers.length && (
          <Empty
            icon="investing"
            title="No assets match this filter"
            description="Choose another filter to see available offers."
          />
        )}
      </Sheet>
      <Sheet
        visible={portfolio}
        title="My stock portfolio"
        onClose={() => setPortfolio(false)}
      >
        <Card>
          <Info label="Portfolio value" value={money(value)} />
          <Info
            label="Current holdings return"
            value={`${money(gain)} (${pct.toFixed(2)}%)`}
          />
          <Info
            label="All-asset realized gains / losses"
            value={money(g.realized ?? 0)}
          />
          <Info
            label="Dividends received"
            value={money(g.dividendsEarned ?? 0)}
          />
        </Card>
        {held.length ? (
          held.map(({ a, i, h }) => (
            <Row
              key={a.symbol}
              title={a.name}
              subtitle={`${quantityText(i, h!.quantity)} shares`}
              value={money(
                orderValue(i, h!.quantity, g.lastSettlement, g.marketSeed),
              )}
              icon="investing"
              color={itemColors[i % 6]}
              onPress={() => setAsset(i)}
            />
          ))
        ) : (
          <Empty
            title="Your portfolio is empty"
            description="Buy shares from the stock market to build a dividend portfolio."
            icon="investing"
          />
        )}
        <Button
          title="Go to stock market"
          onPress={() => {
            setPortfolio(false);
            showMarket("stock");
          }}
        />
      </Sheet>
      <Sheet
        visible={propertyList !== null}
        title={propertyList === "owned" ? "My property" : "Real estate market"}
        onClose={() => setPropertyList(null)}
      >
        {ITEMS.map((a, i) => ({ a, i }))
          .filter(
            ({ a, i }) =>
              a.kind === "Real estate" &&
              (propertyList === "market" || g.items?.[i]),
          )
          .map(({ a, i }) => (
            <Row
              key={a.name}
              title={a.name}
              subtitle={`${a.location} · ${money(propertyHourly(g, i).rent - propertyHourly(g, i).expenses)} / hour`}
              value={g.items?.[i] ? "Owned" : money(assetPrice(g, i))}
              icon="items"
              color={itemColors[i % 6]}
              onPress={() => setProperty(i)}
            />
          ))}
        {propertyList === "owned" &&
          !ITEMS.some((a, i) => a.kind === "Real estate" && g.items?.[i]) && (
            <Empty
              icon="items"
              title="You don’t own any properties"
              description="Visit the real estate market to buy your first rental property."
            />
          )}
      </Sheet>
      <TradeSheet
        key={asset ?? "closed"}
        g={g}
        index={asset}
        onClose={() => setAsset(null)}
      />
      <AssetSheet g={g} index={property} onClose={() => setProperty(null)} />
    </>
  );
}
function TradeSheet({
  g,
  index,
  onClose,
}: {
  g: Game;
  index: number | null;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(
      index !== null && MARKETS[index].kind === "Crypto" ? "0.01" : "1",
    ),
    { busy, dispatch } = useGame(),
    p = usePalette();
  if (index === null) return null;
  const a = MARKETS[index],
    h = g.holdings![index],
    price = marketPrice(index, g.lastSettlement, g.marketSeed);
  let q = 0;
  try {
    q = parseQuantity(index, amount);
  } catch {}
  const buy = orderValue(index, q, g.lastSettlement, g.marketSeed, true),
    sell = orderValue(index, q, g.lastSettlement, g.marketSeed),
    buyFee = Math.ceil(buy / 100),
    sellFee = Math.ceil(sell / 100),
    avg = h.quantity ? mulDiv(h.cost, marketUnits(index), h.quantity) : 0;
  return (
    <Sheet visible title={a.name} onClose={onClose}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <Txt muted>{a.symbol} · Simulated price</Txt>
        <Txt bold size={32}>
          {money(price)}
        </Txt>
        <Txt
          color={
            marketChange(index, g.lastSettlement, g.marketSeed) >= 0
              ? p.accent
              : p.negative
          }
        >
          {marketChange(index, g.lastSettlement, g.marketSeed).toFixed(2)}% in
          the last five-minute period
        </Txt>
      </View>
      <MarketChart index={index} g={g} />
      <Card>
        <Info
          label="Quantity owned"
          value={`${quantityText(index, h.quantity)} ${a.symbol}`}
        />
        <Info
          label="Average purchase price (includes fees)"
          value={money(avg)}
        />
        <Info
          label="Unrealized gain / loss"
          value={money(
            orderValue(index, h.quantity, g.lastSettlement, g.marketSeed) -
              h.cost,
          )}
        />
        {a.kind === "Stock" && (
          <Info
            label="Hourly dividend yield"
            value={`${(dividendYield(index) / 100).toFixed(2)}%`}
          />
        )}
      </Card>
      <Input
        label="Order quantity"
        numeric
        value={amount}
        onChangeText={setAmount}
        maxLength={24}
      />
      <Txt muted size={11}>
        {a.kind === "Crypto"
          ? "Up to six decimal places."
          : "Whole shares only."}{" "}
        Trading fee: 1%, rounded up to the nearest cent.
      </Txt>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button
            title="Buy maximum"
            secondary
            onPress={() =>
              setAmount(
                quantityText(index, maxTrade(g, index)).replace(/,/g, ""),
              )
            }
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Sell all"
            secondary
            disabled={!h.quantity}
            onPress={() =>
              setAmount(quantityText(index, h.quantity).replace(/,/g, ""))
            }
          />
        </View>
      </View>
      <Button
        title={`Buy ${amount || "0"} · ${money(buy + buyFee)}`}
        disabled={busy || q <= 0 || g.cash < buy + buyFee}
        onPress={() =>
          void dispatch({ type: "trade", index, side: "buy", quantity: q })
        }
      />
      <Button
        title={`Sell ${amount || "0"} · ${money(sell - sellFee)}`}
        secondary
        disabled={busy || q <= 0 || h.quantity < q}
        onPress={() =>
          void dispatch({ type: "trade", index, side: "sell", quantity: q })
        }
      />
    </Sheet>
  );
}
function MarketChart({ index, g }: { index: number; g: Game }) {
  const p = usePalette(),
    values = Array.from({ length: 24 }, (_, i) =>
      marketPrice(
        index,
        Math.max(0, g.lastSettlement - (23 - i) * 300000),
        g.marketSeed,
      ),
    ),
    min = Math.min(...values),
    range = Math.max(1, Math.max(...values) - min),
    points = values
      .map(
        (v, i) => `${10 + (i * 300) / 23},${120 - ((v - min) / range) * 100}`,
      )
      .join(" ");
  return (
    <Card>
      <Txt muted size={12}>
        Price history · last two hours
      </Txt>
      <Svg width="100%" height={140} viewBox="0 0 320 140">
        <Line x1={0} y1={120} x2={320} y2={120} stroke={p.border} />
        <Polyline
          points={points}
          fill="none"
          stroke={p.accent}
          strokeWidth={2.5}
        />
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Txt muted size={11}>
          Low {money(min)}
        </Txt>
        <Txt muted size={11}>
          High {money(Math.max(...values))}
        </Txt>
      </View>
    </Card>
  );
}
