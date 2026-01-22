// components/Header/Header.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import styles from './HeaderStyles';

type Props = {
  onOpenHistory: () => void;
  title?: string;
};

const Header: React.FC<Props> = ({ onOpenHistory, title = 'Atlas' }) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onOpenHistory} style={styles.iconButton}>
        <Text style={styles.menuIcon}>≡</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.subtitleText}>Timesheet Entry · Secure</Text>
      </View>

      <View style={styles.rightSpacer} />
    </View>
  );
};

export default Header;
