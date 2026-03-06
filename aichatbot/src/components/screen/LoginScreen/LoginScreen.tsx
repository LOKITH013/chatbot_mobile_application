import React, { useState } from 'react';
import { Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';

import AuthContainer from '../../auth/AuthContainer';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';
import styles from './LoginScreenStyles';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { login } from '../../../api/timesheetApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const USER_ID_LABEL = 'User ID';

function getLoginErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { detail?: string } | undefined;
    if (data?.detail) return typeof data.detail === 'string' ? data.detail : 'Invalid login credentials';
    if (status === 401 || status === 403) return 'Invalid login credentials';
    if (status && status >= 400) return error.message || 'Invalid login credentials';
    if (error.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
    if (error.code === 'ERR_NETWORK') return 'Cannot reach server. Check network and that the server is running.';
  }
  return 'Unable to connect to server';
}

export default function LoginScreen({ navigation }: Props) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    setError('');

    const userIdTrimmed = userId.trim();
    if (!userIdTrimmed || !password) {
      setError('Enter User ID and Password');
      return;
    }

    try {
      const profile = await login(userIdTrimmed, password) as Record<string, unknown>;
      console.log('Profile object received from login:', profile);

      await AsyncStorage.setItem('session', JSON.stringify(profile));

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { profile } }],
      });
    } catch (err) {
      setError(getLoginErrorMessage(err));
    }
  };

  return (
    <AuthContainer title="Company Portal" subtitle="Employee Login">
      <Text style={styles.inputLabel}>{USER_ID_LABEL}</Text>
      <TextInput
        style={styles.input}
        value={userId}
        onChangeText={setUserId}
        placeholder={USER_ID_LABEL}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoComplete="username"
      />

      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <PrimaryButton label="Log In" onPress={handleLogin} />
    </AuthContainer>
  );
}
