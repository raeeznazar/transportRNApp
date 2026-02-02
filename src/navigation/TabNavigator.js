import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";
import TilesScreen from "../screens/TilesScreen";
import DrawerNavigator from "./DrawerNavigator";

const Tab = createBottomTabNavigator();

// Platform-specific tab bar styling
const TAB_BAR_HEIGHT = Platform.select({ ios: 85, android: 65 });
const TAB_BAR_PADDING = Platform.select({ ios: 20, android: 10 });

export default function TabNavigator() {
  const theme = useCurrentTheme();

  const activeColor = theme?.colors?.headerText ?? "#000";
  const inactiveColor = theme?.colors?.headerText ? `${theme.colors.headerText}80` : "#00000080";

  const handleHomeTabPress = (navigation) => (e) => {
    e.preventDefault();
    navigation.navigate("Home", { screen: "Dashboard" });
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerTintColor: theme?.colors?.headerText,
        headerStyle: { backgroundColor: theme?.colors?.headerBg },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarStyle: {
          backgroundColor: theme?.colors?.headerBg,
          paddingBottom: TAB_BAR_PADDING,
          height: TAB_BAR_HEIGHT,
          borderTopWidth: 1,
          borderTopColor: theme?.colors?.border ?? "#e0e0e0",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DrawerNavigator}
        listeners={({ navigation }) => ({
          tabPress: handleHomeTabPress(navigation),
        })}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={size ?? 24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tiles"
        component={TilesScreen}
        options={{
          title: "Tiles",
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "grid" : "grid-outline"} size={size ?? 24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
