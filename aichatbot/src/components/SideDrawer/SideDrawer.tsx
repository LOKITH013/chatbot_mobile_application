import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import styles from './SideDrawerStyles';

/* ================= TYPES ================= */
export type HistoryItem = {
  id: number;
  title: string | null;
  updatedAt: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onNewEntry: () => void;
  historyItems: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onLogout: () => void;
  profileName: string;
};

/* ================= COMPONENT ================= */
const SideDrawer: React.FC<Props> = ({
  visible,
  onClose,
  onNewEntry,
  historyItems,
  onSelectHistory,
  onLogout,
  profileName,
}) => {
  const [search, setSearch] = useState('');

  /* ================= GROUP BY DATE ================= */
  const grouped = useMemo(() => {
    const filtered = historyItems.filter(h =>
      (h.title || 'Chat').toLowerCase().includes(search.toLowerCase()),
    );

    const map: Record<string, HistoryItem[]> = {};

    filtered.forEach(item => {
      const d = new Date(item.updatedAt);
      const key = d.toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });

    return Object.entries(map).map(([dateLabel, items]) => ({
      dateLabel,
      items,
    }));
  }, [historyItems, search]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable style={styles.overlay} onPress={onClose} />

      <View style={styles.drawer}>
        {/* ================= SEARCH ================= */}
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Search chats"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* ================= NEW CHAT ================= */}
        <TouchableOpacity style={styles.newEntryButton} onPress={onNewEntry}>
          <Text style={styles.newEntryIcon}>＋</Text>
          <Text style={styles.newEntryText}>New chat</Text>
        </TouchableOpacity>

        {/* ================= HISTORY ================= */}
        <FlatList
          data={grouped}
          keyExtractor={g => g.dateLabel}
          contentContainerStyle={styles.historyContainer}
          renderItem={({ item }) => (
            <View style={styles.historySection}>
              <Text style={styles.historyDate}>{item.dateLabel}</Text>

              {item.items.map(h => (
                <TouchableOpacity
                  key={h.id}
                  style={styles.historyRow}
                  onPress={() => onSelectHistory(h)}
                >
                  <Text numberOfLines={1} style={styles.historyTitle}>
                    {h.title || 'Chat'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyHistoryText}>
              No chats yet. Start a new conversation.
            </Text>
          }
        />

        {/* ================= PROFILE ================= */}
        <TouchableOpacity style={styles.profileBar}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profileName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileSubtitle}>Timesheet workspace</Text>
          </View>

          <Text style={styles.profileChevron}>›</Text>
        </TouchableOpacity>

        {/* ================= LOGOUT ================= */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SideDrawer;
