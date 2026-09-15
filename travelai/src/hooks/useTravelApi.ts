import { useState, useEffect, useCallback, MouseEvent } from 'react';
import {
  TripSummary,
  ItineraryDay,
  FlightOption,
  HotelOption,
  WeatherCondition,
  BudgetOverview,
  ChatMessage,
  ApiStatusState,
  SavedTripSnippet,
  ConversationHistoryItem
} from '../types';
import {
  checkFastApiHealth,
  fetchTripItinerary,
  fetchFlightOptions,
  fetchHotelOptions,
  fetchWeatherCondition,
  fetchBudgetOverview,
  fetchSavedTripsList,
  sendChatMessage,
  INITIAL_CONVERSATIONS,
  INITIAL_CHAT_MESSAGES,
  getApiBaseUrl,
  setApiBaseUrl,
} from '../services/api';

export function useTravelApi() {
  // Navigation & View states
  const [activePage, setActivePage] = useState<'planner-studio' | 'itinerary-hub' | 'bookings-desk' | 'ai-places-memory'>('planner-studio');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'route-tab' | 'flights-tab' | 'hotels-tab' | 'weather-tab' | 'budget-tab'>('route-tab');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  // API Status & Health State
  const [apiStatus, setApiStatus] = useState<ApiStatusState>({
    isConnected: false,
    endpointUrl: getApiBaseUrl(),
    statusCode: null,
    statusMessage: 'Connecting to FastAPI...',
    mode: 'mock-fallback',
  });
  const [isCheckingApi, setIsCheckingApi] = useState(false);

  // Core Trip & Entity Data
  const [trip, setTrip] = useState<TripSummary | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [budget, setBudget] = useState<BudgetOverview | null>(null);
  const [savedTrips, setSavedTrips] = useState<SavedTripSnippet[]>([]);
  const [conversations, setConversations] = useState<ConversationHistoryItem[]>(INITIAL_CONVERSATIONS);

  // Chat & Messaging state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [promptInput, setPromptInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Active Selected Trip ID
  const [activeTripId, setActiveTripId] = useState<string>('goa-coastal-v24');

  // Load health & trip data
  const loadData = useCallback(async () => {
    setIsCheckingApi(true);
    const health = await checkFastApiHealth();
    setApiStatus(health);
    setIsCheckingApi(false);

    try {
      const itineraryRes = await fetchTripItinerary(activeTripId);
      setTrip(itineraryRes.trip);
      setDays(itineraryRes.days);

      const [flightsRes, hotelsRes, weatherRes, budgetRes, tripsRes] = await Promise.all([
        fetchFlightOptions(activeTripId),
        fetchHotelOptions(activeTripId),
        fetchWeatherCondition('Goa, India'),
        fetchBudgetOverview(activeTripId),
        fetchSavedTripsList(),
      ]);

      setFlights(flightsRes);
      setHotels(hotelsRes);
      setWeather(weatherRes);
      setBudget(budgetRes);
      setSavedTrips(tripsRes);
    } catch (err) {
      console.warn('Using initial fallback state:', err);
    }
  }, [activeTripId]);

  useEffect(() => {
    loadData();
    // Re-check API health periodically every 25 seconds
    const interval = setInterval(() => {
      checkFastApiHealth().then(setApiStatus);
    }, 25000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handler: Update FastAPI Base URL
  const updateApiUrl = async (newUrl: string) => {
    setApiBaseUrl(newUrl);
    setIsCheckingApi(true);
    const health = await checkFastApiHealth();
    setApiStatus(health);
    setIsCheckingApi(false);
    loadData();
  };

  // Handler: Send Chat message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || promptInput).trim();
    if (!text || isSendingMessage) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setIsSendingMessage(true);

    try {
      const response = await sendChatMessage(text, activeTripId);
      setMessages((prev) => [...prev, response.replyMessage]);
    } catch {
      // Fallback assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Acknowledged: "${text}". Updated itinerary route parameters.`,
        },
      ]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handler: Select Flight
  const handleSelectFlight = (flightId: string) => {
    setFlights((prev) =>
      prev.map((f) => ({
        ...f,
        isSelected: f.id === flightId,
      }))
    );
  };

  // Handler: Select Hotel
  const handleSelectHotel = (hotelId: string) => {
    setHotels((prev) =>
      prev.map((h) => ({
        ...h,
        isBooked: h.id === hotelId,
      }))
    );
  };

  // Handler: Delete conversation
  const handleDeleteConversation = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    activePage,
    setActivePage,
    activeDashboardTab,
    setActiveDashboardTab,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isApiModalOpen,
    setIsApiModalOpen,
    apiStatus,
    isCheckingApi,
    updateApiUrl,
    trip,
    days,
    flights,
    hotels,
    weather,
    budget,
    savedTrips,
    conversations,
    messages,
    promptInput,
    setPromptInput,
    isSendingMessage,
    handleSendMessage,
    handleSelectFlight,
    handleSelectHotel,
    handleDeleteConversation,
    activeTripId,
    setActiveTripId,
    refreshData: loadData,
  };
}
