import {
  Button,
  Divider,
  Layout,
  List,
  ListItem,
  Text,
} from "@ui-kitten/components";
import * as WebBrowser from "expo-web-browser";
import _ from "lodash";
import * as React from "react";
import { StyleSheet } from "react-native";

import { Restaurant } from "../firebase/state";
import useFirebaseState from "../hooks/useFirebaseState";

const renderRestaurant = ({ item: restaurant }: { item: Restaurant }) => (
  <ListItem
    style={styles.item}
    title={restaurant.name}
    onPress={() => WebBrowser.openBrowserAsync(restaurant.website)}
    accessoryRight={() => (
      <Text appearance="hint">
        {_.times(restaurant.price, _.constant("$")).join("")}
      </Text>
    )}
  />
);

export default function RestaurantsScreen() {
  const { restaurants } = useFirebaseState();
  return (
    <Layout style={styles.container} level="4">
      <Text category="h1">Restaurants ({restaurants.length})</Text>
      <List
        style={styles.list}
        renderItem={renderRestaurant}
        ItemSeparatorComponent={Divider}
        data={restaurants}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  list: {
    marginTop: 10,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
});
