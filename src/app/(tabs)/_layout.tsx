import { Tabs } from "expo-router";
import { Text } from "react-native";
export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#101A2A",
          borderTopColor: "#223047",
          height: 72,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: "#E8C47B",
        tabBarInactiveTintColor: "#8896AB",
      }}
    >
      {[
        ["index", "Home", "⌂"],
        ["businesses", "Businesses", "▦"],
        ["investments", "Investments", "↗"],
        ["real-estate", "Real Estate", "◇"],
        ["empire", "Empire", "♛"],
      ].map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24, color }}>{icon}</Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
