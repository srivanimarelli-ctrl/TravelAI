import React, { useState } from 'react';
import { Sparkles, Check, X } from 'lucide-react';

interface InterestsPopoverProps {
  currentInterests?: string[];
  onSelectInterests: (interests: string[]) => void;
  onClose: () => void;
}

interface InterestItem {
  id: string;
  name: string;
  icon: string;
}

const AVAILABLE_INTERESTS: InterestItem[] = [
  { id: 'beaches', name: 'Beaches', icon: '🏖️' },
  { id: 'temples', name: 'Temples & Heritage', icon: '🛕' },
  { id: 'nature', name: 'Nature & Parks', icon: '🌿' },
  { id: 'food', name: 'Food & Gastronomy', icon: '🍽️' },
  { id: 'history', name: 'History & Museums', icon: '🏛️' },
  { id: 'adventure', name: 'Adventure & Sports', icon: '🧗' },
  { id: 'shopping', name: 'Shopping & Bazaars', icon: '🛍️' },
  { id: 'nightlife', name: 'Nightlife & Lounges', icon: '🍸' },
  { id: 'culture', name: 'Culture & Arts', icon: '🎭' },
  { id: 'wildlife', name: 'Wildlife & Safari', icon: '🦁' },
  { id: 'luxury', name: 'Luxury Leisure', icon: '💎' },
  { id: 'wellness', name: 'Wellness & Spa', icon: '🧘' },
];

export const InterestsPopover: React.FC<InterestsPopoverProps> = ({
  currentInterests = [],
  onSelectInterests,
  onClose,
}) => {
  // Normalize current interests to lowercase IDs
  const initialSelected = new Set(
    (currentInterests || []).map((i) => i.toLowerCase().trim())
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelected);

  const toggleInterest = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(AVAILABLE_INTERESTS.map((i) => i.id)));
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    // Map selected IDs to clean readable names
    const names = AVAILABLE_INTERESTS.filter((i) => selectedIds.has(i.id)).map((i) => i.name.split('&')[0].trim());
    onSelectInterests(names);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="Travel Interests Selector"
      className="w-80 sm:w-96 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-surface-container-high/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/40 mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-tertiary" />
          <span className="text-xs font-semibold text-on-surface">Travel Interests</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectedIds.size > 0 ? handleClearAll : handleSelectAll}
            className="text-[11px] text-tertiary hover:underline"
          >
            {selectedIds.size > 0 ? 'Clear all' : 'Select all'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Interests */}
      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 mb-3">
        {AVAILABLE_INTERESTS.map((item) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleInterest(item.id)}
              className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors text-left ${
                isSelected
                  ? 'bg-tertiary/15 text-tertiary border-tertiary/35 font-semibold shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-highest/60 text-on-surface border-surface-container-highest/60'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-tertiary shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Selected count banner */}
      <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-surface-container text-[11px] text-on-surface-variant flex items-center justify-between">
        <span>Selected</span>
        <span className="font-semibold text-on-surface">
          {selectedIds.size} of {AVAILABLE_INTERESTS.length} interests
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-highest/40">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="px-4 py-1.5 rounded-lg bg-tertiary text-on-tertiary text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-md"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Interests</span>
        </button>
      </div>
    </div>
  );
};
