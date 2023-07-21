import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Avatar, Input, Button } from "@rneui/base";
import { FontAwesome } from "@expo/vector-icons";
import { auth, firestore } from "../firebase";

const UserProfile = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [newName, setNewName] = useState("");
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  const handleLogout = () => {
    try {
      auth.signOut();
    } catch (error) {
      Alert.alert("Logout Failed", "Failed to logout. Please try again.");
    }
  };

  const handleUpdateName = async () => {
    try {
      await user.updateProfile({ displayName: newName });
      setEditingName(false);
    } catch (error) {
      Alert.alert("Update Failed", "Failed to update name. Please try again.");
    }
  };

  const renderAvatar = () => {
    if (user?.photoURL) {
      return <Avatar rounded source={{ uri: user.photoURL }} size="large" />;
    } else {
      return <FontAwesome name="user-circle" size={80} color="gray" />;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setEditingName(true)}
      >
        {editingName ? (
          <Input
            value={newName}
            onChangeText={setNewName}
            placeholder="Enter your name"
            style={styles.input}
            autoFocus
          />
        ) : (
          <Text style={styles.name}>{user?.displayName || "User"}</Text>
        )}
      </TouchableOpacity>
      <View style={styles.avatarContainer}>{renderAvatar()}</View>
      <Text style={styles.email}>{user?.email}</Text>
      {editingName ? (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleUpdateName}
        >
          <Text style={styles.logoutText}>Save</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setEditingName(true)}>
          <Text style={styles.editName}>Edit Name</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    marginVertical: 30,
  },
  inputContainer: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  avatarContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    width: "100%",
  },
  editName: {
    color: "blue",
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2868E6",
    borderRadius: 5,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
  },
});

export default UserProfile;