import React from 'react';
import { Compass, CalendarDays, Plus, Loader2 } from 'lucide-react';
import { ChatPanel } from '../components/ChatPanel';
import { DashboardPanel } from '../components/DashboardPanel';
import {
  TripSummary,
  ItineraryDay,
  FlightOption,
  HotelOption,
  WeatherCondition,
  BudgetOverview,
  ChatMessage,
  ApiStatusState
} from '../types';

interface PlannerStudioPageProps {
  trip: TripSummary | null;
  travelContext?: Record<string, any> | null;
  currentIntent?: string | null;
  onUpdatePreference?: (updates: Partial<Record<string, any>>) => void;
  days: ItineraryDay[];
  flights: FlightOption[];
  hotels: HotelOption[];
  weather: WeatherCondition | null;
  budget: BudgetOverview | null;
  messages: ChatMessage[];
  promptInput: string;
  onPromptChange: (val: string) => void;
  onSendMessage: (textToSend?: string) => void;
  isSending: boolean;
  activeTab: 'route-tab' | 'flights-tab' | 'hotels-tab' | 'weather-tab' | 'budget-tab';
  onSwitchTab: (tab: 'route-tab' | 'flights-tab' | 'hotels-tab' | 'weather-tab' | 'budget-tab') => void;
  onSelectFlight: (id: string) => void;
  onSelectHotel: (id: string) => void;
  apiStatus: ApiStatusState;
  onClearContext: () => void;
  onNavigateToItineraryHub?: () => void;
  onNewTrip?: () => void;
}

export const PlannerStudioPage: React.FC<PlannerStudioPageProps> = ({
  trip,
  travelContext,
  currentIntent,
  onUpdatePreference,
  days,
  flights,
  hotels,
  weather,
  budget,
  messages,
  promptInput,
  onPromptChange,
  onSendMessage,
  isSending,
  activeTab,
  onSwitchTab,
  onSelectFlight,
  onSelectHotel,
  apiStatus,
  onClearContext,
  onNavigateToItineraryHub,
  onNewTrip,
}) => {
  // Empty State: Render when no trip or invalid trip
  if (!trip) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 text-center animate-in fade-in">
        <div className="max-w-md w-full p-8 rounded-2xl bg-surface-container border border-surface-container-highest/60 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-on-surface">No Active Trip Selected</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Select a trip from Itinerary Hub or create a new one
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onNavigateToItineraryHub && (
              <button
                type="button"
                onClick={onNavigateToItineraryHub}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-fixed transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Go to Itinerary Hub</span>
              </button>
            )}
            {onNewTrip && (
              <button
                type="button"
                onClick={onNewTrip}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold border border-surface-container-highest/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                title="Open New Chat & Plan Trip"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span>Create New Trip</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col xl:flex-row min-h-[calc(100vh-4rem)] p-3 sm:p-4 lg:p-6 gap-4 lg:gap-6 overflow-hidden">
      {/* LEFT PANE: Chat & Autonomous Assistant Desk */}
      <ChatPanel
        trip={trip}
        travelContext={travelContext}
        currentIntent={currentIntent}
        onUpdatePreference={onUpdatePreference}
        messages={messages}
        promptInput={promptInput}
        onPromptChange={onPromptChange}
        onSendMessage={onSendMessage}
        isSending={isSending}
        onSwitchTab={onSwitchTab}
        apiStatus={apiStatus}
        onClearContext={onClearContext}
      />

      {/* RIGHT PANE: Itinerary & Trip Architecture Dashboard */}
      <DashboardPanel
        trip={trip}
        days={days}
        flights={flights}
        hotels={hotels}
        weather={weather}
        budget={budget}
        activeTab={activeTab}
        onSwitchTab={onSwitchTab}
        onSelectFlight={onSelectFlight}
        onSelectHotel={onSelectHotel}
      />
    </div>
  );
};
