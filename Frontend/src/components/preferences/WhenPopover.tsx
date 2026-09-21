import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface WhenPopoverProps {
  startDate?: string;
  endDate?: string;
  days?: number;
  onSelectDates: (start: string, end: string, daysCount: number) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseDateStr(str?: string): Date {
  if (!str) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  // If ISO YYYY-MM-DD
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(day)) {
        return new Date(y, m, day);
      }
    }
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  // If "12 Dec" or "Sep 26"
  const parsedWithYear = new Date(`${str} ${new Date().getFullYear()}`);
  if (!isNaN(parsedWithYear.getTime())) {
    return new Date(parsedWithYear.getFullYear(), parsedWithYear.getMonth(), parsedWithYear.getDate());
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 7);
  return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
}

function formatDisplayDate(d: Date): string {
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export const WhenPopover: React.FC<WhenPopoverProps> = ({
  startDate,
  endDate,
  days,
  onSelectDates,
  onClose,
}) => {
  // Initialize start & end dates
  const initialStart = useMemo(() => parseDateStr(startDate), [startDate]);
  const initialEnd = useMemo(() => {
    if (endDate) return parseDateStr(endDate);
    const d = new Date(initialStart);
    d.setDate(d.getDate() + (days && days > 0 ? days - 1 : 5));
    return d;
  }, [endDate, initialStart, days]);

  const [selectedStart, setSelectedStart] = useState<Date>(initialStart);
  const [selectedEnd, setSelectedEnd] = useState<Date>(initialEnd);

  // Calendar viewing month & year
  const [viewYear, setViewYear] = useState<number>(initialStart.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialStart.getMonth());

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calendar grid calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Duration calculation
  const calculatedDuration = useMemo(() => {
    const startMs = new Date(selectedStart.getFullYear(), selectedStart.getMonth(), selectedStart.getDate()).getTime();
    const endMs = new Date(selectedEnd.getFullYear(), selectedEnd.getMonth(), selectedEnd.getDate()).getTime();
    const diffDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
    return {
      days: diffDays,
      nights: Math.max(1, diffDays - 1),
    };
  }, [selectedStart, selectedEnd]);

  // Date selection logic
  const handleDayClick = (dayNum: number) => {
    const clickedDate = new Date(viewYear, viewMonth, dayNum);

    // If no start date or start & end are already selected, start a new selection
    const isStartSame = selectedStart.toDateString() === selectedEnd.toDateString();
    if (!isStartSame && clickedDate < selectedStart) {
      setSelectedStart(clickedDate);
      setSelectedEnd(clickedDate);
    } else if (isStartSame) {
      if (clickedDate < selectedStart) {
        setSelectedStart(clickedDate);
        setSelectedEnd(selectedStart);
      } else {
        setSelectedEnd(clickedDate);
      }
    } else {
      // Start fresh from clicked date
      setSelectedStart(clickedDate);
      setSelectedEnd(clickedDate);
    }
  };

  // Quick Presets handler
  const applyQuickPreset = (presetDays: number) => {
    const newEnd = new Date(selectedStart);
    newEnd.setDate(selectedStart.getDate() + (presetDays - 1));
    setSelectedEnd(newEnd);
  };

  const handleConfirm = () => {
    const formattedStart = formatDisplayDate(selectedStart);
    const formattedEnd = formatDisplayDate(selectedEnd);
    onSelectDates(formattedStart, formattedEnd, calculatedDuration.days);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="Date Range Selector"
      className="w-full max-w-[calc(100vw-2.5rem)] sm:max-w-md rounded-2xl bg-surface-container-high/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-surface-container-highest/40 mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-tertiary" />
          <span className="text-xs font-semibold text-on-surface">Select Travel Dates</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Range Display Banner */}
      <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-tertiary/10 border border-tertiary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div>
          <span className="text-[10px] font-semibold uppercase text-tertiary tracking-wider block">
            Selected Range
          </span>
          <span className="text-xs sm:text-sm font-bold text-on-surface">
            {formatDisplayDate(selectedStart)} – {formatDisplayDate(selectedEnd)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-tertiary bg-tertiary/15 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {calculatedDuration.days} Days • {calculatedDuration.nights} Nights
          </span>
        </div>
      </div>

      {/* Quick Duration Options */}
      <div className="mb-3">
        <div className="text-[10px] font-semibold uppercase text-on-surface-variant mb-1.5">
          Quick Options
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
          {[
            { label: 'Weekend', days: 3 },
            { label: '4 Days', days: 4 },
            { label: '5 Days', days: 5 },
            { label: '7 Days', days: 7 },
            { label: '10 Days', days: 10 },
            { label: '14 Days', days: 14 },
          ].map((item) => (
            <button
              key={item.days}
              type="button"
              onClick={() => applyQuickPreset(item.days)}
              className={`py-1 px-1.5 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                calculatedDuration.days === item.days
                  ? 'bg-tertiary/15 text-tertiary border-tertiary/40 font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-highest/60 text-on-surface border-surface-container-highest/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="mb-3 bg-surface-container/70 rounded-xl p-2.5 border border-surface-container-highest/40">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-on-surface">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAY_LABELS.map((d) => (
            <span key={d} className="text-[10px] font-semibold text-on-surface-variant uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const currentCellDate = new Date(viewYear, viewMonth, dayNum);

            const isStart = currentCellDate.toDateString() === selectedStart.toDateString();
            const isEnd = currentCellDate.toDateString() === selectedEnd.toDateString();
            const isInRange = currentCellDate > selectedStart && currentCellDate < selectedEnd;

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleDayClick(dayNum)}
                className={`h-7 w-full text-xs font-medium rounded-md transition-all flex items-center justify-center ${
                  isStart || isEnd
                    ? 'bg-tertiary text-on-tertiary font-bold shadow-xs'
                    : isInRange
                    ? 'bg-tertiary/20 text-tertiary font-semibold rounded-none'
                    : 'text-on-surface hover:bg-surface-container-highest/80'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
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
          onClick={handleConfirm}
          className="px-4 py-1.5 rounded-lg bg-tertiary text-on-tertiary text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply Dates</span>
        </button>
      </div>
    </div>
  );
};
