import React, { useState } from 'react';
import {
  Plane,
  Hotel,
  Car,
  CheckCircle2,
  Calendar,
  Download,
  Share2,
  Compass,
  Printer,
  Phone,
  Check,
  CalendarDays,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { FlightOption, HotelOption, TripSummary } from '../types';

interface BookingsDeskPageProps {
  trip: TripSummary | null;
  flights: FlightOption[];
  hotels: HotelOption[];
  onGoToStudio: () => void;
  onNavigateToItineraryHub?: () => void;
}

export const BookingsDeskPage: React.FC<BookingsDeskPageProps> = ({
  trip,
  flights,
  hotels,
  onGoToStudio,
  onNavigateToItineraryHub,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'flights' | 'hotels' | 'transfers'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedFlight = flights.find((f) => f.isSelected) || flights[0];
  const bookedHotel = hotels.find((h) => h.isBooked) || hotels[0];

  const handleShareCodes = () => {
    const codes = `TravelAI Reservation Codes for ${trip?.title || 'Trip'}:\n• Flight PNR: #6E9482 (${selectedFlight?.flightNumber || '6E-204'})\n• Hotel Voucher: #TAJ8830 (${bookedHotel?.name || 'Taj Resort'})\n• Chauffeur: #GOA-SEDAN (Rajesh V., +91 98201 44810)`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(codes);
      showToast('Reservation codes copied to clipboard!');
    } else {
      showToast('Reservation codes ready!');
    }
  };

  const handleCopyDriverPhone = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('+91 98201 44810');
      showToast('Chauffeur contact copied to clipboard!');
    }
  };

  // Empty State if no trip is selected
  if (!trip) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] p-6 flex items-center justify-center animate-in fade-in">
        <div className="max-w-md w-full p-8 rounded-2xl bg-surface-container border border-surface-container-highest/60 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-on-surface">No Active Trip Selected</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Bookings and travel vouchers are generated from an active trip itinerary. Select an itinerary from the hub or generate a new one in Dispatch Studio.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onNavigateToItineraryHub && (
              <button
                type="button"
                onClick={onNavigateToItineraryHub}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold border border-surface-container-highest/60 transition-all flex items-center justify-center gap-2"
              >
                <CalendarDays className="w-4 h-4 text-tertiary" />
                <span>Browse Itineraries</span>
              </button>
            )}
            <button
              type="button"
              onClick={onGoToStudio}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Go to Dispatch Studio</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 lg:p-8 space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            Confirmed flights, luxury stays, and private transfers for{' '}
            <strong className="text-on-surface">{trip.title}</strong>
          </p>
        </div>

        {/* Header Action Buttons: Studio Navigation, Print, Share */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onGoToStudio}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary-fixed transition-colors shadow-md"
            title="Open active trip in Dispatch Studio"
          >
            <Compass className="w-4 h-4" />
            <span>Open in Dispatch Studio</span>
          </button>

          <button
            type="button"
            aria-label="Share reservation codes"
            onClick={handleShareCodes}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs sm:text-sm font-semibold transition-colors border border-surface-container-highest/60"
            title="Copy reservation codes to clipboard"
          >
            <Share2 className="w-4 h-4 text-secondary" />
            <span>Share Codes</span>
          </button>

          <button
            type="button"
            aria-label="Download and print all vouchers"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs sm:text-sm font-semibold transition-colors border border-surface-container-highest/60"
            title="Print all vouchers to PDF"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Print All Vouchers</span>
          </button>
        </div>
      </div>

      {/* Scope Architecture Notice Banner */}
      <div className="p-3.5 rounded-xl bg-surface-container border border-surface-container-highest/60 flex items-center justify-between text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-tertiary flex-shrink-0" />
          <span>
            <strong>Client-Side Reservation Desk:</strong> All booking vouchers are derived from your active trip state. To customize flight or hotel selections, use the interactive selectors in Dispatch Studio.
          </span>
        </div>
        <span className="hidden md:inline font-mono text-[11px] text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full border border-tertiary/20">
          No external booking API required
        </span>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container border border-surface-container-highest/60 w-fit">
        {[
          { id: 'all', label: 'All Bookings (3)' },
          { id: 'flights', label: 'Flights (1)' },
          { id: 'hotels', label: 'Accommodations (1)' },
          { id: 'transfers', label: 'Transfers (1)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === tab.id
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Bookings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Empty Category States */}
        {activeCategory === 'flights' && !selectedFlight && (
          <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 p-8 shadow-lg text-center space-y-3 col-span-full">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-on-surface">No flight booked yet</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Select an available flight in Dispatch Studio to view confirmed tickets and boarding passes.
            </p>
          </div>
        )}

        {activeCategory === 'hotels' && !bookedHotel && (
          <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 p-8 shadow-lg text-center space-y-3 col-span-full">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center mx-auto">
              <Hotel className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-on-surface">No accommodation booked yet</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Select a stay option in Dispatch Studio to view confirmed hotel vouchers and check-in details.
            </p>
          </div>
        )}

        {/* Flight Booking Card */}
        {(activeCategory === 'all' || activeCategory === 'flights') && selectedFlight && (
          <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 p-6 shadow-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
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
                <div><strong>Fare Category:</strong> Flexible Corporate Pass</div>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high/40 flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-medium transition-colors border border-surface-container-highest/60 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-primary" />
                <span>Print Ticket</span>
              </button>
              <button
                type="button"
                onClick={onGoToStudio}
                className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary text-xs font-medium transition-colors border border-surface-container-highest/60"
                title="Change flight in Studio"
              >
                Change in Studio
              </button>
            </div>
          </div>
        )}

        {/* Hotel Booking Card */}
        {(activeCategory === 'all' || activeCategory === 'hotels') && bookedHotel && (
          <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 p-6 shadow-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
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
                <div><strong>Meal Plan:</strong> Gourmet Buffet Breakfast Included</div>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high/40 flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-medium transition-colors border border-surface-container-highest/60 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-tertiary" />
                <span>Print Voucher</span>
              </button>
              <button
                type="button"
                onClick={onGoToStudio}
                className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-tertiary text-xs font-medium transition-colors border border-surface-container-highest/60"
                title="Change hotel in Studio"
              >
                Change in Studio
              </button>
            </div>
          </div>
        )}

        {/* Chauffeur Sedan Booking Card */}
        {(activeCategory === 'all' || activeCategory === 'transfers') && (
          <div className="rounded-2xl bg-surface-container border border-surface-container-highest/60 p-6 shadow-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
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
                  Dedicated Chauffeur for {trip.duration || 'Curated Circuit'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/40 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Pickup:</span>
                  <span className="font-medium text-on-surface">
                    {selectedFlight ? `${selectedFlight.arrivalAirport} Terminal Arrival` : 'Airport Arrival'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Driver:</span>
                  <span className="font-medium text-on-surface">Rajesh V. (+91 98201 44810)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Dropoff:</span>
                  <span className="font-medium text-on-surface">
                    {bookedHotel ? bookedHotel.name : (trip.destination ? `${trip.destination} Center` : 'City Center')}
                  </span>
                </div>
              </div>

              <div className="text-xs text-on-surface-variant space-y-1">
                <div><strong>Inclusions:</strong> 24/7 dedicated city transit, air conditioning, toll fees</div>
                <div><strong>Luggage Capacity:</strong> 3 Large Suitcases</div>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high/40 flex items-center gap-2">
              <a
                href="tel:+919820144810"
                className="flex-1 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-medium transition-colors border border-surface-container-highest/60 flex items-center justify-center gap-1.5 text-center"
              >
                <Phone className="w-3.5 h-3.5 text-secondary" />
                <span>Call Driver</span>
              </a>
              <button
                type="button"
                onClick={handleCopyDriverPhone}
                className="py-2 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-secondary text-xs font-medium transition-colors border border-surface-container-highest/60 flex items-center gap-1"
                title="Copy chauffeur phone number"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
