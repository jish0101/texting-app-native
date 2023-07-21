import { KeyboardAvoidingView, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Button, Input, Text } from "@rneui/base";
import { StatusBar } from "expo-status-bar";
import { styles } from "../styles/styles";
import firebase, { loginUser } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        navigation.replace("Home");
      }
    });

    return unsubscribe;
  }, [navigation]);

  const signIn = async () => {
    if (!email || !password) {
      alert("Enter your details");
      return;
    }
    try {
      await loginUser(email, password);
    } catch (err) {
      alert("Some error, check your details or try later!")
    }
  };

  const navigateHandler = () => {
    return navigation.navigate("Register");
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <StatusBar style="light" />
      <Ionicons name="ios-chatbubble-sharp" size={100} color="#2C6BED" />
      <Text h2 style={{ marginTop: 50 }}>
        Log in 🔒
      </Text>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Your Email"
          autoFocus
          value={email}
          onChangeText={(text) => setEmail(text)}
          type="email"
        />
        <Input
          placeholder="Your Password"
          secureTextEntry
          type="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          onSubmitEditing={signIn}
        />
      </View>
      <Button
        size="lg"
        containerStyle={styles.button}
        onPress={signIn}
        title="Login"
      />
      <Button
        containerStyle={styles.button}
        size="lg"
        onPress={navigateHandler}
        type="outline"
        title="Register"
      />
      <View style={{ height: 100 }} />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;