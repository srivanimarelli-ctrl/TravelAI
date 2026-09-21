import React from 'react';
import { Sun, Droplets, Wind, ShieldAlert, CloudSun } from 'lucide-react';
import { WeatherCondition } from '../../types';

interface WeatherTabProps {
  weather: WeatherCondition | null;
  destination?: string;
}

export const WeatherTab: React.FC<WeatherTabProps> = ({ weather, destination }) => {
  if (!weather) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-surface-container border border-surface-container-highest/60 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <CloudSun className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface">No weather forecast yet</h3>
        <p className="text-xs text-on-surface-variant max-w-sm">
          Meteorological data will synchronize automatically when an active trip is loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-space-md animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-on-surface">
            {destination ? `${destination} Meteorological Model` : 'Regional Meteorological Model'}
          </h2>
          <p className="text-xs text-on-surface-variant">
            Live satellite feed & weather forecast via FastAPI
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-tertiary text-xs font-semibold self-start sm:self-auto border border-tertiary/20">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span>{weather.conditionDescription || 'Pleasant Weather'}</span>
        </div>
      </div>

      {/* Current Metric Visual 4-Grid Cards */}
      <div className="rounded-xl bg-surface-container p-space-md lg:p-space-lg shadow-md grid grid-cols-2 md:grid-cols-4 gap-space-sm border border-surface-container-highest/40">
        <div className="flex flex-col items-center justify-center p-space-md rounded-lg bg-surface-container-low text-center border border-surface-container-high/30">
          <Sun className="w-8 h-8 text-primary" />
          <div className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            {weather.temperatureCelsius}°C
          </div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">
            {weather.conditionDescription} (Feels {weather.feelsLikeCelsius}°C)
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-space-md rounded-lg bg-surface-container-low text-center border border-surface-container-high/30">
          <Droplets className="w-8 h-8 text-secondary" />
          <div className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            {weather.humidityPercent}%
          </div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">
            Relative Humidity (Comfortable)
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-space-md rounded-lg bg-surface-container-low text-center border border-surface-container-high/30">
          <Wind className="w-8 h-8 text-tertiary" />
          <div className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            {weather.windSpeedKmh.split('•')[0]}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">
            Wind • WSW Calm Swells
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-space-md rounded-lg bg-surface-container-low text-center border border-surface-container-high/30">
          <ShieldAlert className="w-8 h-8 text-primary-fixed-dim" />
          <div className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            {weather.uvIndex} (High)
          </div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">
            {weather.uvDescription}
          </div>
        </div>
      </div>

      {/* 4-Day Extended Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
        {weather.dailyForecast.map((fc, idx) => (
          <div
            key={fc.dayNumber || `fc-${idx}`}
            className="p-space-md rounded-lg bg-surface-container text-center space-y-1.5 border border-surface-container-highest/40 hover:border-surface-container-highest transition-all"
          >
            <span className="text-xs font-medium text-on-surface-variant block">
              {fc.date} • {fc.dayLabel}
            </span>
            <div className="py-1">
              {fc.icon === 'sunny' || fc.icon === 'wb_sunny' ? (
                <Sun className="w-7 h-7 text-primary mx-auto" />
              ) : fc.icon === 'air' ? (
                <Wind className="w-7 h-7 text-primary mx-auto" />
              ) : (
                <CloudSun className="w-7 h-7 text-primary mx-auto" />
              )}
            </div>
            <div className="text-sm font-semibold text-on-surface">
              {fc.tempHigh}° / {fc.tempLow}°
            </div>
            <span className="text-xs text-tertiary font-medium block">
              {fc.conditionText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
