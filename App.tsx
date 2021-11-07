import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

import Theme from "./src/constants/Theme";
import { StateProvider } from "./src/firebase/state";
import useCachedResources from "./src/hooks/useCachedResources";
import useColorScheme from "./src/hooks/useColorScheme";
import Navigation from "./src/navigation";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider
          {...eva}
          theme={{
            ...(colorScheme === "light" ? eva.light : eva.dark),
            ...Theme,
          }}
        >
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <StateProvider>
              <Navigation colorScheme={colorScheme} />
              <StatusBar />
            </StateProvider>
          </SafeAreaProvider>
        </ApplicationProvider>
      </>
    );
  }
}
