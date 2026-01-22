// components/Header/HeaderStyles.ts

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subtitleText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  rightSpacer: {
    width: 22, // same width as icon to keep title centered
  },
});

export default styles;
