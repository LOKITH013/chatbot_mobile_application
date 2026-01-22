import React, { useState } from 'react';
import { Text, TextInput, Alert, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AuthContainer from '../../auth/AuthContainer';
import PrimaryButton from '../../PrimaryButton/PrimaryButton';
import styles from './SignUpScreenStyles';
import { RootStackParamList } from '../../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const trimmedCompany = companyName.trim();
    const trimmedAddress = companyAddress.trim();
    const trimmedId = employeeId.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // ---------------- VALIDATION ----------------
    if (
      !trimmedCompany ||
      !trimmedAddress ||
      !trimmedId ||
      !trimmedEmail ||
      !trimmedPassword
    ) {
      Alert.alert(
        'Missing details',
        'Please fill in all fields before continuing.',
      );
      return;
    }

    const gmailPattern = /^[^\s@]+@gmail\.com$/;
    if (!gmailPattern.test(trimmedEmail)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a Gmail address (example@gmail.com).',
      );
      return;
    }

    const userData = {
      companyName: trimmedCompany,
      companyAddress: trimmedAddress,
      employeeId: trimmedId,
      email: trimmedEmail,
      password: trimmedPassword, // stored only for validation
    };

    try {
      // ✅ Save full user data (for validation)
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // ✅ Save non-sensitive profile data
      await AsyncStorage.setItem(
        'savedUser',
        JSON.stringify({
          email: trimmedEmail,
          employeeId: trimmedId,
          companyName: trimmedCompany,
          companyAddress: trimmedAddress,
        }),
      );

      // 🔐 Save password securely
      await Keychain.setGenericPassword(trimmedEmail, trimmedPassword);

      // ❌ Clear session (force login after signup)
      await AsyncStorage.removeItem('session');
    } catch (error) {
      console.log('Error while saving user:', error);
      Alert.alert('Error', 'Failed to create account. Try again.');
      return;
    }

    Alert.alert(
      'Account Created',
      'Your account has been created successfully. Please log in.',
      [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
    );
  };

  return (
    <AuthContainer title="Timesheet Entry" subtitle="Create your account">
      <Text style={styles.inputLabel}>Company Name</Text>
      <TextInput
        style={styles.input}
        value={companyName}
        onChangeText={setCompanyName}
      />

      <Text style={styles.inputLabel}>Company Address</Text>
      <TextInput
        style={styles.input}
        value={companyAddress}
        onChangeText={setCompanyAddress}
      />

      <Text style={styles.inputLabel}>Employee ID</Text>
      <TextInput
        style={styles.input}
        value={employeeId}
        onChangeText={setEmployeeId}
      />

      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.inputLabel}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <PrimaryButton label="Sign Up" onPress={handleSignUp} />

      <View style={styles.signUpRow}>
        <Text style={styles.signUpPrompt}>Already have an account?</Text>
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('Login')}
        >
          Log In
        </Text>
      </View>
    </AuthContainer>
  );
}
