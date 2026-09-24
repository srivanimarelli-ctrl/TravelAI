import React from 'react';
import { 
  Car, 
  Footprints, 
  CarTaxiFront, 
  Navigation, 
  ExternalLink, 
  Clock, 
  MapPin, 
  ChevronRight,
  AlertCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { RouteLeg, TravelMode } from '../../types';

interface RouteDirectionsDrawerProps {
  legs: RouteLeg[];
  activeLegIndex: number;
  onSelectLeg: (index: number) => void;
  selectedMode: TravelMode;
  onChangeMode: (mode: TravelMode) => void;
  isLoading?: boolean;
}

export const RouteDirectionsDrawer: React.FC<RouteDirectionsDrawerProps> = ({
  legs,
  activeLegIndex,
  onSelectLeg,
  selectedMode,
  onChangeMode,
  isLoading,
}) => {
  if (!legs || legs.length === 0) return null;

  const activeLeg = legs[activeLegIndex] || legs[0];
  const totalDistance = legs.reduce((acc, leg) => acc + (leg.distanceKm || 0), 0);
  const totalDuration = legs.reduce((acc, leg) => acc + (leg.durationMins || 0), 0);

  return (
    <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 shadow-md p-space-md space-y-4">
      {/* Header: Title & Travel Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container-highest/40">
        <div>
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span>Turn-by-Turn Route Directions</span>
          </h3>
          <p className="text-[11px] text-on-surface-variant">
            Total Day Route: <strong className="text-on-surface">{Math.round(totalDistance * 10) / 10} km</strong> • Approx. <strong className="text-on-surface">{totalDuration} mins</strong>
          </p>
        </div>

        {/* Travel Mode Pills */}
        <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-surface-container-highest/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChangeMode('driving')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedMode === 'driving'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Drive</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('walking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedMode === 'walking'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Walk</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeMode('cab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedMode === 'cab'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <CarTaxiFront className="w-3.5 h-3.5" />
            <span>Cab</span>
          </button>
        </div>
      </div>

      {/* Leg Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {legs.map((leg, idx) => {
          const isSelected = idx === activeLegIndex;
          return (
            <button
              key={`leg-tab-${idx}`}
              type="button"
              onClick={() => onSelectLeg(idx)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                isSelected
                  ? 'bg-primary/10 border-primary text-primary shadow-sm'
                  : 'bg-surface-container-low border-surface-container-highest/60 text-on-surface-variant hover:border-surface-container-highest hover:text-on-surface'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface'
              }`}>
                {idx + 1}
              </div>
              <div>
                <div className="line-clamp-1 max-w-[130px] sm:max-w-[170px]">
                  {leg.fromTitle} ➔ {leg.toTitle}
                </div>
                <div className="text-[10px] font-normal opacity-80">
                  {leg.distanceKm} km • {leg.durationMins} mins
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Leg Step-by-Step Directions */}
      {activeLeg && (
        <div className="space-y-3 pt-1">
          {/* Active Leg Summary Card */}
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Leg {activeLegIndex + 1} of {legs.length}
                </span>
                {activeLeg.status === 'fallback' && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                    <AlertCircle className="w-3 h-3" /> Estimated route
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-on-surface">
                {activeLeg.fromTitle} <span className="text-primary font-normal">➔</span> {activeLeg.toTitle}
              </div>
              <div className="text-xs text-on-surface-variant flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-on-surface">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {activeLeg.durationMins} mins
                </span>
                <span>•</span>
                <span>{activeLeg.distanceKm} km distance</span>
                <span>•</span>
                <span className="capitalize">{selectedMode === 'cab' ? 'Cab/Taxi' : selectedMode} profile</span>
              </div>
            </div>

            {/* Launch Google Maps Button */}
            <a
              href={activeLeg.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary/90 transition-all shadow-sm flex-shrink-0"
              title="Open turn-by-turn route in Google Maps"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Turn-by-Turn Instruction Steps List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
              Step-by-Step Directions
            </div>

            {activeLeg.steps && activeLeg.steps.length > 0 ? (
              activeLeg.steps.map((step, sIdx) => (
                <div
                  key={`step-${activeLegIndex}-${sIdx}`}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-lowest border border-surface-container-highest/30 text-xs text-on-surface hover:border-surface-container-highest transition-colors"
                >
                  <div className="w-5 h-5 rounded-md bg-surface-container-high text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {sIdx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-on-surface leading-tight">
                      {step.instruction}
                    </p>
                    {step.distanceMeters > 0 && (
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {step.distanceMeters >= 1000
                          ? `${(step.distanceMeters / 1000).toFixed(1)} km`
                          : `${step.distanceMeters} m`}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant p-2 italic">
                Follow direct transit route between {activeLeg.fromTitle} and {activeLeg.toTitle}.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
