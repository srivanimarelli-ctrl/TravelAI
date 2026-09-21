import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, X, Check, Globe, Navigation, ArrowRight } from 'lucide-react';

export interface WherePopoverProps {
  currentOrigin?: string;
  currentDestination?: string;
  onSelectWhere?: (where: { origin?: string; destination?: string }) => void;
  onSelectDestination?: (destination: string) => void;
  onClose: () => void;
}

interface CuratedDestination {
  city: string;
  country: string;
  region: string;
}

const POPULAR_ORIGINS = [
  'Hyderabad',
  'Mumbai',
  'New Delhi',
  'Bengaluru',
  'Chennai',
  'Kolkata',
];

const CURATED_DESTINATIONS: CuratedDestination[] = [
  { city: 'Goa', country: 'India', region: 'South Asia' },
  { city: 'Jaipur', country: 'India', region: 'South Asia' },
  { city: 'Kerala', country: 'India', region: 'South Asia' },
  { city: 'Ladakh', country: 'India', region: 'South Asia' },
  { city: 'Mumbai', country: 'India', region: 'South Asia' },
  { city: 'New Delhi', country: 'India', region: 'South Asia' },
  { city: 'Tokyo', country: 'Japan', region: 'East Asia' },
  { city: 'Kyoto', country: 'Japan', region: 'East Asia' },
  { city: 'Bali', country: 'Indonesia', region: 'Southeast Asia' },
  { city: 'Bangkok', country: 'Thailand', region: 'Southeast Asia' },
  { city: 'Singapore', country: 'Singapore', region: 'Southeast Asia' },
  { city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East' },
  { city: 'Paris', country: 'France', region: 'Europe' },
  { city: 'Rome', country: 'Italy', region: 'Europe' },
  { city: 'London', country: 'United Kingdom', region: 'Europe' },
  { city: 'Barcelona', country: 'Spain', region: 'Europe' },
  { city: 'Santorini', country: 'Greece', region: 'Europe' },
  { city: 'Swiss Alps', country: 'Switzerland', region: 'Europe' },
  { city: 'New York', country: 'United States', region: 'North America' },
  { city: 'San Francisco', country: 'United States', region: 'North America' },
  { city: 'Sydney', country: 'Australia', region: 'Oceania' },
  { city: 'Cape Town', country: 'South Africa', region: 'Africa' },
];

export const WherePopover: React.FC<WherePopoverProps> = ({
  currentOrigin = '',
  currentDestination = '',
  onSelectWhere,
  onSelectDestination,
  onClose,
}) => {
  const [origin, setOrigin] = useState(currentOrigin);
  const [destination, setDestination] = useState(currentDestination);
  const destInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    destInputRef.current?.focus();
  }, []);

  const filteredDestinations = useMemo(() => {
    const q = destination.trim().toLowerCase();
    if (!q) return CURATED_DESTINATIONS;
    return CURATED_DESTINATIONS.filter(
      (d) =>
        d.city.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q)
    );
  }, [destination]);

  const handleApply = (customDest?: string, customOrigin?: string) => {
    const finalDest = (customDest !== undefined ? customDest : destination).trim();
    const finalOrigin = (customOrigin !== undefined ? customOrigin : origin).trim();

    if (onSelectWhere) {
      onSelectWhere({
        origin: finalOrigin || undefined,
        destination: finalDest || undefined,
      });
    }
    if (onSelectDestination && finalDest) {
      onSelectDestination(finalDest);
    }
    onClose();
  };

  const handleSelectDestItem = (fullName: string) => {
    setDestination(fullName);
    handleApply(fullName);
  };

  return (
    <div
      role="dialog"
      aria-label="Route & Destination Selector"
      className="w-84 sm:w-96 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-surface-container-high/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/40 mb-3">
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-on-surface">Route & Destination</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dual Inputs: FROM (Origin) & TO (Destination) */}
      <div className="space-y-2 mb-3">
        {/* Origin / From Field */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-secondary" />
            <span>From (Origin)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Departure city, e.g. Hyderabad"
              className="w-full px-3 py-1.5 rounded-lg bg-surface-container text-xs text-on-surface placeholder:text-on-surface-variant/60 border border-surface-container-highest/60 focus:outline-none focus:border-secondary/60 transition-colors"
            />
            {origin && (
              <button
                type="button"
                onClick={() => setOrigin('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Quick origin chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mt-1.5">
            {POPULAR_ORIGINS.map((hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => setOrigin(hub)}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors shrink-0 ${
                  origin.toLowerCase() === hub.toLowerCase()
                    ? 'bg-secondary/15 text-secondary border-secondary/30 font-semibold'
                    : 'bg-surface-container hover:bg-surface-container-highest/60 text-on-surface-variant border-surface-container-highest/50'
                }`}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>

        {/* Destination / To Field */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary" />
            <span>To (Destination)</span>
          </label>
          <div className="relative">
            <input
              ref={destInputRef}
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApply();
                }
              }}
              placeholder="Destination city or country, e.g. Tokyo, Delhi"
              className="w-full px-3 py-1.5 rounded-lg bg-surface-container text-xs text-on-surface placeholder:text-on-surface-variant/60 border border-surface-container-highest/60 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {destination && (
              <button
                type="button"
                onClick={() => setDestination('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 mb-3">
        <div className="px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
          {destination ? 'Matching Destinations' : 'Popular Destinations'}
        </div>

        {filteredDestinations.map((dest) => {
          const fullName = `${dest.city}, ${dest.country}`;
          const isSelected =
            destination.toLowerCase().includes(dest.city.toLowerCase()) ||
            destination.toLowerCase() === fullName.toLowerCase();

          return (
            <button
              key={fullName}
              type="button"
              onClick={() => handleSelectDestItem(fullName)}
              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left text-xs transition-colors ${
                isSelected
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'hover:bg-surface-container text-on-surface'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`} />
                <div className="truncate">
                  <span className="font-medium text-on-surface">{dest.city}</span>
                  <span className="text-[11px] text-on-surface-variant ml-1.5">{dest.country}</span>
                </div>
              </div>
              {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
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
          onClick={() => handleApply()}
          className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed transition-all shadow-md flex items-center gap-1.5"
        >
          <span>Apply Location</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
