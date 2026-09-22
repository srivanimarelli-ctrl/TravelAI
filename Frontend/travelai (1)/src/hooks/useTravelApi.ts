import { useState, useCallback, useMemo } from 'react';
import { Trip, Waypoint } from '../types';

const INITIAL_WAYPOINTS: Waypoint[] = [
  {
    id: 'wp-1',
    name: 'Grossglockner High Alpine Road',
    location: 'Hohe Tauern National Park',
    country: 'Austria',
    coordinates: { lat: 47.0833, lng: 12.8428 },
    elevation: '2,504 m',
    scenicRating: 4.9,
    category: 'Alpine Vista',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    description: '48 km of high alpine winding asphalt with 36 hairpin turns into the heart of the Austrian Alps.',
    bestSeason: 'June – October',
    difficulty: 'Challenging Alpine',
  },
  {
    id: 'wp-2',
    name: 'Stelvio Pass (Passo dello Stelvio)',
    location: 'Ortler Alps, South Tyrol',
    country: 'Italy',
    coordinates: { lat: 46.5293, lng: 10.4531 },
    elevation: '2,757 m',
    scenicRating: 5.0,
    category: 'Mountain Pass',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    description: 'Legendary 48 switchback turns climbing through glacial cirques into panoramic mountain summits.',
    bestSeason: 'Late May – October',
    difficulty: 'Challenging Alpine',
  },
  {
    id: 'wp-3',
    name: 'Transfăgărășan Highway',
    location: 'Făgăraș Mountains',
    country: 'Romania',
    coordinates: { lat: 45.5997, lng: 24.6178 },
    elevation: '2,042 m',
    scenicRating: 4.8,
    category: 'Mountain Pass',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    description: 'A winding high-altitude highway carving through dramatic glacial valleys and the Balea Waterfall.',
    bestSeason: 'July – September',
    difficulty: 'Intermediate Twisties',
  },
  {
    id: 'wp-4',
    name: 'Pacific Coast Highway 1',
    location: 'Big Sur, California',
    country: 'United States',
    coordinates: { lat: 36.2704, lng: -121.8081 },
    elevation: '320 m',
    scenicRating: 4.9,
    category: 'Coastal Road',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Iconic ocean cliffs, dramatic coastal fog, and Bixby Bridge overlooking the Pacific waves.',
    bestSeason: 'Year-Round (Best Spring/Fall)',
    difficulty: 'Easy Scenic',
  },
  {
    id: 'wp-5',
    name: 'Furka Pass Glacier Run',
    location: 'Urner Alps',
    country: 'Switzerland',
    coordinates: { lat: 46.5726, lng: 8.415 },
    elevation: '2,429 m',
    scenicRating: 4.9,
    category: 'Alpine Vista',
    image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80',
    description: 'Renowned pass featured in classic cinema, offering direct views of the Rhone Glacier ice grotto.',
    bestSeason: 'June – October',
    difficulty: 'Challenging Alpine',
  },
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    title: 'Alpine Grand Odyssey 2026',
    destination: 'Austria, Switzerland & Northern Italy',
    startDate: '2026-07-12',
    endDate: '2026-07-22',
    waypointsCount: 14,
    status: 'Active',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    distanceKm: 1420,
    estimatedDuration: '10 Days',
    highlights: ['Stelvio Pass 48 Hairpins', 'Grossglockner Summit', 'Dolomite High Passages'],
  },
  {
    id: 'trip-2',
    title: 'Carpathian Ridge Expedition',
    destination: 'Transylvania, Romania',
    startDate: '2026-09-04',
    endDate: '2026-09-11',
    waypointsCount: 8,
    status: 'Planning',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    distanceKm: 860,
    estimatedDuration: '7 Days',
    highlights: ['Transfăgărășan Pass', 'Balea Glacial Lake', 'Corvin Castle'],
  },
];

export function useTravelApi() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>(INITIAL_WAYPOINTS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'waypoints' | 'trips' | 'planner'>('waypoints');

  const filteredWaypoints = useMemo(() => {
    return waypoints.filter((wp) => {
      const matchesCategory = selectedCategory === 'All' || wp.category === selectedCategory;
      const matchesSearch =
        wp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wp.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [waypoints, selectedCategory, searchQuery]);

  const addTrip = useCallback((newTrip: Omit<Trip, 'id'>) => {
    const trip: Trip = {
      ...newTrip,
      id: 'trip-' + Date.now().toString(36),
    };
    setTrips((prev) => [trip, ...prev]);
  }, []);

  return {
    waypoints: filteredWaypoints,
    allWaypoints: waypoints,
    trips,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    addTrip,
  };
}
