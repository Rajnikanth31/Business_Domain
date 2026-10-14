import { useEffect } from "react";
import { AppState } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useGame } from "../store/game";
export default function RootLayout() {
  const theme = useGame((s) => s.game?.theme);
  useEffect(() => {
    void useGame.getState().boot();
    const timer = setInterval(() => {
      if (AppState.currentState === "active")
        void useGame.getState().dispatch();
    }, 1000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void useGame.getState().dispatch(undefined, true);
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return (
    <>
      <StatusBar style={theme === "light" ? "dark" : "light"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#090F1B" },
        }}
      />
    </>
  );
}
