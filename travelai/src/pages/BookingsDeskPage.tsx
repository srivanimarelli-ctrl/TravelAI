import React from 'react';
import { Plane, Hotel, Car, CheckCircle2, Calendar, Download } from 'lucide-react';
import { FlightOption, HotelOption } from '../types';

interface BookingsDeskPageProps {
  flights: FlightOption[];
  hotels: HotelOption[];
  onGoToStudio: () => void;
}

export const BookingsDeskPage: React.FC<BookingsDeskPageProps> = ({
  flights,
  hotels,
}) => {
  const selectedFlight = flights.find((f) => f.isSelected) || flights[0];
  const bookedHotel = hotels.find((h) => h.isBooked) || hotels[0];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Plane className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Bookings & Reservations Desk
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Confirmed flight tickets, hotel vouchers, and private transfers
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs sm:text-sm font-semibold transition-colors border border-surface-container-highest/60 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>Download All Vouchers</span>
        </button>
      </div>

      {/* Main Bookings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Booking Card */}
        {selectedFlight && (
          <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Plane className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Confirmed Flight
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary/15 text-tertiary text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> PNR #6E9482
              </span>
            </div>

            <div>
              <div className="text-lg font-bold text-on-surface">
                {selectedFlight.flightNumber}
              </div>
              <div className="text-xs text-on-surface-variant">
                {selectedFlight.aircraft}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-base text-on-surface">
                  {selectedFlight.departureTime}
                </div>
                <div className="text-on-surface-variant">{selectedFlight.departureAirport}</div>
              </div>
              <div className="text-center font-medium text-outline text-[11px]">
                {selectedFlight.duration}
              </div>
              <div className="text-right">
                <div className="font-bold text-base text-on-surface">
                  {selectedFlight.arrivalTime}
                </div>
                <div className="text-on-surface-variant">{selectedFlight.arrivalAirport}</div>
              </div>
            </div>

            <div className="text-xs text-on-surface-variant space-y-1">
              <div><strong>Baggage:</strong> {selectedFlight.baggageInfo}</div>
              <div><strong>Passenger Seats:</strong> 14B, 14C (Executive Cabin)</div>
            </div>
          </div>
        )}

        {/* Hotel Booking Card */}
        {bookedHotel && (
          <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-tertiary/10 text-tertiary">
                  <Hotel className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">
                  Confirmed Lodge
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary/15 text-tertiary text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Res #TAJ8830
              </span>
            </div>

            <div>
              <div className="text-lg font-bold text-on-surface">
                {bookedHotel.name}
              </div>
              <div className="text-xs text-on-surface-variant">
                {bookedHotel.location}
              </div>
            </div>

            <div className="h-32 rounded-xl overflow-hidden relative">
              <img
                src={bookedHotel.imageUrl}
                alt={bookedHotel.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-end justify-between text-xs text-white">
                <span>{bookedHotel.roomType}</span>
                <span className="font-bold">3 Nights Reserved</span>
              </div>
            </div>

            <div className="text-xs text-on-surface-variant space-y-1">
              <div><strong>Check-in:</strong> Apr 12, 2026 (12:00 PM)</div>
              <div><strong>Check-out:</strong> Apr 15, 2026 (11:00 AM)</div>
            </div>
          </div>
        )}

        {/* Chauffeur Sedan Booking */}
        <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <Car className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Private Transfer
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-secondary text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Disp #GOA-SEDAN
            </span>
          </div>

          <div>
            <div className="text-lg font-bold text-on-surface">
              Mercedes-Benz E-Class Sedan
            </div>
            <div className="text-xs text-on-surface-variant">
              Dedicated Chauffeur for 4 Days Circuit
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Pickup:</span>
              <span className="font-medium text-on-surface">GOX Terminal Arrival</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Driver:</span>
              <span className="font-medium text-on-surface">Rajesh V. (+91 98201 44810)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Dropoff:</span>
              <span className="font-medium text-on-surface">GOI Airport Departure</span>
            </div>
          </div>

          <div className="text-xs text-on-surface-variant">
            <span>Includes 24/7 on-call city transit, air conditioning, and toll fees.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
