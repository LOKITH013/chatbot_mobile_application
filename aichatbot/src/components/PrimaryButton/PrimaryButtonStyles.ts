import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  primaryButton: {
    backgroundColor: '#111827', // Dark button like ChatGPT input send icon
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 999, // Fully rounded pill shape
    alignItems: 'center',

    // Light shadow to match modern UI
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // Android shadow
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
