import { useState } from "react";
import { View, Alert } from "react-native";
import { Game, ITEMS, money } from "../engine/game";
import {
  assetPrice,
  empireMetrics,
  propertyHourly,
  propertyValue,
} from "../engine/empire";
import { useGame } from "../store/game";
import Icon from "../components/Icon";
import {
  Button,
  Card,
  Empty,
  Info,
  Page,
  Progress,
  Row,
  Section,
  Sheet,
  Tabs,
  Txt,
  usePalette,
} from "../components/GameUI";
export function itemIcon(kind: string) {
  return kind === "Cars"
    ? "car"
    : kind === "Yachts"
      ? "yacht"
      : kind === "Aircraft"
        ? "aircraft"
        : kind === "Art"
          ? "art"
          : kind === "Jewelry"
            ? "gem"
            : kind === "Islands"
              ? "island"
              : "items";
}
export const itemColors = [
  "#58A2BA",
  "#D49B64",
  "#6CA28A",
  "#827CB6",
  "#3D7EB5",
  "#A6A060",
];
export default function Items({ g }: { g: Game }) {
  const [category, setCategory] = useState("Cars"),
    [view, setView] = useState("Catalog"),
    [index, setIndex] = useState<number | null>(null),
    m = empireMetrics(g),
    owned = ITEMS.reduce(
      (n, a, i) => n + (a.kind !== "Real estate" && g.items?.[i] ? 1 : 0),
      0,
    ),
    visible = ITEMS.map((a, i) => ({ a, i })).filter(
      ({ a, i }) => a.kind === category && (view === "Catalog" || g.items?.[i]),
    );
  return (
    <>
      <Page title="Items" balance={g.cash}>
        <Card>
          <Txt muted>Your possessions</Txt>
          <Txt size={32} bold>
            {money(m.luxuries)}
          </Txt>
          <Info label="Collection size" value={`${owned} items`} />
          <Txt muted size={12}>
            Real estate and rental income are managed in Investing.
          </Txt>
        </Card>
        <Tabs
          values={["Catalog", "My collection"]}
          selected={view}
          onSelect={setView}
        />
        <Tabs
          values={["Cars", "Yachts", "Aircraft", "Islands", "Art", "Jewelry"]}
          selected={category}
          onSelect={setCategory}
        />
        {visible.map(({ a, i }) => (
          <Row
            key={a.name}
            icon={itemIcon(a.kind)}
            color={itemColors[i % itemColors.length]}
            title={a.name}
            subtitle={g.items?.[i] ? `Owned · ${a.location}` : a.location}
            value={g.items?.[i] ? "View" : money(a.cost)}
            onPress={() => setIndex(i)}
          />
        ))}
        {!visible.length && (
          <Empty
            icon={itemIcon(category)}
            title="Nothing in this collection yet"
            description="Visit the catalog to add your first item."
          />
        )}
      </Page>
      <AssetSheet g={g} index={index} onClose={() => setIndex(null)} />
    </>
  );
}
export function AssetSheet({
  g,
  index,
  onClose,
}: {
  g: Game;
  index: number | null;
  onClose: () => void;
}) {
  const { busy, dispatch } = useGame(),
    p = usePalette();
  if (index === null) return null;
  const a = ITEMS[index],
    price = assetPrice(g, index),
    has = !!g.items?.[index],
    rates = propertyHourly(g, index),
    level = g.improvements?.[index] ?? 0,
    improvements = [
      "Cosmetic repairs",
      "Home appliances",
      "Furniture refresh",
      "High-speed connectivity",
      "Resident parking",
    ];
  return (
    <Sheet visible title={a.name} onClose={onClose}>
      <View
        style={{
          padding: 40,
          alignItems: "center",
          borderRadius: 20,
          backgroundColor: p.panel,
        }}
      >
        <Icon
          name={itemIcon(a.kind)}
          size={105}
          color={itemColors[index % itemColors.length]}
        />
      </View>
      <Card>
        <Info label="Location" value={a.location} />
        <Info label="Market value" value={money(propertyValue(g, index))} />
        <Info label="Rental income / hour" value={money(rates.rent)} />
        <Info label="Maintenance / hour" value={money(rates.expenses)} />
        <Info
          label="Net income / hour"
          value={money(rates.rent - rates.expenses)}
        />
      </Card>
      {has && a.kind === "Real estate" && (
        <Card>
          <Section>Property improvements</Section>
          <Progress value={level / 5} />
          {improvements.map((name, i) => (
            <Txt key={name} muted={i >= level} size={13}>
              {i < level ? "✓" : "○"} {name}
            </Txt>
          ))}
          <Info
            label="Next improvement investment"
            value={money(Math.floor(price / 10))}
          />
          <Info
            label="Next level rent / hour"
            value={money(
              propertyHourly(
                {
                  ...g,
                  improvements: g.improvements!.map((x, i) =>
                    i === index ? Math.min(5, x + 1) : x,
                  ),
                },
                index,
              ).rent,
            )}
          />
          <Button
            title={
              level >= 5
                ? "All improvements complete"
                : `Add ${improvements[level].toLowerCase()}`
            }
            disabled={busy || level >= 5 || g.cash < Math.floor(price / 10)}
            onPress={() => void dispatch({ type: "improveProperty", index })}
          />
        </Card>
      )}
      {has ? (
        <>
          <Txt muted size={12}>
            A sale returns 90% of the property or item value, including paid
            improvements.
          </Txt>
          <Button
            title={`Sell for ${money(Math.floor(propertyValue(g, index) * 0.9))}`}
            danger
            disabled={busy}
            onPress={() =>
              Alert.alert("Confirm sale", `Sell ${a.name}?`, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sell",
                  style: "destructive",
                  onPress: async () => {
                    await dispatch({ type: "sellItem", index });
                    if (!useGame.getState().error) onClose();
                  },
                },
              ])
            }
          />
        </>
      ) : (
        <Button
          title={`Buy for ${money(price)}`}
          disabled={busy || g.cash < price}
          onPress={() => void dispatch({ type: "buyItem", index })}
        />
      )}
    </Sheet>
  );
}
