import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FiltersProvider } from "./src/filters/FiltersContext";
import type { RootStackParamList } from "./src/navigation/types";
import { PoseProvider } from "./src/pose/PoseContext";
import { ArScreen } from "./src/screens/ArScreen";
import { ListScreen } from "./src/screens/ListScreen";
import { PoiDetailScreen } from "./src/screens/PoiDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0B1F17",
    card: "#0B1F17",
    text: "#F4F0E6",
    border: "rgba(244,240,230,0.15)",
    primary: "#C4A35A",
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PoseProvider>
        <FiltersProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="light" />
            <Stack.Navigator>
              <Stack.Screen
                name="List"
                component={ListScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Ar"
                component={ArScreen}
                options={{ headerShown: false, animation: "fade" }}
              />
              <Stack.Screen
                name="PoiDetail"
                component={PoiDetailScreen}
                options={{
                  title: "Détail",
                  headerTintColor: "#F4F0E6",
                  headerStyle: { backgroundColor: "#0B1F17" },
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </FiltersProvider>
      </PoseProvider>
    </SafeAreaProvider>
  );
}
