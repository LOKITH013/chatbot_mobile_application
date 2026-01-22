import React from 'react';
import { TouchableOpacity, Text, GestureResponderEvent } from 'react-native';
import styles from './PrimaryButtonStyles';

type Props = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
};

export default function PrimaryButton({ label, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}
