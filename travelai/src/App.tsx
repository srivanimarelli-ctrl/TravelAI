/**
 * TravelAI - Autonomous Trip Architecture Frontend
 * 
 * Production-ready React + TypeScript + Vite + Tailwind CSS frontend
 * configured to communicate with an existing FastAPI REST backend.
 */

import React from 'react';
import { useTravelApi } from './hooks/useTravelApi';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ApiConfigModal } from './components/ApiConfigModal';
import { PlannerStudioPage } from './pages/PlannerStudioPage';
import { ItineraryHubPage } from './pages/ItineraryHubPage';
import { BookingsDeskPage } from './pages/BookingsDeskPage';
import { AiPlacesMemoryPage } from './pages/AiPlacesMemoryPage';

export default function App() {
  const {
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
    setActiveTripId,
  } = useTravelApi();

  const handleNewTrip = () => {
    handleSendMessage('Create a new bespoke itinerary draft');
    setActivePage('planner-studio');
  };

  const handleClearContext = () => {
    setPromptInput('');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex font-sans antialiased selection:bg-primary-container selection:text-on-primary">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        conversations={conversations}
        savedTrips={savedTrips}
        apiStatus={apiStatus}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onDeleteConversation={handleDeleteConversation}
        onNewTrip={handleNewTrip}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header */}
        <Header
          apiStatus={apiStatus}
          activeTrip={trip}
          onOpenApiModal={() => setIsApiModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onSelectTripPreset={(presetName) => {
            if (presetName.includes('Tokyo')) {
              setActiveTripId('tokyo-explorer');
            } else if (presetName.includes('Rajasthan')) {
              setActiveTripId('rajasthan-heritage');
            } else {
              setActiveTripId('goa-coastal-v24');
            }
          }}
        />

        {/* Dynamic Page Views */}
        <main className="w-full pt-16 flex-1 flex flex-col bg-surface">
          {activePage === 'planner-studio' && (
            <PlannerStudioPage
              trip={trip}
              days={days}
              flights={flights}
              hotels={hotels}
              weather={weather}
              budget={budget}
              messages={messages}
              promptInput={promptInput}
              onPromptChange={setPromptInput}
              onSendMessage={handleSendMessage}
              isSending={isSendingMessage}
              activeTab={activeDashboardTab}
              onSwitchTab={setActiveDashboardTab}
              onSelectFlight={handleSelectFlight}
              onSelectHotel={handleSelectHotel}
              apiStatus={apiStatus}
              onClearContext={handleClearContext}
            />
          )}

          {activePage === 'itinerary-hub' && (
            <ItineraryHubPage
              currentTrip={trip}
              savedTrips={savedTrips}
              onOpenTrip={(id) => {
                setActiveTripId(id);
                setActivePage('planner-studio');
              }}
              onGoToStudio={() => setActivePage('planner-studio')}
            />
          )}

          {activePage === 'bookings-desk' && (
            <BookingsDeskPage
              flights={flights}
              hotels={hotels}
              onGoToStudio={() => setActivePage('planner-studio')}
            />
          )}

          {activePage === 'ai-places-memory' && <AiPlacesMemoryPage />}
        </main>
      </div>

      {/* FastAPI Backend Configuration Modal */}
      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiStatus={apiStatus}
        onUpdateApiUrl={updateApiUrl}
        isChecking={isCheckingApi}
      />
    </div>
  );
}
