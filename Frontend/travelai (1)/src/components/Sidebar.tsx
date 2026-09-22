import React from 'react';
import { MapPin, Route, Compass, Sparkles, Bookmark, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: 'waypoints' | 'trips' | 'planner';
  setActiveTab: (tab: 'waypoints' | 'trips' | 'planner') => void;
}

interface NavItem {
  id: 'waypoints' | 'trips' | 'planner';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: NavItem[] = [
    { id: 'waypoints', label: 'Waypoints & Passes', icon: Compass },
    { id: 'trips', label: 'My Expeditions', icon: Route },
    { id: 'planner', label: 'AI Route Architect', icon: Sparkles, badge: 'New' },
  ];

  return (
    <aside
      id="app-sidebar"
      style={{
        backgroundColor: 'rgba(15, 21, 36, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      }}
      className="w-64 shrink-0 flex flex-col justify-between p-4 hidden lg:flex min-h-[calc(100vh-61px)]"
    >
      <div className="space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3">
            Exploration
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#89ceff]/15 text-[#89ceff] border border-[#89ceff]/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#89ceff]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#89ceff]/20 text-[#89ceff]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3">
            Collection
          </span>
          <nav className="mt-2 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
              <Bookmark className="w-4 h-4 text-slate-400" />
              <span>Saved Alpine Roads</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Offline GPS Tracks</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom info widget */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#89ceff]" />
            Telemetry Active
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-medium">99.8% Sync</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          FastAPI engine synchronized with MongoDB mountain pass nodes.
        </p>
      </div>
    </aside>
  );
};
export default Sidebar;
