/**
 * FastAPI REST Client & Service Layer
 * 
 * Configured via Vite environment variable VITE_FASTAPI_URL.
 * Supports fallback to graceful mock state if the backend is not yet started or endpoint is in development.
 */

import {
  TripSummary,
  ItineraryDay,
  FlightOption,
  HotelOption,
  WeatherCondition,
  BudgetOverview,
  ChatMessage,
  SavedTripSnippet,
  ConversationHistoryItem,
  ApiStatusState
} from '../types';

// Environment variable with runtime local-storage override capability
const ENV_API_URL = import.meta.env.VITE_FASTAPI_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('TRAVELAI_FASTAPI_URL');
    if (customUrl) return customUrl.trim();
  }
  return ENV_API_URL;
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || url.trim() === '') {
      localStorage.removeItem('TRAVELAI_FASTAPI_URL');
    } else {
      localStorage.setItem('TRAVELAI_FASTAPI_URL', url.trim());
    }
  }
}

// -------------------------------------------------------------
// Base Fetch Utility
// -------------------------------------------------------------
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        data: null,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network request failed';
    return { data: null, error: msg, status: 0 };
  }
}

// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------
export async function checkFastApiHealth(): Promise<ApiStatusState> {
  const baseUrl = getApiBaseUrl();
  try {
    // Try /api/health or / or /docs
    const result = await apiRequest<{ status?: string }>('/api/health');
    if (result.status >= 200 && result.status < 400) {
      return {
        isConnected: true,
        endpointUrl: baseUrl,
        statusCode: result.status,
        statusMessage: '200 OK - Connected',
        mode: 'live',
        lastPingAt: new Date().toLocaleTimeString(),
      };
    }

    // Try root endpoint
    const rootResult = await apiRequest<{ message?: string }>('/');
    if (rootResult.status >= 200 && rootResult.status < 400) {
      return {
        isConnected: true,
        endpointUrl: baseUrl,
        statusCode: rootResult.status,
        statusMessage: `${rootResult.status} OK - Connected`,
        mode: 'live',
        lastPingAt: new Date().toLocaleTimeString(),
      };
    }

    return {
      isConnected: false,
      endpointUrl: baseUrl,
      statusCode: null,
      statusMessage: 'Standby / Mock Fallback',
      mode: 'mock-fallback',
      lastPingAt: new Date().toLocaleTimeString(),
    };
  } catch {
    return {
      isConnected: false,
      endpointUrl: baseUrl,
      statusCode: null,
      statusMessage: 'Standby / Mock Fallback',
      mode: 'mock-fallback',
      lastPingAt: new Date().toLocaleTimeString(),
    };
  }
}

// -------------------------------------------------------------
// Fallback Mock Data (matches Stitch design exactly)
// -------------------------------------------------------------
export const INITIAL_TRIP: TripSummary = {
  id: 'goa-coastal-v24',
  title: 'Goa Coastal Splendor & Heritage',
  destination: 'Goa, India',
  duration: '4 Days, 3 Nights',
  daysCount: 4,
  nightsCount: 3,
  travelersCount: 2,
  budgetEstimate: '₹50,000 Est. Budget',
  status: 'Confirmed Plan',
  heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlx7gAJoMQBXDwbj6pcwTqIFcYOsmHvoW4FP-ompYmqI5sdLnZA_V_Vo7s2KaplYKZasc62M2PUG1oCM8TH0Z07k10P6QveYrXQL7OAzs_LtZujhGa5DgZj2B1Lt83FtvfbX5cf4OzbSPNc0HxZSxA0n70yRDsXRUzj3Cs3tyKLFvOticj1qWp-a5SvwUFFe5M7wTtu3leSHjY1VvKgmhcc0WV-OM1qDNk60-lJxEzj7UZUxDQDjkCFg',
  bespokeCircuitLabel: 'Bespoke Circuit',
  activeWaypointsCount: 4,
  routeHeadline: 'North Coast • Old Goa • Chapora River',
};

export const INITIAL_ITINERARY_DAYS: ItineraryDay[] = [
  {
    dayNumber: 1,
    date: 'Apr 12',
    title: 'Day 1: North Goa Coastline & Sunset Arrival',
    transitBadge: 'Private Chauffeur Sedan',
    activities: [
      {
        timeOfDay: 'Morning',
        time: '11:30',
        title: 'Touchdown GOX & Transfer',
        description: 'Executive pickup from Manohar International Airport; check-in at Taj Holiday Village Candolim.',
        categoryColor: 'primary',
      },
      {
        timeOfDay: 'Afternoon',
        time: '14:00',
        title: 'Thalassa Vagator Dining',
        description: 'Greek & fresh seafood lunch with cliff views overlooking Ozran Beach shoreline.',
        categoryColor: 'secondary',
      },
      {
        timeOfDay: 'Evening',
        time: '17:45',
        title: 'Sunset Cruise on Chapora',
        description: 'Private catamaran voyage with handcrafted cocktails and coastal acoustics.',
        categoryColor: 'tertiary',
      },
    ],
  },
  {
    dayNumber: 2,
    date: 'Apr 13',
    title: 'Day 2: Old Goa Heritage & Fontainhas Latin Quarter',
    transitBadge: 'Guided Heritage Escort',
    activities: [
      {
        timeOfDay: 'Morning',
        time: '09:30',
        title: 'Basilica of Bom Jesus UNESCO',
        description: 'Walk through 16th-century baroque architecture and Se Cathedral heritage archives.',
        categoryColor: 'primary',
      },
      {
        timeOfDay: 'Afternoon',
        time: '13:30',
        title: 'Fontainhas Walk & Lunch',
        description: 'Explore colorful Portuguese colonial residences followed by authentic Indo-Portuguese degustation.',
        categoryColor: 'secondary',
      },
      {
        timeOfDay: 'Evening',
        time: '19:30',
        title: 'Baga Beachfront Dining',
        description: 'Private candle-lit beachfront table with tiger prawns & Kingfish recheado.',
        categoryColor: 'tertiary',
      },
    ],
  },
  {
    dayNumber: 3,
    date: 'Apr 14',
    title: 'Day 3: Private Catamaran & Rejuvenation Spa',
    transitBadge: 'Private Yacht Charter',
    activities: [
      {
        timeOfDay: 'Morning',
        time: '08:30',
        title: 'South Coast Dolphin Cruise',
        description: 'Private charter navigating calm waters with wild dolphin spotting and reef swimming.',
        categoryColor: 'primary',
      },
      {
        timeOfDay: 'Afternoon',
        time: '15:00',
        title: 'Jiva Ayurvedic Wellness',
        description: '90-minute signature herbal massage and hydrotherapy at Taj Wellness Spa.',
        categoryColor: 'secondary',
      },
      {
        timeOfDay: 'Evening',
        time: '20:00',
        title: "Chef's Table at Cavatina",
        description: 'Contemporary Goan gastronomy curated by Chef Avinash Martins.',
        categoryColor: 'tertiary',
      },
    ],
  },
  {
    dayNumber: 4,
    date: 'Apr 15',
    title: 'Day 4: Serene Morjim Beach & Departure',
    transitBadge: 'Outbound Flight DEL',
    activities: [
      {
        timeOfDay: 'Morning',
        time: '08:00',
        title: 'Morjim Shoreline Yoga',
        description: 'Morning beach session, organic tropical smoothies, and turtle sanctuary walk.',
        categoryColor: 'primary',
      },
      {
        timeOfDay: 'Afternoon',
        time: '13:00',
        title: 'Artisanal Cashew & Spice Market',
        description: 'Boutique shopping for feni, roasted organic cashews, and indigenous spices in Mapusa.',
        categoryColor: 'secondary',
      },
      {
        timeOfDay: 'Evening',
        time: '17:30',
        title: 'GOI Airport Transfer',
        description: 'Chauffeured sedan to Goa Dabolim / GOX for evening direct flight to New Delhi.',
        categoryColor: 'tertiary',
      },
    ],
  },
];

export const INITIAL_FLIGHTS: FlightOption[] = [
  {
    id: 'fl-6e204',
    airlineCode: '6E',
    flightNumber: 'IndiGo 6E-204',
    aircraft: 'Airbus A321neo • Direct Non-Stop',
    departureTime: '08:15',
    departureAirport: 'DEL (Indira Gandhi T3)',
    arrivalTime: '10:40',
    arrivalAirport: 'GOI (Dabolim Intl)',
    duration: '2h 25m',
    onTimePercent: 96,
    serviceType: 'Selected for Trip',
    baggageInfo: 'Includes 15kg Baggage + Standard Seat Selection',
    pricePerPerson: 6450,
    currency: '₹',
    totalForPax: 12900,
    isSelected: true,
  },
  {
    id: 'fl-ai883',
    airlineCode: 'AI',
    flightNumber: 'Air India AI-883',
    aircraft: 'Boeing 787-8 • Full Service Direct',
    departureTime: '11:10',
    departureAirport: 'DEL (Terminal 3)',
    arrivalTime: '13:45',
    arrivalAirport: 'GOX (North Goa)',
    duration: '2h 35m',
    serviceType: 'Hot Meal Included',
    baggageInfo: 'Includes 25kg Baggage + Hot Gourmet Meal',
    pricePerPerson: 7890,
    currency: '₹',
    totalForPax: 15780,
    isSelected: false,
  },
  {
    id: 'fl-qp1341',
    airlineCode: 'QP',
    flightNumber: 'Akasa Air QP-1341',
    aircraft: 'Boeing 737 MAX 8 • Express Direct',
    departureTime: '14:20',
    departureAirport: 'DEL (Terminal 2)',
    arrivalTime: '16:50',
    arrivalAirport: 'GOX (North Goa)',
    duration: '2h 30m',
    serviceType: 'Eco Express',
    baggageInfo: 'Includes 15kg Checked Baggage',
    pricePerPerson: 5920,
    currency: '₹',
    totalForPax: 11840,
    isSelected: false,
  },
];

export const INITIAL_HOTELS: HotelOption[] = [
  {
    id: 'ht-taj-village',
    name: 'Taj Holiday Village Resort & Spa',
    location: 'Sinquerim Beach, Candolim, North Goa',
    rating: 4.9,
    reviewCount: 1240,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAarl8JpZER6C92bP4Z09unjUmjhIRwgcisHQIl3iLYYS8KpZqi-62cTQCYeiESVvEzVNKDr4ocefQ5F2OTubQ95KBO4kpatrjFSzrqpy2cshjmLM0NKo4j68HD81jJ_VddnQCqKZ9uevPFU4cjgcGweFBm8oTW2YsUHczINBgZJy-V4V3SIjKOSdai9Au-y2TTIzbT7-yzeZvSdseJO56O1HTHAvzhtECr8wcFMrUz_VL0VDOBXPvNmA',
    imageAlt: 'Luxury beachfront villa at Taj Holiday Village in Goa with lush coconut palms, sea-view patio, terracotta architecture.',
    pricePerNight: 14200,
    totalPrice: 21300,
    nights: 3,
    roomType: 'Sea-view Villa',
    features: ['Sea-view Villa', 'Complimentary Breakfast', 'Jiva Spa Access', 'Infinity Lap Pool'],
    isBooked: true,
  },
  {
    id: 'ht-w-goa',
    name: 'W Goa, Vagator',
    location: 'Vagator Beach, North Goa',
    rating: 4.8,
    reviewCount: 890,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsaYyNq5PWaAfEwGiq6HHbKuJiQx_WzOQnX0OWEO0TzCAkxzivcQrHTCzBLArS06p4hAXuobk48J36hNa1TTDMflMM8PDU0V9H0IjDaGoFk68w_hYBPvTGbkLC6E58yN7iAn9Zgxn3GCHR_9xenqJ9ElUAVzx9ufvHu7JpM3IRokGDHmOFQhgbm3ra7Kamzd0lVdao_nPVfFpBTUyBaECWbc6c6gbhkLH8ZgSviUPxHkUy1IulfVYUdA',
    imageAlt: 'High-end modern luxury resort W Goa in Vagator with elevated cliffside pool deck overlooking the Arabian Sea.',
    pricePerNight: 16400,
    totalPrice: 24600,
    nights: 3,
    roomType: 'Wonderful Room',
    features: ['Wonderful Room', 'Rock Pool Deck', 'Cocktail Lounge'],
    isBooked: false,
    cancellationPolicy: 'Flexible cancellation up to 48h',
  },
];

export const INITIAL_WEATHER: WeatherCondition = {
  temperatureCelsius: 31,
  feelsLikeCelsius: 33,
  conditionDescription: 'Sunny & Breezy',
  humidityPercent: 68,
  windSpeedKmh: '14 km/h • WSW Calm Swells',
  uvIndex: 8,
  uvDescription: 'UV Index • Sunscreen Advised',
  dailyForecast: [
    {
      dayNumber: 1,
      date: 'Apr 12',
      dayLabel: 'Day 1',
      icon: 'sunny',
      tempHigh: 31,
      tempLow: 24,
      rainChancePercent: 0,
      conditionText: '0% Rain',
    },
    {
      dayNumber: 2,
      date: 'Apr 13',
      dayLabel: 'Day 2',
      icon: 'partly_cloudy_day',
      tempHigh: 32,
      tempLow: 25,
      rainChancePercent: 5,
      conditionText: '5% Rain',
    },
    {
      dayNumber: 3,
      date: 'Apr 14',
      dayLabel: 'Day 3',
      icon: 'wb_sunny',
      tempHigh: 30,
      tempLow: 24,
      rainChancePercent: 0,
      conditionText: '0% Rain',
    },
    {
      dayNumber: 4,
      date: 'Apr 15',
      dayLabel: 'Day 4',
      icon: 'air',
      tempHigh: 31,
      tempLow: 24,
      rainChancePercent: 0,
      conditionText: 'Breezy',
    },
  ],
};

export const INITIAL_BUDGET: BudgetOverview = {
  totalBudget: 50000,
  allocatedExpenditure: 46800,
  unallocatedBuffer: 3200,
  consumptionPercentage: 93.6,
  currencySymbol: '₹',
  breakdown: [
    {
      category: 'Flights',
      allocatedAmount: 12900,
      percentage: 25.8,
      sublabel: '25.8% (2 Pax)',
      color: '#89ceff',
      colorName: 'primary',
    },
    {
      category: 'Accommodations',
      allocatedAmount: 21300,
      percentage: 42.6,
      sublabel: '42.6% (Taj Stay)',
      color: '#4edea3',
      colorName: 'tertiary',
    },
    {
      category: 'Gastronomy',
      allocatedAmount: 8400,
      percentage: 16.8,
      sublabel: '16.8% (Fine Dining)',
      color: '#c0c1ff',
      colorName: 'secondary',
    },
    {
      category: 'Activities & Spa',
      allocatedAmount: 4200,
      percentage: 8.4,
      sublabel: '8.4% (Cruise & Tours)',
      color: '#0ea5e9',
      colorName: 'primary-container',
    },
    {
      category: 'Safety Reserve',
      allocatedAmount: 3200,
      percentage: 6.4,
      sublabel: '6.4% Cash Buffer',
      color: '#88929b',
      colorName: 'outline',
    },
  ],
  savingsInsightTitle: 'TravelAI Dynamic Savings Insight',
  savingsInsightBody:
    'Booking your departure flight via GOI Dabolim instead of GOX saved ₹2,880 on transfer surcharges. Total package aligns with luxury tier parameters without exceeding the ceiling.',
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    timestamp: '10:24 AM',
    text: 'Plan an unforgettable 4-day luxury trip to Goa for 2 people with a ₹50,000 budget. Include heritage forts, beach clubs, and fine seafood dining.',
  },
  {
    id: 'msg-2',
    sender: 'assistant',
    timestamp: '10:25 AM',
    richContent: {
      versionHeadline: 'Goa Coastal Architecture • v2.4',
      optimizationRate: 'Optimization 99.4%',
      leadParagraph:
        'I have compiled a premier 4-day bespoke coastal route combining Portuguese heritage architecture, sunset cruises on the Chapora River, and handpicked seafood gastronomy.',
      highlights: [
        {
          icon: 'flight_takeoff',
          category: 'Transit',
          detail: 'IndiGo non-stop flights synchronized with private chauffeur sedan.',
          color: 'primary',
        },
        {
          icon: 'hotel',
          category: 'Stay',
          detail: 'Taj Holiday Village Candolim (Sea-facing Cottage).',
          color: 'tertiary',
        },
        {
          icon: 'restaurant',
          category: 'Catering',
          detail: 'Reserved slots at Thalassa Vagator and Cavatina South Goa.',
          color: 'secondary',
        },
      ],
      actionButton: {
        label: 'Inspect Route & Logistics Matrix',
        tabTarget: 'route-tab',
        icon: 'visibility',
      },
    },
  },
  {
    id: 'msg-3',
    sender: 'user',
    timestamp: '10:28 AM',
    text: 'Can you recommend luxury beachfront stays in North Goa with infinity pools?',
  },
  {
    id: 'msg-4',
    sender: 'assistant',
    timestamp: '10:29 AM',
    richContent: {
      leadParagraph:
        'Selected two coastal sanctuaries matching your criteria with private pools, signature dining, and prompt checkout access:',
      hotelRecommendations: [
        {
          id: 'ht-w-goa-mini',
          name: 'W Goa',
          locationSnippet: 'Vagator Cliff Edge • Rock Pool',
          rating: 4.9,
          pricePerNight: '₹16,400',
          isApplied: false,
        },
        {
          id: 'ht-taj-mini',
          name: 'Taj Holiday Village',
          locationSnippet: 'Candolim Beachfront Villa',
          rating: 4.9,
          pricePerNight: '₹14,200',
          isApplied: true,
        },
      ],
    },
  },
];

export const INITIAL_CONVERSATIONS: ConversationHistoryItem[] = [
  { id: 'c-kyoto', title: 'Kyoto Cherry Blossoms 2025', timeAgo: '2h ago' },
  { id: 'c-amalfi', title: 'Amalfi Coast Road Trip', timeAgo: 'Yesterday' },
  { id: 'c-swiss', title: 'Swiss Alps Summer Trek', timeAgo: '3d ago' },
];

export const INITIAL_SAVED_TRIPS: SavedTripSnippet[] = [
  { id: 'trip-tokyo', name: 'Tokyo Explorer', destinationTag: 'Tokyo', daysTag: '7 Days' },
  { id: 'trip-jaipur', name: 'Rajasthan Royal Heritage', destinationTag: 'Jaipur', daysTag: '3 Days' },
  { id: 'trip-goa', name: 'Coastal Sunset Retreat', destinationTag: 'Goa', daysTag: '4 Days' },
];

// -------------------------------------------------------------
// Service API Methods (calls FastAPI with graceful fallback)
// -------------------------------------------------------------

export async function fetchTripItinerary(tripId?: string): Promise<{
  trip: TripSummary;
  days: ItineraryDay[];
}> {
  const endpoint = tripId ? `/api/trips/${tripId}` : '/api/trips/active';
  const result = await apiRequest<{ trip: TripSummary; days: ItineraryDay[] }>(endpoint);

  if (result.data && result.data.trip) {
    return result.data;
  }
  return { trip: INITIAL_TRIP, days: INITIAL_ITINERARY_DAYS };
}

export async function fetchFlightOptions(tripId?: string): Promise<FlightOption[]> {
  const endpoint = tripId ? `/api/flights?tripId=${tripId}` : '/api/flights';
  const result = await apiRequest<FlightOption[]>(endpoint);
  if (result.data && Array.isArray(result.data)) {
    return result.data;
  }
  return INITIAL_FLIGHTS;
}

export async function fetchHotelOptions(tripId?: string): Promise<HotelOption[]> {
  const endpoint = tripId ? `/api/hotels?tripId=${tripId}` : '/api/hotels';
  const result = await apiRequest<HotelOption[]>(endpoint);
  if (result.data && Array.isArray(result.data)) {
    return result.data;
  }
  return INITIAL_HOTELS;
}

export async function fetchWeatherCondition(destination?: string): Promise<WeatherCondition> {
  const endpoint = destination ? `/api/weather?destination=${encodeURIComponent(destination)}` : '/api/weather';
  const result = await apiRequest<WeatherCondition>(endpoint);
  if (result.data && result.data.temperatureCelsius) {
    return result.data;
  }
  return INITIAL_WEATHER;
}

export async function fetchBudgetOverview(tripId?: string): Promise<BudgetOverview> {
  const endpoint = tripId ? `/api/budget?tripId=${tripId}` : '/api/budget';
  const result = await apiRequest<BudgetOverview>(endpoint);
  if (result.data && result.data.totalBudget) {
    return result.data;
  }
  return INITIAL_BUDGET;
}

export async function fetchSavedTripsList(): Promise<SavedTripSnippet[]> {
  const result = await apiRequest<SavedTripSnippet[]>('/api/trips');
  if (result.data && Array.isArray(result.data)) {
    return result.data;
  }
  return INITIAL_SAVED_TRIPS;
}

export async function sendChatMessage(
  prompt: string,
  tripId?: string
): Promise<{ replyMessage: ChatMessage }> {
  const result = await apiRequest<{ replyMessage: ChatMessage }>('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify({
      message: prompt,
      tripId: tripId || 'goa-coastal-v24',
      timestamp: new Date().toISOString(),
    }),
  });

  if (result.data && result.data.replyMessage) {
    return result.data;
  }

  // Simulated fallback response from assistant matching Stitch style
  const fallbackReply: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    richContent: {
      versionHeadline: 'TravelAI Node Recalibration',
      optimizationRate: 'Optimization 99.8%',
      leadParagraph: `Acknowledged: "${prompt}". Recalibrating route nodes to factor in your request. Your itinerary timeline has been updated with real-time transit and availability parameters.`,
      highlights: [
        {
          icon: 'explore',
          category: 'Recalibrated',
          detail: 'Adjusted waypoint arrival windows and synchronized transfer buffer.',
          color: 'primary',
        },
      ],
      actionButton: {
        label: 'View Refined Timeline',
        tabTarget: 'route-tab',
        icon: 'calendar_month',
      },
    },
  };

  return { replyMessage: fallbackReply };
}
