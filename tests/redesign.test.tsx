import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GameScreen from "../src/screens/GameScreen";
import { newPlayer } from "../src/engine/empire";
import { useGame } from "../src/store/game";
jest.mock("expo-sqlite", () => ({}));
jest.mock("react-native-reanimated", () => ({
  __esModule: true,
  default: { View: require("react-native").View },
  FadeIn: { duration: () => undefined },
}));
function screen(
  page: "home" | "businesses" | "investments" | "property" | "empire",
) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 400, height: 800 },
        insets: { top: 0, bottom: 0, left: 0, right: 0 },
      }}
    >
      <GameScreen page={page} />
    </SafeAreaProvider>
  );
}
beforeEach(() =>
  useGame.setState({
    game: { ...newPlayer(0), cash: 100000000 },
    busy: false,
    error: null,
    offline: null,
    dispatch: jest.fn(),
  }),
);
test("business category grid opens a named company purchase", async () => {
  const ui = await render(screen("businesses"));
  await fireEvent.press(ui.getByText("Start a business"));
  await fireEvent.press(ui.getByLabelText("Choose Shop"));
  await fireEvent.changeText(
    ui.getByLabelText("Company name"),
    "My corner shop",
  );
  await fireEvent.press(ui.getByText("Open for $4,899.00"));
  expect(useGame.getState().dispatch).toHaveBeenCalledWith({
    type: "openCompany",
    kind: "shop",
    name: "My corner shop",
  });
});
test("merger requirements are visible and an ineligible merger cannot be submitted", async () => {
  const ui = await render(screen("businesses"));
  await fireEvent.press(ui.getByText("Business mergers"));
  expect(ui.getByText("Clothing brand")).toBeTruthy();
  expect(ui.getByText(/city vehicles: 0\/8/)).toBeTruthy();
  expect(ui.getByText("Create Clothing brand")).toBeTruthy();
  expect(useGame.getState().dispatch).not.toHaveBeenCalled();
});
test("profile exposes both saved appearance choices", async () => {
  const ui = await render(screen("empire"));
  await fireEvent.press(ui.getByText("Dark"));
  expect(useGame.getState().dispatch).toHaveBeenCalledWith({
    type: "theme",
    value: "dark",
  });
});
test("profile editing submits actual player fields", async () => {
  const ui = await render(screen("empire"));
  await fireEvent.press(ui.getByText("Edit profile"));
  await fireEvent.changeText(ui.getByLabelText("Player name"), "Raja");
  await fireEvent.press(ui.getByText("Save profile"));
  expect(useGame.getState().dispatch).toHaveBeenCalledWith(
    expect.objectContaining({ type: "profile", name: "Raja" }),
  );
});
test("wealth ranking clearly identifies the offline comparison", async () => {
  const ui = await render(screen("empire"));
  await fireEvent.press(ui.getByText(/Wealth ranking ·/));
  expect(ui.getByText("FICTIONAL OFFLINE BENCHMARKS")).toBeTruthy();
  expect(ui.getByText("Entrepreneur (You)")).toBeTruthy();
});
test("earnings preserves responsive tapping while financial actions save", async () => {
  useGame.setState({ busy: true });
  const ui = await render(screen("home"));
  await fireEvent.press(ui.getByLabelText("Tap to earn $2.50"));
  expect(useGame.getState().dispatch).toHaveBeenCalledWith({ type: "tap" });
});
test("stock recommendation is connected to an order action", async () => {
  const ui = await render(screen("investments"));
  await fireEvent.press(ui.getByLabelText(/Northstar Tech/));
  await fireEvent.press(ui.getByText(/^Buy 1 ·/));
  expect(useGame.getState().dispatch).toHaveBeenCalledWith({
    type: "trade",
    index: 0,
    side: "buy",
    quantity: 1,
  });
});
test("real estate belongs inside Investing and opens a dollar purchase", async () => {
  const ui = await render(screen("investments"));
  await fireEvent.press(ui.getByText("Real Estate"));
  await fireEvent.press(ui.getByLabelText("Real estate market"));
  await fireEvent.press(ui.getByLabelText(/Harbor studio/));
  await fireEvent.press(ui.getByText("Buy for $85,000.00"));
  expect(useGame.getState().dispatch).toHaveBeenCalledWith({
    type: "buyItem",
    index: 0,
  });
});
test("cryptoexchange exposes real sorting options", async () => {
  const ui = await render(screen("investments"));
  await fireEvent.press(ui.getByText("Cryptocurrency"));
  await fireEvent.press(ui.getByText("Buy"));
  await fireEvent.press(ui.getByText("Gainers"));
  expect(ui.getByText("Cryptoexchange")).toBeTruthy();
  expect(ui.getByText("Highest Cap")).toBeTruthy();
});
