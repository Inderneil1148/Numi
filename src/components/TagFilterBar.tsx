import React from 'react';
import { CustomTag } from '../types/finance';
import { Plus, X } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

interface TagFilterBarProps {
  tags: CustomTag[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onOpenTagManager: () => void;
  tagCounts: Record<string, number>;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({
  tags,
  selectedTag,
  onSelectTag,
  onOpenTagManager,
  tagCounts,
}) => {
  const { tap, selection } = useHaptics();

  const handleTagClick = (tag: string | null) => {
    selection();
    onSelectTag(tag);
  };

  const handleManageClick = () => {
    tap('light');
    onOpenTagManager();
  };

  return (
    <div className="w-full flex items-center gap-2 py-1 overflow-x-auto no-scrollbar scroll-smooth">
      <button
        type="button"
        onClick={() => handleTagClick(null)}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-full shrink-0 transition-all min-h-[32px] flex items-center gap-1.5 active:scale-95 cursor-pointer ${
          selectedTag === null
            ? 'bg-[#007AFF] text-white shadow-xs dark:bg-[#0A84FF]'
            : 'bg-white text-[#444746] border border-[#C4C7C5] hover:bg-[#F0F4F9] dark:bg-[#1C1C1E] dark:text-[#8E8E93] dark:border-white/[0.1] dark:hover:bg-[#2C2C2E] dark:hover:text-white'
        }`}
      >
        <span>All</span>
      </button>

      {tags.map((tag) => {
        const isSelected = selectedTag === tag.name;
        const count = tagCounts[tag.name] || 0;

        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => handleTagClick(isSelected ? null : tag.name)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full shrink-0 transition-all min-h-[32px] flex items-center gap-1.5 active:scale-95 cursor-pointer ${
              isSelected
                ? 'bg-[#1D1D1F] text-white shadow-xs font-semibold dark:bg-white dark:text-black'
                : 'bg-white text-[#1F1F1F] border border-[#C4C7C5] hover:bg-[#F0F4F9] dark:bg-[#1C1C1E] dark:text-[#F5F5F7] dark:border-white/[0.1] dark:hover:bg-[#2C2C2E]'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: isSelected ? (undefined) : tag.color }}
            />
            <span className="tracking-tight">#{tag.name}</span>
            {count > 0 && (
              <span
                className={`text-[11px] tabular-nums font-semibold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-[#E0E2EC] text-[#444746] dark:bg-[#2C2C2E] dark:text-[#8E8E93]'
                }`}
              >
                {count}
              </span>
            )}
            {isSelected && <X size={12} strokeWidth={2.5} className="ml-0.5 opacity-80" />}
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleManageClick}
        className="px-3 py-1.5 text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-white hover:bg-[#E8F0FE] dark:bg-[#1C1C1E] dark:hover:bg-[#2C2C2E] border border-[#007AFF]/40 dark:border-[#0A84FF]/40 rounded-full shrink-0 transition-colors min-h-[32px] flex items-center gap-1 active:scale-95 cursor-pointer"
        title="Manage Custom Tags"
      >
        <Plus size={13} strokeWidth={2.5} />
        <span className="whitespace-nowrap">Edit Tags</span>
      </button>
    </div>
  );
};
