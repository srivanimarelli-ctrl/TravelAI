import React, { useRef } from 'react';
import { X, MapPin, Phone, Globe, ExternalLink, Star, Compass, Clock, ShieldCheck } from 'lucide-react';
import { PrivateTravelService } from '../types';
import { useModalFocus } from '../hooks/useModalFocus';

interface PrivateServiceModalProps {
  provider: PrivateTravelService | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrivateServiceModal: React.FC<PrivateServiceModalProps> = ({
  provider,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalFocus(modalRef, isOpen, onClose);

  if (!isOpen || !provider) return null;

  const googleMapsUrl = (provider.maps_url && !provider.maps_url.includes('serpapi.com'))
    ? provider.maps_url
    : (provider.latitude != null && provider.longitude != null)
    ? `https://www.google.com/maps/search/?api=1&query=${provider.latitude},${provider.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.name + ' ' + (provider.address || provider.location))}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-provider-title"
        className="w-full max-w-lg rounded-2xl bg-surface-container border border-surface-container-highest shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Image or Banner */}
        <div className="relative h-48 w-full bg-surface-container-highest overflow-hidden shrink-0">
          {provider.image_url ? (
            <img
              src={provider.image_url}
              alt={provider.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Graceful fallback if external image URL expires
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
              <Compass className="w-12 h-12 opacity-60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/90 text-on-primary text-[10px] font-bold uppercase tracking-wider">
              {provider.service_category}
            </span>
            <h2 id="modal-provider-title" className="text-lg font-bold mt-1 text-white truncate">
              {provider.name}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-on-surface">
          {/* Rating & Location Tag */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-container-highest/60">
            <div className="flex items-center gap-1.5">
              {provider.rating ? (
                <>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                    <span>{provider.rating.toFixed(1)}</span>
                  </div>
                  {provider.review_count && (
                    <span className="text-on-surface-variant text-[11px]">
                      ({provider.review_count.toLocaleString()} Google reviews)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-on-surface-variant text-[11px] italic">Verified provider</span>
              )}
            </div>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span>{provider.source === 'serpapi_google_maps' ? 'Verified Google Maps' : 'Verified Partner'}</span>
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-3">
            {/* Address */}
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-on-surface">Address</span>
                <span className="text-on-surface-variant text-[11px]">{provider.address}</span>
              </div>
            </div>

            {/* Hours */}
            {provider.operating_hours && (
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-on-surface">Operating Hours</span>
                  <span className="text-on-surface-variant text-[11px]">{provider.operating_hours}</span>
                </div>
              </div>
            )}

            {/* Coordinates */}
            {provider.latitude && provider.longitude && (
              <div className="flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-on-surface">GPS Coordinates</span>
                  <span className="text-on-surface-variant font-mono text-[11px]">
                    {provider.latitude.toFixed(4)}, {provider.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            )}

            {/* Price if genuinely present */}
            {provider.price && (
              <div className="p-2.5 rounded-xl bg-tertiary/5 border border-tertiary/20">
                <span className="font-semibold block text-tertiary">Estimated Rates / Tier</span>
                <span className="text-on-surface text-[11px]">{provider.price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-container-high/60 border-t border-surface-container-highest flex flex-wrap items-center justify-end gap-2 shrink-0">
          {provider.phone ? (
            <a
              href={`tel:${provider.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-bright text-primary border border-primary/30 text-xs font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact: {provider.phone}</span>
            </a>
          ) : (
            <span className="text-[11px] text-on-surface-variant italic px-2">Phone not listed</span>
          )}

          {provider.website && (
            <a
              href={provider.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface border border-surface-container-highest text-xs font-semibold transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
              <ExternalLink className="w-3 h-3 text-on-surface-variant" />
            </a>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>View on Map</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-surface-container-highest text-on-surface text-xs font-medium hover:bg-surface-container-highest/40 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
