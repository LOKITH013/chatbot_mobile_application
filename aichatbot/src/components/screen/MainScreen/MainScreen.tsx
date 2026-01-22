import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../../../navigation/RootNavigator';
import { Message } from '../../../types';

import Header from '../../Header/Header';
import ChatContainer from '../../ChatContainer/ChatContainer';
import SideDrawer from '../../SideDrawer/SideDrawer';

import styles from './MainScreenStyles';
import {
  sendMessageToBackend,
  fetchConversations,
  fetchChatHistory,
} from '../../../api/timesheetApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const generateUniqueId = () => {
  return `id_${Math.random().toString(36).substr(2, 9)}`;
};

export default function MainScreen({ route, navigation }: Props) {
  /* ================= STATE ================= */
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadInitialChat();
  }, []);

  const showIntro = () => {
    setActiveSessionId(null);
    setMessages([
      {
        id: 'intro',
        role: 'assistant',
        sender: 'Atlas',
        text: "Hi, I'm Atlas.\nTell me your work in natural language.",
      },
    ]);
  };

  const loadInitialChat = async () => {
    try {
      const conversations = await fetchConversations();
      setSessions(conversations || []);

      if (conversations?.length) {
        await openConversation(conversations[0].conversation_id);
      } else {
        showIntro();
      }
    } catch (err) {
      console.warn('Failed to load chat history', err);
      showIntro();
    }
  };

  /* ================= OPEN CONVERSATION ================= */
  const openConversation = async (conversationId: number) => {
    try {
      const history = await fetchChatHistory(conversationId);

      const formatted: Message[] = history.map((m: any) => ({
        id: m.id ?? generateUniqueId(),
        role: m.role,
        sender: m.role === 'assistant' ? 'Atlas' : undefined,
        text: m.message ?? undefined,
        payload: m.payload ?? undefined,
      }));

      setActiveSessionId(conversationId);
      setMessages(formatted);
    } catch (err) {
      console.warn('Failed to open conversation', err);
    }
  };

  /* ================= MESSAGE HELPERS ================= */
  const addUser = (text: string) => {
    setMessages(prev => [
      ...prev,
      { id: generateUniqueId(), role: 'user', text },
    ]);
  };

  const addAtlasText = (text: unknown) => {
    let textString: string;
    if (typeof text !== 'string') {
      textString = JSON.stringify(text, null, 2);
    } else {
      textString = text;
    }

    setMessages(prev => [
      ...prev,
      {
        id: generateUniqueId(),
        role: 'assistant',
        sender: 'Atlas',
        text: textString,
      },
    ]);
  };

  const addAtlasPayload = (payload: any) => {
    setMessages(prev => [
      ...prev,
      {
        id: generateUniqueId(),
        role: 'assistant',
        sender: 'Atlas',
        payload,
      },
    ]);
  };

  /* ================= NEW CHAT ================= */
  const handleNewEntry = () => {
    showIntro();
    setDrawerOpen(false);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await AsyncStorage.clear();
    setSessions([]);
    setMessages([]);
    setActiveSessionId(null);

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    const text = message.trim();
    if (!text || loading) return;

    addUser(text);
    setMessage('');
    setLoading(true);

    try {
      const res = await sendMessageToBackend(text, activeSessionId);

      if (res.payload) addAtlasPayload(res.payload);
      if (res.reply) addAtlasText(res.reply);
      
      // Refresh conversations
      const updated = await fetchConversations();
      setSessions(updated || []);

    } catch {
      addAtlasText('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.mainContainer}>
      <SideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNewEntry={handleNewEntry}
        historyItems={sessions.map(s => ({
          id: s.conversation_id,
          title: s.title,
          updatedAt: s.updated_at,
        }))}
        onSelectHistory={item => {
          openConversation(item.id);
          setDrawerOpen(false);
        }}
        onLogout={handleLogout}
        profileName={route.params.profile?.email ?? 'User'}
      />
      <Header title="Atlas" onOpenHistory={() => setDrawerOpen(true)} />

      <ChatContainer
        messages={messages}
        messageInput={message}
        onChangeMessageInput={setMessage}
        onSendMessage={sendMessage}
        loading={loading}
      />
    </SafeAreaView>
  );
}