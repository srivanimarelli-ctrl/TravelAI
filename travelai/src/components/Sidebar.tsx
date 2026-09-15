import React from 'react';
import {
  Compass,
  CalendarDays,
  Plane,
  Sparkles,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Server,
  X
} from 'lucide-react';
import { ApiStatusState, ConversationHistoryItem, SavedTripSnippet } from '../types';

interface SidebarProps {
  activePage: 'planner-studio' | 'itinerary-hub' | 'bookings-desk' | 'ai-places-memory';
  onSelectPage: (page: 'planner-studio' | 'itinerary-hub' | 'bookings-desk' | 'ai-places-memory') => void;
  conversations: ConversationHistoryItem[];
  savedTrips: SavedTripSnippet[];
  apiStatus: ApiStatusState;
  onOpenApiModal: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onNewTrip: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  conversations,
  savedTrips,
  apiStatus,
  onOpenApiModal,
  onDeleteConversation,
  onNewTrip,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header & Brand */}
          <div className="h-16 px-space-md flex items-center justify-between bg-surface-container-lowest/60 backdrop-blur-xl border-b border-surface-container-high/40">
            <div className="flex items-center gap-space-sm overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <Compass className="w-5 h-5 text-primary" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-base text-on-surface leading-none truncate">
                    TravelAI
                  </span>
                  <span className="text-[11px] font-semibold text-on-surface-variant/80 mt-1 uppercase tracking-wider">
                    v2.4 Next.js 19
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse / Mobile Close */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Toggle Navigation"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              {onCloseMobile && (
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={onCloseMobile}
                  className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* New Trip Action Button */}
          <div className="p-space-md">
            <button
              type="button"
              onClick={onNewTrip}
              className={`w-full flex items-center justify-center gap-space-sm py-2 px-space-md rounded-xl bg-primary-container text-on-primary font-medium text-sm transition-all shadow-[0_8px_32px_-4px_rgba(14,165,233,0.25)] hover:bg-primary hover:text-on-primary-container active:scale-[0.98] ${
                isCollapsed ? 'px-0 justify-center' : ''
              }`}
              title="Start New Trip / Chat"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>New Trip / Chat</span>}
            </button>
          </div>

          {/* Main Navigation links */}
          <nav className="px-space-md space-y-1">
            <button
              type="button"
              onClick={() => {
                onSelectPage('planner-studio');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg text-sm transition-all ${
                activePage === 'planner-studio'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Planner Studio"
            >
              <Compass className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Planner Studio</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectPage('itinerary-hub');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg text-sm transition-all ${
                activePage === 'itinerary-hub'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Itinerary Hub"
            >
              <CalendarDays className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Itinerary Hub</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectPage('bookings-desk');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg text-sm transition-all ${
                activePage === 'bookings-desk'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="Bookings Desk"
            >
              <Plane className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Bookings Desk</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectPage('ai-places-memory');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-space-sm px-space-md py-2 rounded-lg text-sm transition-all ${
                activePage === 'ai-places-memory'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title="AI Places Memory"
            >
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>AI Places Memory</span>}
            </button>
          </nav>

          {/* Conversations and Saved Trips sections (collapsible) */}
          {!isCollapsed && (
            <div className="flex-1 overflow-y-auto px-space-md py-space-sm space-y-space-md">
              {/* Conversations */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Conversations
                  </span>
                  <span className="text-[11px] text-on-surface-variant/60">Recent</span>
                </div>
                <div className="space-y-1">
                  {conversations.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container-low/60 hover:bg-surface-container-high transition-colors cursor-pointer"
                      onClick={() => onSelectPage('planner-studio')}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-xs text-on-surface truncate font-medium">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          {item.timeAgo}
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label="Delete conversation"
                        onClick={(e) => onDeleteConversation(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-on-surface-variant hover:text-error transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Trips from /api/trips */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Saved Trips
                  </span>
                  <span className="text-[11px] font-medium text-primary">/api/trips</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {savedTrips.map((tripItem) => (
                    <button
                      key={tripItem.id}
                      type="button"
                      onClick={() => onSelectPage('planner-studio')}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-full bg-surface-container text-left hover:bg-surface-container-high transition-colors text-xs"
                    >
                      <span className="text-on-surface truncate font-medium">
                        {tripItem.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary text-[10px] font-semibold whitespace-nowrap ml-1">
                        {tripItem.destinationTag} • {tripItem.daysTag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* API Status Box Footer */}
          <div className="p-space-md bg-surface-container-lowest/90 border-t border-surface-container-high/40">
            <button
              type="button"
              onClick={onOpenApiModal}
              className={`w-full flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-left ${
                isCollapsed ? 'justify-center p-2' : ''
              }`}
              title="Configure FastAPI Backend Connection"
            >
              <div className="relative flex-shrink-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    apiStatus.isConnected ? 'bg-tertiary animate-ping' : 'bg-primary animate-pulse'
                  }`}
                />
                <div
                  className={`w-2.5 h-2.5 rounded-full absolute inset-0 ${
                    apiStatus.isConnected ? 'bg-tertiary' : 'bg-primary'
                  }`}
                />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-xs font-semibold truncate ${
                      apiStatus.isConnected ? 'text-tertiary' : 'text-primary'
                    }`}
                  >
                    {apiStatus.isConnected ? 'API Status: 200 OK' : 'FastAPI Connected / Standby'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant truncate font-mono">
                    {apiStatus.endpointUrl}
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
