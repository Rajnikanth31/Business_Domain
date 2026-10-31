import { View, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "../store/game";
import { migrate } from "../engine/empire";
import { palette } from "../theme/theme";
import { Button, Gradient, Illustration, Txt } from "../components/GameUI";
import Earnings from "./Earnings";
import Companies from "./Companies";
import Investing from "./Investing";
import Items from "./Items";
import Profile from "./Profile";
export default function GameScreen({
  page,
}: {
  page: "home" | "businesses" | "investments" | "property" | "empire";
}) {
  const { game, error, boot, restore } = useGame(),
    p = palette(game?.theme);
  if (!game)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "space-around",
          alignItems: "center",
          padding: 30,
        }}
      >
        <Gradient />
        <View style={{ gap: 10 }}>
          <Txt color="#FFFFFF" center size={27}>
            Business Empire
          </Txt>
          <Txt color="#7BE1CD" center size={43} bold>
            NextGen
          </Txt>
        </View>
        <View
          style={{
            width: 260,
            height: 200,
            overflow: "hidden",
            borderRadius: 24,
          }}
        >
          <Illustration kind="money" />
        </View>
        {error ? (
          <View style={{ gap: 18 }}>
            <Txt color="#FFFFFF" center>
              {error}
            </Txt>
            <Button title="Retry loading save" onPress={() => void boot()} />
            <Button
              title="Restore save backup"
              secondary
              disabled={/newer/i.test(error)}
              onPress={() =>
                Alert.alert(
                  "Restore backup?",
                  "Progress after your last backup will be reverted. The unreadable snapshot is kept for recovery.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Restore", onPress: () => void restore() },
                  ],
                )
              }
            />
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <ActivityIndicator size="large" color="#64D7B7" />
            <Txt color="#FFFFFFDD" center>
              Loading your empire…
            </Txt>
          </View>
        )}
      </SafeAreaView>
    );
  const g = game.version === 2 ? game : migrate(game);
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: p.background }}
    >
      {page === "home" ? (
        <Earnings g={g} />
      ) : page === "businesses" ? (
        <Companies g={g} />
      ) : page === "investments" ? (
        <Investing g={g} />
      ) : page === "property" ? (
        <Items g={g} />
      ) : (
        <Profile g={g} />
      )}
    </SafeAreaView>
  );
}
