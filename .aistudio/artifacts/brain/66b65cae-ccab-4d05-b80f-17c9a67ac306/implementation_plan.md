# Web Authentication API (Face ID / Touch ID) in SecurityLockGuard

Seamlessly integrate the standard Web Authentication API (`navigator.credentials`) into the `SecurityLockGuard` component, delivering instant Apple Face ID, Touch ID, Windows Hello, and Android Biometric unlock alongside the existing 4-digit PIN security system.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and interaction decisions were confirmed during the interactive clarification interview and govern the implementation of the biometric layer:

- **Confirmed Decision 1 (Auto-Prompt on Lock Screen Opening)**: Whenever the lock screen appears (cold app launch, return from background, or manual lock), `SecurityLockGuard` will **automatically prompt for Face ID / Touch ID** after a brief 300ms transition buffer so users can unlock in under a second without an extra tap.
- **Confirmed Decision 2 (Post-PIN Biometric Enablement Sheet)**: Immediately upon completing 4-digit PIN setup or passcode change, if the current device supports platform authenticators (`isUserVerifyingPlatformAuthenticatorAvailable()`), the app will **automatically offer to enable Face ID / Touch ID**, linking the device's biometric credential in one tap.
- **Confirmed Decision 3 (Graceful Fallback to 4-Digit PIN)**: If the user cancels the biometric prompt or biometric recognition fails, the interface **seamlessly falls back to the tactile 4-digit numeric keypad** without locking out the user, while preserving a dedicated biometric retry button on the keypad.

---

## 1. Overview & Core Concept

### What It Does
Enhances the Numi privacy barrier with native hardware-level authentication. Users enjoy the speed and convenience of hardware biometric recognition (Face ID, Touch ID, Android Fingerprint, Windows Hello) while retaining a reliable 4-digit salted SHA-256 PIN as the primary authority and fallback.

### Target Audience & Persona
Mobile and desktop users managing personal ledgers and account balances who desire frictionless instant access when opening their device without exposing financial data in shared spaces.

### Key Value Delivered
- **Sub-Second Access**: Unlocks in $\le 800\text{ms}$ via native platform biometrics.
- **Zero-Friction Onboarding**: Automated prompt after PIN creation pairs biometrics without digging through settings.
- **Resilient Fallback**: Cancellations, failures, or glove/mask scenarios smoothly transition to the 4-digit PIN.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Flow A: Automated Unlock with Face ID / Touch ID
1. **App Resume / Cold Launch**: The app opens or resumes from background with the frosted privacy curtain (`z-[150]`, `backdrop-blur-3xl bg-black/90 dark:bg-black/95 text-white`).
2. **Auto-Trigger**: A subtle pulsing biometric glow (`#9EE42A`) signals authentication, and the browser invokes `navigator.credentials.get({ ... })`.
3. **Biometric Success**: Haptic success feedback (`success()`) plays, the lock curtain smoothly dissolves (`opacity-0 scale-102 transition-all duration-300`), and the ledger dashboard is revealed.
4. **Biometric Dismiss / Fail**: If dismissed or unrecognized, the prompt quietly closes, keeping the tactile 3x4 numeric keypad ready for immediate PIN entry. The dedicated biometric icon button on the bottom left allows re-prompting at any time.

#### Flow B: PIN Creation & Automatic Biometric Enablement
1. **Set Passcode**: In Settings, the user taps **"Passcode Lock"** and enters a 4-digit PIN followed by confirmation.
2. **Post-Setup Biometric Modal**: If `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` resolves to true and biometrics are not yet active:
   - A clean sheet displays: *"Enable Face ID / Touch ID for instant unlock?"*
   - Tapping **"Enable Biometrics"** calls `navigator.credentials.create({ ... })`.
   - On success, `webAuthnCredentialId` is stored in the security configuration with a success toast.
   - Tapping **"Maybe Later"** keeps PIN-only lock active.

#### Flow C: Manual Settings Governance & Testing
1. In `SettingsModal.tsx`, the **"Security & App Lock"** section displays:
   - **Passcode Lock**: Master switch for app locking.
   - **Face ID / Touch ID**: Toggle to register new credentials or remove biometrics.
   - **Lock on Background**: Toggle for immediate lock on multitasking switch.
   - **Lock Screen Now**: Instant button allowing the user to immediately test biometric and PIN unlock.

### Visual Identity & Theme
- **Surface Elevation**: Deep frosted glass scrim (`backdrop-blur-3xl bg-black/90 dark:bg-black/95 text-white`) with high-contrast text for ambient readability.
- **Biometric Button**: Circular button (`w-16 h-16 rounded-full bg-[#9EE42A]/20 text-[#9EE42A] border border-[#9EE42A]/30 active:scale-95`) embedded seamlessly in the bottom-left slot of the 3x4 keypad.
- **Status Indicator**: Dynamic status subtext beneath the title communicating current state (*"Scan Face ID or Touch ID"*, *"Verifying biometrics..."*, *"Enter 4-digit passcode"*).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Platform Authenticator Attachment (`platform`)
- **Chosen Approach**: Configure `authenticatorAttachment: 'platform'` and `userVerification: 'preferred'` in WebAuthn options.
- **Why**: Directly targets device-native biometrics (Apple Secure Enclave, Android Keystore, Windows Hello) rather than external FIDO USB hardware keys.

### Decision 2: Fallback Credential Discovery vs. Strict ID Binding
- **Chosen Approach**: When verifying, allow passing `credentialId` if properly encoded, with automatic fallback to discoverable resident keys or general platform assertion if ID decoding fails.
- **Why**: Prevents authentication exceptions if hostnames change or cross-origin iframe storage isolates credentials.

### Decision 3: Single Master PIN Authority
- **Chosen Approach**: WebAuthn serves as a convenience accelerator; the salted SHA-256 PIN remains the primary credential. Recovery and reset flows always allow re-authenticating with Google account or biometrics.
- **Why**: Ensures users are never permanently locked out if a browser update or device biometrics change.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│      State: isAppLocked, securityConfig, securityModalMode             │
└───────────────┬───────────────────────────┬────────────────────────────┘
                │                           │
  ┌─────────────▼─────────────┐ ┌───────────▼─────────────┐ ┌────────────▼────────────┐
  │   SecurityLockGuard.tsx   │ │   SettingsModal.tsx     │ │     WebAuthn Helper     │
  ├───────────────────────────┤ ├─────────────────────────┤ ├─────────────────────────┤
  │ • Auto-trigger biometric  │ │ • Toggle Passcode Lock  │ │ • isBiometricsSupported │
  │ • Biometric retry button  │ │ • Toggle Face/Touch ID  │ │ • registerBiometrics()  │
  │ • Post-setup prompt sheet │ │ • Lock on Background    │ │ • verifyBiometrics()    │
  │ • Tactile 3x4 PIN keypad  │ │ • Lock Screen Now test  │ └─────────────────────────┘
  │ • Recovery with Google    │ └─────────────────────────┘
  └─────────────┬─────────────┘
                │
  ┌─────────────▼─────────────────────────────────────────┐
  │               Storage & Crypto Service                │
  ├───────────────────────────────────────────────────────┤
  │ • hashPin(pin, salt) via crypto.subtle.digest         │
  │ • verifyPin(enteredPin, storedHash, salt)             │
  │ • saveSecurityConfig() / loadSecurityConfig()         │
  └───────────────────────────────────────────────────────┘
```

### Security Configuration Schema

```typescript
export interface SecurityConfig {
  isEnabled: boolean;
  pinHash: string | null;
  pinSalt: string | null;
  isBiometricsEnabled: boolean;
  webAuthnCredentialId: string | null;
  autoLockOnBackground: boolean;
}
```

### Interactive State Transitions

1. **Mount in Unlock Mode**:
   - `useEffect` checks `config.isBiometricsEnabled` $\rightarrow$ if true, sets status to *"Scanning Face ID / Touch ID..."* and invokes `verifyBiometrics()`.
   - On assertion resolution: triggers `success()` haptics, sets status to *"Unlocked"*, and executes `onSuccess()`.
   - On cancellation/error: resets status to default subtitle and leaves keypad ready for PIN input.
2. **Keypad Digit Press**:
   - Updates `pin` state with acoustic/haptic feedback.
   - At length 4: checks `verifyPin(pin, config.pinHash, config.pinSalt)`.
   - On match: triggers `success()` and calls `onSuccess()`.
   - On mismatch: triggers `animate-shake`, `warning()` haptics, clears digits, and shows *"Incorrect passcode. Try again."*
3. **Setup Completion Flow**:
   - When 4-digit PIN is confirmed in `mode="setup"`, if biometrics are supported and not enabled, shows the inline prompt: *"Enable Face ID / Touch ID for faster unlock?"*
   - Clicking *"Enable"* calls `registerBiometrics()` and saves credential ID.
   - Seamlessly returns to app with active security.
