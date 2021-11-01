import { Button, Input, Text, Icon } from "@ui-kitten/components";
import React, { FC } from "react";
import { StyleSheet, View } from "react-native";

import { ImageOverlay } from "../components/ImageOverlay";
import KeyboardAvoidingView from "../components/KeyboardAvoidingView";
import useFirebaseState from "../hooks/useFirebaseState";
import { RootStackParamList } from "../types";

const SignIn: FC<RootStackParamList["SignIn"]> = () => {
  const [email, setEmail] = React.useState<string>();
  const { setUsername } = useFirebaseState();

  const onSignInButtonPress = (): void => {
    if (email) {
      setUsername(email);
    }
  };

  return (
    <KeyboardAvoidingView>
      <ImageOverlay
        style={styles.container}
        source={require("../../assets/images/sign-in-background.jpg")}
      >
        <View style={styles.headerContainer}>
          <Text category="h1" status="control">
            Aviso Eats
          </Text>
          <Text style={styles.signInLabel} category="s1" status="control">
            Just dudes eatin foods
          </Text>
        </View>
        <View style={styles.formContainer}>
          <Input
            status="control"
            placeholder="Username"
            accessoryLeft={(props) => <Icon name="person-outline" {...props} />}
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <Button
          style={styles.signInButton}
          status="control"
          size="giant"
          onPress={onSignInButtonPress}
        >
          SIGN IN
        </Button>
      </ImageOverlay>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 216,
  },
  formContainer: {
    flex: 1,
    marginTop: 32,
    paddingHorizontal: 16,
  },
  signInLabel: {
    marginTop: 16,
  },
  signInButton: {
    marginHorizontal: 16,
    marginBottom: 80,
  },
  signUpButton: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
});

export default SignIn;
