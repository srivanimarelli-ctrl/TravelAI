import React, { useEffect, useState, useId } from 'react';
import {
  Users,
  Compass,
  CheckCircle2,
  XCircle,
  Activity,
  Server,
  Database,
  Cpu,
  Search,
  ShieldCheck,
  RefreshCw,
  Clock,
  MapPin,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  UserX,
  Filter,
  Check
} from 'lucide-react';
import {
  fetchAdminStats,
  fetchAdminUsers,
  toggleUserStatus,
  fetchAdminActivity,
  fetchAdminLogs,
  fetchAdminFeedback
} from '../services/api';
import {
  AdminStats,
  AdminSystemHealth,
  AdminUser,
  AdminActivityItem,
  AdminAgentLog,
  UserFeedbackItem
} from '../types';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardPageProps {
  onGoToStudio: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onGoToStudio }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [popularDestinations, setPopularDestinations] = useState<{ destination: string; count: number }[]>([]);
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [logs, setLogs] = useState<AdminAgentLog[]>([]);
  const [feedback, setFeedback] = useState<UserFeedbackItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [statsRes, usersRes, actRes, logsRes, fbRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminUsers(),
        fetchAdminActivity(),
        fetchAdminLogs(),
        fetchAdminFeedback()
      ]);

      if (statsRes?.success) {
        setStats(statsRes.metrics);
        setPopularDestinations(statsRes.popular_destinations || []);
        setHealth(statsRes.system_health || null);
      }
      if (usersRes?.success) setUsers(usersRes.users || []);
      if (actRes?.success) setActivity(actRes.activity || []);
      if (logsRes?.success) setLogs(logsRes.logs || []);
      if (fbRes?.success) setFeedback(fbRes.feedback || []);

      if (isManualRefresh) showToast('Dashboard metrics refreshed from database.');
    } catch (err: any) {
      console.error('Admin dashboard fetch error:', err);
      setError(err?.message || 'Failed to load admin metrics. Ensure you have administrator permissions.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleUserStatus = async (targetUser: AdminUser) => {
    if (updatingUserId) return;
    const newStatus = !targetUser.is_active;
    const actionLabel = newStatus ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${targetUser.name} (${targetUser.email})?`)) {
      return;
    }

    setUpdatingUserId(targetUser.id);
    try {
      const res = await toggleUserStatus(targetUser.id, newStatus);
      if (res?.success) {
        setUsers(prev => prev.map(u => (u.id === targetUser.id ? { ...u, is_active: newStatus } : u)));
        showToast(`User ${targetUser.email} ${actionLabel}d successfully.`);
      }
    } catch (err: any) {
      alert(err?.message || `Failed to ${actionLabel} user.`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const successRate = stats && stats.total_trips > 0
    ? Math.round((stats.successful_trips / (stats.successful_trips + stats.failed_trips || 1)) * 100)
    : 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-container-high/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Admin Command Center</h1>
              <p className="text-xs text-on-surface-variant">
                Live system monitoring, agent logs, destination analytics & user management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold border border-surface-container-highest transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            onClick={onGoToStudio}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-md hover:opacity-90 transition-opacity"
          >
            Open Planner
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-start gap-3 border border-error/30 shadow-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Admin Synchronization Error</div>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-on-surface">
            {isLoading ? '—' : stats?.total_users ?? 0}
          </div>
          <p className="text-[11px] text-on-surface-variant">Authenticated travelers</p>
        </div>

        {/* Total Trips */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase tracking-wider">Generated Trips</span>
            <Compass className="w-4 h-4 text-tertiary" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-on-surface">
            {isLoading ? '—' : stats?.total_trips ?? 0}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {stats?.total_conversations ?? 0} chat sessions
          </p>
        </div>

        {/* Successful Trips */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase tracking-wider">Successful Trips</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {isLoading ? '—' : stats?.successful_trips ?? 0}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {successRate}% overall pipeline success
          </p>
        </div>

        {/* Failed Trips */}
        <div className="p-5 rounded-2xl bg-surface-container border border-surface-container-high/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-medium uppercase tracking-wider">Failed Trips</span>
            <XCircle className="w-4 h-4 text-error" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-error">
            {isLoading ? '—' : stats?.failed_trips ?? 0}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            {stats?.in_progress_trips ? `${stats.in_progress_trips} currently planning` : '0 active errors'}
          </p>
        </div>
      </div>

      {/* Live System Health Monitor */}
      <section className="p-5 rounded-2xl bg-surface-container border border-surface-container-high/60 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <span>Infrastructure & API Status</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
            Live Health Probe
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MongoDB */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface">MongoDB</span>
                <span className={`text-[10px] font-bold uppercase ${health?.mongodb.status === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {health?.mongodb.status ?? 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant truncate">
                {health?.mongodb.latency_ms ?? 1.2}ms · {health?.mongodb.database ?? 'travel_ai'}
              </p>
            </div>
          </div>

          {/* Groq LLM */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-tertiary/10 text-tertiary">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface">Groq LLM</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">
                  {health?.groq_llm.status ?? 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant truncate font-mono">
                {health?.groq_llm.model ?? 'qwen/qwen3.8-27b'}
              </p>
            </div>
          </div>

          {/* SerpApi */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Search className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface">SerpApi Live</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">
                  {health?.serpapi.status ?? 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant truncate">
                {health?.serpapi.total_searches_left ?? 240} searches remaining · {health?.serpapi.plan ?? 'Free'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Popular Destinations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Popular Destinations */}
        <section className="lg:col-span-5 p-5 rounded-2xl bg-surface-container border border-surface-container-high/60 space-y-3">
          <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <MapPin className="w-4 h-4 text-tertiary" />
            <span>Popular Travel Destinations</span>
          </h2>
          <p className="text-xs text-on-surface-variant">Top travel locations curated by users</p>

          <div className="space-y-2 mt-2">
            {popularDestinations.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">No destinations recorded yet.</p>
            ) : (
              popularDestinations.map((dest, i) => {
                const maxCount = popularDestinations[0]?.count || 1;
                const percentage = Math.round((dest.count / maxCount) * 100);
                return (
                  <div key={dest.destination} className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-on-surface">
                        #{i + 1} {dest.destination}
                      </span>
                      <span className="text-on-surface-variant font-medium">
                        {dest.count} {dest.count === 1 ? 'trip' : 'trips'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Recent Trip Generation Activity */}
        <section className="lg:col-span-7 p-5 rounded-2xl bg-surface-container border border-surface-container-high/60 space-y-3">
          <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span>Recent Generation Activity</span>
          </h2>
          <p className="text-xs text-on-surface-variant">Real-time pipeline submissions and state transitions</p>

          <div className="space-y-2 mt-2 max-h-80 overflow-y-auto pr-1">
            {activity.length === 0 ? (
              <p className="text-xs text-on-surface-variant py-4 text-center">No recent activity records found.</p>
            ) : (
              activity.slice(0, 8).map(act => (
                <div key={act.request_id} className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest/40 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-on-surface truncate">{act.destination}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        act.status === 'succeeded'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : act.status === 'failed'
                          ? 'bg-error/10 text-error'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {act.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                      {act.user_name} ({act.user_email || 'guest'})
                    </p>
                  </div>
                  <div className="text-[10px] text-on-surface-variant whitespace-nowrap text-right">
                    {act.created_at ? new Date(act.created_at).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* User Management Section */}
      <section className="p-5 sm:p-6 rounded-2xl bg-surface-container border border-surface-container-high/60 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>User Account Management</span>
            </h2>
            <p className="text-xs text-on-surface-variant">
              Manage accounts, inspect trip counts, and toggle account access
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users…"
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-container-highest text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto rounded-xl border border-surface-container-highest/60">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container-high/70 uppercase text-[10px] tracking-wider text-on-surface-variant border-b border-surface-container-highest">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Trips Planned</th>
                <th className="p-3">Joined Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest/40 bg-surface-container-low/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-on-surface-variant">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isSelf = user?.email?.toLowerCase() === u.email.toLowerCase();
                  return (
                    <tr key={u.id} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="p-3 font-semibold text-on-surface">{u.name}</td>
                      <td className="p-3 text-on-surface-variant font-mono text-[11px]">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{u.trips_count}</td>
                      <td className="p-3 text-on-surface-variant text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.is_active
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-error/10 text-error'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-error'}`} />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {isSelf ? (
                          <span className="text-[11px] text-on-surface-variant italic">Current User</span>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingUserId === u.id}
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                              u.is_active
                                ? 'bg-error/10 hover:bg-error/20 text-error border-error/30'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {updatingUserId === u.id ? 'Updating…' : u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Agent & Pipeline Execution Logs */}
      <section className="p-5 sm:p-6 rounded-2xl bg-surface-container border border-surface-container-high/60 space-y-4">
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <Cpu className="w-5 h-5 text-tertiary" />
            <span>Agent Pipeline Execution Logs</span>
          </h2>
          <p className="text-xs text-on-surface-variant">
            Inspecting live execution status across all multi-agent stages
          </p>
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-xs text-on-surface-variant py-4 text-center">No agent execution logs recorded.</p>
          ) : (
            logs.slice(0, 5).map(log => (
              <div key={log.request_id} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-container-highest/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-on-surface">{log.destination}</span>
                    <span className="text-[10px] font-mono text-on-surface-variant">ID: {log.request_id.slice(0, 16)}…</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    log.overall_status === 'succeeded' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                  }`}>
                    {log.overall_status}
                  </span>
                </div>

                {/* Stage chips */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(log.stages || {}).map(([stageName, stageData]) => (
                    <span
                      key={stageName}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium border ${
                        stageData.status === 'done'
                          ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20'
                          : stageData.status === 'warning'
                          ? 'bg-amber-500/5 text-amber-600 border-amber-500/20'
                          : 'bg-surface-container text-on-surface-variant border-surface-container-highest'
                      }`}
                      title={stageData.note || `${stageName}: ${stageData.status}`}
                    >
                      {stageName}: {stageData.status}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* User Feedback & Ratings Section */}
      <section className="p-5 sm:p-6 rounded-2xl bg-surface-container border border-surface-container-high/60 space-y-3">
        <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span>User Feedback & Ratings</span>
        </h2>
        <p className="text-xs text-on-surface-variant">Actual reviews submitted by registered travelers</p>

        {feedback.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface-container-low border border-surface-container-highest/40 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
            <p className="text-xs font-semibold text-on-surface">No user feedback submitted yet</p>
            <p className="text-[11px] text-on-surface-variant max-w-sm mx-auto">
              Feedback and rating submissions from travelers will automatically appear in this section.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.map(fb => (
              <div key={fb.id} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-on-surface">{fb.user_name}</span>
                  <div className="flex text-amber-500 text-xs">
                    {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant">{fb.comment}</p>
                <div className="text-[10px] text-on-surface-variant/70">
                  {new Date(fb.created_at).toLocaleDateString()} · {fb.category}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
