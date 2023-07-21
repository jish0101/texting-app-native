import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { auth, fetchMessagesForChat } from "../firebase";
import firebase from "../firebase";

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
        </View>
      ),
    });
  }, [navigation]);

  const sendMessage = () => {
    const chatID = route.params.chatID;
    const messageText = input.trim();
    if (!messageText) return;
    const currentUser = firebase.auth().currentUser;

    if (currentUser) {
      const { displayName, email, photoURL } = currentUser;

      firebase
        .firestore()
        .collection("chats")
        .doc(chatID)
        .collection("messages")
        .add({
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          message: messageText,
          displayName: displayName,
          email: email,
          photoURL: photoURL,
        })
        .then((docRef) => {
          console.log("Message added with ID:", docRef.id);
          setInput("");
        })
        .catch((error) => {
          console.error("Error adding message:", error);
        });
    } else {
      console.log("User not logged in.");
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <>
            <ScrollView
              contentContainerStyle={{ paddingTop: 15 }}
              ref={scrollViewRef}
              onLayout={(event) =>
                setScrollViewHeight(event.nativeEvent.layout.height)
              }
              onContentSizeChange={(width, height) => setContentHeight(height)}
              style={styles.container}
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
            </ScrollView>
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
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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

{
  /* <Avatar
  containerStyle={{
    position: "absolute",
    bottom: -15,
    right: -5,
  }}
  bottom={-15}
  right={-5}
  size={30}
  rounded
  source={{ uri: data?.photoURL }}
/> */
}