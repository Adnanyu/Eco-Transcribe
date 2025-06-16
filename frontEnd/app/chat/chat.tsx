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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useLocalSearchParams } from 'expo-router';


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
  const { recordingId } = useLocalSearchParams()
  // const recordingIdd = id || 102; 
  const params = useLocalSearchParams()
  console.log('id is lllll: ', recordingId)
  console.log('params is lllll: ', params)


  useEffect(() => {
    const socket = new SockJS('http://1.1.15.13:8081/ws');
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
      destination: '/app/ask-single',
      body: JSON.stringify({
        userMessage: input,
        recordingId: recordingId.toString(),
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
      <View style={styles.container}>
        <SafeAreaView style={{height: '100%'}}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
          />
          <KeyboardAvoidingView
          // style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 115 : 0} // Adjust as needed
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              </TouchableWithoutFeedback>
     </KeyboardAvoidingView>
                </SafeAreaView>
          </View>
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