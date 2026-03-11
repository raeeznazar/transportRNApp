import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCurrentTheme } from "../../stores/themeStore";
import CreateDeliveryReciptEntry from "../screens/delivery/CreateDeliveryReciptEntry";
import DeliveryEntryDetailsPage from "../screens/delivery/DeliveryEntryDetailsPage";
import DeliveryReciptEntry from "../screens/delivery/DeliveryReciptEntry";
const Stack = createNativeStackNavigator();
export default function DeliveryNavigator() {
  const theme = useCurrentTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: theme?.colors?.headerText,
        headerStyle: {
          backgroundColor: theme?.colors?.headerBg,
        },
      }}
    >
      <Stack.Screen
        name="DeliveryReciptEntryScreen"
        component={DeliveryReciptEntry}
        options={{
          headerShown: false,
          title: "Delivery Recipts",
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="CreateDeliveryReciptEntryScreen"
        component={CreateDeliveryReciptEntry}
        options={{
          headerShown: true,
          title: "Create Delivery Recipt",
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="DeliveryEntryDetailsPage"
        component={DeliveryEntryDetailsPage}
        options={{
          headerShown: true,
          title: "Receipt Detail",
          unmountOnBlur: true,
        }}
      />
    </Stack.Navigator>
  );
}
