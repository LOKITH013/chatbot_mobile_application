import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import styles from './InputBarStyles';

type Props = {
  message: string;
  onChangeMessage: (text: string) => void;
  onSend: () => void;
  loading?: boolean;
};

const InputBar: React.FC<Props> = ({
  message,
  onChangeMessage,
  onSend,
  loading,
}) => {
  return (
    <View style={styles.inputBar}>
      <TextInput
        style={styles.chatInput}
        placeholder="Ask anything or type your timesheet query..."
        placeholderTextColor="#ACACBE"
        value={message}
        onChangeText={onChangeMessage}
        multiline
      />

      <TouchableOpacity
        style={styles.sendButton}
        onPress={onSend}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.sendButtonText}>➤</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default InputBar;
