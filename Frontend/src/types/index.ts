/**
 * TypeScript Data Models & Interfaces for TravelAI FastAPI Frontend
 */

export interface LocationChip {
  label: string;
  sublabel?: string;
  icon: string;
  colorClass?: string;
}

export interface ActivitySegment {
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  time: string;
  title: string;
  description: string;
  categoryColor: 'primary' | 'secondary' | 'tertiary';
  location?: string;
  cost?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  title: string;
  transitBadge: string;
  activities: ActivitySegment[];
}

export interface FlightOption {
  id: string;
  airlineCode: string;
  airlineName?: string;
  flightNumber: string;
  aircraft: string;
  departureTime: string;
  departureAirport: string;
  departureDate?: string;
  departureDateIso?: string;
  arrivalTime: string;
  arrivalAirport: string;
  duration: string;
  onTimePercent?: number;
  serviceType: string;
  baggageInfo: string;
  pricePerPerson: number;
  currency: string;
  totalForPax: number;
  isSelected?: boolean;
  bookingUrl?: string;
  googleFlightsUrl?: string;
  searchUrl?: string;
}

export interface HotelOption {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  imageAlt: string;
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  roomType: string;
  features: string[];
  isBooked?: boolean;
  cancellationPolicy?: string;
}

export interface WeatherCondition {
  temperatureCelsius: number;
  feelsLikeCelsius: number;
  conditionDescription: string;
  humidityPercent: number;
  windSpeedKmh: string;
  uvIndex: number;
  uvDescription: string;
  dailyForecast: Array<{
    dayNumber: number;
    date: string;
    dayLabel: string;
    icon: string;
    tempHigh: number;
    tempLow: number;
    rainChancePercent: number;
    conditionText: string;
  }>;
}

export interface BudgetItem {
  category: 'Flights' | 'Accommodations' | 'Gastronomy' | 'Activities & Spa' | 'Safety Reserve';
  allocatedAmount: number;
  percentage: number;
  sublabel: string;
  color: string;
  colorName: 'primary' | 'tertiary' | 'secondary' | 'primary-container' | 'outline';
}

export interface BudgetOverview {
  totalBudget: number;
  allocatedExpenditure: number;
  unallocatedBuffer: number;
  consumptionPercentage: number;
  currencySymbol: string;
  travelersCount?: number;
  breakdown: BudgetItem[];
  savingsInsightTitle: string;
  savingsInsightBody: string;
}

export interface TripSummary {
  id: string;
  title: string;
  destination: string;
  duration: string;
  daysCount: number;
  nightsCount: number;
  travelersCount: number;
  budgetEstimate: string;
  status: 'Confirmed Plan' | 'Drafting' | 'Archived';
  heroImageUrl: string;
  bespokeCircuitLabel: string;
  activeWaypointsCount: number;
  routeHeadline: string;
  travelStyle?: string;
  budgetMode?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  richContent?: {
    versionHeadline?: string;
    optimizationRate?: string;
    leadParagraph?: string;
    highlights?: Array<{
      icon: string;
      category: string;
      detail: string;
      color: 'primary' | 'secondary' | 'tertiary';
    }>;
    actionButton?: {
      label: string;
      tabTarget: string;
      icon: string;
    };
    hotelRecommendations?: Array<{
      id: string;
      name: string;
      locationSnippet: string;
      rating: number;
      pricePerNight: string;
      isApplied?: boolean;
    }>;
  };
}

export interface ConversationHistoryItem {
  id: string;
  title: string;
  timeAgo: string;
}

export interface SavedTripSnippet {
  id: string;
  name: string;
  destinationTag: string;
  daysTag: string;
}

export interface ApiStatusState {
  isConnected: boolean;
  endpointUrl: string;
  statusCode: number | null;
  statusMessage: string;
  mode: 'live' | 'mock-fallback';
  lastPingAt?: string;
}

export interface PlaceMemoryItem {
  id: string;
  name: string;
  category: string;
  tag: string;
  location: string;
  rating: number;
  note: string;
  price: string;
}

