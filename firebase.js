import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  // your keys here
};

// Initialize Firebase

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Authentication
const loginUser = async (email, password) => {
  try {
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log("Logged in:", user.uid);
    return user;
  } catch (error) {
    throw new Error("Authentication error: " + error.message);
  }
};

const createUser = async (name, email, password, photoURL) => {
  try {
    const userCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Update user profile with additional data
    await user.updateProfile({
      displayName: name,
      photoURL: photoURL,
    });

    console.log("User created:", user.uid);
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("User creation error: " + error.message);
  }
};

const logoutUser = async () => {
  try {
    await firebase.auth().signOut();
    console.log("Logged out");
  } catch (error) {
    throw new Error("Logout error: " + error.message);
  }
};

// db
const auth = firebase.auth();
const firestore = firebase.firestore();

const addChat = async (chatName) => {
  try {
    const chatRef = firestore.collection("chats");
    await chatRef.add({
      chatName: chatName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Chat added successfully");
  } catch (error) {
    console.error("Error adding chat:", error);
    throw new Error("Failed to add chat");
  }
};

const fetchChats = (onChatsUpdate) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const chatsRef = firestore.collection("chats");

      const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
        const chats = [];
        querySnapshot.forEach((doc) => {
          const chat = doc.data();
          const chatID = doc.id;
          chats.push({ chatID, data: chat });
        });

        onChatsUpdate(chats);
      });

      return unsubscribe;
    } else {
      console.log("User not authenticated");
      return () => {};
    }
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw new Error("Failed to fetch chats");
  }
};


const fetchMessagesForChat = (chatID, onMessagesUpdate) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const messagesRef = firestore
        .collection('chats')
        .doc(chatID)
        .collection('messages')
        .orderBy('timestamp');

      const unsubscribe = messagesRef.onSnapshot((querySnapshot) => {
        const messages = [];
        querySnapshot.forEach((doc) => {
          const message = doc.data();
          const id = doc.id;
          messages.push({ id, data: message });
        });
        onMessagesUpdate(messages);
      });

      return unsubscribe;
    } else {
      console.log('User not authenticated');
      return () => {};
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }
};



export default firebase;
export { firestore, auth, loginUser, createUser, logoutUser, addChat, fetchChats, fetchMessagesForChat };