import type { ColorValue } from "react-native";
import Svg, { Path, Rect, Circle, Line } from "react-native-svg";
export default function Icon({
  name,
  color = "#FFFFFF",
  size = 24,
}: {
  name: string;
  color?: ColorValue;
  size?: number;
}) {
  const paths: Record<string, string> = {
    investing: "M3 17l6-6 4 4 8-10 M15 5h6v6",
    business: "M4 9h16v12H4z M8 9V4h8v5 M4 14h16 M10 13v3h4v-3",
    earnings: "M3 6h18v14H3z M3 10h18 M15 15h3",
    items: "M3 11l9-8 9 8 M5 10v11h14V10 M10 21v-7h4v7",
    profile: "M4 21v-3c0-5 16-5 16 0v3 M12 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8",
    tap: "M9 12V5a2 2 0 0 1 4 0v7 M13 9a2 2 0 0 1 4 0v4 M17 11a2 2 0 0 1 4 0v6c0 4-3 5-7 5h-2l-7-8a2 2 0 0 1 3-3l1 1",
    car: "M3 13l3-6h12l3 6v6H3z M3 13h18 M7 16h1 M16 16h1 M5 19v2 M19 19v2",
    yacht: "M3 17l3 4h12l3-4H3z M12 3v12 M12 4l7 9h-7 M10 7l-5 6h5",
    aircraft: "M12 3v18 M12 8l9 6v3l-9-3-9 3v-3z M8 21l4-3 4 3",
    coffee: "M4 8h12v9c0 5-12 5-12 0z M16 9h3a3 3 0 0 1 0 6h-3 M7 2v3 M12 2v3",
    shop: "M3 9l2-5h14l2 5v4H3z M5 13v8h14v-8 M10 21v-6h4v6",
    truck:
      "M2 6h12v12H2z M14 10h5l3 4v4h-8 M6 17a2 2 0 1 0 0 4a2 2 0 1 0 0-4 M18 17a2 2 0 1 0 0 4a2 2 0 1 0 0-4",
  };
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "chip" ? (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={3} />
          <Line x1={3} y1={10} x2={21} y2={10} />
          <Line x1={3} y1={14} x2={21} y2={14} />
          <Line x1={9} y1={4} x2={9} y2={20} />
          <Line x1={15} y1={4} x2={15} y2={20} />
        </>
      ) : (
        <Path d={paths[name] ?? paths.business} />
      )}
      {name === "tap" && <Circle cx={11} cy={5} r={0.1} />}
    </Svg>
  );
}
