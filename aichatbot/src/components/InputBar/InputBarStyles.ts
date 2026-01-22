import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',

    // Keeps it slightly above gesture bar
    paddingBottom: Platform.OS === 'android' ? 10 : 0,
  },


  chatInput: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    fontSize: 14,
    color: '#111827',
  },

  sendButton: {
    marginLeft: 8,
    backgroundColor: '#1E3A8A',
    padding: 12,
    borderRadius: 24,
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
