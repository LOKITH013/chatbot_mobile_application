import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  inputLabel: {
    color: '#111827', // near-black
    marginTop: 10,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
  },

  input: {
    backgroundColor: '#F9FAFB', // light input background
    borderWidth: 1,
    borderColor: '#E5E7EB', // soft border
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    color: '#111827',
    fontSize: 14,
  },

  errorText: {
    color: '#DC2626', // red for errors
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },

  infoText: {
    color: '#059669', // success green
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },

  // row with "Save password" + "Forgot password?"
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB', // light gray border
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#FFFFFF',
  },

  checkboxBoxChecked: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  checkboxLabel: {
    color: '#111827',
    fontSize: 13,
  },

  forgotText: {
    color: '#2563EB', // blue link text
    fontSize: 13,
    fontWeight: '500',
  },

  // reset password section
  resetContainer: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  resetLabel: {
    color: '#111827',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
  },

  resetButton: {
    backgroundColor: '#111827',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },

  resetInfo: {
    color: '#6B7280',
    marginTop: 6,
    fontSize: 12,
  },

  // existing sign-up row
  signUpRow: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  signUpPrompt: {
    color: '#6B7280',
    marginRight: 4,
    fontSize: 13,
  },

  linkText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
  },
});
