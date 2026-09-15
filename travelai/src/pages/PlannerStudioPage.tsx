import React from 'react';
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
}

export const PlannerStudioPage: React.FC<PlannerStudioPageProps> = ({
  trip,
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
}) => {
  return (
    <div className="w-full flex-1 flex flex-col xl:flex-row min-h-[calc(100vh-4rem)] p-3 sm:p-4 lg:p-6 gap-4 lg:gap-6 overflow-hidden">
      {/* LEFT PANE: Chat & Autonomous Assistant Desk */}
      <ChatPanel
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
