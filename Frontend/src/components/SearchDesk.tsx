"use client";

import React from "react";

export interface SearchDeskProps {
  origin: string;
  destination: string;
  dates: string;
  guests: string;
  budget: string;
  aiPrompt: string;
  onOriginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDestinationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDatesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGuestsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBudgetChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAiPromptChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSearching?: boolean;
}

export function SearchDesk({
  origin,
  destination,
  dates,
  guests,
  budget,
  aiPrompt,
  onOriginChange,
  onDestinationChange,
  onDatesChange,
  onGuestsChange,
  onBudgetChange,
  onAiPromptChange,
  onSubmit,
  isSearching = false,
}: SearchDeskProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      {/* Document Line Label */}
      <div className="flex items-center justify-between mb-3">
        <span className="label">ITINERARY REQUEST — 042 / FIELD DESK SPECIFICATION</span>
        <span className="meta text-xs">DOC-REF: #TRV-2026-9A</span>
      </div>

      {/* Main Search Desk Well */}
      <form
        onSubmit={onSubmit}
        className="bg-[var(--paper-alt)] border border-[var(--hairline-strong)] rounded-[3px] p-4 sm:p-6 shadow-[var(--lift)]"
      >
        {/* Horizontal Controls Band on Desktop / Vertical Stack on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline)]">
          {/* Field 1: Origin (Wide Column) */}
          <div className="md:col-span-3 md:pr-4">
            <div className="field">
              <label htmlFor="search-origin">ORIGIN / FROM</label>
              <input
                id="search-origin"
                type="text"
                value={origin}
                onChange={onOriginChange}
                placeholder="Lisbon, Portugal"
                data-testid="input-origin"
              />
            </div>
          </div>

          {/* Field 2: Destination (Wide Column) */}
          <div className="md:col-span-3 pt-3 md:pt-0 md:px-4">
            <div className="field">
              <label htmlFor="search-destination">DESTINATION / TO</label>
              <input
                id="search-destination"
                type="text"
                value={destination}
                onChange={onDestinationChange}
                placeholder="Kyoto &amp; Kanazawa, Japan"
                data-testid="input-destination"
              />
            </div>
          </div>

          {/* Field 3: Dates (Narrow Column) */}
          <div className="md:col-span-2 pt-3 md:pt-0 md:px-4">
            <div className="field">
              <label htmlFor="search-dates">DATES</label>
              <input
                id="search-dates"
                type="text"
                value={dates}
                onChange={onDatesChange}
                placeholder="Oct 14 — Oct 28"
                data-testid="input-dates"
              />
            </div>
          </div>

          {/* Field 4: Travellers (Narrow Column) */}
          <div className="md:col-span-2 pt-3 md:pt-0 md:px-4">
            <div className="field">
              <label htmlFor="search-guests">TRAVELLERS</label>
              <input
                id="search-guests"
                type="text"
                value={guests}
                onChange={onGuestsChange}
                placeholder="2 Guests"
                data-testid="input-guests"
              />
            </div>
          </div>

          {/* Field 5: Budget / Style (Narrow Column) */}
          <div className="md:col-span-2 pt-3 md:pt-0 md:pl-4">
            <div className="field">
              <label htmlFor="search-budget">BUDGET &amp; STYLE</label>
              <select
                id="search-budget"
                value={budget}
                onChange={onBudgetChange}
                className="bg-transparent border-b border-[var(--hairline-strong)] text-[var(--ink)] cursor-pointer"
                data-testid="select-budget"
              >
                <option value="Tactile / Medium">Tactile / Medium</option>
                <option value="Modest / Field">Modest / Field</option>
                <option value="Luxurious / Grand">Luxurious / Grand</option>
              </select>
            </div>
          </div>
        </div>

        {/* Natural Language Prompt Row (Invisible AI Presentation - no sparkle or robot icons) */}
        <div className="mt-5 pt-4 border-t border-[var(--hairline)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="field flex-1">
            <label htmlFor="search-prompt">NATURAL LANGUAGE REQUIREMENTS / FIELD NOTES</label>
            <input
              id="search-prompt"
              type="text"
              value={aiPrompt}
              onChange={onAiPromptChange}
              placeholder="e.g. Traditional ryokans, high-speed rail passes, ceramic workshops, and coastal stops..."
              className="text-sm font-normal"
              data-testid="input-ai-prompt"
            />
          </div>

          {/* Submit Action: Only filled button in Search Desk */}
          <div className="flex items-end justify-end md:justify-auto pt-2 md:pt-0">
            <button
              type="submit"
              disabled={isSearching}
              className="btn btn--stamp w-full md:w-auto px-6 py-2.5 uppercase tracking-widest text-xs font-semibold whitespace-nowrap"
              data-testid="button-search-submit"
            >
              {isSearching ? "COMPILING ROUTE..." : "SUBMIT REQUEST"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
