import { StyleSheet, View } from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { Button, Icon, Input } from "@rneui/base";
import { addChat } from "../firebase";

const AddChatScreen = ({ navigation }) => {
  const [input, setInput] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Add a new chat",
      headerBackTitle: "Chats",
    });
  }, []);

  const createChat = async () => {
    if (!input) {
      alert("Enter chat name");
      return;
    }
    await addChat(input);
    navigation.goBack();
    return;
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Enter the chat name"
        value={input}
        onChangeText={(text) => setInput(text)}
        onSubmitEditing={createChat}
        leftIcon={
          <Icon name="wechat" type="antdesign" size={24} color="black" />
        }
      />
      <Button size="lg" containerStyle={styles.button} onPress={createChat} title={"Create new chat 🚀"} />
    </View>
  );
};

export default AddChatScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 20,
    height: "100%",
  },
  button: {
    borderRadius: 10,
  }
});