// src/api/timesheetApi.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

/* ================================
   AXIOS INSTANCE
================================ */
const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async config => {
  const sessionStr = await AsyncStorage.getItem('session');
  if (sessionStr) {
    const session = JSON.parse(sessionStr);
    if (session.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});

/* ================================
   TYPES
================================ */
export type ChatResponse = {
  reply?: string;
  payload?: {
    type: 'TABLE' | string;
    columns?: string[];
    rows?: (string | number | null)[][];
  };
  followup?: {
    reply: string;
    payload?: any;
  };
};

/* ================================
   CHAT HISTORY APIs
================================ */

/** Side drawer – list conversations */
export const fetchConversations = async () => {
  const res = await api.get('/chat/conversations');
  return res.data;
};

/** Load messages for a conversation */
export const fetchChatHistory = async (conversationId: number) => {
  const res = await api.get(`/chat/history/${conversationId}`);
  return res.data;
};

/* ================================
   SEND MESSAGE
================================ */
export const sendMessageToBackend = async (
  message: string,
  sessionId: number | null,
): Promise<ChatResponse> => {
  try {
    const res = await api.post('/chat', {
      message,
      session_id: sessionId,
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Session expired
      return { reply: 'Session expired. Please log in again.' };
    }
    console.error('sendMessageToBackend failed:', error);
    return {
      reply: 'Unable to connect to server. Please try again.',
    };
  }
};
