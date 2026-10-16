import React, { useEffect, useState } from 'react';
import { NumiLogo } from './NumiLogo';

interface SplashPageProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashPage: React.FC<SplashPageProps> = ({
  onComplete,
  durationMs = 1800,
}) => {
  const [stage, setStage] = useState<'entering' | 'active' | 'exiting'>('entering');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage 1: Entrance transition
    const enterTimer = setTimeout(() => {
      setStage('active');
    }, 150);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(100, prev + 10);
      });
    }, durationMs / 12);

    // Stage 2: Trigger exit transition
    const exitTimer = setTimeout(() => {
      setStage('exiting');
    }, durationMs - 400);

    // Stage 3: Complete & unmount
    const finishTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(enterTimer);
      clearInterval(progressInterval);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onComplete]);

  const handleDismiss = () => {
    setStage('exiting');
    setTimeout(() => {
      onComplete();
    }, 280);
  };

  return (
    <aside
      aria-label="App Loading Splash Screen"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-400 ease-out ${
        stage === 'exiting'
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      } bg-[#F2F2F7] dark:bg-[#000000]`}
    >
      {/* Ambient decorative lime glow in center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className={`w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] rounded-full bg-[#9EE42A] blur-[110px] sm:blur-[140px] transition-opacity duration-700 ${
            stage === 'active' ? 'opacity-25 dark:opacity-20' : 'opacity-10'
          }`}
        />
        <div className="absolute w-[240px] h-[240px] rounded-full bg-[#007AFF] dark:bg-[#0A84FF] blur-[100px] opacity-10 dark:opacity-15 pointer-events-none" />
      </div>

      {/* Skip button in top corner for instant entry */}
      <div className="absolute top-6 right-6 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#86868B] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-white transition-all backdrop-blur-md"
        >
          Skip
        </button>
      </div>

      {/* Main Splash Logo & Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Animated App Icon Tile */}
        <div
          className={`transform transition-all duration-700 ease-out mb-5 ${
            stage === 'entering'
              ? 'opacity-0 scale-75 translate-y-4'
              : 'opacity-100 scale-100 translate-y-0'
          }`}
        >
          <div className="relative group">
            {/* Pulsing ring around icon */}
            <div className="absolute -inset-2 rounded-[32%] bg-[#9EE42A]/30 blur-md animate-pulse pointer-events-none" />
            <NumiLogo variant="icon" size={88} iconType="coin" />
          </div>
        </div>

        {/* Wordmark & Title with Staggered Entrance */}
        <div
          className={`transform transition-all duration-700 delay-100 ease-out ${
            stage === 'entering'
              ? 'opacity-0 translate-y-3'
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">
              Numi
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#9EE42A]/25 text-[#3F6212] dark:text-[#A3E635] rounded-md border border-[#9EE42A]/40">
              v2.0.0
            </span>
          </div>

          <p className="text-sm font-medium text-[#86868B] dark:text-[#8E8E93] tracking-tight">
            Minimal expense tracker
          </p>
        </div>

        {/* Animated Progress Indicator */}
        <div
          className={`w-36 mt-8 transform transition-all duration-500 delay-200 ${
            stage === 'entering' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="h-1 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#9EE42A] rounded-full transition-all duration-150 ease-out shadow-[0_0_8px_rgba(158,228,42,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] font-medium text-[#A1A1A6] dark:text-[#636366] mt-4 opacity-75">
          Tap anywhere to continue
        </p>
      </div>
    </aside>
  );
};
