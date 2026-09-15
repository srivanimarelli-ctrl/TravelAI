import React, { useState } from 'react';
import {
  X,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2
} from 'lucide-react';
import { ApiStatusState } from '../types';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: ApiStatusState;
  onUpdateApiUrl: (url: string) => Promise<void>;
  isChecking: boolean;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  apiStatus,
  onUpdateApiUrl,
  isChecking,
}) => {
  const [inputUrl, setInputUrl] = useState(apiStatus.endpointUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateApiUrl(inputUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetToDefault = async () => {
    const defaultUrl = 'http://localhost:8000';
    setInputUrl(defaultUrl);
    await onUpdateApiUrl(defaultUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-surface-container border border-surface-container-highest shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-on-surface">
                FastAPI Backend Connection
              </h3>
              <p className="text-xs text-on-surface-variant">
                Configure your REST API host & verify live communication
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Connection Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              apiStatus.isConnected
                ? 'bg-tertiary-container/15 border-tertiary/30 text-on-surface'
                : 'bg-primary-container/10 border-primary/20 text-on-surface'
            }`}
          >
            {apiStatus.isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-tertiary flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                <span>
                  {apiStatus.isConnected ? 'FastAPI Connected' : 'Mock Fallback / Standby Mode'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    apiStatus.isConnected
                      ? 'bg-tertiary text-on-tertiary font-bold'
                      : 'bg-primary/20 text-primary font-medium'
                  }`}
                >
                  {apiStatus.statusMessage}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {apiStatus.isConnected
                  ? 'Your FastAPI REST server is responding. Real payloads from your backend will seamlessly hydrate the UI.'
                  : 'Frontend is running in client mode with design-faithful placeholder data. Once you run your FastAPI app (e.g., uvicorn main:app --reload --port 8000), it will instantly connect.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface flex items-center justify-between">
                <span>FastAPI Base URL:</span>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  Env: VITE_FASTAPI_URL
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-highest text-xs sm:text-sm text-on-surface font-mono focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={isChecking}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-medium hover:bg-primary-fixed transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isChecking ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Test & Save</span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-primary hover:underline"
              >
                Reset to http://localhost:8000
              </button>
              {saveSuccess && (
                <span className="text-tertiary flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved & Tested
                </span>
              )}
            </div>
          </form>

          {/* Expected FastAPI Endpoints Spec Box */}
          <div className="rounded-xl bg-surface-container-lowest p-4 border border-surface-container-highest/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-primary" />
                <span>Configured FastAPI REST Endpoints:</span>
              </span>
              <span className="text-[11px] text-outline font-mono">OpenAPI 3.0</span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px] text-on-surface-variant">
              <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low">
                <span className="text-tertiary">GET /api/health</span>
                <span className="text-outline">Health check ping</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low">
                <span className="text-primary">POST /api/chat/message</span>
                <span className="text-outline">Send query & get itinerary updates</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low">
                <span className="text-tertiary">GET /api/trips</span>
                <span className="text-outline">Fetch saved trip list</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low">
                <span className="text-tertiary">GET /api/trips/active</span>
                <span className="text-outline">Active trip details & day timeline</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low">
                <span className="text-tertiary">GET /api/flights</span>
                <span className="text-outline">Matched flight fares & schedules</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low">
                <span className="text-tertiary">GET /api/hotels</span>
                <span className="text-outline">Accommodations & room rates</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low">
                <span className="text-tertiary">GET /api/weather</span>
                <span className="text-outline">Coastal meteorological model</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-surface-container-low">
                <span className="text-tertiary">GET /api/budget</span>
                <span className="text-outline">Budget auditor allocation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-surface-container-low border-t border-surface-container-high flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs sm:text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
