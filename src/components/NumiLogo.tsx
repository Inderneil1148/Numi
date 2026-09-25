import React from 'react';

export interface NumiLogoProps {
  /**
   * 'icon': Squircle app icon tile with coin or typography mark
   * 'typography': Vector typography mark only (adaptive or colored)
   * 'brand': App icon squircle paired with typography and optional subtitle
   */
  variant?: 'icon' | 'typography' | 'brand';
  iconType?: 'coin' | 'typography';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  textColor?: string;
  accentColor?: string;
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
}

export const NumiLogo: React.FC<NumiLogoProps> = ({
  variant = 'brand',
  iconType = 'coin',
  size = 'md',
  textColor,
  accentColor = '#9EE42A',
  className = '',
  showSubtitle = true,
  subtitle = 'Minimal Expense & Tag Tracker',
}) => {
  // Determine pixel sizes
  const getIconSize = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs':
        return 26;
      case 'sm':
        return 34;
      case 'md':
        return 40;
      case 'lg':
        return 48;
      case 'xl':
        return 60;
      default:
        return 40;
    }
  };

  const iconPx = getIconSize();

  // Antique Silver Roman Coin Icon (Denarius of Augustus with beaded pearl rim, laurel wreath & lime dot)
  const renderCoinIcon = () => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
      aria-label="Numi Roman Coin"
    >
      <defs>
        <radialGradient id="numi-coin-metal" cx="36%" cy="34%" r="66%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#E2E4E8" />
          <stop offset="55%" stopColor="#B4B9C2" />
          <stop offset="85%" stopColor="#7A818E" />
          <stop offset="100%" stopColor="#4E5461" />
        </radialGradient>
        <radialGradient id="numi-inner-patina" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#1F242D" stopOpacity="0.45" />
        </radialGradient>
        <linearGradient id="numi-rim-hl" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#9CA3AF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#374151" stopOpacity="0.9" />
        </linearGradient>
        <filter id="numi-relief" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0.6" dy="1.0" stdDeviation="0.6" floodColor="#1E222A" floodOpacity="0.4" />
          <feDropShadow dx="-0.4" dy="-0.4" stdDeviation="0.3" floodColor="#FFFFFF" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Outer Coin Rim & Disc */}
      <circle cx="50" cy="50" r="47.5" fill="url(#numi-coin-metal)" stroke="url(#numi-rim-hl)" strokeWidth="1.8" />
      <circle cx="50" cy="50" r="47.5" fill="url(#numi-inner-patina)" />

      {/* Beaded Pearl Rim (Iconic feature of ancient Roman Denarius) */}
      <circle cx="50" cy="50" r="43.5" stroke="#404652" strokeWidth="1.4" strokeDasharray="1.4, 2.2" fill="none" opacity="0.75" />
      <circle cx="50" cy="50" r="42.3" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="1.4, 2.2" fill="none" opacity="0.85" />

      {/* Outer Inscription Dots/Text: IMP CAES - DIVI F AVG */}
      <g fill="#404652" opacity="0.72" fontFamily="sans-serif" fontSize="4.5" fontWeight="bold">
        <text x="11" y="46" transform="rotate(-50 11 46)">I</text>
        <text x="13" y="37" transform="rotate(-35 13 37)">M</text>
        <text x="17" y="29" transform="rotate(-20 17 29)">P</text>
        <text x="24" y="21" transform="rotate(-5 24 21)">·</text>
        <text x="28" y="18" transform="rotate(10 28 18)">C</text>
        <text x="34" y="16" transform="rotate(20 34 16)">A</text>
        <text x="40" y="15" transform="rotate(30 40 15)">E</text>
        <text x="46" y="15" transform="rotate(40 46 15)">S</text>
        <text x="73" y="22" transform="rotate(60 73 22)">D</text>
        <text x="78" y="28" transform="rotate(75 78 28)">I</text>
        <text x="82" y="35" transform="rotate(90 82 35)">V</text>
        <text x="84" y="43" transform="rotate(105 84 43)">I</text>
        <text x="82" y="58" transform="rotate(130 82 58)">A</text>
        <text x="78" y="66" transform="rotate(145 78 66)">V</text>
        <text x="72" y="73" transform="rotate(160 72 73)">G</text>
      </g>

      {/* Emperor Augustus Laureate Profile Relief */}
      <g filter="url(#numi-relief)">
        {/* Classical Profile: Head, Laurel Crown, Neck & Bust */}
        <path
          d="M51 22 c3.8 0 7.2 1.8 9.5 4.8 c1.2 1.6 3.5 3.2 4.8 4.2 c1.4 1 2.2 2.5 1.5 4.2 c-0.8 1.8-1.5 2.5-0.8 3.8 c0.8 1.5 2 2.8 1.2 4.5 c-0.8 1.5-2.8 2-3.8 2 c-1 1-1.5 2.5-2.2 4.2 c-1.2 2.8-1.8 5.8-3.8 8.2 c-2.8 3.5-7.5 6.2-12.8 7 c-2.5 0.4-5.2-0.2-7.2-1.2 c-1.5-0.8-1.8-2.5-0.8-3.8 c1.2-1.5 2.8-3 3.8-5 c1-2 1.2-4.5 0.5-7 c-1.2-3.5-3.8-5.8-4.5-9 c-1-4.2 0.2-8.8 2.8-12.5 c2.8-3.8 7-6.2 11.7-6.4 z"
          fill="#5A6270"
        />

        {/* Laurel Wreath Leaves (Corona Civica) */}
        <path d="M44 24.5 c2.5-2.5 6-2 8 0.5 c-2.5 2-6 1.5-8-0.5 z" fill="#E5E7EB" />
        <path d="M50 22.5 c2.8-2 6.5-1.2 8.2 1.2 c-2.5 2-6 1-8.2-1.2 z" fill="#E5E7EB" />
        <path d="M39 28.5 c2.5-2.5 6-1.5 7.8 0.8 c-2.2 2-6 1.2-7.8-0.8 z" fill="#E5E7EB" />
        <path d="M45 28 c2.2-2 5.8-1.2 7.5 1 c-2 2-5.5 1.2-7.5-1 z" fill="#E5E7EB" />
        <path d="M51 27.5 c2-1.8 5.2-1 6.8 1 c-1.8 1.8-4.8 1-6.8-1 z" fill="#E5E7EB" />

        {/* Laurel Ribbon Hanging at Nape with signature Lime Accent Dot */}
        <path d="M42 39 c-1.5 2.5-2.8 5.5-3.2 8.5 c-0.2 1.5-1.5 2-2.2 1.2 c-0.8-0.8-0.5-2.5 0.2-4 c1-2.5 2.5-4.8 4.2-6.5 z" fill="#7A818E" />
        <circle cx="63.5" cy="35.5" r="2.2" fill={accentColor} />
      </g>
    </svg>
  );

  // Pure Vector Typography Graphic: lime line with terminal dot (as tittle for i) + 'numi' letters
  const renderVectorTypography = (fillColor = '#FFFFFF', limeColor = accentColor) => (
    <svg
      viewBox="0 0 240 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
      aria-hidden="true"
    >
      {/* Signature Lime Horizontal Line & Terminal Dot (Serving as the dot of 'i') */}
      <line
        x1="12"
        y1="14"
        x2="208"
        y2="14"
        stroke={limeColor}
        strokeWidth="4.8"
        strokeLinecap="round"
      />
      <circle cx="208" cy="14" r="8" fill={limeColor} />

      {/* Typography: 'n' */}
      <path
        d="M12,26 h12 v4.8 c2.8-3.8 7.2-6 12.8-6 c9.6,0 16.4,6.4 16.4,17.2 V68 H41.6 V45.2 c0-4.8-3-7.6-7.4-7.6 c-4.6,0-7.8,3-7.8,7.6 V68 H12 Z"
        fill={fillColor}
      />

      {/* Typography: 'u' */}
      <path
        d="M62,26 h11.6 v23 c0,4.8 3.2,7.6 7.8,7.6 c4.4,0 7.4-2.8 7.4-7.6 V26 H100.4 V68 H88.8 v-4.8 c-2.8,3.8-7.2,6-12.8,6 c-9.6,0-16.4-6.4-16.4-17.2 V26 Z"
        fill={fillColor}
      />

      {/* Typography: 'm' */}
      <path
        d="M110,26 h11.6 v4.8 c2.6-3.8 6.8-6 12.2-6 c6.2,0 10.8,3 13.2,8 c2.8-5 7.6-8 13.8-8 c9,0 15.6,6.4 15.6,17.2 V68 H164.8 V45.2 c0-4.8-2.8-7.6-7-7.6 c-4.2,0-7.2,3-7.2,7.6 V68 H139 V45.2 c0-4.8-2.8-7.6-7-7.6 c-4.2,0-7.2,3-7.2,7.6 V68 H110 Z"
        fill={fillColor}
      />

      {/* Typography: 'i' stem (No dot here; the lime circle at the end of the line directly above is the dot) */}
      <rect x="202" y="26" width="12" height="42" rx="1.2" fill={fillColor} />
    </svg>
  );

  // App Icon Squircle Tile (Pitch Black / Graphite finish with authentic Roman Coin Icon)
  const renderAppIconTile = () => (
    <div
      style={{ width: iconPx, height: iconPx }}
      className="relative shrink-0 rounded-[24%] bg-gradient-to-b from-[#1E2026] to-[#0A0B0E] p-[7%] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.28)] border border-white/10 transition-all hover:scale-105 active:scale-95 group overflow-hidden"
      title="Numi - Minimal Expense & Tag Tracker (Denarius Coin)"
    >
      {/* Subtle top glare/bevel & ring */}
      <div className="absolute inset-0 rounded-[24%] ring-1 ring-white/15 pointer-events-none" />
      <div className="w-full h-full flex items-center justify-center">
        {iconType === 'coin'
          ? renderCoinIcon()
          : renderVectorTypography('#FFFFFF', accentColor)}
      </div>
    </div>
  );

  // Standalone Squircle App Icon
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {renderAppIconTile()}
      </div>
    );
  }

  // Pure Vector Typography (e.g., inline wordmark)
  if (variant === 'typography') {
    const defaultColor = textColor || '#1D1D1F';
    return (
      <div
        style={{
          width: typeof size === 'number' ? size : iconPx * 2.8,
          height: (typeof size === 'number' ? size : iconPx * 2.8) * (80 / 240),
        }}
        className={`inline-block ${className}`}
      >
        {renderVectorTypography(defaultColor, accentColor)}
      </div>
    );
  }

  // Brand Variant: App Icon Squircle Tile + Typography Brand Name & Optional Subtitle
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {renderAppIconTile()}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#1D1D1F] leading-none">
            Numi
          </span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#9EE42A]/20 text-[#3F6212] rounded-md border border-[#9EE42A]/30">
            Tracker
          </span>
        </div>
        {showSubtitle && subtitle && (
          <span className="text-[11px] font-medium text-[#86868B] truncate tracking-tight hidden lg:block leading-tight mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export const CoinIcon: React.FC<{
  size?: number;
  className?: string;
  accentColor?: string;
}> = ({ size = 32, className = '', accentColor = '#9EE42A' }) => {
  return (
    <div style={{ width: size, height: size }} className={`inline-block shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
        aria-label="Denarius Roman Coin"
      >
        <defs>
          <radialGradient id="ci-metal" cx="36%" cy="34%" r="66%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#E2E4E8" />
            <stop offset="55%" stopColor="#B4B9C2" />
            <stop offset="85%" stopColor="#7A818E" />
            <stop offset="100%" stopColor="#4E5461" />
          </radialGradient>
          <radialGradient id="ci-patina" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#1F242D" stopOpacity="0.45" />
          </radialGradient>
          <linearGradient id="ci-rim-hl" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#9CA3AF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#374151" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="47.5" fill="url(#ci-metal)" stroke="url(#ci-rim-hl)" strokeWidth="1.8" />
        <circle cx="50" cy="50" r="47.5" fill="url(#ci-patina)" />
        <circle cx="50" cy="50" r="43.5" stroke="#404652" strokeWidth="1.4" strokeDasharray="1.4, 2.2" fill="none" opacity="0.75" />
        <circle cx="50" cy="50" r="42.3" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="1.4, 2.2" fill="none" opacity="0.85" />

        <g fill="#404652" opacity="0.72" fontFamily="sans-serif" fontSize="4.5" fontWeight="bold">
          <text x="11" y="46" transform="rotate(-50 11 46)">I</text>
          <text x="13" y="37" transform="rotate(-35 13 37)">M</text>
          <text x="17" y="29" transform="rotate(-20 17 29)">P</text>
          <text x="24" y="21" transform="rotate(-5 24 21)">·</text>
          <text x="28" y="18" transform="rotate(10 28 18)">C</text>
          <text x="34" y="16" transform="rotate(20 34 16)">A</text>
          <text x="40" y="15" transform="rotate(30 40 15)">E</text>
          <text x="46" y="15" transform="rotate(40 46 15)">S</text>
          <text x="73" y="22" transform="rotate(60 73 22)">D</text>
          <text x="78" y="28" transform="rotate(75 78 28)">I</text>
          <text x="82" y="35" transform="rotate(90 82 35)">V</text>
          <text x="84" y="43" transform="rotate(105 84 43)">I</text>
          <text x="82" y="58" transform="rotate(130 82 58)">A</text>
          <text x="78" y="66" transform="rotate(145 78 66)">V</text>
          <text x="72" y="73" transform="rotate(160 72 73)">G</text>
        </g>

        <path
          d="M51 22 c3.8 0 7.2 1.8 9.5 4.8 c1.2 1.6 3.5 3.2 4.8 4.2 c1.4 1 2.2 2.5 1.5 4.2 c-0.8 1.8-1.5 2.5-0.8 3.8 c0.8 1.5 2 2.8 1.2 4.5 c-0.8 1.5-2.8 2-3.8 2 c-1 1-1.5 2.5-2.2 4.2 c-1.2 2.8-1.8 5.8-3.8 8.2 c-2.8 3.5-7.5 6.2-12.8 7 c-2.5 0.4-5.2-0.2-7.2-1.2 c-1.5-0.8-1.8-2.5-0.8-3.8 c1.2-1.5 2.8-3 3.8-5 c1-2 1.2-4.5 0.5-7 c-1.2-3.5-3.8-5.8-4.5-9 c-1-4.2 0.2-8.8 2.8-12.5 c2.8-3.8 7-6.2 11.7-6.4 z"
          fill="#5A6270"
        />
        <path d="M44 24.5 c2.5-2.5 6-2 8 0.5 c-2.5 2-6 1.5-8-0.5 z" fill="#E5E7EB" />
        <path d="M50 22.5 c2.8-2 6.5-1.2 8.2 1.2 c-2.5 2-6 1-8.2-1.2 z" fill="#E5E7EB" />
        <path d="M39 28.5 c2.5-2.5 6-1.5 7.8 0.8 c-2.2 2-6 1.2-7.8-0.8 z" fill="#E5E7EB" />
        <path d="M45 28 c2.2-2 5.8-1.2 7.5 1 c-2 2-5.5 1.2-7.5-1 z" fill="#E5E7EB" />
        <path d="M51 27.5 c2-1.8 5.2-1 6.8 1 c-1.8 1.8-4.8 1-6.8-1 z" fill="#E5E7EB" />
        <path d="M42 39 c-1.5 2.5-2.8 5.5-3.2 8.5 c-0.2 1.5-1.5 2-2.2 1.2 c-0.8-0.8-0.5-2.5 0.2-4 c1-2.5 2.5-4.8 4.2-6.5 z" fill="#7A818E" />
        <circle cx="63.5" cy="35.5" r="2.2" fill={accentColor} />
      </svg>
    </div>
  );
};
