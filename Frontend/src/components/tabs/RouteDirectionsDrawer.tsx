import React from 'react';
import { 
  Car, 
  Footprints, 
  CarTaxiFront, 
  Navigation, 
  ExternalLink, 
  Clock, 
  AlertCircle,
  ArrowRight,
  CornerUpRight,
  CornerUpLeft,
  MoveUp,
  MapPinCheck
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

function getStepIcon(instruction: string) {
  const lower = instruction.toLowerCase();
  if (lower.includes('right')) return <CornerUpRight className="w-3.5 h-3.5 text-primary" />;
  if (lower.includes('left')) return <CornerUpLeft className="w-3.5 h-3.5 text-primary" />;
  if (lower.includes('arrive') || lower.includes('destination')) return <MapPinCheck className="w-3.5 h-3.5 text-emerald-400" />;
  return <MoveUp className="w-3.5 h-3.5 text-primary" />;
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

  const totalDistance = legs.reduce((acc, leg) => acc + (leg.distanceKm || 0), 0);
  const totalDuration = legs.reduce((acc, leg) => acc + (leg.durationMins || 0), 0);

  // Estimates for different modes
  const drivingEst = Math.round(totalDuration);
  const walkingEst = Math.max(1, Math.round((totalDistance / 4.5) * 60));

  const isEntireDay = activeLegIndex === -1;
  const activeLeg = isEntireDay ? null : (legs[activeLegIndex] || legs[0]);

  return (
    <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 shadow-lg p-space-md space-y-4 h-full flex flex-col overflow-hidden">
      {/* Header: Title & Travel Mode Switcher */}
      <div className="flex flex-col gap-4 pb-3 border-b border-surface-container-highest/50 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center shadow-inner">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-on-surface uppercase tracking-wider">
              Today's Route
            </h3>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-on-surface leading-none mb-1">
              {Math.round(totalDistance * 10) / 10} km
            </span>
            <span className="text-sm font-semibold text-primary">
              {totalDuration} min {selectedMode === 'walking' ? 'walking' : 'driving'}
            </span>
            <span className="text-xs text-on-surface-variant font-medium mt-0.5">
              {legs.length} legs • {legs.length + 1} stops
            </span>
          </div>
        </div>

        {/* Premium Segmented Travel Mode Switcher */}
        <div className="flex items-center w-full gap-1 bg-surface-container-high/90 backdrop-blur-md p-1.5 rounded-2xl border border-surface-container-highest/80 shadow-inner overflow-x-auto scrollbar-none">
          {/* Drive Mode Button */}
          <button
            type="button"
            onClick={() => onChangeMode('driving')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              selectedMode === 'driving'
                ? 'bg-primary text-on-primary shadow-md shadow-primary/25 scale-[1.02]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <Car className="w-4 h-4" />
            <div className="flex flex-col text-left leading-none">
              <span>Drive</span>
              <span className={`text-[9px] font-normal mt-0.5 ${selectedMode === 'driving' ? 'text-on-primary/90' : 'text-on-surface-variant/70'}`}>
                ~{drivingEst}m
              </span>
            </div>
          </button>

          {/* Walk Mode Button */}
          <button
            type="button"
            onClick={() => onChangeMode('walking')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              selectedMode === 'walking'
                ? 'bg-primary text-on-primary shadow-md shadow-primary/25 scale-[1.02]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <Footprints className="w-4 h-4" />
            <div className="flex flex-col text-left leading-none">
              <span>Walk</span>
              <span className={`text-[9px] font-normal mt-0.5 ${selectedMode === 'walking' ? 'text-on-primary/90' : 'text-on-surface-variant/70'}`}>
                ~{walkingEst}m
              </span>
            </div>
          </button>

          {/* Cab Mode Button */}
          <button
            type="button"
            onClick={() => onChangeMode('cab')}
            className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              selectedMode === 'cab'
                ? 'bg-primary text-on-primary shadow-md shadow-primary/25 scale-[1.02]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <CarTaxiFront className="w-4 h-4" />
            <div className="flex flex-col text-left leading-none">
              <span>Cab</span>
              <span className={`text-[9px] font-normal mt-0.5 ${selectedMode === 'cab' ? 'text-on-primary/90' : 'text-on-surface-variant/70'}`}>
                ~{drivingEst}m
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Leg Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
        {/* Entire Day Button */}
        <button
          type="button"
          onClick={() => onSelectLeg(-1)}
          className={`flex-shrink-0 flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
            isEntireDay
              ? 'bg-primary text-on-primary shadow-md border-primary'
              : 'bg-surface-container-low border-surface-container-highest/60 text-on-surface-variant hover:border-surface-container-highest hover:text-on-surface'
          }`}
        >
          Entire Day
        </button>

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
              Leg {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isEntireDay ? (
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-3">
            <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
              All Legs Summary
            </div>
            {legs.map((leg, idx) => (
              <button
                key={`entire-leg-${idx}`}
                onClick={() => onSelectLeg(idx)}
                className="w-full text-left p-3.5 rounded-xl bg-surface-container-low border border-surface-container-highest/60 hover:border-primary/50 transition-colors flex items-center justify-between gap-3 shadow-sm group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Leg {idx + 1}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-on-surface flex items-center gap-1.5 flex-wrap">
                    <span>{leg.fromTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{leg.toTitle}</span>
                  </div>
                  <div className="text-xs text-on-surface-variant flex items-center gap-3 pt-1">
                    <span className="font-bold">{leg.durationMins} min</span>
                    <span>•</span>
                    <span>{leg.distanceKm} km</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        ) : activeLeg ? (
          <div className="flex-1 flex flex-col overflow-hidden space-y-3 pt-1">
          {/* Active Leg Summary Card */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex flex-col gap-4 shadow-sm flex-shrink-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                  Leg {activeLegIndex + 1} of {legs.length}
                </span>
                {activeLeg.status === 'fallback' && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                    <AlertCircle className="w-3 h-3" /> Showing direct distance estimate
                  </span>
                )}
              </div>
              <div className="font-bold text-sm sm:text-base text-on-surface flex flex-col gap-1.5 pt-1">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-surface-container-highest mt-1.5 flex-shrink-0" />
                  <span className="line-clamp-2 leading-snug">{activeLeg.fromTitle}</span>
                </div>
                <div className="ml-1 pl-[3px] border-l-2 border-surface-container-highest/50 h-2"></div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="line-clamp-2 leading-snug">{activeLeg.toTitle}</span>
                </div>
              </div>
              <div className="text-xs text-on-surface-variant flex items-center gap-3 pt-2">
                <span className="flex items-center gap-1 font-bold text-on-surface">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {activeLeg.durationMins} mins
                </span>
                <span>•</span>
                <span>{activeLeg.distanceKm} km</span>
              </div>
            </div>

            {/* Launch Google Maps Button */}
            <a
              href={activeLeg.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 transition-all shadow-md w-full"
              title="Open turn-by-turn route in Google Maps"
            >
              <span>Navigate with Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Turn-by-Turn Instruction Steps List */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Step-by-Step Directions
              </div>
              <div className="text-[10px] text-on-surface-variant font-medium">
                {activeLeg.steps?.length || 0} steps
              </div>
            </div>

            {activeLeg.steps && activeLeg.steps.length > 0 ? (
              activeLeg.steps.map((step, sIdx) => (
                <div
                  key={`step-${activeLegIndex}-${sIdx}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container-highest/40 text-xs text-on-surface hover:border-surface-container-highest transition-colors shadow-xs"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold flex-shrink-0 mt-0.5 shadow-sm">
                    {getStepIcon(step.instruction)}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-h-[32px]">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-on-surface leading-snug">
                        {step.instruction}
                      </p>
                      {step.distanceMeters > 0 && (
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap">
                          {step.distanceMeters >= 1000
                            ? `${(step.distanceMeters / 1000).toFixed(1)} km`
                            : `${step.distanceMeters} m`}
                        </span>
                      )}
                    </div>
                    {step.name && (
                      <p className="text-xs text-on-surface-variant mt-1 font-medium">
                        {step.name}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant p-2.5 italic rounded-xl bg-surface-container-lowest border border-surface-container-highest/40">
                Direct transit connection between {activeLeg.fromTitle} and {activeLeg.toTitle}.
              </p>
            )}
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
};
