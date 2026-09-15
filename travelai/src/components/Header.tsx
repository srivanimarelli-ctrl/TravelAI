import React, { useState } from 'react';
import {
  Menu,
  PlaneTakeoff,
  ChevronDown,
  Search,
  Bell,
  Settings,
  User,
  Check
} from 'lucide-react';
import { ApiStatusState, TripSummary } from '../types';

interface HeaderProps {
  apiStatus: ApiStatusState;
  activeTrip: TripSummary | null;
  onOpenApiModal: () => void;
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
  onSelectTripPreset?: (presetName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus,
  activeTrip,
  onOpenApiModal,
  onToggleMobileSidebar,
  isSidebarCollapsed,
  onSelectTripPreset,
}) => {
  const [isTripDropdownOpen, setIsTripDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const tripPresets = [
    { id: 'goa', name: 'Goa Coastal Splendor (Apr 12 - 15)', location: 'Goa, India' },
    { id: 'tokyo', name: 'Active: Tokyo (Apr 12 - 19)', location: 'Tokyo, Japan' },
    { id: 'jaipur', name: 'Rajasthan Royal Heritage (May 4 - 7)', location: 'Jaipur, India' },
  ];

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface/85 backdrop-blur-xl z-30 border-b border-surface-container-high/40 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-20' : 'left-0 lg:left-72'
      }`}
    >
      <div className="h-16 w-full px-4 lg:px-8 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button, Brand Icon, Status & Trip Selector */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* FastAPI Connected Pill */}
          <div
            onClick={onOpenApiModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high cursor-pointer transition-colors border border-surface-container-high/60"
            title="Click to configure FastAPI connection"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  apiStatus.isConnected ? 'bg-tertiary' : 'bg-primary'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  apiStatus.isConnected ? 'bg-tertiary' : 'bg-primary'
                }`}
              />
            </span>
            <span className="text-xs text-on-surface font-medium">
              {apiStatus.isConnected ? 'FastAPI: localhost:8000 Connected' : 'FastAPI: Standby (Port 8000)'}
            </span>
          </div>

          {/* Active Trip Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTripDropdownOpen(!isTripDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors border border-surface-container-high/40"
            >
              <PlaneTakeoff className="w-4 h-4 text-primary" />
              <span className="truncate max-w-[140px] sm:max-w-[180px] md:max-w-[240px]">
                {activeTrip ? activeTrip.title : 'Active: Tokyo (Apr 12 - 19)'}
              </span>
              <ChevronDown className="w-4 h-4 text-on-surface-variant" />
            </button>

            {isTripDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-surface-container-high/95 backdrop-blur-xl border border-surface-container-highest shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Select Active Trip
                </div>
                {tripPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      if (onSelectTripPreset) onSelectTripPreset(preset.name);
                      setIsTripDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs hover:bg-surface-container text-on-surface transition-colors"
                  >
                    <div>
                      <div className="font-medium text-on-surface">{preset.name}</div>
                      <div className="text-[11px] text-on-surface-variant">{preset.location}</div>
                    </div>
                    {activeTrip?.destination.includes(preset.location.split(',')[0]) && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Search, Notifications, Settings, Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Global Search */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface-variant border border-surface-container-high/40 w-64 xl:w-80">
            <Search className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search flights, stays, or prompt..."
              className="bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none w-full"
            />
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              ⌘K
            </kbd>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface-container-high/95 backdrop-blur-xl border border-surface-container-highest shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest/60">
                    <span className="text-xs font-semibold text-on-surface">Notifications</span>
                    <span className="text-[11px] text-primary">Mark all read</span>
                  </div>
                  <div className="py-2 space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-surface-container-low/70">
                      <div className="font-medium text-on-surface">Goa Flight Alert</div>
                      <div className="text-[11px] text-on-surface-variant">IndiGo 6E-204 fare synchronized via FastAPI :8000.</div>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-low/70">
                      <div className="font-medium text-on-surface">Taj Holiday Village Confirmation</div>
                      <div className="text-[11px] text-on-surface-variant">Sea-view Cottage booked with complimentary breakfast.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="API Settings"
              onClick={onOpenApiModal}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              title="FastAPI Settings & Backend URL"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(137,206,255,0.35)] text-on-primary">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
