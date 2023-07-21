import React from "react";
import { ListItem } from "@rneui/base";
import { Ionicons } from '@expo/vector-icons';

const CustomListItem = ({ chatID, chatName, enterChat }) => {
  return (
    <ListItem onPress={() => enterChat(chatID, chatName)} key={chatID} bottomDivider>
      <Ionicons name="chatbubble" size={24} color="black" />
      <ListItem.Content>
        <ListItem.Title>{chatName || "Some Chat"}</ListItem.Title>
        <ListItem.Subtitle numberOfLines={1} ellipsizeMode="tail">
        Nothing
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );
};

export default CustomListItem;