// src/api/timesheetApi.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { triggerSessionExpired } from '../auth/sessionExpired';

const SESSION_KEY = 'session';

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

/* ================================
   REQUEST INTERCEPTOR – attach access token
================================ */
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch {
      // ignore invalid session
    }
  }
  return config;
});

/* ================================
   REFRESH TOKEN – single in-flight request
================================ */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;
      const session = JSON.parse(sessionStr);
      const refreshToken = session?.refresh_token;
      if (!refreshToken) return null;

      // Expects POST /auth/refresh with { refresh_token } and returns { access_token, refresh_token? }
      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );
      const data = res.data as { access_token?: string; access?: string; refresh_token?: string; refresh?: string };
      const newAccess = data?.access_token ?? data?.access;
      const newRefresh = data?.refresh_token ?? data?.refresh ?? refreshToken;

      const updated = { ...session, access_token: newAccess, refresh_token: newRefresh };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return newAccess;
    } catch {
      await AsyncStorage.removeItem(SESSION_KEY);
      triggerSessionExpired();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/* ================================
   RESPONSE INTERCEPTOR – 401 → refresh and retry
================================ */
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const newToken = await refreshAccessToken();
    if (newToken) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

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
