import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GameScreen from "../src/screens/GameScreen";
import { initialGame } from "../src/engine/game";
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
    game: initialGame(0),
    busy: false,
    error: null,
    offline: null,
    dispatch: jest.fn(),
  }),
);
test("business catalog opens and purchases a company", async () => {
  const ui = await render(screen("businesses"));
  await fireEvent.press(ui.getByText("Start a business"));
  await fireEvent.press(ui.getByText("Open for $800.00"));
  expect(useGame.getState().dispatch).toHaveBeenCalledWith({
    type: "buy",
    index: 0,
  });
});
test("profile exposes both saved appearance choices", async () => {
  const ui = await render(screen("empire"));
  await fireEvent.press(ui.getByText("Light"));
  expect(useGame.getState().dispatch).toHaveBeenCalledWith({
    type: "theme",
    value: "light",
  });
});
test("light earnings screen retains dollar balance", async () => {
  useGame.setState({ game: { ...initialGame(0), theme: "light" } });
  const ui = await render(screen("home"));
  expect(ui.getByText("$1,000.00")).toBeTruthy();
});
test("stock order is connected to a real purchase action", async () => {
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
test("property detail connects a dollar purchase", async () => {
  const ui = await render(screen("property"));
  await fireEvent.press(ui.getByLabelText(/Harbor studio/));
  await fireEvent.press(ui.getByText("Buy for $850.00"));
  expect(useGame.getState().dispatch).toHaveBeenCalledWith({
    type: "buyItem",
    index: 0,
  });
});
