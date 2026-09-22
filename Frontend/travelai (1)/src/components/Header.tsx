import React, { useState, useRef, useEffect } from 'react';
import { Compass, LogOut, ChevronDown, Bell, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange, searchQuery = '' }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstLetter = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header
      id="app-header"
      style={{
        backgroundColor: 'rgba(15, 21, 36, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
      className="sticky top-0 z-40 w-full px-6 py-3.5 flex items-center justify-between"
    >
      {/* Brand & Waypoint pill */}
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-white tracking-tight">Travel</span>
          <span className="text-xl font-bold text-[#89ceff] tracking-tight">AI</span>
        </div>

        <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#182234]/90 border border-white/10 text-slate-300 text-[11px] font-medium">
          <div className="w-3.5 h-3.5 rounded-full bg-[#38bdf8] flex items-center justify-center text-slate-950">
            <Compass className="w-2.5 h-2.5" />
          </div>
          <span className="tracking-wider uppercase text-[10px]">WAYPOINT CONNECTED</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mountain passes, roads, destinations..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-white/10 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#89ceff]/50 transition-all"
          />
        </div>
      </div>

      {/* Right controls: Notifications & User Avatar Dropdown */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-white/5 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#89ceff]" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            id="header-user-avatar-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 cursor-pointer"
          >
            {/* Avatar circle shows first letter of user's name */}
            <div
              id="header-avatar-circle"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38bdf8] to-[#89ceff] text-slate-950 font-bold text-sm flex items-center justify-center shadow-sm"
            >
              {firstLetter}
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[120px] truncate">
              {user?.name || 'Explorer'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Glassmorphism Dropdown Card */}
          {dropdownOpen && (
            <div
              id="header-user-dropdown"
              style={{
                backgroundColor: 'rgba(30, 34, 44, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(125, 211, 252, 0.08)',
              }}
              className="absolute right-0 mt-2 w-64 rounded-2xl border p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* User info: name (bold) & email (small grey) */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#38bdf8] to-[#89ceff] text-slate-950 font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
                  {firstLetter}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-white truncate">
                    {user?.name || 'Traveler'}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {user?.email || 'user@travelai.com'}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-[11px] text-[#89ceff] mb-3 border border-white/5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified TravelAI Member</span>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-2" />

              {/* Sign Out button with LogOut icon */}
              <button
                type="button"
                id="header-logout-btn"
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all duration-150 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
