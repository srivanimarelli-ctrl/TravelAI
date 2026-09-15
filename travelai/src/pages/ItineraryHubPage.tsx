import React from 'react';
import { CalendarDays, MapPin, ArrowRight, Clock, Wallet, Users, Compass } from 'lucide-react';
import { TripSummary, SavedTripSnippet } from '../types';

interface ItineraryHubPageProps {
  currentTrip: TripSummary | null;
  savedTrips: SavedTripSnippet[];
  onOpenTrip: (tripId: string) => void;
  onGoToStudio: () => void;
}

export const ItineraryHubPage: React.FC<ItineraryHubPageProps> = ({
  currentTrip,
  savedTrips,
  onOpenTrip,
  onGoToStudio,
}) => {
  const allItineraries = [
    {
      id: 'goa-coastal-v24',
      title: 'Goa Coastal Splendor & Heritage',
      destination: 'Goa, India',
      duration: '4 Days, 3 Nights',
      budget: '₹50,000 Est. Budget',
      status: 'Confirmed Plan',
      pax: '2 Travelers',
      highlight: 'Portuguese architecture, Chapora sunset cruise & Cavatina dining',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlx7gAJoMQBXDwbj6pcwTqIFcYOsmHvoW4FP-ompYmqI5sdLnZA_V_Vo7s2KaplYKZasc62M2PUG1oCM8TH0Z07k10P6QveYrXQL7OAzs_LtZujhGa5DgZj2B1Lt83FtvfbX5cf4OzbSPNc0HxZSxA0n70yRDsXRUzj3Cs3tyKLFvOticj1qWp-a5SvwUFFe5M7wTtu3leSHjY1VvKgmhcc0WV-OM1qDNk60-lJxEzj7UZUxDQDjkCFg',
    },
    {
      id: 'tokyo-explorer',
      title: 'Tokyo Explorer & High-Speed Transit',
      destination: 'Tokyo, Japan',
      duration: '7 Days, 6 Nights',
      budget: '¥320,000 Est. Budget',
      status: 'In Review',
      pax: '2 Travelers',
      highlight: 'Shinjuku neon walks, teamLab Planets & Hakone onsen escape',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'rajasthan-heritage',
      title: 'Rajasthan Royal Haveli Heritage',
      destination: 'Jaipur, India',
      duration: '3 Days, 2 Nights',
      budget: '₹38,000 Est. Budget',
      status: 'Drafting',
      pax: '4 Travelers',
      highlight: 'Amber Fort private elephant sanctuary, City Palace & Jal Mahal',
      imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Itinerary Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Archived, active, and generated trips synchronized via FastAPI
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToStudio}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary transition-colors shadow-md self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Open Active in Studio</span>
        </button>
      </div>

      {/* Grid of Itineraries */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allItineraries.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-surface-container border border-surface-container-highest/60 overflow-hidden shadow-lg hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-44 relative overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-tertiary text-xs font-semibold border border-surface-container-highest/60">
                  {item.status}
                </span>
                <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-on-surface font-medium">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{item.destination}</span>
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-base font-semibold text-on-surface">
                  {item.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {item.highlight}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-on-surface-variant font-medium">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high">
                    <Clock className="w-3 h-3 text-tertiary" />
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high">
                    <Wallet className="w-3 h-3 text-secondary" />
                    <span>{item.budget}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high">
                    <Users className="w-3 h-3 text-outline" />
                    <span>{item.pax}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => {
                  onOpenTrip(item.id);
                  onGoToStudio();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-xs font-semibold transition-colors border border-surface-container-highest/60"
              >
                <span>Load into Dispatch Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
