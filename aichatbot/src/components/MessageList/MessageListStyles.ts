// components/MessageList/MessageListStyles.ts

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  messagesList: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCFCE7', // soft green
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: '#065F46',
  },
  assistantText: {
    color: '#111827',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },

  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  tableHeaderCell: {
    padding: 8,
    fontWeight: '700',
    minWidth: 100,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },

  tableRow: {
    flexDirection: 'row',
  },

  tableCell: {
    padding: 8,
    minWidth: 100,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  scrollDownButton: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 90,
  },
  tableWrapper: {
    maxHeight: 260,
  },
});

export default styles;
