import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '78%',
    backgroundColor: '#FFFFFF',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flex: 1,
  },

  searchWrapper: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: '#111827',
  },

  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  newEntryIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#111827',
  },
  newEntryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  historyContainer: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  historySection: {
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  historyRow: {
    paddingVertical: 6,
  },
  historyTitle: {
    fontSize: 14,
    color: '#111827',
  },
  emptyHistoryText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },

  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  profileSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  profileChevron: {
    fontSize: 22,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  logoutButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF5F5', // Light red background to make it visible
  },

  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
