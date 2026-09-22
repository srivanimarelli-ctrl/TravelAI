import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { useTravelApi } from './hooks/useTravelApi';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const travelApi = useTravelApi();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#89ceff]/20 border-t-[#89ceff] rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
            Connecting TravelAI Waypoint...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage
        onLoginSuccess={() => {}}
        onGoToRegister={() => setAuthView('register')}
      />
    ) : (
      <RegisterPage
        onRegisterSuccess={() => setAuthView('login')}
        onGoToLogin={() => setAuthView('login')}
      />
    );
  }

  // If isAuthenticated: render the full app layout (Sidebar + Header + Pages)
  return (
    <div className="min-h-screen w-full bg-[#0a0e1a] text-slate-100 flex flex-col font-sans">
      <Header
        searchQuery={travelApi.searchQuery}
        onSearchChange={travelApi.setSearchQuery}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={travelApi.activeTab}
          setActiveTab={travelApi.setActiveTab}
        />
        <Dashboard api={travelApi} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
