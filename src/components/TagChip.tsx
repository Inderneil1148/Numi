import React from 'react';
import { X } from 'lucide-react';

interface TagChipProps {
  name: string;
  color?: string;
  onRemove?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
  size?: 'sm' | 'md';
  interactive?: boolean;
}

export const TagChip: React.FC<TagChipProps> = ({
  name,
  color,
  onRemove,
  onClick,
  isSelected = false,
  size = 'md',
  interactive = false,
}) => {
  const isSmall = size === 'sm';

  const baseClasses = `inline-flex items-center gap-1.5 font-medium transition-all duration-150 select-none ${
    isSmall
      ? 'text-[11px] px-2 py-0.5 rounded-full'
      : 'text-xs px-3 py-1 rounded-full min-h-[28px]'
  } ${
    interactive || onClick ? 'cursor-pointer active:scale-95' : ''
  }`;

  const styleClasses = isSelected
    ? 'bg-[#1D1D1F] text-white shadow-xs dark:bg-white dark:text-black'
    : 'bg-[#E5E5EA]/80 text-[#1D1D1F] hover:bg-[#D1D1D6] dark:bg-[#2C2C2E] dark:text-[#F5F5F7] dark:hover:bg-[#3A3A3C]';

  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${baseClasses} ${styleClasses}`}
    >
      {color && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: isSelected ? '#FFFFFF' : color }}
        />
      )}
      <span className="tracking-tight">#{name}</span>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`ml-0.5 p-0.5 rounded-full transition-colors ${
            isSelected
              ? 'hover:bg-white/20 text-white'
              : 'hover:bg-black/10 text-[#8E8E93]'
          }`}
          aria-label={`Remove tag ${name}`}
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
};
