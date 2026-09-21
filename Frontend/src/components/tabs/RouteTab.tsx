import React from 'react';
import { CalendarDays } from 'lucide-react';
import { TripSummary, ItineraryDay } from '../../types';

interface RouteTabProps {
  trip: TripSummary | null;
  days: ItineraryDay[];
}

export const RouteTab: React.FC<RouteTabProps> = ({ trip, days }) => {
  return (
    <div className="space-y-space-md animate-in fade-in duration-200">
      {/* Destination Micro Hero Map & Banner */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-lg border border-surface-container-highest/60">
        <div
          className="w-full h-full bg-cover bg-center"
          data-location={trip?.destination || 'Goa, India'}
          style={{
            backgroundImage: `url('${
              trip?.heroImageUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBlx7gAJoMQBXDwbj6pcwTqIFcYOsmHvoW4FP-ompYmqI5sdLnZA_V_Vo7s2KaplYKZasc62M2PUG1oCM8TH0Z07k10P6QveYrXQL7OAzs_LtZujhGa5DgZj2B1Lt83FtvfbX5cf4OzbSPNc0HxZSxA0n70yRDsXRUzj3Cs3tyKLFvOticj1qWp-a5SvwUFFe5M7wTtu3leSHjY1VvKgmhcc0WV-OM1qDNk60-lJxEzj7UZUxDQDjkCFg'
            }')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/50 to-transparent p-space-md flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[11px] font-semibold uppercase tracking-wider border border-primary/30">
                {trip?.bespokeCircuitLabel || 'Bespoke Circuit'}
              </span>
              <div className="font-semibold text-lg sm:text-xl text-on-surface mt-1">
                {trip?.routeHeadline || 'North Coast • Old Goa • Chapora River'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-on-surface-variant font-medium">Live Map Sync</div>
              <div className="text-sm font-semibold text-tertiary flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span>{trip?.activeWaypointsCount || 4} Waypoints Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Timeline Architecture */}
      {(!days || days.length === 0) ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-surface-container border border-surface-container-highest/60 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-on-surface">No route timeline yet</h3>
          <p className="text-xs text-on-surface-variant max-w-sm">
            Daily activities and travel waypoints have not been generated yet. Use the chat desk to draft a complete day-by-day itinerary.
          </p>
        </div>
      ) : (
        <div className="space-y-space-md relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-surface-container-highest">
          {days.map((day, dIdx) => {
            const isDayOne = day.dayNumber === 1;
            return (
              <div key={day.dayNumber || `day-${dIdx}`} className="relative pl-10">
              {/* Day Number Badge */}
              <div
                className={`absolute left-2 top-2.5 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold shadow-md ${
                  isDayOne
                    ? 'bg-primary-container text-on-primary ring-2 ring-primary/40'
                    : 'bg-surface-container-highest text-on-surface'
                }`}
              >
                {day.dayNumber}
              </div>

              {/* Day Card */}
              <div className="rounded-xl bg-surface-container p-space-md shadow-md border border-surface-container-highest/40 hover:border-surface-container-highest transition-all space-y-space-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-medium text-on-surface">
                      {day.title}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isDayOne
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {day.date}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">
                    {day.transitBadge}
                  </span>
                </div>

                {/* 3 Activities Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                  {day.activities.map((act, actIdx) => {
                    const colorClasses = {
                      primary: 'text-primary',
                      secondary: 'text-secondary',
                      tertiary: 'text-tertiary',
                    }[act.categoryColor] || 'text-primary';

                    return (
                      <div
                        key={`${day.dayNumber || dIdx}-act-${actIdx}-${act.timeOfDay}`}
                        className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high/40 space-y-1"
                      >
                        <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${colorClasses}`}>
                          {act.timeOfDay} • {act.time}
                        </span>
                        <p className="text-xs font-medium text-on-surface">
                          {act.title}
                        </p>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {act.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
