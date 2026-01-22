// components/ChatContainer/ChatContainer.tsx

import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import MessageList from '../MessageList/MessageList';
import InputBar from '../InputBar/InputBar';
import { Message } from '../../types';

type Props = {
  messages: Message[];
  messageInput: string;
  onChangeMessageInput: (text: string) => void;
  onSendMessage: () => void;
  loading?: boolean;
};

const ChatContainer: React.FC<Props> = ({
  messages,
  messageInput,
  onChangeMessageInput,
  onSendMessage,
  loading,
}) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Messages */}
      <View style={styles.messagesWrapper}>
        <MessageList messages={messages} />
      </View>

      {/* Sticky Input */}
      <View style={styles.inputWrapper}>
        <InputBar
          message={messageInput}
          onChangeMessage={onChangeMessageInput}
          onSend={onSendMessage}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatContainer;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesWrapper: {
    flex: 1,
  },
  inputWrapper: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
});
