import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useCurrentTheme } from "../../stores/themeStore";
import TilesScreen from "../screens/TilesScreen";
import DrawerNavigator from "./DrawerNavigator";
const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const theme = useCurrentTheme();

  const active = theme?.colors?.headerText ?? "#000";
  const inactive = theme?.colors?.headerText ? `${theme.colors.headerText}80` : "#00000080";

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarLabelStyle: { fontSize: 12 },
        headerStyle: { backgroundColor: theme?.colors?.headerBg },
        tabBarStyle: { backgroundColor: theme?.colors?.headerBg },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DrawerNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default navigation
            e.preventDefault();

            // Get current navigation state
            const state = navigation.getState();
            const currentTab = state.routes[state.index];

            // If we're not on Home tab, navigate to Home and Dashboard
            if (currentTab.name !== "Home") {
              navigation.navigate("Home", { screen: "Dashboard" });
            } else {
              // If we're already on Home tab, reset to Dashboard
              navigation.navigate("Home", { screen: "Dashboard" });
            }
          },
        })}
        options={{
          title: "Home",
          headerShown: false,
          headerTintColor: theme?.colors?.headerText,
          headerStyle: { backgroundColor: theme?.colors?.headerBg },
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={size ?? 20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tiles"
        component={TilesScreen}
        options={{
          title: "Tiles",
          headerShown: false,
          headerTintColor: theme?.colors?.headerText,
          headerStyle: { backgroundColor: theme?.colors?.headerBg },
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "grid" : "grid-outline"} size={size ?? 20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
