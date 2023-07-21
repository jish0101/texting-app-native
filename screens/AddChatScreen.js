import React, { useState, useLayoutEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Input, Icon, Button, Text } from "@rneui/base";
import { firestore } from "../firebase";
import { FontAwesome } from "@expo/vector-icons";

const AddChatScreen = ({ navigation }) => {
  const [chatName, setChatName] = useState("");

  // Maximum limit for global chats
  const MAX_GLOBAL_CHATS = 10;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Add a new chat",
      headerBackTitle: "Chats",
    });
  }, [navigation]);

  const checkChatLimit = async () => {
    try {
      const chatsRef = firestore.collection("chats");
      const querySnapshot = await chatsRef.get();
      const numChats = querySnapshot.size;

      if (numChats >= MAX_GLOBAL_CHATS) {
        Alert.alert(
          "Chat Limit Reached",
          "The number of chats has reached the maximum limit. Creating a new chat will delete the oldest chat. Do you want to proceed?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Proceed",
              onPress: deleteOldestChat,
            },
          ]
        );
      } else {
        createChat();
      }
    } catch (error) {
      console.error("Error checking chat limit:", error);
    }
  };

  const deleteOldestChat = async () => {
    try {
      const chatsRef = firestore
        .collection("chats")
        .orderBy("createdAt")
        .limit(1);
      const querySnapshot = await chatsRef.get();
      const oldestChat = querySnapshot.docs[0];

      if (oldestChat) {
        await oldestChat.ref.delete();
      }

      createChat();
    } catch (error) {
      console.error("Error deleting oldest chat:", error);
    }
  };

  const createChat = async () => {
    if (!chatName.trim()) {
      Alert.alert("Enter chat name", "Please enter a valid chat name.");
      return;
    }

    try {
      await firestore.collection("chats").add({
        chatName: chatName.trim(),
        createdAt: new Date(),
      });

      navigation.goBack();
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert(
        "Create Chat Failed",
        "Failed to create the chat. Please try again."
      );
    }
  };

  return (
      <View style={styles.container}>
        <Input
          placeholder="Enter the chat name"
          value={chatName}
          onChangeText={setChatName}
          onSubmitEditing={checkChatLimit}
          leftIcon={
            <Icon
              name="wechat"
              type="antdesign"
              size={24}
              style={{ marginHorizontal: 10 }}
              color="black"
            />
          }
        />
        <Button
          size="lg"
          containerStyle={styles.button}
          onPress={checkChatLimit}
          title="Create new chat 🚀"
        />
      <View style={styles.flexContainer}>
        <FontAwesome name="info-circle"  size={20}/>
        <Text style={styles.info}>
          As of now, only 10 chats can be created.
        </Text>
      </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    gap: 20,
    marginVertical: 25,
  },
  flexContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  button: {
    borderRadius: 10,
    width: "100%",
  },
  info: {
    fontSize: 18
  }
});

export default AddChatScreen;
