/**
 * Callback fired when the session is invalid and refresh token failed.
 * Used by the API layer to trigger redirect to Login without importing navigation.
 */
let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(callback: (() => void) | null): void {
  onSessionExpired = callback;
}

export function triggerSessionExpired(): void {
  if (typeof onSessionExpired === 'function') {
    onSessionExpired();
  }
}
