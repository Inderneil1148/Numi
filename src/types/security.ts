export interface SecurityConfig {
  isEnabled: boolean;
  pinHash: string | null;
  pinSalt: string | null;
  isBiometricsEnabled: boolean;
  webAuthnCredentialId: string | null;
  autoLockOnBackground: boolean;
}

export type SecurityMode = 'unlock' | 'setup' | 'confirm' | 'change';
