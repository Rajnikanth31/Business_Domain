import { Tabs } from "expo-router";
import Icon from "../../components/Icon";
import { useGame } from "../../store/game";
import { palette } from "../../theme/theme";
export default function Layout() {
  const p = palette(useGame((g) => g.game?.theme));
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: p.panel,
          borderTopColor: p.border,
          height: 72,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: p.accent,
        tabBarInactiveTintColor: p.muted,
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      {[
        ["investments", "Investing", "investing"],
        ["businesses", "Business", "business"],
        ["index", "Earnings", "earnings"],
        ["real-estate", "Items", "items"],
        ["empire", "Profile", "profile"],
      ].map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => (
              <Icon name={icon} color={color} size={24} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
