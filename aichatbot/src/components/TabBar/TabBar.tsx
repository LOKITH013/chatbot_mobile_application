// components/TabBar/TabBar.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TabKey } from '../../types';
import styles from './TabBarStyles';

type Props = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
};

const TabBar: React.FC<Props> = ({ activeTab, onChangeTab }) => {
  const tabs: { key: TabKey; label: string }[] = [
    { key: 'entryView', label: 'ENTRY & VIEW' },
    { key: 'history', label: 'HISTORY' },
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            activeTab === tab.key && styles.tabButtonActive,
          ]}
          onPress={() => onChangeTab(tab.key)}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === tab.key && styles.tabButtonTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabBar;
