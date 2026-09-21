import React, { useState } from 'react';
import { Users, Plus, Minus, Check, X } from 'lucide-react';

interface TravelersPopoverProps {
  initialAdults?: number | null;
  initialChildren?: number | null;
  initialInfants?: number | null;
  initialGenericTravelers?: number | null;
  onSelectTravelers: (adults: number, children: number, infants: number) => void;
  onClose: () => void;
}

export const TravelersPopover: React.FC<TravelersPopoverProps> = ({
  initialAdults,
  initialChildren,
  initialInfants,
  initialGenericTravelers,
  onSelectTravelers,
  onClose,
}) => {
  // If no explicit adult count is available, default to generic count or 1
  const [adults, setAdults] = useState<number>(
    initialAdults !== null && initialAdults !== undefined
      ? initialAdults
      : (initialGenericTravelers && initialGenericTravelers > 0 ? initialGenericTravelers : 2)
  );
  const [children, setChildren] = useState<number>(initialChildren ?? 0);
  const [infants, setInfants] = useState<number>(initialInfants ?? 0);

  const totalPax = adults + children + infants;

  const handleConfirm = () => {
    onSelectTravelers(adults, children, infants);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="Travelers Selector"
      className="w-80 sm:w-88 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-surface-container-high/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/40 mb-3">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-on-surface">Who is traveling?</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Traveler Categories */}
      <div className="space-y-3 mb-3">
        {/* Adults */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface">Adults</div>
            <div className="text-[11px] text-on-surface-variant">Age 12+</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={adults <= 1}
              onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest/80 border border-surface-container-highest/60 text-on-surface flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-semibold text-on-surface">
              {adults}
            </span>
            <button
              type="button"
              disabled={adults >= 20}
              onClick={() => setAdults((prev) => Math.min(20, prev + 1))}
              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest/80 border border-surface-container-highest/60 text-on-surface flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface">Children</div>
            <div className="text-[11px] text-on-surface-variant">Age 2–11</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={children <= 0}
              onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest/80 border border-surface-container-highest/60 text-on-surface flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-semibold text-on-surface">
              {children}
            </span>
            <button
              type="button"
              disabled={children >= 10}
              onClick={() => setChildren((prev) => Math.min(10, prev + 1))}
              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest/80 border border-surface-container-highest/60 text-on-surface flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-on-surface">Infants</div>
            <div className="text-[11px] text-on-surface-variant">Under 2</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={infants <= 0}
              onClick={() => setInfants((prev) => Math.max(0, prev - 1))}
              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest/80 border border-surface-container-highest/60 text-on-surface flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-semibold text-on-surface">
              {infants}
            </span>
            <button
              type="button"
              disabled={infants >= 6}
              onClick={() => setInfants((prev) => Math.min(6, prev + 1))}
              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest/80 border border-surface-container-highest/60 text-on-surface flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="mb-3 px-3 py-1.5 rounded-lg bg-surface-container text-[11px] text-on-surface-variant flex items-center justify-between">
        <span>Total Travelers</span>
        <span className="font-semibold text-on-surface">
          {totalPax} {totalPax === 1 ? 'Traveler' : 'Travelers'}
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
          className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-md"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply</span>
        </button>
      </div>
    </div>
  );
};
