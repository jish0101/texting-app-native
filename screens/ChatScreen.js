import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { auth, fetchMessagesForChat, firestore } from "../firebase";
import firebase from "../firebase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const ChatScreen = ({ navigation, route }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(null);
  const scrollViewRef = useRef();
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chat",
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Ionicons name="chatbubble" size={24} color="#fff" />
          <Text style={styles.text}>{route.params.chatName}</Text>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <FontAwesome name="camera" size={24} color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity>
            <FontAwesome name="phone" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteChat}>
            <FontAwesome name="trash" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const sendMessage = async () => {
    const MAX_MESSAGES_PER_CHAT = 30;
    const chatID = route.params.chatID;
    const messageText = input.trim();
    if (!messageText) return;
    const currentUser = firebase.auth().currentUser;

    if (currentUser) {
      const { displayName, email, photoURL } = currentUser;

      // Get the reference to the messages collection for the chat
      const messagesRef = firebase
        .firestore()
        .collection("chats")
        .doc(chatID)
        .collection("messages");

      try {
        // Check the number of messages in the chat
        const snapshot = await messagesRef.orderBy("timestamp", "asc").get();
        const messagesCount = snapshot.size;

        // If the number of messages exceeds the limit, delete the oldest messages
        if (messagesCount >= MAX_MESSAGES_PER_CHAT) {
          const oldestMessages = snapshot.docs.slice(
            0,
            messagesCount - MAX_MESSAGES_PER_CHAT
          );
          const deletePromises = oldestMessages.map((doc) => doc.ref.delete());
          await Promise.all(deletePromises);
        }

        // Add the new message
        await messagesRef.add({
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          message: messageText,
          displayName: displayName,
          email: email,
          photoURL: photoURL,
        });

        setInput("");
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    } else {
      console.log("User not logged in.");
    }
  };

  const handleDeleteChat = () => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: deleteChat,
      },
    ]);
  };

  useEffect(() => {
    const chatID = route.params.chatID;
    const chatRef = firestore.collection("chats").doc(chatID);

    const unsubscribe = chatRef.onSnapshot((snapshot) => {
      if (!snapshot.exists) {
        // Chat was deleted, show an alert and then redirect all users back to the home screen
        Alert.alert(
          "Chat Deleted",
          "This chat has been deleted..",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("Home");
              },
            },
          ]
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, route.params.chatID]);

  const deleteChat = async () => {
    const chatID = route.params.chatID;

    try {
      await firestore.collection("chats").doc(chatID).delete();
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error deleting chat:", error);
      Alert.alert(
        "Delete Failed",
        "Failed to delete the chat. Please try again."
      );
    }
  };

  useLayoutEffect(() => {
    const chatID = route.params.chatID;
    const unsubscribe = fetchMessagesForChat(chatID, setMessages);

    return () => {
      unsubscribe();
    };
  }, [route.params.chatID]);

  useLayoutEffect(() => {
    const scrollDifference = contentHeight - scrollViewHeight;
    if (scrollDifference > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [scrollViewHeight, contentHeight]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingTop: 15 }}
        style={styles.container}
        ref={scrollViewRef}
        onLayout={(event) =>
          setScrollViewHeight(event.nativeEvent.layout.height)
        }
        onContentSizeChange={(width, height) => setContentHeight(height)}
      >
        {messages &&
          messages.map(({ id, data }) =>
            data?.email === auth.currentUser.email ? (
              <View key={id} style={styles.reciever}>
                <Text style={styles.recieverText}>{data.message}</Text>
                <FontAwesome
                  name="user-circle-o"
                  size={20}
                  style={styles.recieverIcon}
                  color="grey"
                />
              </View>
            ) : (
              <View key={id} style={styles.sender}>
                <Text style={styles.senderText}>{data.message}</Text>
                <FontAwesome
                  name="user-circle-o"
                  size={20}
                  style={styles.senderIcon}
                  color="#2868E6"
                />
                <Text style={styles.senderName}>{data.displayName}</Text>
              </View>
            )
          )}
      </KeyboardAwareScrollView>

      {/* Input section */}
      <View style={styles.footer}>
        <TextInput
          value={input}
          style={styles.textInput}
          onChangeText={(text) => setInput(text)}
          onSubmitEditing={sendMessage}
          placeholder="Enter your message.."
        />
        <TouchableOpacity onPress={sendMessage} activeOpacity={0.5}>
          <Ionicons name="send" size={24} color="#2868E6" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    gap: 25,
  },
  text: {
    color: "white",
    marginLeft: 10,
    fontWeight: "700",
  },
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 15,
    marginBottom: 10,
  },
  textInput: {
    bottom: 0,
    height: 40,
    flex: 1,
    marginRight: 15,
    backgroundColor: "#ECECEC",
    padding: 10,
    color: "grey",
    borderRadius: 30,
  },
  recieverText: {
    color: "black",
    fontWeight: "500",
    marginLeft: 10,
  },
  senderText: {
    color: "white",
    fontWeight: "500",
  },
  recieverIcon: {
    position: "absolute",
    right: 0,
    bottom: -22,
  },
  senderIcon: {
    position: "absolute",
    left: 5,
    bottom: -25,
  },
  reciever: {
    padding: 15,
    backgroundColor: "#ECECEC",
    alignSelf: "flex-end",
    borderRadius: 20,
    marginRight: 15,
    marginBottom: 50,
    maxWidth: "80%",
    position: "relative",
  },
  sender: {
    padding: 15,
    backgroundColor: "#2868E6",
    alignSelf: "flex-start",
    borderRadius: 20,
    marginLeft: 15,
    marginBottom: 50,
    maxWidth: "80%",
    position: "relative",
  },
  senderName: {
    fontSize: 12,
    color: "black",
    position: "absolute",
    left: 30,
    fontWeight: "500",
    bottom: -22,
  },
});
