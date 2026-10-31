import { ReactNode, useId } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
} from "react-native-svg";
import { useGame } from "../store/game";
import { palette, Palette } from "../theme/theme";
import Icon from "./Icon";
import { money } from "../engine/game";
export function usePalette() {
  return palette(useGame((s) => s.game?.theme));
}
export function Gradient({
  colors = ["#38B9A8", "#18245A"],
  radius = 0,
}: {
  colors?: string[];
  radius?: number;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <Svg
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="1" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>
      <Rect width={100} height={100} rx={radius} fill={`url(#${id})`} />
    </Svg>
  );
}
export function Page({
  title,
  children,
  balance,
  scroll = true,
}: {
  title?: string;
  children: ReactNode;
  balance?: number;
  scroll?: boolean;
}) {
  const p = usePalette();
  const body = (
    <>
      {title && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <Text
            style={{ fontSize: 28, fontWeight: "700", color: p.text, flex: 1 }}
          >
            {title}
          </Text>
          {balance !== undefined && (
            <Text style={{ color: p.accent, fontSize: 13, fontWeight: "600" }}>
              {money(balance)}
            </Text>
          )}
        </View>
      )}
      <Notice />
      {children}
    </>
  );
  return scroll ? (
    <ScrollView
      contentContainerStyle={{
        padding: 18,
        gap: 18,
        paddingBottom: 32,
        flexGrow: 1,
      }}
    >
      {body}
    </ScrollView>
  ) : (
    <View style={{ flex: 1 }}>{body}</View>
  );
}
export function Txt({
  children,
  muted = false,
  size = 14,
  bold = false,
  color,
  center = false,
}: {
  children: ReactNode;
  muted?: boolean;
  size?: number;
  bold?: boolean;
  color?: string;
  center?: boolean;
}) {
  const p = usePalette();
  return (
    <Text
      style={{
        color: color ?? (muted ? p.muted : p.text),
        fontSize: size,
        fontWeight: bold ? "600" : "400",
        lineHeight: size * 1.4,
        textAlign: center ? "center" : "left",
        flexShrink: 1,
      }}
    >
      {children}
    </Text>
  );
}
export function Card({
  children,
  tint,
  padding = 18,
}: {
  children: ReactNode;
  tint?: string;
  padding?: number;
}) {
  const p = usePalette();
  return (
    <View
      style={{
        backgroundColor: tint ?? p.panel,
        borderRadius: 18,
        padding,
        gap: 14,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}
export function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
  danger = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  danger?: boolean;
}) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: secondary ? p.panel : danger ? p.negative : p.accent,
        borderRadius: 12,
        padding: 14,
        minHeight: 48,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          color: secondary ? p.text : p.accentText,
          fontSize: 15,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Row({
  title,
  subtitle,
  value,
  icon = "business",
  color = "#559BD5",
  onPress,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: string;
  color?: string;
  onPress: () => void;
}) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(", ")}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        padding: 15,
        backgroundColor: p.panel,
        borderRadius: 14,
        minHeight: 82,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={26} />
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Txt bold size={15}>
          {title}
        </Txt>
        {subtitle && (
          <Txt muted size={12}>
            {subtitle}
          </Txt>
        )}
      </View>
      {value && (
        <Txt size={13} bold>
          {value}
        </Txt>
      )}
      <Txt muted size={24}>
        ›
      </Txt>
    </Pressable>
  );
}
export function Info({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Txt muted size={12}>
          {label}
        </Txt>
      </View>
      <Txt size={13} bold>
        {value}
      </Txt>
    </View>
  );
}
export function Section({ children }: { children: ReactNode }) {
  return (
    <Txt size={20} bold>
      {children}
    </Txt>
  );
}
export function Tabs({
  values,
  selected,
  onSelect,
  underline = false,
}: {
  values: string[];
  selected: string;
  onSelect: (v: string) => void;
  underline?: boolean;
}) {
  const p = usePalette();
  return (
    <ScrollView
      horizontal
      style={{ flexGrow: 0 }}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ minWidth: "100%", gap: underline ? 0 : 8 }}
    >
      {values.map((v) => (
        <Pressable
          key={v}
          accessibilityRole="button"
          accessibilityState={{ selected: v === selected }}
          onPress={() => onSelect(v)}
          style={{
            flex: 1,
            minWidth: values.length > 4 ? 90 : 80,
            minHeight: 48,
            paddingHorizontal: 10,
            paddingVertical: 12,
            borderBottomWidth: underline ? 2 : 0,
            borderBottomColor: v === selected ? p.accent : "transparent",
            backgroundColor: underline
              ? "transparent"
              : v === selected
                ? p.accent
                : p.panel,
            borderRadius: underline ? 0 : 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: underline
                ? v === selected
                  ? p.accent
                  : p.muted
                : v === selected
                  ? p.accentText
                  : p.muted,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {v}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  numeric = false,
  maxLength = 40,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  label: string;
  numeric?: boolean;
  maxLength?: number;
}) {
  const p = usePalette();
  return (
    <View style={{ gap: 7 }}>
      <Txt muted size={12}>
        {label}
      </Txt>
      <TextInput
        accessibilityLabel={label}
        keyboardType={numeric ? "decimal-pad" : "default"}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={p.muted}
        style={{
          color: p.text,
          backgroundColor: p.card,
          padding: 14,
          minHeight: 48,
          borderRadius: 10,
          fontSize: 16,
          borderWidth: 1,
          borderColor: p.border,
        }}
      />
    </View>
  );
}
export function Notice() {
  const { error, offline, dismiss } = useGame();
  const p = usePalette();
  return error || offline ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Dismiss notification"
      onPress={dismiss}
      style={{
        backgroundColor: p.panel,
        borderWidth: 1,
        borderColor: error ? p.negative : p.accent,
        padding: 13,
        borderRadius: 12,
      }}
    >
      <Text
        accessibilityLiveRegion="polite"
        style={{
          color: error ? p.negative : p.text,
          fontSize: 13,
          lineHeight: 20,
        }}
      >
        {error || offline} · Dismiss
      </Text>
    </Pressable>
  ) : null;
}
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const p = usePalette();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: p.background }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 18,
            paddingVertical: 12,
            gap: 12,
          }}
        >
          <Pressable
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={onClose}
            style={{ padding: 10, minWidth: 48, minHeight: 48 }}
          >
            <Text style={{ color: p.text, fontSize: 24 }}>‹</Text>
          </Pressable>
          <Text
            style={{ color: p.text, fontSize: 23, fontWeight: "700", flex: 1 }}
          >
            {title}
          </Text>
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 18, gap: 18, paddingBottom: 44 }}
        >
          <Notice />
          {children}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
export function Progress({ value }: { value: number }) {
  const p = usePalette(),
    percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={{
        height: 6,
        backgroundColor: p.border,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <View
        style={{ width: `${percent}%`, height: 6, backgroundColor: p.accent }}
      />
    </View>
  );
}
export function Empty({
  title,
  description,
  icon = "business",
}: {
  title: string;
  description: string;
  icon?: string;
}) {
  const p = usePalette();
  return (
    <View style={{ padding: 25, alignItems: "center", gap: 12 }}>
      <Icon name={icon} color={p.muted} size={44} />
      <Txt bold center>
        {title}
      </Txt>
      <Txt muted size={13} center>
        {description}
      </Txt>
    </View>
  );
}
export function Banner({
  title,
  subtitle,
  onPress,
  kind = "city",
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  kind?: "city" | "house" | "money" | "market";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={{
        height: 160,
        borderRadius: 20,
        overflow: "hidden",
        justifyContent: "flex-end",
        padding: 20,
      }}
    >
      {kind === "city" || kind === "house" ? (
        <Image
          source={
            kind === "city"
              ? require("../../assets/images/property-city.png")
              : require("../../assets/images/property-house.png")
          }
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Illustration kind={kind} />
      )}
      <View
        style={{ position: "absolute", inset: 0, backgroundColor: "#09152B50" }}
      />
      <Txt color="#FFFFFF" size={25} bold>
        {title}
      </Txt>
      <Txt color="#FFFFFFDD" size={13}>
        {subtitle}
      </Txt>
    </Pressable>
  );
}
export function Illustration({
  kind,
}: {
  kind: "city" | "house" | "money" | "market";
}) {
  const sceneId = useId().replace(/:/g, "");
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      style={StyleSheet.absoluteFill}
      viewBox="0 0 360 180"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id={sceneId} x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor={kind === "house" ? "#62B3DD" : "#258AB6"} />
          <Stop
            offset="1"
            stopColor={kind === "money" ? "#202D64" : "#142B4B"}
          />
        </LinearGradient>
      </Defs>
      <Rect width={360} height={180} fill={`url(#${sceneId})`} />
      <Circle cx={290} cy={38} r={24} fill="#F8DBA2" />
      {kind === "house" ? (
        <>
          <Path d="M60 101L172 26L290 101Z" fill="#E8BE8C" />
          <Rect x={81} y={98} width={187} height={90} fill="#EBE8D9" />
          <Rect x={154} y={111} width={45} height={69} fill="#577994" />
          <Rect x={103} y={115} width={30} height={28} fill="#87BCD7" />
          <Rect x={219} y={115} width={30} height={28} fill="#87BCD7" />
          <Path d="M0 165Q90 135 180 170T360 145V180H0Z" fill="#457B65" />
        </>
      ) : kind === "money" ? (
        <>
          <Path d="M80 70L195 34L292 86L182 126Z" fill="#41CCAA" />
          <Path d="M80 70V116L182 169V126Z" fill="#189C8A" />
          <Path d="M182 126L292 86V129L182 169Z" fill="#2476A1" />
          <Path
            d="M140 52L184 38L246 102L211 115L211 155L182 168L182 126Z"
            fill="#EEC477"
          />
          <Path
            d="M98 85L166 119M98 98L166 132"
            stroke="#75E1BA"
            strokeWidth={3}
          />
        </>
      ) : kind === "market" ? (
        <>
          <Path
            d="M30 145L82 112L116 130L180 77L215 96L310 35"
            fill="none"
            stroke="#75DCE5"
            strokeWidth={8}
          />
          <Rect x={50} y={120} width={25} height={60} fill="#2B70A7" />
          <Rect x={120} y={105} width={25} height={75} fill="#4CA7C9" />
          <Rect x={190} y={72} width={25} height={108} fill="#54C2C6" />
          <Rect x={260} y={32} width={25} height={148} fill="#7DD4BA" />
        </>
      ) : (
        <>
          {[25, 80, 140, 208, 278].map((x, i) => (
            <Rect
              key={x}
              x={x}
              y={30 + (i % 3) * 25}
              width={45 + (i % 2) * 15}
              height={160}
              rx={3}
              fill={["#7897AD", "#527B9D", "#87A6B7"][i % 3]}
            />
          ))}
          {[40, 95, 155, 225, 295].map((x) =>
            [65, 90, 115].map((y) => (
              <Rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={9}
                height={12}
                fill="#C8DFE5"
              />
            )),
          )}
        </>
      )}
    </Svg>
  );
}
export function duration(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000)),
    h = Math.floor(seconds / 3600),
    m = Math.floor((seconds % 3600) / 60);
  return h ? `${h}h ${m}m` : m ? `${m}m ${seconds % 60}s` : `${seconds}s`;
}
export function compact(cents: number) {
  const n = cents / 100;
  return Math.abs(n) >= 1e12
    ? `$${(n / 1e12).toFixed(1)} T`
    : Math.abs(n) >= 1e9
      ? `$${(n / 1e9).toFixed(1)} B`
      : Math.abs(n) >= 1e6
        ? `$${(n / 1e6).toFixed(1)} M`
        : money(cents);
}
export type { Palette };

