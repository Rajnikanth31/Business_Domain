import { useState } from "react";
import { View, Pressable, Alert } from "react-native";
import { Game, money } from "../engine/game";
import {
  bankDetails,
  companyRates,
  companyValue,
  companyUpgradeCost,
  definition,
  empireMetrics,
  mergerStatus,
  projectOffer,
  upgradeSeconds,
} from "../engine/empire";
import { Company, INDUSTRIES, Industry, MERGERS } from "../data/catalog";
import { useGame } from "../store/game";
import Icon from "../components/Icon";
import {
  Button,
  Card,
  Empty,
  Gradient,
  Info,
  Input,
  Page,
  Progress,
  Row,
  Section,
  Sheet,
  Txt,
  duration,
  usePalette,
} from "../components/GameUI";
export default function Companies({ g }: { g: Game }) {
  const [catalog, setCatalog] = useState(false),
    [chosen, setChosen] = useState<Industry | null>(null),
    [name, setName] = useState(""),
    [id, setId] = useState<number | null>(null),
    [mergers, setMergers] = useState(false),
    { busy, dispatch } = useGame(),
    p = usePalette(),
    m = empireMetrics(g),
    company = g.companies?.find((c) => c.id === id),
    cooldown =
      g.lastBoost === undefined
        ? 0
        : Math.max(0, g.lastBoost + 86400000 - g.lastSettlement);
  async function open() {
    if (!chosen) return;
    await dispatch({
      type: "openCompany",
      kind: chosen.id,
      name: name.trim() || undefined,
    });
    if (!useGame.getState().error) {
      setCatalog(false);
      setChosen(null);
    }
  }
  return (
    <>
      <Page title="Business" balance={g.cash}>
        <Card>
          <Txt size={34} bold>
            {money(m.businessHourly)}
          </Txt>
          <Txt color={p.accent}>Total income per hour</Txt>
          <Button
            title={
              (g.boostUntil ?? 0) > g.lastSettlement
                ? `+30% boost · ${duration(g.boostUntil! - g.lastSettlement)} left`
                : cooldown
                  ? `Next free boost in ${duration(cooldown)}`
                  : "Activate +30% income for 4 hours"
            }
            disabled={busy || !!cooldown || !g.companies?.length}
            secondary
            onPress={() => void dispatch({ type: "boost" })}
          />
          <Txt muted size={11}>
            Free once every 24 hours. Bonus applies to positive company profit.
          </Txt>
        </Card>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Start a business"
              onPress={() => {
                setChosen(null);
                setCatalog(true);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Business mergers"
              secondary
              onPress={() => setMergers(true)}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Section>My companies</Section>
          <Txt muted size={18}>
            {g.companies?.length ?? 0}/10
          </Txt>
        </View>
        {!g.companies?.length ? (
          <Empty
            title="You don’t own any businesses"
            description="Choose a category to start your first company."
          />
        ) : (
          g.companies.map((c) => {
            const d = definition(c);
            return (
              <Row
                key={c.id}
                title={c.name}
                icon={d.icon}
                color={d.color}
                subtitle={`${d.name} · Stage ${c.level}${c.upgrade ? " · Expanding" : ""}`}
                value={`${money(companyRates(c).profit)} / h`}
                onPress={() => setId(c.id)}
              />
            );
          })
        )}
      </Page>
      <Sheet
        visible={catalog}
        title={
          chosen ? `Open ${chosen.name}` : "Choose a new business category"
        }
        onClose={() => (chosen ? setChosen(null) : setCatalog(false))}
      >
        {chosen ? (
          <>
            <Card>
              <Info label="Opening investment" value={money(chosen.cost)} />
              <Info
                label="Company slots"
                value={`${g.companies?.length ?? 0}/10`}
              />
              <Txt muted size={13}>
                {chosen.mode === "fleet" || chosen.mode === "airline"
                  ? "Buy vehicles after opening to generate revenue."
                  : chosen.mode === "bank"
                    ? "Fund the vault and choose deposit and lending offers."
                    : ["construction", "dealer", "it"].includes(chosen.mode)
                      ? "Accept timed projects to earn income; resources or staff may be required."
                      : chosen.mode === "oil"
                        ? "Buy production wells to begin extraction."
                        : "Expand stages, recruit staff and train your team to grow revenue."}
              </Txt>
            </Card>
            <Input
              label="Company name"
              placeholder={`${chosen.name} ${g.nextCompanyId}`}
              value={name}
              onChangeText={setName}
            />
            <Button
              title={`Open for ${money(chosen.cost)}`}
              disabled={
                busy || g.cash < chosen.cost || (g.companies?.length ?? 0) >= 10
              }
              onPress={() => void open()}
            />
          </>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {INDUSTRIES.filter((d) => d.mode !== "merged").map((d) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Choose ${d.name}`}
                key={d.id}
                onPress={() => {
                  setName("");
                  setChosen(d);
                }}
                style={({ pressed }) => ({
                  width: "48%",
                  minHeight: 180,
                  padding: 16,
                  borderRadius: 18,
                  backgroundColor: p.panel,
                  gap: 16,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: d.color,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={d.icon} size={30} />
                </View>
                <View style={{ flex: 1 }} />
                <Txt bold size={17}>
                  {d.name}
                </Txt>
                <Txt muted size={13}>
                  From {money(d.cost)}
                </Txt>
              </Pressable>
            ))}
          </View>
        )}
      </Sheet>
      <Sheet
        visible={!!company}
        title={company?.name ?? "Company"}
        onClose={() => setId(null)}
      >
        {company && (
          <Manage
            key={company.id}
            c={company}
            g={g}
            onClose={() => setId(null)}
          />
        )}
      </Sheet>
      <Sheet
        visible={mergers}
        title="Business mergers"
        onClose={() => setMergers(false)}
      >
        {MERGERS.map((spec) => {
          const state = mergerStatus(g, spec.id),
            d = INDUSTRIES.find((x) => x.id === spec.id)!;
          return (
            <Card key={spec.id}>
              <View
                style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
              >
                <Icon name={d.icon} color={d.color} size={40} />
                <Section>{d.name}</Section>
              </View>
              {state.rows.map((r) => (
                <View key={r.label} style={{ gap: 7 }}>
                  <Txt size={13}>
                    {r.complete ? "✓" : "○"} {r.label}
                  </Txt>
                  <Progress value={r.progress} />
                </View>
              ))}
              <View
                style={{
                  padding: 18,
                  borderRadius: 14,
                  overflow: "hidden",
                  gap: 10,
                }}
              >
                <Gradient colors={["#358BCA", "#244B94"]} />
                <Txt color="#FFFFFF" center>
                  Potential effect
                </Txt>
                <Txt color="#FFFFFF" size={27} center bold>
                  {money(d.revenue - d.expense)}
                </Txt>
                <Txt color="#FFFFFFCC" center size={12}>
                  Income per hour at stage 1
                </Txt>
              </View>
              <Txt muted size={12}>
                Eligible companies, their fleets and invested capital are
                combined. Their active projects and expansions must finish
                first.
              </Txt>
              <Button
                title={`Create ${d.name}`}
                disabled={busy || !state.eligible}
                onPress={() =>
                  Alert.alert(
                    "Create merged company?",
                    `This combines the listed companies and costs ${money(spec.cash)}.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Merge",
                        onPress: () =>
                          void dispatch({ type: "merge", kind: spec.id }),
                      },
                    ],
                  )
                }
              />
            </Card>
          );
        })}
      </Sheet>
    </>
  );
}
function Manage({
  c,
  g,
  onClose,
}: {
  c: Company;
  g: Game;
  onClose: () => void;
}) {
  const { busy, dispatch } = useGame(),
    [name, setName] = useState(c.name),
    [deposit, setDeposit] = useState(String(c.depositRate)),
    [lending, setLending] = useState(String(c.lendingRate)),
    d = definition(c),
    r = companyRates(c),
    upgrade = companyUpgradeCost(c),
    offer = projectOffer(c),
    bank = bankDetails(c),
    p = usePalette();
  const act = (
    type:
      | "hire"
      | "fire"
      | "train"
      | "buyCity"
      | "buyIntercity"
      | "buyResource"
      | "startProject"
      | "fundBank"
      | "withdrawBank"
      | "runMatch"
      | "companyUpgrade",
  ) => void dispatch({ type, id: c.id });
  return (
    <>
      <View style={{ alignItems: "center", gap: 10, paddingVertical: 10 }}>
        <Icon name={d.icon} color={d.color} size={64} />
        <Txt muted>
          {d.name} · Stage {c.level}/{d.stages}
        </Txt>
        <Txt bold size={30}>
          {money(r.profit)}
        </Txt>
        <Txt muted>Income per hour</Txt>
      </View>
      <Card>
        <Info label="Revenue per hour" value={money(r.revenue)} />
        <Info label="Expenses per hour" value={money(r.expenses)} />
        <Info label="Company value" value={money(companyValue(c))} />
      </Card>
      <Input label="Company name" value={name} onChangeText={setName} />
      <Button
        title="Save company name"
        secondary
        disabled={busy || !name.trim() || name.trim() === c.name}
        onPress={() => void dispatch({ type: "renameCompany", id: c.id, name })}
      />
      <Card>
        <Section>Expansion</Section>
        {c.upgrade ? (
          <>
            <Txt>
              Stage {c.upgrade.target} completes in{" "}
              {duration(c.upgrade.endsAt - g.lastSettlement)}
            </Txt>
            <Progress
              value={
                1 -
                (c.upgrade.endsAt - g.lastSettlement) /
                  (upgradeSeconds(c) * 1000)
              }
            />
          </>
        ) : (
          <>
            <Info label="Next stage investment" value={money(upgrade)} />
            <Info
              label="Expansion time"
              value={duration(upgradeSeconds(c) * 1000)}
            />
            <Info
              label="Projected net income per hour"
              value={money(
                companyRates({ ...c, level: Math.min(d.stages, c.level + 1) })
                  .profit,
              )}
            />
            <Button
              title={
                c.level >= d.stages
                  ? "Maximum stage reached"
                  : `Expand for ${money(upgrade)}`
              }
              disabled={busy || c.level >= d.stages || g.cash < upgrade}
              onPress={() => act("companyUpgrade")}
            />
          </>
        )}
      </Card>
      {(d.mode === "fleet" || d.mode === "airline") && (
        <Card>
          <Section>
            {d.mode === "airline" ? "Aircraft fleet" : "Vehicle fleet"}
          </Section>
          <Info
            label="Fleet capacity"
            value={`${c.city + c.intercity}/${c.level * 50}`}
          />
          {d.mode !== "airline" && (
            <>
              <Info label="City vehicles" value={String(c.city)} />
              <Button
                title={`Buy city vehicle · ${money(d.unitCost)}`}
                disabled={
                  busy ||
                  g.cash < d.unitCost ||
                  c.city + c.intercity >= c.level * 50
                }
                onPress={() => act("buyCity")}
              />
            </>
          )}
          <Info
            label={d.mode === "airline" ? "Aircraft" : "Intercity vehicles"}
            value={String(c.intercity)}
          />
          <Button
            title={`Buy ${d.mode === "airline" ? "aircraft" : "intercity vehicle"} · ${money(d.unitCost * (d.mode === "airline" ? 1 : 3))}`}
            disabled={
              busy ||
              g.cash < d.unitCost * (d.mode === "airline" ? 1 : 3) ||
              c.city + c.intercity >= c.level * 50
            }
            onPress={() => act("buyIntercity")}
          />
        </Card>
      )}
      {["factory", "construction", "oil"].includes(d.mode) && (
        <Card>
          <Section>
            {d.mode === "oil" ? "Oil & gas production" : "Resources"}
          </Section>
          <Info
            label={d.mode === "oil" ? "Production wells" : "Resource batches"}
            value={String(c.resources)}
          />
          <Button
            title={`Buy ${d.mode === "oil" ? "production well" : "resource batch"} · ${money(d.unitCost)}`}
            disabled={busy || g.cash < d.unitCost || c.resources >= 1000}
            onPress={() => act("buyResource")}
          />
          <Txt muted size={12}>
            {d.mode === "oil"
              ? "Each well adds extraction revenue and operating costs."
              : "Resource batches are consumed by project contracts and count toward company value until used."}
          </Txt>
        </Card>
      )}
      {["factory", "construction", "dealer", "it"].includes(d.mode) && (
        <Card>
          <Section>{offer.name}</Section>
          {c.project ? (
            <>
              <Info
                label="Status"
                value={`Completes in ${duration(c.project.endsAt - g.lastSettlement)}`}
              />
              <Info
                label="Completion payment"
                value={money(c.project.payout)}
              />
              <Txt muted size={12}>
                Payment is credited automatically when the project finishes,
                including while offline.
              </Txt>
            </>
          ) : (
            <>
              <Info label="Project investment" value={money(offer.cost)} />
              <Info label="Completion payment" value={money(offer.payout)} />
              <Info
                label="Time required"
                value={duration(offer.seconds * 1000)}
              />
              <Txt muted size={12}>
                {d.mode === "it"
                  ? "Requires at least one developer."
                  : d.mode === "factory" || d.mode === "construction"
                    ? "Requires one resource batch in addition to the project investment."
                    : "Purchase a vehicle for a timed resale contract."}
              </Txt>
              <Button
                title={`Start ${offer.name.toLowerCase()}`}
                disabled={
                  busy ||
                  g.cash < offer.cost ||
                  (d.mode === "it" && !c.staff) ||
                  ((d.mode === "factory" || d.mode === "construction") &&
                    !c.resources)
                }
                onPress={() => act("startProject")}
              />
            </>
          )}
        </Card>
      )}
      {d.mode === "bank" && (
        <Card>
          <Section>Bank management</Section>
          <Info label="Your vault capital" value={money(c.vault)} />
          <Info
            label="Simulated customer deposits"
            value={money(bank.deposits)}
          />
          <Info label="Active loan book" value={money(bank.loans)} />
          <Info label="Lending utilization" value={`${bank.utilization}%`} />
          <Button
            title={`Fund vault · ${money(d.unitCost)}`}
            disabled={busy || g.cash < d.unitCost}
            onPress={() => act("fundBank")}
          />
          <Button
            title={`Withdraw capital · ${money(d.unitCost)}`}
            secondary
            disabled={busy || c.vault < d.unitCost}
            onPress={() => act("withdrawBank")}
          />
          <Input
            label="Deposit interest (% per game hour) · 1–8"
            numeric
            value={deposit}
            onChangeText={setDeposit}
          />
          <Input
            label="Lending interest (% per game hour) · above deposit, up to 16"
            numeric
            value={lending}
            onChangeText={setLending}
          />
          <Button
            title="Apply bank rates"
            secondary
            disabled={busy}
            onPress={() =>
              void dispatch({
                type: "bankRates",
                id: c.id,
                deposit: Number(deposit),
                lending: Number(lending),
              })
            }
          />
          <Txt muted size={12}>
            Higher deposit offers attract more funds but cost interest. Higher
            lending offers reduce demand. All amounts are simulated game
            economics.
          </Txt>
        </Card>
      )}
      {d.mode === "sport" && (
        <Card>
          <Section>Club competition</Section>
          <Info label="Completed matches" value={String(c.wins)} />
          {c.project ? (
            <>
              <Txt>
                Match finishes in{" "}
                {duration(c.project.endsAt - g.lastSettlement)}
              </Txt>
              <Info label="Prize payment" value={money(c.project.payout)} />
            </>
          ) : (
            <>
              <Txt muted size={12}>
                Develop the squad with staff and training to improve match
                prizes and sponsorship income.
              </Txt>
              <Button
                title={`Schedule match · ${money(50000000)}`}
                disabled={busy || g.cash < 50000000}
                onPress={() => act("runMatch")}
              />
            </>
          )}
        </Card>
      )}
      <Card>
        <Section>
          {d.mode === "it" ? "Developers & training" : "Employees & training"}
        </Section>
        <Info label="Team size" value={`${c.staff}/${c.level * 10}`} />
        <Info label="Training level" value={`${c.training}/10`} />
        <Info
          label="Profit after next hire / hour"
          value={money(companyRates({ ...c, staff: c.staff + 1 }).profit)}
        />
        <Button
          title={`Hire employee · ${money(100000)}`}
          disabled={busy || g.cash < 100000 || c.staff >= c.level * 10}
          onPress={() => act("hire")}
        />
        <Button
          title={`Train team · ${money(50000 * (c.training + 1))}`}
          secondary
          disabled={
            busy ||
            !c.staff ||
            c.training >= 10 ||
            g.cash < 50000 * (c.training + 1)
          }
          onPress={() => act("train")}
        />
        <Button
          title="Release one employee"
          secondary
          disabled={busy || !c.staff || !!c.project}
          onPress={() => act("fire")}
        />
        <Txt muted size={12}>
          Employees earn salaries. Compare productivity gains with the added
          hourly expense.
        </Txt>
      </Card>
      <Button
        title={`Sell company for ${money(companyValue(c))}`}
        danger
        disabled={busy || !!c.project || !!c.upgrade}
        onPress={() =>
          Alert.alert(
            "Sell company?",
            `${c.name} will be sold with its fleet, inventory and bank capital.`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sell",
                style: "destructive",
                onPress: async () => {
                  await dispatch({ type: "companySell", id: c.id });
                  if (!useGame.getState().error) onClose();
                },
              },
            ],
          )
        }
      />
      <Txt muted size={11} color={p.muted}>
        Active projects and expansions must finish before a sale or merger.
      </Txt>
    </>
  );
}
