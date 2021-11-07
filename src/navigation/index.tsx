/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  BottomNavigation,
  BottomNavigationTab,
  Divider,
  Layout,
  TopNavigation,
} from "@ui-kitten/components";
import * as React from "react";
import { ColorSchemeName, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import useFirebaseState from "../hooks/useFirebaseState";
import NotFoundScreen from "../screens/NotFoundScreen";
import RestaurantsScreen from "../screens/RestaurantsScreen";
import SignInScreen from "../screens/SignInScreen";
import TabOneScreen from "../screens/TabOneScreen";
import { RootStackParamList, RootTabParamList } from "../types";
import LinkingConfiguration from "./LinkingConfiguration";

// Routes
// Stack: SignIn or Everything Else
// Everything Else: Bottom Tab.  We'll come up with something.

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { me } = useFirebaseState();
  return (
    <Stack.Navigator>
      {true ? (
        <Stack.Screen
          name="Root"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
    </Stack.Navigator>
  );
};

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

const BottomTabBar: React.FC<BottomTabBarProps> = ({ navigation, state }) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}
  >
    <BottomNavigationTab title="Tab One" />
    <BottomNavigationTab title="Restaurants" />
  </BottomNavigation>
);

function BottomTabNavigator() {
  return (
    <Layout style={styles.container} level="4">
      <SafeAreaView style={styles.container}>
        <BottomTab.Navigator
          initialRouteName="TabOne"
          tabBar={BottomTabBar}
          screenOptions={{
            headerShown: false,
          }}
        >
          <BottomTab.Screen name="TabOne" component={TabOneScreen} />
          <BottomTab.Screen name="Restaurants" component={RestaurantsScreen} />
        </BottomTab.Navigator>
      </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
