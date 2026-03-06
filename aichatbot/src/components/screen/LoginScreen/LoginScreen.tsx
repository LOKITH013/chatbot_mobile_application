import React, { useEffect, useState } from 'react';
import { Text, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthContainer from '../../auth/AuthContainer';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';
import styles from './LoginScreenStyles';
import { RootStackParamList } from '../../../navigation/RootNavigator';

const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const USER_ID_LABEL = 'User ID';

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
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userIdTrimmed,
          password,
        }),
      });

      
      if (!res?.ok) {
        const err = await res.json();
        setError(err.detail ?? 'Invalid login credentials');
        return;
      }
      
      const profile = await res?.json();
      
      console.log('Profile object received from login:', profile);

      // ✅ Save session
      await AsyncStorage?.setItem('session', JSON.stringify(profile));

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main', params: { profile } }],
      });
    } catch {
      setError('Unable to connect to server');
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
