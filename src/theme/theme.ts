export const dark = {
  background: "#202124",
  panel: "#292A2D",
  card: "#343538",
  text: "#F5F5F5",
  muted: "#AFB2B8",
  border: "#424448",
  accent: "#55BC87",
  accentText: "#14251B",
  blue: "#5C9AE8",
  bank: "#335D50",
  bankEnd: "#243F38",
  negative: "#F08989",
};
export const light = {
  background: "#F6F7F9",
  panel: "#FFFFFF",
  card: "#EFF2F6",
  text: "#20242D",
  muted: "#687281",
  border: "#E2E5EA",
  accent: "#327DE4",
  accentText: "#FFFFFF",
  blue: "#327DE4",
  bank: "#327DE4",
  bankEnd: "#2058B1",
  negative: "#C74A4A",
};
export type Palette = typeof dark;
export const palette = (theme?: "dark" | "light") =>
  theme === "light" ? light : dark;
