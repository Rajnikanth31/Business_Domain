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
test("dashboard shows actual cash and dispatches tap", async () => {
  const dispatch = jest.fn();
  useGame.setState({
    game: initialGame(0),
    busy: false,
    error: null,
    offline: null,
    dispatch,
  });
  const ui = await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 400, height: 800 },
        insets: { top: 0, bottom: 0, left: 0, right: 0 },
      }}
    >
      <GameScreen page="home" />
    </SafeAreaProvider>,
  );
  expect(ui.getByText("$1,000.00")).toBeTruthy();
  await fireEvent.press(ui.getByLabelText("Tap to earn $10.00"));
  expect(dispatch).toHaveBeenCalledWith({ type: "tap" });
});
