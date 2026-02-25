import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

export default function CustomDrawerContent(props) {
  const { navigation, state } = props;
  const theme = useCurrentTheme();

  // Track which menus are expanded
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // Define your drawer structure
  const drawerItems = [
    {
      name: "Dashboard",
      label: "Dashboard",
      icon: "grid-outline",
      route: "Dashboard",
    },
    {
      name: "Inwards",
      label: "Inwards",
      icon: "enter-outline",
      route: "Inwards",
      submenus: [
        {
          name: "Incoming",
          label: "Incoming",
          route: "Inwards",
          params: { screen: "InwardsList" },
        },
        {
          name: "Truck Arrival Sheet",
          label: "Truck Arrival Sheet",
          route: "Inwards",
          params: { screen: "TruckArivalAfterReportScreen" },
        },
      ],
    },
    {
      name: "Outwards",
      label: "Outwards",
      icon: "exit-outline",
      route: "Outwards",
    },
    {
      name: "Delivery",
      label: "Delivery",
      icon: "cube-outline",
      route: "Delivery",
      submenus: [
        {
          name: "Generate Receipt",
          label: "Generate Receipt",
          route: "Delivery",
          params: { screen: "DeliveryReciptEntryScreen" },
        },
        // {
        //   name: "Truck Arrival Sheet",
        //   label: "Truck Arrival Sheet",
        //   route: "Delivery",
        //   params: { screen: "TruckArivalAfterReportScreen" },
        // },
      ],
    },
    {
      name: "Tracking",
      label: "Tracking",
      icon: "cash-outline",
      route: "Tracking",
    },
    {
      name: "Revenue",
      label: "Revenue",
      icon: "trending-up-outline",
      route: "Revenue",
    },
    {
      name: "Settings",
      label: "Settings",
      icon: "settings-outline",
      route: "Settings",
    },
  ];

  const isActiveRoute = (routeName) => {
    const currentRoute = state.routes[state.index];
    // Only highlight if it's the exact route without nested navigation
    return currentRoute.name === routeName && !currentRoute.state;
  };

  const isActiveSubmenu = (parentRoute, submenuScreen) => {
    const currentRoute = state.routes[state.index];
    if (currentRoute.name === parentRoute && currentRoute.state) {
      const nestedRoute = currentRoute.state.routes[currentRoute.state.index];
      return nestedRoute.name === submenuScreen;
    }
    return false;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    menuHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingLeft: 14,
      paddingRight: 8,
    },
    menuHeaderActive: {
      backgroundColor: theme.colors.primary + "20",
    },
    menuHeaderText: {
      marginLeft: 32,
      fontSize: 15,
      marginLeft: 12,
      fontWeight: "600",
      color: theme.colors.headingText,
      flex: 1,
    },
    chevron: {
      marginRight: 8,
    },
    submenuContainer: {
      paddingVertical: 0,
      paddingBottom: 4,
    },
    submenuItem: {
      marginLeft: 10,
      paddingVertical: -5,
      marginVertical: -5,
    },
    regularItem: {
      marginVertical: 0,
    },
  });

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      {drawerItems.map((item) => {
        if (item.submenus) {
          // Menu with submenus (expandable)
          const isExpanded = expandedMenus[item.name];
          const isActive = isActiveRoute(item.route);
          const parentRoute = item.route;

          return (
            <View key={item.name}>
              <TouchableOpacity style={[styles.menuHeader, isActive && styles.menuHeaderActive]} onPress={() => toggleMenu(item.name)}>
                <Ionicons name={item.icon} size={24} color={isActive ? theme?.colors?.primary : theme?.colors?.headingText} />
                <Text style={styles.menuHeaderText}>{item.label}</Text>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={theme?.colors?.headingText} style={styles.chevron} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.submenuContainer}>
                  {item.submenus.map((submenu) => {
                    const isSubmenuActive = isActiveSubmenu(parentRoute, submenu.params?.screen);
                    return (
                      <DrawerItem
                        key={submenu.name}
                        label={submenu.label}
                        onPress={() => {
                          navigation.reset({
                            index: 0,
                            routes: [
                              {
                                name: submenu.route,
                                state: {
                                  routes: [{ name: submenu.params?.screen }],
                                  index: 0,
                                },
                              },
                            ],
                          });
                        }}
                        style={styles.submenuItem}
                        labelStyle={{
                          color: theme?.colors?.headingText,
                          fontSize: 14,
                          marginLeft: 0,
                        }}
                        icon={({ size, color }) => (
                          <Ionicons name="remove-outline" size={16} color={isSubmenuActive ? theme?.colors?.primary : color} />
                        )}
                        focused={isSubmenuActive}
                        activeTintColor={theme?.colors?.primary}
                        inactiveTintColor={theme?.colors?.headingText}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          );
        }

        // Regular menu item (no submenus)
        return (
          <DrawerItem
            key={item.name}
            label={item.label}
            onPress={() => {
              // Reset stack to first screen
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: item.route,
                    state: item.firstScreen
                      ? {
                          routes: [{ name: item.firstScreen }],
                          index: 0,
                        }
                      : undefined,
                  },
                ],
              });
            }}
            icon={({ size, color }) => <Ionicons name={item.icon} size={size} color={color} />}
            focused={isActiveRoute(item.name)}
            activeTintColor={theme?.colors?.primary}
            inactiveTintColor={theme?.colors?.headingText}
            style={styles.regularItem}
            labelStyle={{
              fontSize: 15,
              fontWeight: "600",
            }}
          />
        );
      })}
    </DrawerContentScrollView>
  );
}
