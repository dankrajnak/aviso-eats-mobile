import { Text, Layout } from "@ui-kitten/components";
import * as React from "react";
import { StyleSheet, View } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";

export default function TabTwoScreen() {
  return (
    <Layout style={styles.container}>
      <Text>Tab Two</Text>
      <Layout>
        <EditScreenInfo path="/screens/TabTwoScreen.tsx" />
      </Layout>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
