// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const ChatScreen = () => {
//   const [messages, setMessages] = useState([
//     { id: '1', text: 'Hello!', sender: 'other' },
//     { id: '2', text: 'Hi! How are you?', sender: 'me' },
//     { id: '3', text: 'am fine thanks', sender: 'me' },
//     { id: '4', text: 'i need help', sender: 'me' },
//   ]);
//   const [input, setInput] = useState('');

//   const sendMessage = () => {
//     if (input.trim() === '') return;
//     const newMessage = {
//       id: Date.now().toString(),
//       text: input,
//       sender: 'me',
//     };
//     setMessages((prevMessages) => [...prevMessages, newMessage]);
//     setInput('');
//   };

//   const renderItem = ({ item }) => (
//     <View
//       style={[
//         styles.messageContainer,
//         item.sender === 'me' ? styles.myMessage : styles.otherMessage,
//       ]}
//     >
//       <Text style={styles.messageText}>{item.text}</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <SafeAreaView>

//       <FlatList
//         data={messages}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.messagesList}
//         />
//         </SafeAreaView>

//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type a message"
//           value={input}
//           onChangeText={setInput}
//         />
//         <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
//           <Text style={styles.sendButtonText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ChatScreen;

// const styles = StyleSheet.create({
//   container: {
//     height: '90%',
//     backgroundColor: '#fff',
//   },
//   messagesList: {
//     padding: 10,
//     paddingBottom: 80,
//   },
//   messageContainer: {
//     marginVertical: 5,
//     maxWidth: '70%',
//     padding: 10,
//     borderRadius: 10,
//   },
//   myMessage: {
//     backgroundColor: '#FA2E47',
//     alignSelf: 'flex-end',
//   },
//   otherMessage: {
//     backgroundColor: '#ECECEC',
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 16,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 10,
//     backgroundColor: '#f1f1f1',
//     alignItems: 'center',
//   },
//   input: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   sendButton: {
//     marginLeft: 10,
//     backgroundColor: '#007AFF',
//     borderRadius: 20,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   sendButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
// });




// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import SockJS from 'sockjs-client';
// import { Client } from '@stomp/stompjs';
// import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';


// // Type for chat messages
// type ChatMessage = {
//   id: string;
//   text: string;
//   sender: 'me' | 'other';
// };

// const ChatScreen = () => {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const stompClientRef = useRef<Client | null>(null);
//   const flatListRef = useRef<FlatList<ChatMessage>>(null);
//   const recordingId = 102; // Replace with dynamic value if needed
//   const tabBarHeight = useBottomTabBarHeight();


//   useEffect(() => {
//     const socket = new SockJS('http://localhost:8080/ws');
//     const stompClient = new Client({
//       webSocketFactory: () => socket,
//       reconnectDelay: 5000,
//       debug: (str) => console.log('[STOMP]', str),
//     });

//     stompClient.onConnect = () => {
//       console.log('✅ STOMP Connected');
//       setIsConnected(true);

//       stompClient.subscribe('/topic/response', (message) => {
//         const body = message.body;

//         setMessages((prevMessages) => {
//           if (
//             prevMessages.length === 0 ||
//             prevMessages[prevMessages.length - 1].sender !== 'other'
//           ) {
//             return [
//               ...prevMessages,
//               { id: Date.now().toString(), text: body, sender: 'other' },
//             ];
//           } else {
//             const updatedMessages = [...prevMessages];
//             updatedMessages[updatedMessages.length - 1].text += body;
//             return updatedMessages;
//           }
//         });
//       });
//     };

//     stompClient.onDisconnect = () => {
//       console.log('❌ STOMP Disconnected');
//       setIsConnected(false);
//     };

//     stompClient.activate();
//     stompClientRef.current = stompClient;

//     return () => {
//       stompClient.deactivate();
//     };
//   }, []);

//   useEffect(() => {
//     // Auto scroll to bottom when new message arrives
//     if (flatListRef.current) {
//       flatListRef.current.scrollToEnd({animated: true});
//     }
//   }, [messages]);

//   const sendMessage = () => {
//     if (input.trim() === '' || !isConnected || !stompClientRef.current?.connected) return;

//     const myMessage: ChatMessage = {
//       id: Date.now().toString(),
//       text: input,
//       sender: 'me',
//     };

//     setMessages((prevMessages) => [...prevMessages, myMessage]);

//     stompClientRef.current.publish({
//       destination: '/app/ask',
//       body: JSON.stringify({
//         userMessage: input,
//         recordingId: recordingId,
//       }),
//     });

//     setInput('');
//   };

//   const renderItem = ({ item }: { item: ChatMessage }) => (
//     <View
//       style={[
//         styles.messageContainer,
//         item.sender === 'me' ? styles.myMessage : styles.otherMessage,
//       ]}
//     >
//       <Text style={styles.messageText}>{item.text}</Text>
//     </View>
//   );return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       // keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70} // adjust based on tab height
//       keyboardVerticalOffset={tabBarHeight + 20}
//     >
//       <SafeAreaView style={styles.safeContainer}>
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={(item) => item.id}
//           renderItem={renderItem}
//           contentContainerStyle={styles.messagesList}
//         />
  
//         <View style={styles.inputWrapper}>
//           <View style={styles.inputContainer}>
//             <TextInput
//               style={styles.input}
//               placeholder="Type a message"
//               value={input}
//               onChangeText={setInput}
//             />
//             <TouchableOpacity
//               onPress={sendMessage}
//               style={[styles.sendButton, { opacity: isConnected ? 1 : 0.5 }]}
//               disabled={!isConnected}
//             >
//               <Text style={styles.sendButtonText}>Send</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     </KeyboardAvoidingView>
//   );  
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   messagesList: {
//     padding: 16,
//     flexGrow: 1,
//     justifyContent: 'flex-end',
//   },
//   messageContainer: {
//     marginVertical: 8,
//     padding: 12,
//     borderRadius: 8,
//     maxWidth: '80%',
//   },
//   myMessage: {
//     backgroundColor: '#FA2E47',
//     alignSelf: 'flex-end',
//   },
//   otherMessage: {
//     backgroundColor: '#EEE',
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 16,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 8,
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//     backgroundColor: '#fff',
//   },
//   input: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     marginRight: 8,
//   },
//   sendButton: {
//     backgroundColor: '#007AFF',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     justifyContent: 'center',
//   },
//   sendButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   safeContainer: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   inputWrapper: {
//     backgroundColor: '#fff',
//     paddingBottom: 10, // Space above the tab bar
//   },
  
// });

// export default ChatScreen;



import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';


// Type for chat messages
type ChatMessage = {
  id: string;
  text: string;
  sender: 'me' | 'other';
};

const ChatScreen = ({id}:{id?: string}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const recordingId = id || 102; // Replace with dynamic value if needed


  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
    });

    stompClient.onConnect = () => {
      console.log('✅ STOMP Connected');
      setIsConnected(true);

      stompClient.subscribe('/topic/response', (message) => {
        const body = message.body;

        setMessages((prevMessages) => {
          if (
            prevMessages.length === 0 ||
            prevMessages[prevMessages.length - 1].sender !== 'other'
          ) {
            return [
              ...prevMessages,
              { id: Date.now().toString(), text: body, sender: 'other' },
            ];
          } else {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1].text += body;
            return updatedMessages;
          }
        });
      });
    };

    stompClient.onDisconnect = () => {
      console.log('❌ STOMP Disconnected');
      setIsConnected(false);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when new message arrives
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === '' || !isConnected || !stompClientRef.current?.connected) return;

    const myMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
    };

    setMessages((prevMessages) => [...prevMessages, myMessage]);

    stompClientRef.current.publish({
      destination: '/app/ask',
      body: JSON.stringify({
        userMessage: input,
        recordingId: recordingId,
      }),
    });

    setInput('');
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'me' ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );
  return (
      <SafeAreaView style={{height: '100%'}}>
    <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
        />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              value={input}
              onChangeText={setInput}
              />
            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendButton, { opacity: isConnected ? 1 : 0.5 }]}
              disabled={!isConnected}
              >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
              </SafeAreaView>
  );  
};

const styles = StyleSheet.create({
  container: {
    height: '95%',
    // backgroundColor: '#fff',
  },
  messagesList: {
    padding: 10,
    paddingBottom: 0,
    // height: '90%',
    // backgroundColor: 'blue',
    flexGrow: 1
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
  },
  myMessage: {
    backgroundColor: '#FA2E47',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    // alignSelf: 'baseline',
    padding: 10,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChatScreen;