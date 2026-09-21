import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Calendar, Wallet, Users, Sparkles, ChevronDown } from 'lucide-react';
import { TripSummary, ChatMessage } from '../../types';
import { WherePopover } from './WherePopover';
import { WhenPopover } from './WhenPopover';
import { BudgetPopover } from './BudgetPopover';
import { TravelersPopover } from './TravelersPopover';
import { InterestsPopover } from './InterestsPopover';

interface TravelPreferenceBarProps {
  trip?: TripSummary | null;
  travelContext?: Record<string, any> | null;
  messages?: ChatMessage[];
  onUpdatePreference: (updates: Partial<{
    origin: string;
    destination: string;
    start_date: string;
    end_date: string;
    days: number;
    budget: number;
    currency: string;
    travel_style: string;
    budget_mode: string;
    adults: number;
    children: number;
    infants: number;
    travelers: number;
    preferences: string[];
  }>) => void;
}

type ActivePopoverType = 'where' | 'when' | 'budget' | 'travelers' | 'interests' | null;

export const TravelPreferenceBar: React.FC<TravelPreferenceBarProps> = ({
  trip,
  travelContext,
  messages = [],
  onUpdatePreference,
}) => {
  const [activePopover, setActivePopover] = useState<ActivePopoverType>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePopover(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const togglePopover = (type: ActivePopoverType) => {
    setActivePopover((prev) => (prev === type ? null : type));
  };

  // Derive display values strictly from travelContext
  const currentValues = useMemo(() => {
    // 1. Where / Origin & Destination
    const originStr = typeof travelContext?.origin === 'string' ? travelContext.origin : '';
    const destStr = typeof travelContext?.destination === 'string'
      ? travelContext.destination
      : Array.isArray(travelContext?.destination)
      ? travelContext.destination.join(', ')
      : '';

    let whereDisplay = 'Where to?';
    if (originStr && destStr) {
      whereDisplay = `${originStr} → ${destStr}`;
    } else if (destStr) {
      whereDisplay = destStr;
    } else if (originStr) {
      whereDisplay = `From ${originStr}`;
    }

    // 2. When / Dates & Duration
    let dateRange = '';
    let durationLabel = '';
    if (travelContext?.start_date && travelContext?.end_date) {
      dateRange = `${travelContext.start_date} – ${travelContext.end_date}`;
    } else if (travelContext?.start_date) {
      dateRange = `From ${travelContext.start_date}`;
    }

    if (travelContext?.days) {
      const d = Number(travelContext.days);
      const n = Math.max(1, d - 1);
      durationLabel = `${d}D / ${n}N`;
    }

    let whenDisplay = 'Select Dates';
    if (dateRange) {
      whenDisplay = dateRange;
    } else if (travelContext?.days) {
      const d = Number(travelContext.days);
      const n = Math.max(1, d - 1);
      whenDisplay = `${d} Days, ${n} ${n === 1 ? 'Night' : 'Nights'}`;
    }

    // 3. Budget & Currency
    const currency = travelContext?.currency || 'INR';
    const currencySymbol =
      currency === 'USD' ? '$' :
      currency === 'EUR' ? '€' :
      currency === 'GBP' ? '£' :
      currency === 'JPY' ? '¥' :
      currency === 'AED' ? 'د.إ' :
      currency === 'AUD' ? 'A$' :
      currency === 'CAD' ? 'C$' :
      currency === 'SGD' ? 'S$' : '₹';

    let rawBudget: number | null = null;
    if (travelContext?.budget !== undefined && travelContext?.budget !== null) {
      rawBudget = Number(travelContext.budget);
    }

    const budgetDisplay = rawBudget !== null
      ? `${currencySymbol}${rawBudget.toLocaleString()}`
      : 'Set Budget';

    // 4. Travelers: Distinguish adults and children if available
    let adults: number | null = travelContext?.adults ?? travelContext?.slots?.adults ?? null;
    let children: number | null = travelContext?.children ?? travelContext?.slots?.children ?? null;
    const infants: number = travelContext?.infants ?? travelContext?.slots?.infants ?? 0;

    let travelersDisplay = 'Add Travelers';
    if (adults !== null || children !== null) {
      const parts: string[] = [];
      if (adults !== null && adults > 0) {
        parts.push(`${adults} ${adults === 1 ? 'Adult' : 'Adults'}`);
      }
      if (children !== null && children > 0) {
        parts.push(`${children} ${children === 1 ? 'Child' : 'Children'}`);
      }
      if (infants > 0) {
        parts.push(`${infants} ${infants === 1 ? 'Infant' : 'Infants'}`);
      }
      if (parts.length > 0) {
        travelersDisplay = parts.join(', ');
      }
    } else if (travelContext?.travelers || travelContext?.slots?.travelers) {
      const count = Number(travelContext.travelers || travelContext.slots.travelers);
      travelersDisplay = `${count} ${count === 1 ? 'Traveler' : 'Travelers'}`;
    }

    // 5. Interests
    let interestsList: string[] = [];
    if (Array.isArray(travelContext?.preferences) && travelContext.preferences.length > 0) {
      interestsList = travelContext.preferences;
    }

    let interestsDisplay = 'Add Interests';
    if (interestsList.length > 0) {
      if (interestsList.length <= 2) {
        interestsDisplay = interestsList.join(', ');
      } else {
        interestsDisplay = `${interestsList.slice(0, 2).join(', ')} +${interestsList.length - 2}`;
      }
    } else if (travelContext?.travel_style) {
      interestsDisplay = travelContext.travel_style;
    }

    return {
      origin: originStr,
      destination: destStr,
      whereDisplay,
      whenDisplay,
      durationLabel,
      budgetDisplay,
      rawBudget,
      currency,
      travelStyle: travelContext?.travel_style || undefined,
      travelersDisplay,
      adults,
      children,
      infants,
      genericTravelers: (travelContext?.travelers || 0) || null,
      interestsList,
      interestsDisplay,
    };
  }, [travelContext]);

  return (
    <div
      ref={barRef}
      className="relative z-30 w-full pt-1 pb-1"
      aria-label="Travel Preference Controls"
    >
      {/* 5 Interactive Controls Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {/* Control 1: Where? */}
        <button
          type="button"
          onClick={() => togglePopover('where')}
          aria-expanded={activePopover === 'where'}
          className={`shrink-0 group px-2.5 py-1.5 rounded-lg border text-left flex items-center gap-2 transition-all duration-200 active:scale-[0.98] ${
            activePopover === 'where'
              ? 'bg-surface-container-high border-primary/50 ring-1 ring-primary/20 shadow-md'
              : 'bg-surface-container/80 hover:bg-surface-container-high/90 border-surface-container-highest/60 hover:border-surface-container-highest'
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-0.5">
              Where?
            </span>
            <span className="text-xs font-semibold text-on-surface truncate max-w-[120px] sm:max-w-[150px]">
              {currentValues.whereDisplay}
            </span>
          </div>
          <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform duration-200 ${activePopover === 'where' ? 'rotate-180 text-primary' : ''}`} />
        </button>

        {/* Control 2: When? */}
        <button
          type="button"
          onClick={() => togglePopover('when')}
          aria-expanded={activePopover === 'when'}
          className={`shrink-0 group px-2.5 py-1.5 rounded-lg border text-left flex items-center gap-2 transition-all duration-200 active:scale-[0.98] ${
            activePopover === 'when'
              ? 'bg-surface-container-high border-tertiary/50 ring-1 ring-tertiary/20 shadow-md'
              : 'bg-surface-container/80 hover:bg-surface-container-high/90 border-surface-container-highest/60 hover:border-surface-container-highest'
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-0.5">
              When?
            </span>
            <span className="text-xs font-semibold text-on-surface truncate max-w-[110px] sm:max-w-[130px]">
              {currentValues.whenDisplay}
            </span>
          </div>
          <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform duration-200 ${activePopover === 'when' ? 'rotate-180 text-tertiary' : ''}`} />
        </button>

        {/* Control 3: Budget */}
        <button
          type="button"
          onClick={() => togglePopover('budget')}
          aria-expanded={activePopover === 'budget'}
          className={`shrink-0 group px-2.5 py-1.5 rounded-lg border text-left flex items-center gap-2 transition-all duration-200 active:scale-[0.98] ${
            activePopover === 'budget'
              ? 'bg-surface-container-high border-secondary/50 ring-1 ring-secondary/20 shadow-md'
              : 'bg-surface-container/80 hover:bg-surface-container-high/90 border-surface-container-highest/60 hover:border-surface-container-highest'
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-secondary/10 text-secondary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-0.5">
              Budget
            </span>
            <span className="text-xs font-semibold text-on-surface truncate max-w-[90px] sm:max-w-[110px]">
              {currentValues.budgetDisplay}
            </span>
          </div>
          <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform duration-200 ${activePopover === 'budget' ? 'rotate-180 text-secondary' : ''}`} />
        </button>

        {/* Control 4: Travelers */}
        <button
          type="button"
          onClick={() => togglePopover('travelers')}
          aria-expanded={activePopover === 'travelers'}
          className={`shrink-0 group px-2.5 py-1.5 rounded-lg border text-left flex items-center gap-2 transition-all duration-200 active:scale-[0.98] ${
            activePopover === 'travelers'
              ? 'bg-surface-container-high border-primary/50 ring-1 ring-primary/20 shadow-md'
              : 'bg-surface-container/80 hover:bg-surface-container-high/90 border-surface-container-highest/60 hover:border-surface-container-highest'
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-0.5">
              Travelers
            </span>
            <span className="text-xs font-semibold text-on-surface truncate max-w-[120px] sm:max-w-[140px]">
              {currentValues.travelersDisplay}
            </span>
          </div>
          <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform duration-200 ${activePopover === 'travelers' ? 'rotate-180 text-primary' : ''}`} />
        </button>

        {/* Control 5: Interests */}
        <button
          type="button"
          onClick={() => togglePopover('interests')}
          aria-expanded={activePopover === 'interests'}
          className={`shrink-0 group px-2.5 py-1.5 rounded-lg border text-left flex items-center gap-2 transition-all duration-200 active:scale-[0.98] ${
            activePopover === 'interests'
              ? 'bg-surface-container-high border-tertiary/50 ring-1 ring-tertiary/20 shadow-md'
              : 'bg-surface-container/80 hover:bg-surface-container-high/90 border-surface-container-highest/60 hover:border-surface-container-highest'
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant leading-none mb-0.5">
              Interests
            </span>
            <span className="text-xs font-semibold text-on-surface truncate max-w-[110px] sm:max-w-[130px]">
              {currentValues.interestsDisplay}
            </span>
          </div>
          <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform duration-200 ${activePopover === 'interests' ? 'rotate-180 text-tertiary' : ''}`} />
        </button>
      </div>

      {/* Floating Overlay Container for Active Popover */}
      {activePopover && (
        <div
          className={`absolute top-full mt-2 z-50 transition-all duration-150 ${
            activePopover === 'where'
              ? 'left-0'
              : activePopover === 'when'
              ? 'left-0 sm:left-12'
              : activePopover === 'budget'
              ? 'left-0 sm:left-28'
              : activePopover === 'travelers'
              ? 'right-0 sm:right-20'
              : 'right-0'
          }`}
        >
          {activePopover === 'where' && (
            <WherePopover
              currentOrigin={currentValues.origin}
              currentDestination={currentValues.destination}
              onSelectWhere={({ origin, destination }) => {
                onUpdatePreference({
                  ...(origin !== undefined ? { origin } : {}),
                  ...(destination !== undefined ? { destination } : {}),
                });
                setActivePopover(null);
              }}
              onSelectDestination={(dest) => {
                onUpdatePreference({ destination: dest });
                setActivePopover(null);
              }}
              onClose={() => setActivePopover(null)}
            />
          )}

          {activePopover === 'when' && (
            <WhenPopover
              startDate={travelContext?.start_date}
              endDate={travelContext?.end_date}
              days={travelContext?.days || trip?.daysCount}
              onSelectDates={(start, end, daysCount) => {
                onUpdatePreference({
                  start_date: start,
                  end_date: end,
                  days: daysCount,
                });
                setActivePopover(null);
              }}
              onClose={() => setActivePopover(null)}
            />
          )}

          {activePopover === 'budget' && (
            <BudgetPopover
              currentBudget={currentValues.rawBudget}
              currentCurrency={currentValues.currency}
              currentStyle={currentValues.travelStyle}
              onSelectBudget={(budget, currency, style) => {
                onUpdatePreference({
                  budget,
                  currency,
                  ...(style ? { travel_style: style } : {}),
                });
                setActivePopover(null);
              }}
              onClose={() => setActivePopover(null)}
            />
          )}

          {activePopover === 'travelers' && (
            <TravelersPopover
              initialAdults={currentValues.adults}
              initialChildren={currentValues.children}
              initialInfants={currentValues.infants}
              initialGenericTravelers={currentValues.genericTravelers}
              onSelectTravelers={(adults, children, infants) => {
                onUpdatePreference({
                  adults,
                  children,
                  infants,
                  travelers: adults + children + infants,
                });
                setActivePopover(null);
              }}
              onClose={() => setActivePopover(null)}
            />
          )}

          {activePopover === 'interests' && (
            <InterestsPopover
              currentInterests={currentValues.interestsList}
              onSelectInterests={(interests) => {
                onUpdatePreference({ preferences: interests });
                setActivePopover(null);
              }}
              onClose={() => setActivePopover(null)}
            />
          )}
        </div>
      )}
    </div>
  );
};
