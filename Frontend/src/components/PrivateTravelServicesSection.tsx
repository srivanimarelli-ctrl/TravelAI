import React, { useEffect, useState } from 'react';
import {
  Compass,
  Star,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Info,
  Car,
  UserCheck,
  Building2,
  Navigation
} from 'lucide-react';
import { PrivateTravelService } from '../types';
import { fetchPrivateTravelServices } from '../services/api';
import { PrivateServiceModal } from './PrivateServiceModal';

interface PrivateTravelServicesSectionProps {
  destination?: string | null;
  className?: string;
}

export const PrivateTravelServicesSection: React.FC<PrivateTravelServicesSectionProps> = ({
  destination,
  className = '',
}) => {
  const [providers, setProviders] = useState<PrivateTravelService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PrivateTravelService | null>(null);

  const cleanDestination = (destination || '').trim();

  useEffect(() => {
    let isMounted = true;
    if (!cleanDestination) {
      setProviders([]);
      return;
    }

    // Immediately clear stale providers from previous trip
    setProviders([]);
    setIsLoading(true);
    setError(null);
    setIsExpanded(false);

    fetchPrivateTravelServices(cleanDestination, 12)
      .then((res) => {
        if (!isMounted) return;
        setProviders(res.providers || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Private travel services fetch error:', err);
        setError('Unable to load private services for this location.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cleanDestination]);

  if (!cleanDestination) return null;

  // Initial top 3, or all when expanded
  const displayedProviders = isExpanded ? providers : providers.slice(0, 3);
  const hasMore = providers.length > 3;

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('cab') || cat.includes('taxi')) return Car;
    if (cat.includes('guide')) return UserCheck;
    if (cat.includes('agency')) return Building2;
    return Compass;
  };

  return (
    <section
      aria-label="Private Travel Services"
      className={`rounded-2xl bg-surface-container border border-surface-container-high/70 p-5 sm:p-6 space-y-4 shadow-sm ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-highest/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-on-surface">
              Private Travel Services
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
              {cleanDestination}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Verified local tour guides, private cab operators, and licensed travel agencies operating in {cleanDestination}.
          </p>
        </div>

        {providers.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-semibold self-start sm:self-auto border border-tertiary/20">
            {providers.length} {providers.length === 1 ? 'Provider' : 'Providers'} Discovered
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-surface-container-low border border-surface-container-highest/40 p-4 space-y-3">
              <div className="h-32 rounded-lg bg-surface-container-highest/60 w-full" />
              <div className="h-4 bg-surface-container-highest/60 rounded w-3/4" />
              <div className="h-3 bg-surface-container-highest/40 rounded w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-surface-container-highest/50 rounded-lg flex-1" />
                <div className="h-8 bg-surface-container-highest/50 rounded-lg flex-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && providers.length === 0 && (
        <div className="p-8 rounded-xl bg-surface-container-low border border-surface-container-highest/40 text-center space-y-2">
          <Compass className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
          <p className="text-xs font-semibold text-on-surface">
            No private travel services found for this destination.
          </p>
          <p className="text-[11px] text-on-surface-variant max-w-sm mx-auto">
            You can verify local transport and sightseeing options directly with your hotel concierge or local tourist information center upon arrival.
          </p>
        </div>
      )}

      {/* Providers Grid */}
      {!isLoading && providers.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedProviders.map((provider) => {
              const CategoryIcon = getCategoryIcon(provider.service_category);

              return (
                <div
                  key={provider.id}
                  className="rounded-xl bg-surface-container-low border border-surface-container-highest/60 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Image or Header Bar */}
                  <div className="relative h-36 w-full bg-surface-container-highest overflow-hidden">
                    {provider.image_url ? (
                      <img
                        src={provider.image_url}
                        alt={provider.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                        <CategoryIcon className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold border border-white/10 flex items-center gap-1">
                        <CategoryIcon className="w-3 h-3 text-primary" />
                        <span>{provider.service_category}</span>
                      </span>
                    </div>

                    {/* Rating badge on image */}
                    {provider.rating && (
                      <div className="absolute bottom-2 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{provider.rating.toFixed(1)}</span>
                        {provider.review_count && (
                          <span className="text-white/70 font-normal">
                            ({provider.review_count})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                        {provider.name}
                      </h3>
                      <div className="flex items-start gap-1 text-[11px] text-on-surface-variant mt-1 line-clamp-2">
                        <MapPin className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        <span>{provider.address}</span>
                      </div>
                    </div>

                    {/* Quick Metadata */}
                    <div className="pt-2 border-t border-surface-container-highest/40 flex items-center justify-between text-[10px] text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Verified Google Maps</span>
                      </span>
                      {provider.price && (
                        <span className="font-semibold text-tertiary">{provider.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-3 bg-surface-container-high/40 border-t border-surface-container-highest/60 flex flex-wrap items-center gap-1.5">
                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => setSelectedProvider(provider)}
                      className="flex-1 min-w-[70px] flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface text-[11px] font-semibold transition-colors cursor-pointer"
                      title="View complete details and location"
                    >
                      <Info className="w-3 h-3 text-primary" />
                      <span>Details</span>
                    </button>

                    {/* Contact Provider */}
                    {provider.phone ? (
                      <a
                        href={`tel:${provider.phone}`}
                        className="flex-1 min-w-[75px] flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold transition-colors"
                        title={`Call ${provider.phone}`}
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 min-w-[75px] flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-surface-container-highest/30 text-on-surface-variant/40 text-[11px] font-medium cursor-not-allowed"
                        title="Contact number not available"
                      >
                        <Phone className="w-3 h-3 opacity-40" />
                        <span>Call</span>
                      </button>
                    )}

                    {/* Visit Website */}
                    {provider.website ? (
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface border border-surface-container-highest text-[11px] transition-colors"
                        title="Open official website"
                      >
                        <Globe className="w-3.5 h-3.5 text-tertiary" />
                      </a>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-surface-container/20 text-on-surface-variant/30 border border-transparent">
                        <Globe className="w-3.5 h-3.5 opacity-30" />
                      </span>
                    )}

                    {/* View on Map */}
                    {provider.maps_url ? (
                      <a
                        href={provider.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface border border-surface-container-highest text-[11px] transition-colors"
                        title="View on Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5 text-primary" />
                      </a>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-surface-container/20 text-on-surface-variant/30 border border-transparent">
                        <Navigation className="w-3.5 h-3.5 opacity-30" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* View More / Show Less Toggle Button */}
          {hasMore && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary text-xs font-semibold border border-primary/20 transition-all cursor-pointer shadow-sm"
              >
                {isExpanded ? (
                  <>
                    <span>Show top 3 providers</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>View More ({providers.length - 3} more providers)</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Provider Details Modal */}
      <PrivateServiceModal
        isOpen={Boolean(selectedProvider)}
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
      />
    </section>
  );
};
