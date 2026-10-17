import React, { useState, useEffect, useCallback } from 'react';
import { SecurityConfig, SecurityMode } from '../types/security';
import { verifyPin, verifyBiometrics, isBiometricsSupported, registerBiometrics } from '../utils/security';
import { NumiLogo } from './NumiLogo';
import { Lock, Delete, Fingerprint, ShieldAlert, KeyRound, Check, X, Sparkles } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';
import { useAuth } from '../context/AuthContext';

interface SecurityLockGuardProps {
  mode?: SecurityMode;
  config: SecurityConfig;
  onSuccess: () => void;
  onCancel?: () => void;
  onSetupComplete?: (newPin: string, enableBiometrics?: boolean, credentialId?: string | null) => void;
  onForgotPin?: () => void;
}

export const SecurityLockGuard: React.FC<SecurityLockGuardProps> = ({
  mode = 'unlock',
  config,
  onSuccess,
  onCancel,
  onSetupComplete,
  onForgotPin,
}) => {
  const { tap, success, warning } = useHaptics();
  const { currentUser, signInWithGoogle } = useAuth();

  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [currentStep, setCurrentStep] = useState<'enter' | 'confirm'>(
    mode === 'setup' ? 'enter' : 'enter'
  );
  const [isShaking, setIsShaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isVerifyingBiometrics, setIsVerifyingBiometrics] = useState(false);
  const [supportsBiometrics, setSupportsBiometrics] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // Post-PIN setup biometric prompt sheet state
  const [showBiometricSetupPrompt, setShowBiometricSetupPrompt] = useState(false);
  const [confirmedPin, setConfirmedPin] = useState('');
  const [isRegisteringBiometrics, setIsRegisteringBiometrics] = useState(false);

  // Check biometric support
  useEffect(() => {
    isBiometricsSupported().then((supported) => {
      setSupportsBiometrics(supported);
    });
  }, []);

  // Trigger biometric unlock automatically on initial mount if enabled in unlock mode
  const triggerBiometricUnlock = useCallback(async () => {
    if (mode !== 'unlock' || !config.isBiometricsEnabled) return;
    setIsVerifyingBiometrics(true);
    setStatusMessage('Scanning Face ID / Touch ID...');
    try {
      const ok = await verifyBiometrics(config.webAuthnCredentialId);
      if (ok) {
        setStatusMessage('Unlocked ✓');
        success();
        setTimeout(() => {
          onSuccess();
        }, 120);
      } else {
        // Seamless fallback to 4-digit PIN keypad
        setStatusMessage('Enter your 4-digit passcode');
      }
    } catch {
      // Biometric dismissed or failed; user can use PIN seamlessly
      setStatusMessage('Enter your 4-digit passcode');
    } finally {
      setIsVerifyingBiometrics(false);
    }
  }, [mode, config.isBiometricsEnabled, config.webAuthnCredentialId, onSuccess, success]);

  useEffect(() => {
    if (mode === 'unlock' && config.isBiometricsEnabled) {
      const timer = setTimeout(() => {
        triggerBiometricUnlock();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [mode, config.isBiometricsEnabled, triggerBiometricUnlock]);

  const triggerErrorShake = (message: string) => {
    warning();
    setIsShaking(true);
    setStatusMessage(message);
    setTimeout(() => {
      setPin('');
      setIsShaking(false);
    }, 600);
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length >= 4) return;
    tap('light');
    const newPin = pin + digit;
    setPin(newPin);
    setStatusMessage('');

    if (newPin.length === 4) {
      processCompletedPin(newPin);
    }
  };

  const handleDelete = () => {
    tap('light');
    setPin((prev) => prev.slice(0, -1));
    setStatusMessage('');
  };

  const processCompletedPin = async (completedPin: string) => {
    if (mode === 'unlock') {
      const isValid = await verifyPin(completedPin, config.pinHash, config.pinSalt);
      if (isValid) {
        success();
        onSuccess();
      } else {
        triggerErrorShake('Incorrect passcode. Try again.');
      }
    } else if (mode === 'setup' || mode === 'change') {
      if (currentStep === 'enter') {
        tap('medium');
        setFirstPin(completedPin);
        setCurrentStep('confirm');
        setPin('');
        setStatusMessage('Re-enter passcode to confirm');
      } else {
        // Confirm step
        if (completedPin === firstPin) {
          success();
          if (supportsBiometrics && !config.isBiometricsEnabled) {
            // Offer to enable Face ID / Touch ID immediately after PIN setup
            setConfirmedPin(completedPin);
            setShowBiometricSetupPrompt(true);
          } else {
            if (onSetupComplete) {
              onSetupComplete(completedPin, config.isBiometricsEnabled, config.webAuthnCredentialId);
            }
          }
        } else {
          triggerErrorShake('Passcodes do not match. Start over.');
          setTimeout(() => {
            setCurrentStep('enter');
            setFirstPin('');
          }, 650);
        }
      }
    }
  };

  // Post-PIN setup: user accepts biometric enablement
  const handleEnableBiometricsPostSetup = async () => {
    setIsRegisteringBiometrics(true);
    try {
      const credId = await registerBiometrics();
      setIsRegisteringBiometrics(false);
      setShowBiometricSetupPrompt(false);
      if (credId) {
        success();
        onSetupComplete?.(confirmedPin, true, credId);
      } else {
        warning();
        onSetupComplete?.(confirmedPin, false, null);
      }
    } catch (err) {
      console.warn('Biometric registration error:', err);
      setIsRegisteringBiometrics(false);
      setShowBiometricSetupPrompt(false);
      onSetupComplete?.(confirmedPin, false, null);
    }
  };

  // Post-PIN setup: user skips biometric enablement
  const handleSkipBiometricsPostSetup = () => {
    tap('light');
    setShowBiometricSetupPrompt(false);
    onSetupComplete?.(confirmedPin, false, null);
  };

  // Keyboard listener for physical number keys on desktop/laptop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, currentStep, firstPin, mode]);

  // Google Account Recovery Flow
  const handleGoogleRecovery = async () => {
    setIsRecovering(true);
    try {
      const ok = await signInWithGoogle();
      if (ok) {
        success();
        setShowRecoveryModal(false);
        if (onForgotPin) {
          onForgotPin();
        } else {
          onSuccess();
        }
      }
    } catch (err) {
      console.warn('Google recovery error:', err);
    } finally {
      setIsRecovering(false);
    }
  };

  // Biometric Recovery Flow
  const handleBiometricRecovery = async () => {
    setIsRecovering(true);
    try {
      const ok = await verifyBiometrics(config.webAuthnCredentialId);
      if (ok) {
        success();
        setShowRecoveryModal(false);
        if (onForgotPin) {
          onForgotPin();
        } else {
          onSuccess();
        }
      } else {
        warning();
      }
    } catch (err) {
      console.warn('Biometric recovery error:', err);
    } finally {
      setIsRecovering(false);
    }
  };

  const getTitle = () => {
    if (isVerifyingBiometrics) return 'Biometric Verification';
    if (mode === 'unlock') return 'Numi is Locked';
    if (currentStep === 'confirm') return 'Confirm Passcode';
    if (mode === 'change') return 'New Passcode';
    return 'Set 4-Digit Passcode';
  };

  const getSubtitle = () => {
    if (statusMessage) return statusMessage;
    if (isVerifyingBiometrics) return 'Scan Face ID or Touch ID to unlock';
    if (mode === 'unlock') {
      return config.isBiometricsEnabled
        ? 'Scan Face ID / Touch ID or enter 4-digit passcode'
        : 'Enter your 4-digit passcode to access financial data';
    }
    if (currentStep === 'confirm') return 'Enter the same 4-digit passcode again';
    return 'Create a PIN to protect your accounts and transactions';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Security Authentication Guard"
      className="fixed inset-0 z-[150] flex flex-col items-center justify-between p-6 sm:p-8 bg-black/90 dark:bg-black/95 backdrop-blur-3xl text-white select-none animate-in fade-in duration-200"
    >
      {/* Top Bar with Cancel (only in setup/change modes) */}
      <div className="w-full max-w-sm flex items-center justify-between min-h-[40px]">
        {onCancel && mode !== 'unlock' && (
          <button
            type="button"
            onClick={() => {
              tap('light');
              onCancel();
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Center Hero & Keypad Container */}
      <div className="w-full max-w-sm flex flex-col items-center text-center my-auto space-y-6">
        {/* Numi Logo with Lock Badge */}
        <div className="relative">
          <div className="w-16 h-16 rounded-[24%] bg-gradient-to-b from-[#2A2B30] to-[#121316] p-1 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-white/15">
            <NumiLogo variant="icon" size={54} iconType="coin" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#9EE42A] text-black flex items-center justify-center shadow-md">
            <Lock size={12} strokeWidth={2.6} />
          </div>
        </div>

        {/* Title & Instructions */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {getTitle()}
          </h2>
          <p
            className={`text-xs max-w-xs transition-colors ${
              statusMessage.includes('Incorrect') || statusMessage.includes('not match')
                ? 'text-[#FF453A] font-semibold'
                : 'text-white/60 font-medium'
            }`}
          >
            {getSubtitle()}
          </p>
        </div>

        {/* 4 Pin Dot Indicators */}
        <div
          className={`flex items-center justify-center gap-4 py-2 transition-transform ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-[#9EE42A] border-[#9EE42A] shadow-[0_0_12px_rgba(158,228,42,0.7)] scale-110'
                    : 'bg-transparent border-2 border-white/30'
                }`}
              />
            );
          })}
        </div>

        {/* Tactile Circular Keypad (3 x 4 grid) */}
        <div className="w-full max-w-[280px] grid grid-cols-3 gap-y-3.5 gap-x-4 pt-2">
          {/* Digits 1 to 9 */}
          {[
            { num: '1', letters: '' },
            { num: '2', letters: 'ABC' },
            { num: '3', letters: 'DEF' },
            { num: '4', letters: 'GHI' },
            { num: '5', letters: 'JKL' },
            { num: '6', letters: 'MNO' },
            { num: '7', letters: 'PQRS' },
            { num: '8', letters: 'TUV' },
            { num: '9', letters: 'WXYZ' },
          ].map((k) => (
            <button
              key={k.num}
              type="button"
              onClick={() => handleDigitPress(k.num)}
              className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-white/10 hover:bg-white/18 active:bg-white/28 border border-white/10 active:scale-92 transition-all flex flex-col items-center justify-center cursor-pointer shadow-xs focus:outline-none"
            >
              <span className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
                {k.num}
              </span>
              {k.letters && (
                <span className="text-[9px] font-bold text-white/50 tracking-wider leading-none mt-0.5">
                  {k.letters}
                </span>
              )}
            </button>
          ))}

          {/* Bottom Row: Biometrics (or blank), 0, Delete */}
          {/* Column 1: Biometric Button (if enabled & unlock mode) */}
          <div className="flex items-center justify-center">
            {mode === 'unlock' && config.isBiometricsEnabled ? (
              <button
                type="button"
                onClick={() => {
                  tap('light');
                  triggerBiometricUnlock();
                }}
                disabled={isVerifyingBiometrics}
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-92 ${
                  isVerifyingBiometrics
                    ? 'bg-[#9EE42A]/30 text-[#9EE42A] border-[#9EE42A] shadow-[0_0_18px_rgba(158,228,42,0.6)] animate-pulse'
                    : 'bg-[#9EE42A]/20 hover:bg-[#9EE42A]/30 text-[#9EE42A] border-[#9EE42A]/30'
                }`}
                title="Unlock with Biometrics (Face ID / Touch ID)"
                aria-label="Unlock with biometrics"
              >
                <Fingerprint size={26} strokeWidth={2.2} className={isVerifyingBiometrics ? 'animate-pulse' : ''} />
              </button>
            ) : (
              <div className="w-16 h-16 sm:w-18 sm:h-18" />
            )}
          </div>

          {/* Column 2: 0 */}
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full bg-white/10 hover:bg-white/18 active:bg-white/28 border border-white/10 active:scale-92 transition-all flex flex-col items-center justify-center cursor-pointer shadow-xs focus:outline-none"
          >
            <span className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-none">
              0
            </span>
          </button>

          {/* Column 3: Delete */}
          <div className="flex items-center justify-center">
            {pin.length > 0 ? (
              <button
                type="button"
                onClick={handleDelete}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full hover:bg-white/10 active:scale-92 text-white/70 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                title="Delete last digit"
                aria-label="Delete"
              >
                <Delete size={22} strokeWidth={2} />
              </button>
            ) : (
              <div className="w-16 h-16 sm:w-18 sm:h-18" />
            )}
          </div>
        </div>
      </div>

      {/* Footer / Forgot Passcode Link */}
      <div className="w-full max-w-sm flex flex-col items-center justify-center text-center pt-2">
        {mode === 'unlock' && (
          <button
            type="button"
            onClick={() => {
              tap('light');
              setShowRecoveryModal(true);
            }}
            className="text-xs text-white/50 hover:text-white hover:underline transition-colors cursor-pointer py-1.5"
          >
            Forgot Passcode?
          </button>
        )}
      </div>

      {/* Post-PIN Setup: Biometric Registration Prompt Sheet */}
      {showBiometricSetupPrompt && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1C1C1E] border border-white/15 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#9EE42A]/20 text-[#9EE42A] flex items-center justify-center shadow-[0_0_20px_rgba(158,228,42,0.3)] border border-[#9EE42A]/30">
              <Fingerprint size={28} strokeWidth={2.2} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                Enable Face ID / Touch ID?
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                Unlock Numi quickly with biometric authentication alongside your new 4-digit passcode.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleEnableBiometricsPostSetup}
                disabled={isRegisteringBiometrics}
                className="w-full py-3 px-4 rounded-2xl bg-[#9EE42A] hover:bg-[#8CD320] text-black font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                <Fingerprint size={16} />
                <span>{isRegisteringBiometrics ? 'Activating Biometrics...' : 'Enable Face ID / Touch ID'}</span>
              </button>

              <button
                type="button"
                onClick={handleSkipBiometricsPostSetup}
                disabled={isRegisteringBiometrics}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Account / Biometric Passcode Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1C1C1E] border border-white/15 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#007AFF]/20 text-[#0A84FF] flex items-center justify-center">
              <KeyRound size={22} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Passcode Recovery
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {currentUser
                  ? `Re-authenticate with your Google account (${currentUser.email}) to verify your identity and reset your lock.`
                  : 'Sign in with your Google account to confirm your identity and unlock your financial records safely.'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {config.isBiometricsEnabled && (
                <button
                  type="button"
                  onClick={handleBiometricRecovery}
                  disabled={isRecovering}
                  className="w-full py-3 px-4 rounded-2xl bg-[#9EE42A] hover:bg-[#8CD320] text-black font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all disabled:opacity-50"
                >
                  <Fingerprint size={16} />
                  <span>{isRecovering ? 'Verifying...' : 'Verify with Biometrics & Reset'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleGoogleRecovery}
                disabled={isRecovering}
                className="w-full py-3 px-4 rounded-2xl bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                <span>{isRecovering ? 'Verifying...' : 'Verify with Google & Reset PIN'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
