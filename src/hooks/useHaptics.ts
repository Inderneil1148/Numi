import { useCallback, useRef } from 'react';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

// Standard Android Haptic Vibration effects (aligned with Android VibrationEffect constants in ms)
const VIBRATION_PATTERNS: Record<HapticType, number | number[]> = {
  selection: 6,                 // Android EFFECT_TICK (quick micro-pulse)
  light: 10,                    // Android EFFECT_CLICK (standard tactile click)
  medium: 18,                   // Android EFFECT_HEAVY_CLICK (firm tap)
  heavy: 28,                    // Android EFFECT_DOUBLE_CLICK segment
  success: [12, 40, 20],        // Android confirmation feedback
  warning: [20, 50, 25],        // Android warning pulse
  error: [30, 40, 30, 40, 35],  // Android reject / error burst
};

/**
 * Custom hook to trigger tactile vibration feedback on Android & touch devices.
 * Uses the Web Vibration API (`navigator.vibrate`) with Android-calibrated patterns,
 * and provides subtle acoustic micro-clicks via Web Audio API as a fallback.
 */
export function useHaptics() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Lazy initialize Web Audio context on user gesture
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          audioCtxRef.current = new AudioCtx();
        } catch {
          audioCtxRef.current = null;
        }
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Subtle acoustic micro-click (Android system tap feedback simulation)
  const playTactileAudioFeedback = useCallback((frequency: number, durationMs: number, gainValue = 0.035) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + durationMs / 1000);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio feedback failed or blocked, ignore silently
    }
  }, [getAudioContext]);

  // Main vibration trigger
  const trigger = useCallback((type: HapticType = 'light') => {
    // 1. Hardware physical vibration via Web Vibration API
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      try {
        const pattern = VIBRATION_PATTERNS[type] || 10;
        navigator.vibrate(pattern);
      } catch {
        // Silently catch any platform vibration restrictions
      }
    }

    // 2. High-precision tactile acoustic micro-tick for Android confirmation
    if (type === 'selection') {
      playTactileAudioFeedback(200, 6, 0.02);
    } else if (type === 'light') {
      playTactileAudioFeedback(170, 10, 0.03);
    } else if (type === 'medium') {
      playTactileAudioFeedback(140, 15, 0.04);
    } else if (type === 'heavy') {
      playTactileAudioFeedback(110, 22, 0.06);
    } else if (type === 'success') {
      playTactileAudioFeedback(190, 12, 0.04);
      setTimeout(() => playTactileAudioFeedback(260, 18, 0.05), 65);
    } else if (type === 'warning' || type === 'error') {
      playTactileAudioFeedback(95, 20, 0.05);
      setTimeout(() => playTactileAudioFeedback(85, 25, 0.06), 70);
    }
  }, [playTactileAudioFeedback]);

  // Convenience helper methods
  const tap = useCallback((style: HapticType = 'light') => trigger(style), [trigger]);
  const selection = useCallback(() => trigger('selection'), [trigger]);
  const success = useCallback(() => trigger('success'), [trigger]);
  const warning = useCallback(() => trigger('warning'), [trigger]);
  const error = useCallback(() => trigger('error'), [trigger]);

  const isVibrationSupported = typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function';

  return {
    trigger,
    tap,
    selection,
    success,
    warning,
    error,
    isVibrationSupported,
  };
}
