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

export default function LoginScreen({ navigation }: Props) {
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    setError('');

    if (!employeeId.trim() || !email.trim() || !password) {
      setError('Employee ID, Email and Password are required');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId.trim(),
          email: email.trim(),
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
      <Text style={styles.inputLabel}>Employee ID</Text>
      <TextInput
        style={styles.input}
        value={employeeId}
        onChangeText={setEmployeeId}
        autoCapitalize="characters"
      />

      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
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
