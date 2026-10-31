import { useState } from "react";
import { View, Pressable, Alert } from "react-native";
import { Game, money } from "../engine/game";
import { empireMetrics, ranking, milestoneStatus } from "../engine/empire";
import { useGame } from "../store/game";
import Icon from "../components/Icon";
import {
  Button,
  Card,
  Gradient,
  Info,
  Input,
  Page,
  Section,
  Sheet,
  Tabs,
  Txt,
  compact,
  usePalette,
} from "../components/GameUI";
export default function Profile({ g }: { g: Game }) {
  const { dispatch, busy } = useGame(),
    [edit, setEdit] = useState(false),
    [ranks, setRanks] = useState(false),
    [name, setName] = useState(g.profile?.name ?? "Entrepreneur"),
    [sector, setSector] = useState(
      g.profile?.sector ?? "Business & Investments",
    ),
    [avatar, setAvatar] = useState(g.profile?.avatar ?? 0),
    p = usePalette(),
    m = empireMetrics(g),
    board = ranking(g),
    place = board.findIndex((r) => r.player) + 1,
    level = 1 + Math.floor(Math.sqrt((g.xp ?? 0) / 100)),
    badges = milestoneStatus(g);
  async function saveProfile() {
    await dispatch({ type: "profile", name, sector, avatar });
    if (!useGame.getState().error) setEdit(false);
  }
  function beginEdit() {
    setName(g.profile?.name ?? "Entrepreneur");
    setSector(g.profile?.sector ?? "Business & Investments");
    setAvatar(g.profile?.avatar ?? 0);
    setEdit(true);
  }
  return (
    <>
      <Page title="Profile">
        <View style={{ alignItems: "center", gap: 12, paddingVertical: 12 }}>
          <Avatar
            name={g.profile?.name ?? "Entrepreneur"}
            color={board.find((r) => r.player)!.color}
            size={88}
          />
          <Txt size={24} bold>
            {g.profile?.name ?? "Entrepreneur"}
          </Txt>
          <Txt muted>{g.profile?.sector ?? "Business & Investments"}</Txt>
          <Txt color={p.accent}>
            Level {level} · {(g.xp ?? 0).toLocaleString()} XP
          </Txt>
          <Button title="Edit profile" secondary onPress={beginEdit} />
        </View>
        <Card>
          <Txt muted>Total fortune</Txt>
          <Txt size={34} bold>
            {money(m.netWorth)}
          </Txt>
          <Info label="Cash balance" value={money(g.cash)} />
          <Info label="Company assets" value={money(m.assets)} />
          <Info label="Investment portfolio" value={money(m.portfolio)} />
          <Info label="Real estate" value={money(m.properties)} />
          <Info label="Luxury collection" value={money(m.luxuries)} />
          <Info
            label="Net passive income / hour"
            value={money(m.hourlyProfit)}
          />
          <Info label="Lifetime net passive earnings" value={money(g.earned)} />
          <Info
            label="Dividends received"
            value={money(g.dividendsEarned ?? 0)}
          />
        </Card>
        <Button
          title={`Wealth ranking · You are #${place}`}
          onPress={() => setRanks(true)}
        />
        <Section>Milestones</Section>
        <Card>
          {badges.map((b) => (
            <View key={b.id} style={{ gap: 8 }}>
              <Txt color={b.claimed ? p.accent : p.text}>
                {b.claimed ? "✓" : "○"} {b.name}
              </Txt>
              <Button
                title={b.claimed ? "Collected" : `Collect ${money(b.reward)}`}
                disabled={busy || !b.eligible || b.claimed}
                secondary
                onPress={() =>
                  void dispatch({ type: "claimMilestone", id: b.id })
                }
              />
            </View>
          ))}
        </Card>
        <Section>Appearance</Section>
        <Tabs
          values={["Light", "Dark"]}
          selected={g.theme === "dark" ? "Dark" : "Light"}
          onSelect={(v) =>
            void dispatch({
              type: "theme",
              value: v === "Light" ? "light" : "dark",
            })
          }
        />
        <Txt muted size={12}>
          Bank card style
        </Txt>
        <Tabs
          values={["World", "Emerald", "Ocean"]}
          selected={
            g.cardSkin === "emerald"
              ? "Emerald"
              : g.cardSkin === "ocean"
                ? "Ocean"
                : "World"
          }
          onSelect={(v) =>
            void dispatch({
              type: "cardSkin",
              value:
                v === "Emerald" ? "emerald" : v === "Ocean" ? "ocean" : "world",
            })
          }
        />
        <Button
          secondary
          title={`Tap haptics: ${g.haptics === false ? "Off" : "On"}`}
          disabled={busy}
          onPress={() =>
            void dispatch({ type: "haptics", value: g.haptics === false })
          }
        />
        <Section>Save protection</Section>
        <Button
          title="Save a recovery backup"
          secondary
          disabled={busy}
          onPress={async () => {
            await dispatch({ type: "backup" });
            if (!useGame.getState().error)
              Alert.alert(
                "Backup saved",
                "If your saved data cannot be loaded, use Restore save backup on the loading screen. This backup stays on this device.",
              );
          }}
        />
        <Section>Recent transactions</Section>
        {g.transactions.slice(0, 30).map((t) => (
          <View
            key={t.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              borderBottomWidth: 1,
              borderBottomColor: p.border,
              paddingVertical: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Txt size={13}>{t.label}</Txt>
              <Txt muted size={10}>
                {new Date(t.time).toLocaleString()}
              </Txt>
            </View>
            <Txt size={12} color={t.amount >= 0 ? p.accent : p.negative}>
              {t.amount >= 0 ? "+" : ""}
              {money(t.amount)}
            </Txt>
          </View>
        ))}
        <Txt muted size={11}>
          Business Empire: NextGen · 2.0. Simulated dollars and offline markets.
          Earnings are capped at eight hours per absence. Wealth rankings use
          fictional offline benchmarks. Device time and local saves cannot
          provide server-authoritative anti-cheat protection.
        </Txt>
      </Page>
      <Sheet visible={edit} title="Edit profile" onClose={() => setEdit(false)}>
        <Input
          label="Player name"
          maxLength={30}
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Business sector"
          maxLength={40}
          value={sector}
          onChangeText={setSector}
        />
        <Section>Avatar color</Section>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {[
            "#4B99BA",
            "#6B8D58",
            "#996EAB",
            "#B89B5A",
            "#6BA8A0",
            "#C17D7D",
            "#647CA9",
            "#8E8E8E",
          ].map((color, i) => (
            <Pressable
              key={color}
              accessibilityRole="button"
              accessibilityLabel={`Avatar color ${i + 1}`}
              accessibilityState={{ selected: avatar === i }}
              onPress={() => setAvatar(i)}
              style={{
                borderRadius: 30,
                padding: 4,
                borderWidth: 3,
                borderColor: avatar === i ? p.accent : "transparent",
              }}
            >
              <Avatar name={name || "You"} color={color} size={45} />
            </Pressable>
          ))}
        </View>
        <Button
          title="Save profile"
          disabled={busy || !name.trim() || !sector.trim()}
          onPress={() => void saveProfile()}
        />
      </Sheet>
      <Sheet
        visible={ranks}
        title="Wealth ranking"
        onClose={() => setRanks(false)}
      >
        <View
          style={{ padding: 20, borderRadius: 22, overflow: "hidden", gap: 15 }}
        >
          <Gradient colors={["#0A815F", "#304B52"]} />
          <Txt center color="#FFFFFFDD" size={12}>
            FICTIONAL OFFLINE BENCHMARKS
          </Txt>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "flex-end",
              gap: 8,
              paddingTop: 10,
            }}
          >
            {[1, 0, 2].map((i) => {
              const r = board[i];
              return (
                <View
                  key={r.name}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    gap: 10,
                    marginBottom: i === 0 ? 24 : 0,
                  }}
                >
                  <Avatar name={r.name} color={r.color} size={58} />
                  <Txt center color="#FFFFFF" size={12} bold>
                    {r.name}
                  </Txt>
                  <View
                    style={{
                      backgroundColor: "#FFFFFF22",
                      borderRadius: 16,
                      padding: 10,
                      width: "100%",
                      gap: 5,
                    }}
                  >
                    <Txt center color="#FFFFFF" size={17}>
                      {i + 1}
                      {i === 0 ? "st" : i === 1 ? "nd" : "rd"}
                    </Txt>
                    <Txt center color="#FFFFFF" size={14} bold>
                      {compact(r.wealth)}
                    </Txt>
                  </View>
                </View>
              );
            })}
          </View>
          <Txt center color="#FFFFFFCC" size={12}>
            Your rank: #{place} · {compact(m.netWorth)}
          </Txt>
        </View>
        <Card>
          {board.map((r, i) => (
            <View
              key={r.name + (r.player ? "you" : "rival")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderColor: p.border,
              }}
            >
              <Txt bold>{i + 1}</Txt>
              <Avatar name={r.name} color={r.color} size={42} />
              <View style={{ flex: 1 }}>
                <Txt bold size={14}>
                  {r.name}
                  {r.player ? " (You)" : ""}
                </Txt>
                <Txt muted size={11}>
                  {r.sector}
                </Txt>
              </View>
              <Txt size={13} bold>
                {compact(r.wealth)}
              </Txt>
            </View>
          ))}
        </Card>
        <Button
          title="Edit my profile"
          secondary
          onPress={() => {
            setRanks(false);
            beginEdit();
          }}
        />
      </Sheet>
    </>
  );
}
function Avatar({
  name,
  color,
  size,
}: {
  name: string;
  color: string;
  size: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {name.trim() ? (
        <Txt color="#FFFFFF" size={Math.floor(size / 3)} bold>
          {name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0])
            .join("")
            .toUpperCase()}
        </Txt>
      ) : (
        <Icon name="profile" size={size / 2} />
      )}
    </View>
  );
}
