import React from 'react';
import { MapPin, Star, Check } from 'lucide-react';
import { HotelOption } from '../../types';

interface HotelsTabProps {
  hotels: HotelOption[];
  onSelectHotel: (id: string) => void;
}

export const HotelsTab: React.FC<HotelsTabProps> = ({
  hotels,
  onSelectHotel,
}) => {
  return (
    <div className="space-y-space-md animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-on-surface">
            Handpicked 5-Star Accommodations
          </h2>
          <p className="text-xs text-on-surface-variant">
            Filtered by luxury score, beachfront location, and user ratings &gt; 4.8
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-semibold self-start sm:self-auto border border-tertiary/20">
          {hotels.length} Matches
        </span>
      </div>

      {hotels.map((hotel) => {
        const isBooked = hotel.isBooked;
        return (
          <div
            key={hotel.id}
            className={`rounded-xl p-space-md shadow-md grid grid-cols-1 md:grid-cols-12 gap-space-md items-center border transition-all ${
              isBooked
                ? 'bg-surface-container border-tertiary/40 ring-1 ring-tertiary/20'
                : 'bg-surface-container/70 border-surface-container-highest/40 hover:border-surface-container-highest opacity-85 hover:opacity-100'
            }`}
          >
            {/* Hotel Image with Review overlay */}
            <div className="md:col-span-4 h-48 rounded-lg overflow-hidden relative">
              <img
                src={hotel.imageUrl}
                alt={hotel.imageAlt}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-surface-container-lowest/85 backdrop-blur-md text-tertiary text-[11px] font-semibold flex items-center gap-1 border border-surface-container-highest/60">
                <Star className="w-3.5 h-3.5 fill-tertiary text-tertiary" />
                <span>
                  {hotel.rating} ({hotel.reviewCount} Reviews)
                </span>
              </span>
            </div>

            {/* Hotel Information */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-space-sm h-full">
              <div className="flex items-start justify-between gap-space-xs">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-on-surface">
                    {hotel.name}
                  </h3>
                  <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{hotel.location}</span>
                  </div>
                </div>

                {isBooked ? (
                  <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary text-xs font-semibold whitespace-nowrap flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active Booking</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectHotel(hotel.id)}
                    className="px-3 py-1 rounded-full bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-xs font-medium transition-colors"
                  >
                    Switch Stay
                  </button>
                )}
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-on-surface-variant text-xs">
                {hotel.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-surface-container-high border border-surface-container-highest/60 text-[11px]"
                  >
                    {feat}
                  </span>
                ))}
              </div>

              {/* Pricing & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/40">
                <div>
                  <div className="text-lg font-bold text-tertiary">
                    ₹{hotel.pricePerNight.toLocaleString()}{' '}
                    <span className="text-xs text-on-surface-variant font-normal">
                      / night
                    </span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    ₹{hotel.totalPrice.toLocaleString()} total for {hotel.nights} nights (shared)
                  </div>
                </div>

                {isBooked ? (
                  <button
                    type="button"
                    className="px-space-md py-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface text-xs font-medium transition-colors border border-surface-container-highest"
                  >
                    View Room Details
                  </button>
                ) : (
                  <span className="text-xs text-outline hidden sm:inline">
                    {hotel.cancellationPolicy || 'Flexible cancellation'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
