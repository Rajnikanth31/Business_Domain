import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Vibration,
  Platform,
  ScrollView,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import Motion, { FadeIn } from "react-native-reanimated";
import { Game, money, tapValue, tapUpgradeCost } from "../engine/game";
import { empireMetrics } from "../engine/empire";
import { useGame } from "../store/game";
import {
  Button,
  Gradient,
  Notice,
  Txt,
  usePalette,
} from "../components/GameUI";
import Icon from "../components/Icon";
function WorldDots() {
  const dots = [];
  for (let y = 0; y < 20; y++)
    for (let x = 0; x < 52; x++) {
      const inOval = (cx: number, cy: number, rx: number, ry: number) =>
        ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
      if (
        inOval(13, 5, 7, 4) ||
        inOval(20, 13, 3, 7) ||
        inOval(31, 4, 5, 3) ||
        inOval(32, 10, 4, 6) ||
        inOval(41, 6, 10, 4) ||
        inOval(45, 16, 5, 3)
      )
        dots.push(
          <Circle
            key={`${x}-${y}`}
            cx={x * 5}
            cy={y * 5}
            r={1.1}
            fill="#FFFFFF2D"
          />,
        );
    }
  return (
    <Svg
      pointerEvents="none"
      viewBox="0 0 260 100"
      style={{
        position: "absolute",
        right: -10,
        top: 0,
        width: "80%",
        height: "100%",
      }}
    >
      {dots}
    </Svg>
  );
}
export default function Earnings({ g }: { g: Game }) {
  const p = usePalette(),
    dispatch = useGame((s) => s.dispatch),
    busy = useGame((s) => s.busy),
    [scale] = useState(() => new Animated.Value(1)),
    [pop, setPop] = useState(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    value = tapValue(g),
    cost = tapUpgradeCost(g),
    m = empireMetrics(g),
    max = g.tapLevel >= 30;
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function tap() {
    if (g.haptics !== false && Platform.OS === "android") Vibration.vibrate(5);
    setPop(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPop(false), 500);
    void dispatch({ type: "tap" });
  }
  const skin = g.cardSkin ?? "world",
    bankColors =
      skin === "emerald"
        ? ["#137D61", "#183F3B"]
        : skin === "ocean"
          ? ["#3977C9", "#1E3563"]
          : ["#303437", "#23262A"];
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 18 }}>
      <Motion.View
        entering={FadeIn.duration(300)}
        style={{
          padding: 18,
          paddingTop: 38,
          paddingBottom: 22,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          overflow: "hidden",
          gap: 16,
        }}
      >
        <Gradient />
        <View
          style={{
            padding: 22,
            borderRadius: 22,
            overflow: "hidden",
            minHeight: 150,
            gap: 16,
          }}
        >
          <Gradient colors={bankColors} />
          <WorldDots />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{ color: "#FFFFFFAA", fontSize: 13, letterSpacing: 2 }}
            >
              •••• 1729
            </Text>
            <Text style={{ color: "#FFFFFFAA", fontSize: 12 }}>05/30</Text>
          </View>
          <View>
            <Text style={{ color: "#FFFFFFAA", fontSize: 13, marginBottom: 5 }}>
              Balance
            </Text>
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: "#FFFFFF", fontSize: 34, fontWeight: "600" }}
            >
              {money(g.cash)}
            </Text>
          </View>
        </View>
        <View
          style={{
            padding: 18,
            borderRadius: 20,
            backgroundColor: "#FFFFFF24",
            gap: 14,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600" }}>
            {money(value)}{" "}
            <Text
              style={{ fontSize: 12, fontWeight: "400", color: "#FFFFFFBB" }}
            >
              per click
            </Text>
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
              {g.tapLevel + 1} level
            </Text>
            <Text style={{ color: "#65E5BF", fontSize: 13 }}>
              {max
                ? "Maximum level"
                : `▲ ${money(tapValue({ ...g, tapLevel: g.tapLevel + 1 }) - value)} per click`}
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Cash available toward clicker upgrade"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.min(100, Math.floor((g.cash / cost) * 100)),
            }}
            style={{ height: 4, borderRadius: 2, backgroundColor: "#FFFFFF45" }}
          >
            <View
              style={{
                height: 4,
                width: `${Math.min(100, (g.cash / cost) * 100)}%`,
                backgroundColor: "#89E3D6",
              }}
            />
          </View>
          <Text
            style={{ color: "#FFFFFFCC", fontSize: 13, textAlign: "right" }}
          >
            {max ? "" : money(cost)}
          </Text>
          <Button
            title={
              max ? "Maximum clicker level" : `Raise the level (${money(cost)})`
            }
            disabled={busy || max || g.cash < cost}
            onPress={() => void dispatch({ type: "tapUpgrade" })}
          />
        </View>
      </Motion.View>
      <View style={{ padding: 14 }}>
        <Notice />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tap to earn ${money(value)}`}
        onPress={tap}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.92,
            useNativeDriver: true,
            speed: 35,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 25,
          }).start()
        }
        style={{
          flex: 1,
          minHeight: 220,
          justifyContent: "center",
          alignItems: "center",
          gap: 18,
          padding: 24,
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Icon name="tap" size={90} color={p.text} />
        </Animated.View>
        <Txt center>Tap in this area to earn money</Txt>
        <Txt color={p.accent} bold size={18}>
          {pop ? `+${money(value)}` : " "}
        </Txt>
      </Pressable>
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Txt muted size={11}>
          {g.taps.toLocaleString()} clicks
        </Txt>
        <Txt muted size={11}>
          {money(m.hourlyProfit)} / hour passive
        </Txt>
      </View>
    </ScrollView>
  );
}
