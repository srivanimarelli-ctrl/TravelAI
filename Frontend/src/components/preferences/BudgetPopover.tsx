import React, { useState } from 'react';
import { Wallet, Check, X, Plus, Minus } from 'lucide-react';

interface BudgetPopoverProps {
  currentBudget?: number | null;
  currentCurrency?: string;
  currentStyle?: string | null;
  onSelectBudget: (budget: number, currency: string, style?: string) => void;
  onClose: () => void;
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  step: number;
  presets: number[];
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', step: 5000, presets: [30000, 50000, 75000, 100000, 150000, 250000] },
  { code: 'USD', symbol: '$', name: 'US Dollar', step: 250, presets: [1000, 2000, 3500, 5000, 7500, 10000] },
  { code: 'EUR', symbol: '€', name: 'Euro', step: 250, presets: [1000, 1800, 3000, 4500, 7000, 9000] },
  { code: 'GBP', symbol: '£', name: 'British Pound', step: 200, presets: [800, 1500, 2500, 4000, 6000, 8000] },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', step: 25000, presets: [150000, 250000, 400000, 600000, 900000, 1200000] },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', step: 1000, presets: [4000, 7000, 12000, 18000, 25000, 35000] },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', step: 300, presets: [1500, 3000, 5000, 7500, 10000, 15000] },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', step: 300, presets: [1500, 2800, 4500, 7000, 9500, 14000] },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', step: 300, presets: [1500, 2500, 4000, 6500, 9000, 12000] },
];

const TRAVEL_STYLES = [
  { id: 'BUDGET', label: 'Budget Friendly' },
  { id: 'STANDARD', label: 'Standard' },
  { id: 'PREMIUM', label: 'Premium' },
  { id: 'LUXURY', label: 'Luxury Leisure' },
];

export const BudgetPopover: React.FC<BudgetPopoverProps> = ({
  currentBudget,
  currentCurrency = 'INR',
  currentStyle,
  onSelectBudget,
  onClose,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currentCurrency.toUpperCase());
  const activeCurrencyConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];

  const [amount, setAmount] = useState<number>(
    currentBudget && currentBudget > 0
      ? currentBudget
      : activeCurrencyConfig.presets[1]
  );
  const [selectedStyle, setSelectedStyle] = useState<string>(currentStyle || '');

  const handleCurrencyChange = (newCode: string) => {
    setSelectedCurrency(newCode);
    const newConfig = SUPPORTED_CURRENCIES.find((c) => c.code === newCode) || SUPPORTED_CURRENCIES[0];
    // Set a sensible default for the newly chosen currency if current amount is outside normal range
    if (newCode === 'JPY' && amount < 50000) {
      setAmount(300000);
    } else if (newCode === 'INR' && amount < 10000) {
      setAmount(50000);
    } else if (['USD', 'EUR', 'GBP'].includes(newCode) && amount > 50000) {
      setAmount(2500);
    }
  };

  const handleStep = (direction: 'up' | 'down') => {
    const delta = activeCurrencyConfig.step;
    setAmount((prev) => {
      const next = direction === 'up' ? prev + delta : Math.max(delta, prev - delta);
      return next;
    });
  };

  const handleConfirm = () => {
    onSelectBudget(amount, selectedCurrency, selectedStyle || undefined);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="Budget and Currency Selector"
      className="w-80 sm:w-96 max-w-[calc(100vw-2.5rem)] rounded-2xl bg-surface-container-high/95 backdrop-blur-2xl border border-surface-container-highest/80 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/40 mb-3">
        <div className="flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-secondary" />
          <span className="text-xs font-semibold text-on-surface">Trip Budget & Currency</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Currency Selector */}
      <div className="mb-3">
        <label className="block text-[10px] font-semibold uppercase text-on-surface-variant mb-1">
          Select Currency
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {SUPPORTED_CURRENCIES.map((cur) => (
            <button
              key={cur.code}
              type="button"
              onClick={() => handleCurrencyChange(cur.code)}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-between transition-colors ${
                selectedCurrency === cur.code
                  ? 'bg-secondary/15 text-secondary border-secondary/30 font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-highest/60 text-on-surface border-surface-container-highest/60'
              }`}
            >
              <span>{cur.code}</span>
              <span className="font-mono text-[11px] opacity-80">{cur.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input with Steppers */}
      <div className="mb-3">
        <label className="block text-[10px] font-semibold uppercase text-on-surface-variant mb-1">
          Total Estimated Budget
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleStep('down')}
            className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-highest/80 border border-surface-container-highest/60 text-on-surface flex items-center justify-center transition-colors shrink-0"
            title={`Decrease by ${activeCurrencyConfig.symbol}${activeCurrencyConfig.step.toLocaleString()}`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-secondary pointer-events-none">
              {activeCurrencyConfig.symbol}
            </span>
            <input
              type="number"
              min="0"
              step={activeCurrencyConfig.step}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container text-sm font-semibold text-on-surface border border-surface-container-highest/60 focus:outline-none focus:border-secondary/60 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => handleStep('up')}
            className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-highest/80 border border-surface-container-highest/60 text-on-surface flex items-center justify-center transition-colors shrink-0"
            title={`Increase by ${activeCurrencyConfig.symbol}${activeCurrencyConfig.step.toLocaleString()}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Budget Presets */}
      <div className="mb-3">
        <div className="text-[10px] font-semibold uppercase text-on-surface-variant mb-1.5">
          Quick Budget Brackets
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {activeCurrencyConfig.presets.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`py-1 px-2 rounded-lg text-[11px] font-medium border transition-colors ${
                amount === val
                  ? 'bg-secondary/15 text-secondary border-secondary/30'
                  : 'bg-surface-container hover:bg-surface-container-highest/60 text-on-surface border-surface-container-highest/60'
              }`}
            >
              {activeCurrencyConfig.symbol}
              {val.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Travel Style Tiers */}
      <div className="mb-3">
        <div className="text-[10px] font-semibold uppercase text-on-surface-variant mb-1.5">
          Travel Style
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {TRAVEL_STYLES.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStyle((prev) => (prev === st.id ? '' : st.id))}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors text-left truncate ${
                selectedStyle === st.id
                  ? 'bg-secondary/15 text-secondary border-secondary/30 font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-highest/60 text-on-surface border-surface-container-highest/60'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
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
          className="px-4 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-md"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Set Budget</span>
        </button>
      </div>
    </div>
  );
};
