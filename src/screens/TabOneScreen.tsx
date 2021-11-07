import { Card, Layout, Text } from "@ui-kitten/components";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import useFirebaseState from "../hooks/useFirebaseState";
import { RootTabScreenProps } from "../types";

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const state = useFirebaseState();
  return (
    <SafeAreaView style={styles.container}>
      <Layout style={styles.container} level="4">
        <Text category="h1">Tab One</Text>
        <Card>
          <Text>Here's literally everything we have: </Text>
          <Text>{JSON.stringify(state.me)}</Text>
          <EditScreenInfo path="/screens/TabOneScreen.tsx" />
        </Card>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
  },
});
