import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import styles from './SettingsScreenStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation, route }) => {
  const email = route.params?.email ?? 'user@example.com';
  const subscription = route.params?.subscription ?? 'Free';

  const handleLogout = async () => {
    await AsyncStorage.removeItem('session');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      {/* top header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Subscription */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Subscription</Text>
          <Text style={styles.cardValue}>{subscription}</Text>
          <Text style={styles.cardDescription}>
            View or upgrade your current timesheet assistant plan.
          </Text>
        </View>

        {/* Email */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{email}</Text>
          <Text style={styles.cardDescription}>
            This email is used for account recovery and notifications.
          </Text>
        </View>

        {/* Appearance */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardLabel}>Appearance</Text>
          <Text style={styles.cardValue}>System (Default)</Text>
          <Text style={styles.cardDescription}>
            Switch between light, dark, or follow your device theme.
          </Text>
        </TouchableOpacity>

        {/* Accent color */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardLabel}>Accent color</Text>
          <Text style={styles.cardValue}>Default</Text>
          <Text style={styles.cardDescription}>
            Choose a highlight color used for buttons and links.
          </Text>
        </TouchableOpacity>

        {/* General */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardLabel}>General</Text>
          <Text style={styles.cardDescription}>
            Language, time format, and other basic app preferences.
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardLabel}>Notifications</Text>
          <Text style={styles.cardDescription}>
            Control reminder alerts for daily and weekly timesheet entries.
          </Text>
        </TouchableOpacity>

        {/* Voice */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardLabel}>Voice</Text>
          <Text style={styles.cardDescription}>
            Configure microphone access and voice input options.
          </Text>
        </TouchableOpacity>

        {/* Data controls */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardLabel}>Data controls</Text>
          <Text style={styles.cardDescription}>
            Manage how your timesheet data and logs are stored and deleted.
          </Text>
        </TouchableOpacity>

        {/* Security */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardLabel}>Security</Text>
          <Text style={styles.cardDescription}>
            Configure login methods, device security and session timeout.
          </Text>
        </TouchableOpacity>

        {/* About */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardLabel}>About</Text>
          <Text style={styles.cardDescription}>
            Learn more about this Timesheet Assistant app and version details.
          </Text>
        </TouchableOpacity>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
