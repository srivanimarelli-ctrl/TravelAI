import React, { useState } from 'react';
import { Sparkles, MapPin, Star, Heart, ExternalLink, Plus } from 'lucide-react';

export const AiPlacesMemoryPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const places = [
    {
      id: 'p-cavatina',
      name: 'Cavatina by Chef Avinash Martins',
      category: 'Dining & Gastronomy',
      tag: 'dining',
      location: 'Benaulim, South Goa',
      rating: 4.9,
      note: 'Reimagined contemporary Goan culinary tasting menu with smoked pork and stuffed squid.',
      isSaved: true,
      price: '₹₹₹₹',
    },
    {
      id: 'p-thalassa',
      name: 'Thalassa Greek Taverna',
      category: 'Sunset Beach Club',
      tag: 'beach',
      location: 'Ozran Beach, Vagator',
      rating: 4.8,
      note: 'Cliffside sunset panoramic lounge overlooking the rocky Arabian Sea shores.',
      isSaved: true,
      price: '₹₹₹',
    },
    {
      id: 'p-bom-jesus',
      name: 'Basilica of Bom Jesus',
      category: 'UNESCO Heritage Monument',
      tag: 'heritage',
      location: 'Old Goa',
      rating: 4.9,
      note: '16th century Jesuit architecture holding mortal relics of St. Francis Xavier.',
      isSaved: true,
      price: 'Free Entry',
    },
    {
      id: 'p-fontainhas',
      name: 'Fontainhas Latin Quarter',
      category: 'Colonial Architecture Walking Tour',
      tag: 'heritage',
      location: 'Panaji',
      rating: 4.8,
      note: 'Pastel yellow and cobalt blue Portuguese villas, tiled roofs, and antique bakeries.',
      isSaved: true,
      price: 'Self-guided',
    },
    {
      id: 'p-morjim',
      name: 'Morjim Turtle Sanctuary Beach',
      category: 'Pristine Eco Sanctuary',
      tag: 'beach',
      location: 'Morjim, North Goa',
      rating: 4.7,
      note: 'Calm waters, nesting ground of Olive Ridley sea turtles, and tranquil shoreline yoga.',
      isSaved: true,
      price: 'Free Entry',
    },
  ];

  const filteredPlaces =
    selectedTag === 'all'
      ? places
      : places.filter((p) => p.tag === selectedTag);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] p-4 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              AI Places Memory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Handpicked sensory spots, local dining, and architectural gems remembered by TravelAI
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'dining', 'beach', 'heritage'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Places Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            className="rounded-2xl bg-surface-container border border-surface-container-highest/60 p-5 shadow-lg space-y-3 hover:border-primary/40 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                  {place.category}
                </span>
                <h3 className="text-base font-semibold text-on-surface mt-0.5">
                  {place.name}
                </h3>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-lg text-tertiary bg-tertiary/10 hover:bg-tertiary/20 transition-colors"
                title="Saved to Memory"
              >
                <Heart className="w-4 h-4 fill-tertiary" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{place.location}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 text-tertiary font-semibold">
                <Star className="w-3.5 h-3.5 fill-tertiary" />
                <span>{place.rating}</span>
              </div>
              <span>•</span>
              <span className="text-outline">{place.price}</span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {place.note}
            </p>

            <div className="pt-2 border-t border-surface-container-high/40 flex items-center justify-between text-xs">
              <span className="text-outline text-[11px]">Indexed via TravelGraph-Pro</span>
              <button
                type="button"
                className="text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <span>Append to Route</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
