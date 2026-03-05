import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCurrentTheme } from "../../stores/themeStore";
import { ProtectedScreen } from "../components/ProtectedScreen";
import CollectionEntry from "../screens/collection/CollectionEntry";
const Stack = createNativeStackNavigator();

const ProtectedCollectionEntry = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <CollectionEntry {...props} />
  </ProtectedScreen>
);
export default function CollectionNavigator() {
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
        name="CollectionEntry"
        component={ProtectedCollectionEntry}
        options={{
          headerShown: false,
          title: "Collection list",
          unmountOnBlur: true,
        }}
      />
    </Stack.Navigator>
  );
}
