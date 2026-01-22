// components/screen/MainScreen/MainScreenStyles.ts

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB', // modern light UI background
  },

  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },

  chatWrapper: {
    flex: 1,
    marginTop: 6,
  },

  // Floating history navigation button (optional)
  historyButton: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 8,
  },

  historyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  
});

export default styles;
