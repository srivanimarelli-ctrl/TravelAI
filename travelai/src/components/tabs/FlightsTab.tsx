import React from 'react';
import { Plane, CheckCircle2 } from 'lucide-react';
import { FlightOption } from '../../types';

interface FlightsTabProps {
  flights: FlightOption[];
  onSelectFlight: (id: string) => void;
}

export const FlightsTab: React.FC<FlightsTabProps> = ({
  flights,
  onSelectFlight,
}) => {
  return (
    <div className="space-y-space-md animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-on-surface">
            Matched Flights: New Delhi (DEL) ⇄ Goa (GOI/GOX)
          </h2>
          <p className="text-xs text-on-surface-variant">
            Live fares indexed with checked-in luggage and flexibility policy via FastAPI
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium self-start sm:self-auto border border-primary/20">
          {flights.length} Available
        </span>
      </div>

      {flights.map((flight) => {
        const isSelected = flight.isSelected;
        return (
          <div
            key={flight.id}
            className={`rounded-xl p-space-md shadow-md space-y-space-sm border transition-all ${
              isSelected
                ? 'bg-surface-container border-primary/40 ring-1 ring-primary/20'
                : 'bg-surface-container/70 border-surface-container-highest/40 hover:border-surface-container-highest opacity-85 hover:opacity-100'
            }`}
          >
            {/* Top row: Airline & Status/Action */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    flight.airlineCode === '6E'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-secondary/20 text-secondary border border-secondary/30'
                  }`}
                >
                  {flight.airlineCode}
                </span>
                <div>
                  <div className="font-semibold text-sm text-on-surface">
                    {flight.flightNumber}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {flight.aircraft}
                  </div>
                </div>
              </div>

              {isSelected ? (
                <span className="px-3 py-1 rounded-full bg-tertiary-container/30 text-tertiary text-xs font-semibold flex items-center gap-1.5 border border-tertiary/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected for Trip</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectFlight(flight.id)}
                  className="px-3 py-1 rounded-full bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface text-xs font-medium transition-colors"
                >
                  Select Alternative
                </button>
              )}
            </div>

            {/* Flight Transit Graphic */}
            <div className="grid grid-cols-3 items-center py-2">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-on-surface">
                  {flight.departureTime}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {flight.departureAirport}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[11px] text-outline font-medium">{flight.duration}</span>
                <div className="w-full flex items-center gap-1 my-1">
                  <div className="h-0.5 flex-1 bg-surface-container-highest" />
                  <Plane
                    className={`w-4 h-4 ${
                      isSelected ? 'text-primary' : 'text-outline'
                    }`}
                  />
                  <div className="h-0.5 flex-1 bg-surface-container-highest" />
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    flight.onTimePercent ? 'text-tertiary' : 'text-outline'
                  }`}
                >
                  {flight.onTimePercent ? `On-time ${flight.onTimePercent}%` : flight.serviceType}
                </span>
              </div>

              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-on-surface">
                  {flight.arrivalTime}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {flight.arrivalAirport}
                </div>
              </div>
            </div>

            {/* Price and Baggage Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 bg-surface-container-low p-2.5 rounded-lg border border-surface-container-high/30">
              <div className="text-xs text-on-surface-variant">
                {flight.baggageInfo}
              </div>
              <div
                className={`text-sm sm:text-base font-bold ${
                  isSelected ? 'text-primary' : 'text-on-surface'
                }`}
              >
                {flight.currency}
                {flight.pricePerPerson.toLocaleString()}{' '}
                <span className="text-xs text-on-surface-variant font-normal">
                  / person ({flight.currency}{flight.totalForPax.toLocaleString()} total)
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
