import { useNavigation } from "@react-navigation/native";
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function Tile({ title, routeName, onPress }) {
  const scale = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ margin: 6 }} accessibilityRole="button">
      <Animated.View style={[styles.tile, { backgroundColor: theme.colors.buttonBackground, transform: [{ scale }] }]}>
        <Text style={[styles.tileText, { color: theme.colors.textPrimary }]}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function TilesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const tiles = [
    { id: "sales", title: "Sales", route: "Sales" },
    { id: "revenue", title: "Revenue", route: "Revenue" },
    { id: "inventory", title: "Inventory", route: null },
    { id: "customers", title: "Customers", route: null },
    { id: "reports", title: "Reports", route: null },
    { id: "settings", title: "Settings", route: null },
  ];

  const handleTilePress = (tile) => {
    if (tile.route) {
      navigation.navigate(tile.route);
    } else {
      // simple feedback for tiles without a route
      navigation.navigate("Dashboard");
    }
  };

  return (
    <View
      className="flex-1 p-4 bg-primaryBg"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Text className="p-2" style={styles.title}>
        Quick Tiles
      </Text>

      <View style={styles.grid}>
        {tiles.map((t) => (
          <Tile key={t.id} title={t.title} routeName={t.route} onPress={() => handleTilePress(t)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: theme.colors.textPrimary },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: (SCREEN_WIDTH - 48) / 3, // 3 tiles per row with margins
    height: 90,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tileText: { fontSize: 14, fontWeight: "700" },
});
