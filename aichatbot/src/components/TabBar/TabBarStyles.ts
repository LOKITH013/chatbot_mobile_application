// components/TabBar/TabBarStyles.ts

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // light gray pill
    borderRadius: 999,
    padding: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
});

export default styles;
