import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  inputLabel: {
    color: '#111827', // black label
    marginTop: 10,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9FAFB', // light background
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    color: '#111827',
    fontSize: 14,
  },
  signUpRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpPrompt: {
    color: '#6B7280',
    fontSize: 13,
  },
  linkText: {
    marginLeft: 4,
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '600',
  },
});
