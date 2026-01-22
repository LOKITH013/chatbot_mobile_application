import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import styles from './AuthStyles';

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthContainer({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.authContainer}>
      <Text style={styles.appTitle}>{title}</Text>
      <Text style={styles.authSubtitle}>{subtitle}</Text>
      <View style={styles.authForm}>{children}</View>
    </SafeAreaView>
  );
}
