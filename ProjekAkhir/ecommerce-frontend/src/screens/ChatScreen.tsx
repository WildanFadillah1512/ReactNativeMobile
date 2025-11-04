import React, { useState, useRef, useEffect } from 'react'; // Perbaikan: Sintaks import yang benar
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types'; // Sesuaikan path
import { useChats } from '../context/ChatContext'; // Import hook dari context

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  // --- PERBAIKAN: Ambil sellerId sebagai parameter utama ---
  const { sellerId, sellerName, sellerAvatar, itemId } = route.params;

  // Context Chat
  const { getMessages, sendMessage, loading } = useChats();

  // --- PERBAIKAN: Gunakan sellerId untuk mendapatkan pesan ---
  const messages = getMessages(sellerId);

  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (newMessage.trim() === '') return;

    // --- PERBAIKAN: Kirim pesan berdasarkan sellerId ---
    // Kirim juga itemId jika ada, sebagai konteks
    sendMessage(sellerId, newMessage, itemId);
    setNewMessage('');
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06b6d4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header Chat */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {sellerAvatar && (
            <Image
              source={{ uri: sellerAvatar }}
              style={styles.avatar}
            />
          )}
          <Text style={styles.headerTitle}>{sellerName}</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Area Chat */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messageContainer}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'me'
                  ? styles.myMessage
                  : styles.sellerMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Pesan */}
        <View style={styles.footer}>
          <TextInput
            style={styles.input}
            placeholder="Ketik pesan..."
            placeholderTextColor="#94a3b8"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Icon name="paper-plane" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#1e293b',
  },
  backButton: { padding: 6 },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: 'white' },
  headerSpacer: { width: 34 },
  messageContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#06b6d4',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  sellerMessage: {
    backgroundColor: '#334155',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: 'white',
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#06b6d4',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});