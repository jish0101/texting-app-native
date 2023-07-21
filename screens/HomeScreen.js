import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { auth, fetchChats } from "../firebase.js";
import CustomListItem from "../components/CustomListItem";
import { AntDesign, SimpleLineIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState("");
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        navigation.replace("Login");
      }
    });

    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      handleFetchChats();
    }, [user])
  );

  const logoutHandler = async () => {
    navigation.navigate("UserProfile");
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chats",
      headerStyle: { backgroundColor: "#fff" },
      headerTitleStyle: { color: "black" },
      headerTitleAlign: "center",
      headerTintColor: "black",
      headerLeft: () => (
        <View>
          <TouchableOpacity onPress={logoutHandler} activeOpacity={0.5}>
          <FontAwesome name="user-circle-o" size={30} color="black" />
          </TouchableOpacity>
        </View>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 25 }}>
          <TouchableOpacity activeOpacity={0.5}>
            <AntDesign name="camerao" size={24} color={"black"} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => navigation.navigate("AddChat")}
          >
            <SimpleLineIcons name="pencil" size={24} color={"black"} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, []);

  const handleFetchChats = async () => {
    try {
      const chats = await fetchChats();
      setChats(chats);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  const enterChat = (chatID, chatName) => {
    navigation.navigate("Chat", {
      chatID,
      chatName,
    });
  };

  return (
    <SafeAreaView>
      <ScrollView>
        {chats.map(({ chatID, data: { chatName } }) => (
          <CustomListItem key={chatID} chatID={chatID} chatName={chatName} enterChat={enterChat} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;