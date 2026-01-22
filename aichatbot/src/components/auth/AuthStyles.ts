import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light background
    padding: 24,
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 28,
    color: '#111827', // Dark text
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 4,
  },
  authSubtitle: {
    color: '#6B7280', // Subtle gray text
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  authForm: {
    backgroundColor: '#FFFFFF', // No dark panel
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light border for definition
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Android shadow
  },
});
