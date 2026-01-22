import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types';

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
};

const SESSIONS_KEY = 'CHAT_SESSIONS';

/* ---------------- SAFE PARSING ---------------- */

function isValidMessage(m: any): m is Message {
  if (!m || typeof m !== 'object') return false;

  // text must be string if present
  if ('text' in m && typeof m.text !== 'string') return false;

  // payload must be object if present
  if ('payload' in m && typeof m.payload !== 'object') return false;

  return (
    typeof m.id === 'string' && (m.role === 'user' || m.role === 'assistant')
  );
}

function sanitizeMessages(messages: any[]): Message[] {
  return messages.filter(isValidMessage);
}

/* ---------------- LOAD ---------------- */

export async function loadSessions(): Promise<ChatSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(s => s && typeof s === 'object')
      .map(session => ({
        id: String(session.id),
        title: String(session.title ?? 'Chat'),
        createdAt: String(session.createdAt ?? new Date().toISOString()),
        messages: sanitizeMessages(session.messages ?? []),
      }));
  } catch (err) {
    console.warn('Failed to load chat sessions, clearing storage.', err);
    await AsyncStorage.removeItem(SESSIONS_KEY);
    return [];
  }
}

/* ---------------- SAVE ---------------- */

export async function saveSessions(sessions: ChatSession[]) {
  try {
    const safeSessions = sessions.map(s => ({
      id: String(s.id),
      title: String(s.title),
      createdAt: String(s.createdAt),
      messages: sanitizeMessages(s.messages),
    }));

    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(safeSessions));
  } catch (err) {
    console.warn('Failed to save chat sessions', err);
  }
}
