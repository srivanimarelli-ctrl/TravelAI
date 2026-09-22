import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Mountain, Star, MapPin, Gauge, Plus, Calendar, ArrowUpRight, Sparkles, Navigation } from 'lucide-react';
import { useTravelApi } from '../hooks/useTravelApi';
import { Waypoint } from '../types';

interface DashboardProps {
  api: ReturnType<typeof useTravelApi>;
}

export const Dashboard: React.FC<DashboardProps> = ({ api }) => {
  const { waypoints, trips, selectedCategory, setSelectedCategory, activeTab, addTrip } = api;
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [newTripDest, setNewTripDest] = useState('');

  const categories = ['All', 'Alpine Vista', 'Mountain Pass', 'Coastal Road'];

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripTitle || !newTripDest) return;

    addTrip({
      title: newTripTitle,
      destination: newTripDest,
      startDate: '2026-08-15',
      endDate: '2026-08-22',
      waypointsCount: 5,
      status: 'Planning',
      coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      distanceKm: 620,
      estimatedDuration: '6 Days',
      highlights: ['Scenic Summit Overlook', 'Curated Alpine Rest Stops'],
    });

    setNewTripTitle('');
    setNewTripDest('');
    setShowAddTripModal(false);
  };

  return (
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Hero Overview */}
      <div className="relative rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl p-6 sm:p-10 bg-gradient-to-r from-slate-900/90 via-[#161d2d]/90 to-slate-900/90">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/30 text-[#89ceff] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mountain Route Intelligence Active</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Alpine Expeditions & Winding Passes
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Curated road waypoints, hairpin elevation curves, and high-altitude weather data powered by TravelAI.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/10">
            <div>
              <div className="text-2xl font-bold text-white">48</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Hairpin Curves</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#89ceff]">2,757m</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Peak Elevation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Asphalt Vetted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">Live</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Pass Conditions</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Switching */}
      {activeTab === 'waypoints' && (
        <div>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#89ceff] text-slate-950 shadow-md shadow-[#89ceff]/20'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Showing <span className="text-white font-bold">{waypoints.length}</span> curated passes
            </span>
          </div>

          {/* Waypoints Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {waypoints.map((wp) => (
              <motion.div
                key={wp.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedWaypoint(wp)}
                style={{
                  backgroundColor: 'rgba(30, 34, 44, 0.75)',
                  backdropFilter: 'blur(16px)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
                className="rounded-2xl border overflow-hidden shadow-xl hover:border-[#89ceff]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Card Cover Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={wp.image}
                      alt={wp.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Badges on image */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white">
                      <Mountain className="w-3 h-3 text-[#89ceff]" />
                      <span>{wp.elevation}</span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>{wp.scenicRating}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1 drop-shadow-md">
                        <MapPin className="w-3.5 h-3.5 text-[#89ceff]" />
                        {wp.country}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-slate-300">
                        {wp.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white group-hover:text-[#89ceff] transition-colors line-clamp-1 mb-1">
                      {wp.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {wp.description}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-0 flex items-center justify-between border-t border-white/5 mt-auto text-xs text-slate-400">
                  <span>Best: {wp.bestSeason}</span>
                  <span className="text-[#89ceff] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Waypoint Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* My Expeditions Tab */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Saved Expeditions</h3>
            <button
              onClick={() => setShowAddTripModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Expedition</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                style={{
                  backgroundColor: 'rgba(30, 34, 44, 0.88)',
                  backdropFilter: 'blur(20px)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
                className="rounded-2xl border p-6 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#89ceff]/20 text-[#89ceff]">
                      {trip.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {trip.estimatedDuration}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-white mb-1">{trip.title}</h4>
                  <p className="text-xs text-slate-400 mb-4">{trip.destination}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {trip.highlights.map((h, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{trip.distanceKm} km total distance</span>
                  <button className="text-[#89ceff] hover:underline font-semibold flex items-center gap-1">
                    Open Route <Navigation className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Route Architect Planner Tab */}
      {activeTab === 'planner' && (
        <div
          style={{
            backgroundColor: 'rgba(30, 34, 44, 0.88)',
            backdropFilter: 'blur(24px)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
          className="rounded-3xl border p-8 max-w-3xl mx-auto shadow-2xl"
        >
          <div className="flex items-center gap-2 text-[#89ceff] text-xs font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>AI WAYPOINT OPTIMIZER</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Generate Alpine Itinerary</h3>
          <p className="text-xs text-slate-400 mb-6">
            Describe your driving style, duration, and target regions. TravelAI calculates optimal road passes and rest points.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('AI Route Generated! Adding to My Expeditions.');
              api.setActiveTab('trips');
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Destination Mountain Region</label>
              <input
                type="text"
                defaultValue="Dolomites & Eastern Italian Alps"
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#89ceff]/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Expedition Duration</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#89ceff]/50">
                  <option>Weekend Loop (3 Days)</option>
                  <option>Alpine Classic (7 Days)</option>
                  <option>Grand Tour (14 Days)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Road Preference</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#89ceff]/50">
                  <option>Technical Hairpins & High Passes</option>
                  <option>Sweeping Panoramic Glacial Valleys</option>
                  <option>Balanced Scenic Cruising</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-[#89ceff] hover:bg-sky-300 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-[#89ceff]/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Architect Itinerary with TravelAI</span>
            </button>
          </form>
        </div>
      )}

      {/* Waypoint Detail Modal */}
      {selectedWaypoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#1e222c] overflow-hidden shadow-2xl"
          >
            <div className="relative h-60 w-full">
              <img
                src={selectedWaypoint.image}
                alt={selectedWaypoint.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e222c] via-transparent to-black/50" />
              <button
                onClick={() => setSelectedWaypoint(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#89ceff]/20 text-[#89ceff]">
                  {selectedWaypoint.category}
                </span>
                <span className="text-xs text-slate-400">{selectedWaypoint.country}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{selectedWaypoint.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">{selectedWaypoint.description}</p>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 mb-6 text-center">
                <div>
                  <div className="text-xs text-slate-400">Elevation</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedWaypoint.elevation}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Difficulty</div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedWaypoint.difficulty}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Rating</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">★ {selectedWaypoint.scenicRating}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedWaypoint(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Added ${selectedWaypoint.name} to active trip waypoint list!`);
                    setSelectedWaypoint(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100"
                >
                  Add to Expedition
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Trip Modal */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1e222c] p-6 shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-2">Create New Expedition</h4>
            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Expedition Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bavarian Alps Road Run"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#89ceff]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Region / Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Southern Bavaria, Germany"
                  value={newTripDest}
                  onChange={(e) => setNewTripDest(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-[#89ceff]/50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTripModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#89ceff] text-slate-950 rounded-xl hover:bg-sky-300"
                >
                  Save Expedition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
export default Dashboard;
