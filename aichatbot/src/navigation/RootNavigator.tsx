// navigation/RootNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../components/screen/LoginScreen/LoginScreen';
import SignUpScreen from '../components/screen/SignUpScreen/SignUpScreen';
import MainScreen from '../components/screen/MainScreen/MainScreen';
import HistoryScreen from '../components/screen/HistoryScreen';
import SettingsScreen from '../components/screen/SettingsScreen/SettingsScreen';
import { Profile } from '../types';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: { profile: Profile };
  History: undefined;
  Settings: { email?: string; subscription?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
