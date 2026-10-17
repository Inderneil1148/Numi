import { SecurityConfig } from '../types/security';

const SECURITY_STORAGE_KEY = 'numi_security_config';

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  isEnabled: false,
  pinHash: null,
  pinSalt: null,
  isBiometricsEnabled: false,
  webAuthnCredentialId: null,
  autoLockOnBackground: true,
};

/**
 * Computes SHA-256 hash of a 4-digit PIN combined with a unique salt
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${pin}:${salt}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback simple hash for older unsupported environments
    let hash = 0;
    const str = `${pin}:${salt}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `fb-${Math.abs(hash).toString(16)}`;
  }
}

/**
 * Generates a random cryptographic salt for PIN hashing
 */
export function generateSalt(): string {
  try {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

/**
 * Verifies if entered PIN matches the stored hash
 */
export async function verifyPin(
  pin: string,
  storedHash: string | null,
  salt: string | null
): Promise<boolean> {
  if (!storedHash || !salt) return false;
  const computedHash = await hashPin(pin, salt);
  return computedHash === storedHash;
}

/**
 * Checks whether the current device supports WebAuthn platform biometrics (Face ID, Touch ID, Windows Hello, Android Biometrics)
 */
export async function isBiometricsSupported(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.PublicKeyCredential) return false;
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') {
      return false;
    }
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Registers WebAuthn platform biometrics for quick biometric unlock
 */
export async function registerBiometrics(): Promise<string | null> {
  try {
    if (!navigator.credentials || !navigator.credentials.create) return null;

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    crypto.getRandomValues(userId);

    const hostname = window.location.hostname;
    const isValidRpId = hostname && !/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) && hostname !== '';

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'Numi Finance',
        id: isValidRpId ? hostname : undefined,
      },
      user: {
        id: userId,
        name: 'numi-user',
        displayName: 'Numi Finance User',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;

    if (credential && credential.id) {
      return credential.id;
    }
    return credential ? 'webauthn-device-key' : null;
  } catch (err) {
    console.warn('Biometric registration was cancelled or unsupported:', err);
    return null;
  }
}

/**
 * Prompts user for platform biometric verification (Face ID / Touch ID / Fingerprint)
 */
export async function verifyBiometrics(credentialId?: string | null): Promise<boolean> {
  try {
    if (!navigator.credentials || !navigator.credentials.get) return false;

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const hostname = window.location.hostname;
    const isValidRpId = hostname && !/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) && hostname !== '';

    let allowCredentialsList: PublicKeyCredentialDescriptor[] | undefined = undefined;
    if (credentialId && credentialId !== 'webauthn-device-key') {
      try {
        const binStr = atob(credentialId.replace(/_/g, '/').replace(/-/g, '+'));
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }
        allowCredentialsList = [
          {
            id: bytes,
            type: 'public-key',
            transports: ['internal'],
          },
        ];
      } catch (e) {
        console.warn('Could not parse credentialId, allowing discoverable:', e);
      }
    }

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      timeout: 60000,
      userVerification: 'preferred',
      rpId: isValidRpId ? hostname : undefined,
      allowCredentials: allowCredentialsList,
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    return !!assertion;
  } catch (err) {
    console.warn('Biometric verification cancelled or unavailable:', err);
    return false;
  }
}

/**
 * Loads current Security Configuration from localStorage
 */
export function loadSecurityConfig(): SecurityConfig {
  try {
    const raw = localStorage.getItem(SECURITY_STORAGE_KEY);
    if (!raw) return DEFAULT_SECURITY_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SECURITY_CONFIG,
      ...parsed,
    };
  } catch {
    return DEFAULT_SECURITY_CONFIG;
  }
}

/**
 * Saves Security Configuration to localStorage
 */
export function saveSecurityConfig(config: SecurityConfig): void {
  try {
    localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save security config:', err);
  }
}

/**
 * Resets / clears all security lock configurations
 */
export function clearSecurityConfig(): void {
  try {
    localStorage.removeItem(SECURITY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear security config:', err);
  }
}
