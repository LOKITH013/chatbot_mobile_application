import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore: react-native-vector-icons lacks TypeScript definitions
import Icon from 'react-native-vector-icons/Ionicons';

import styles from './HistoryScreenStyles';
import { sendMessageToBackend } from '../../api/timesheetApi';

type HistoryItem = {
  id: string;
  text: string;
};

export default function HistoryScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<HistoryItem[]>([]);

  const fetchHistory = async () => {
    try {
      const data = await sendMessageToBackend('show all');

      // ✅ backend sends { reply }
      const result: string = data?.reply ?? '';

      /*
        Expected backend text:
        "Here are your timesheet entries:
         1. 2025-12-19 — login page — 4 hrs
         2. 2025-12-18 — API work — 5 hrs"
      */

      const rows = result
        .split('\n')
        .slice(1) // skip header line
        .filter(r => r.trim().length > 0);

      const formatted: HistoryItem[] = rows.map((r, idx) => ({
        id: String(idx),
        text: r,
      }));

      setItems(formatted);
    } catch (e) {
      console.log('History fetch error', e);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = items.filter(item =>
    item.text.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.rightSpacer} />
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#9A9A9A"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <TouchableOpacity style={styles.newRow}>
        <Icon name="folder-outline" size={20} color="#000" />
        <Text style={styles.newRowText}>New project</Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.text}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
