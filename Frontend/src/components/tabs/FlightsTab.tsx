import React from 'react';
import { Plane, CheckCircle2, ExternalLink, Calendar, Search } from 'lucide-react';
import { FlightOption } from '../../types';

interface FlightsTabProps {
  flights: FlightOption[];
  onSelectFlight: (id: string) => void;
  destination?: string;
  trip?: any;
}

export const FlightsTab: React.FC<FlightsTabProps> = ({
  flights,
  onSelectFlight,
  destination,
  trip,
}) => {
  const first = flights && flights.length > 0 ? flights[0] : null;
  const routeHeader = React.useMemo(() => {
    if (first && first.departureAirport && first.arrivalAirport) {
      return `Matched Flights: ${first.departureAirport} ⇄ ${first.arrivalAirport}`;
    }
    if (destination) {
      return `Matched Flights: ${destination}`;
    }
    return 'Matched Route Flights';
  }, [first?.departureAirport, first?.arrivalAirport, destination]);

  return (
    <div className="space-y-space-md animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-on-surface">
            {routeHeader}
          </h2>
          <p className="text-xs text-on-surface-variant">
            Live schedules & fares synchronized with trip dates, baggage, and flexible cancellation
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium self-start sm:self-auto border border-primary/20">
          {flights.length} Available
        </span>
      </div>

      {(!flights || flights.length === 0) ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-surface-container border border-surface-container-highest/60 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-on-surface">No flights yet</h3>
          <p className="text-xs text-on-surface-variant max-w-sm">
            No transit options have been matched or requested for this expedition. Prompt the assistant in Dispatch Studio to search flights.
          </p>
        </div>
      ) : (
        flights.map((flight, idx) => {
          const isSelected = flight.isSelected;
          const depDate = flight.departureDate || trip?.start_date || trip?.startDate || 'Departure Date';
          const depIso = flight.departureDateIso || (depDate.includes('-') ? depDate : '');
          const googleUrl = flight.googleFlightsUrl || (
            depIso 
              ? `https://www.google.com/travel/flights?q=Flights%20to%20${flight.arrivalAirport}%20from%20${flight.departureAirport}%20on%20${depIso}`
              : `https://www.google.com/travel/flights?q=Flights%20to%20${flight.arrivalAirport}%20from%20${flight.departureAirport}`
          );
          const searchUrl = flight.searchUrl || `https://www.google.com/search?q=${encodeURIComponent(`${flight.airlineName || flight.airlineCode || 'Flight'} ${flight.flightNumber} ${flight.departureAirport} to ${flight.arrivalAirport} ${depIso || depDate}`)}`;

          return (
            <div
              key={flight.id || `flight-${idx}`}
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
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-on-surface">
                      {flight.airlineName ? `${flight.airlineName} (${flight.flightNumber})` : flight.flightNumber}
                    </span>
                    {depDate && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full border border-tertiary/20">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{depDate}</span>
                      </span>
                    )}
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
                <div className="text-xs font-medium text-on-surface-variant">
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
                <div className="text-xs font-medium text-on-surface-variant">
                  {flight.arrivalAirport}
                </div>
              </div>
            </div>

            {/* Price, Baggage and Google Flights Link Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 bg-surface-container-low p-2.5 rounded-lg border border-surface-container-high/30">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-on-surface-variant">
                  {flight.baggageInfo}
                </span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline hover:text-primary/80 transition-colors bg-primary/10 px-2 py-0.5 rounded border border-primary/20"
                    title={`Cross-check exact flights for ${flight.departureAirport} ⇄ ${flight.arrivalAirport} on Google Flights`}
                  >
                    <span>Google Flights</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface hover:underline transition-colors px-1.5 py-0.5"
                    title={`Search ${flight.flightNumber} schedule details on Google`}
                  >
                    <Search className="w-2.5 h-2.5" />
                    <span>Track Schedule</span>
                  </a>
                </div>
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
      }))}
    </div>
  );
};

