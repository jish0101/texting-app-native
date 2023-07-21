import { KeyboardAvoidingView, View } from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { Button, Input, Text } from "@rneui/base";
import { StatusBar } from "expo-status-bar";
import { styles } from "../styles/styles";
import { createUser } from "../firebase";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageURL, setImageURL] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ headerBackTitle: "Back to Login" });
  }, [navigation]);

  const register = async () => {
    if (!name || !email || !password) {
      alert("Give neccessary details!");
      return;
    }
    try {
      await createUser(name, email, password, imageURL);
    } catch (err) {
      alert("Some error in user creation!!");
    }
  };

  const navigateHandler = () => {
    return navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <StatusBar style="light" />
      <Ionicons name="ios-chatbubble-sharp" size={100} color="#2C6BED" />
      <Text h3 style={{ marginTop: 50 }}>
        Create an account 🔗
      </Text>
      <View style={styles.inputContainer}>
        <Input
          placeholder="Your Name"
          autoFocus
          value={name}
          onChangeText={(text) => setName(text)}
          type="email"
        />
        <Input
          placeholder="Your Email"
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
        />
        <Input
          placeholder="Profile Picture URL (Optional)"
          type="text"
          value={imageURL}
          onChangeText={(text) => setImageURL(text)}
          onSubmitEditing={register}
        />
      </View>
      <Button
        containerStyle={styles.button}
        size="lg"
        onPress={register}
        title="Register"
      />
      <Button
        containerStyle={styles.button}
        onPress={navigateHandler}
        size="lg"
        type="outline"
        title="Login"
      />
      <View style={{ height: 100 }} />
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;