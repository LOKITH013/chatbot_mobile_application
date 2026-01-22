// components/MessageList/MessageList.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Message } from '../../types';
import TableMessage from '../TableMessage/TableMessage';
import styles from './MessageListStyles';

type Props = {
  messages: Message[];
};

const SCROLL_THRESHOLD = 80;

/* ================= SAFE TEXT RENDER ================= */
const renderSafeText = (text: any): string => {
  if (text === null || text === undefined) return '';
  if (typeof text === 'string') return text;
  if (typeof text === 'number') return String(text);

  // Backend validation / FastAPI error object
  if (typeof text === 'object') {
    if (text.msg) return text.msg;
    return JSON.stringify(text);
  }

  return String(text);
};

/* ================= CHAT BUBBLE ================= */
const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';

  // 🔒 FORCE STRING
  let displayText = '';

  if (typeof message.text === 'string') {
    displayText = message.text;
  } else if (message.text) {
    displayText = JSON.stringify(message.text, null, 2);
  }

  if (!displayText) return null;

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {!isUser && <Text style={styles.senderName}>Atlas</Text>}
      <Text
        style={[
          styles.messageText,
          isUser ? styles.userText : styles.assistantText,
        ]}
      >
        {displayText}
      </Text>
    </View>
  );
};


/* ================= MESSAGE LIST ================= */
const MessageList: React.FC<Props> = ({ messages }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  /* 🔥 Auto-scroll when new messages arrive */
  useEffect(() => {
    if (!showScrollDown && messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages, showScrollDown]);

  /* 🔍 Detect scroll position */
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;

    const distanceFromBottom =
      contentSize.height - (layoutMeasurement.height + contentOffset.y);

    setShowScrollDown(distanceFromBottom > SCROLL_THRESHOLD);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
    setShowScrollDown(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {messages.map(message => (
          <View key={message.id}>
            {/* TEXT MESSAGE */}
            {message.text !== undefined && <ChatBubble message={message} />}

            {/* TABLE PAYLOAD */}
            {message.payload?.type === 'TABLE' && (
              <TableMessage payload={message.payload} />
            )}
          </View>
        ))}
      </ScrollView>

      {/* ⬇️ SCROLL TO BOTTOM */}
      {showScrollDown && (
        <TouchableOpacity
          style={styles.scrollDownButton}
          onPress={scrollToBottom}
          activeOpacity={0.8}
        >
          <MaterialIcon
            name="keyboard-arrow-down"
            size={28}
            color="#000000ff"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MessageList;
