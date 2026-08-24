"use client";

import React from "react";

export interface MastheadProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onRequestItinerary?: () => void;
}

export function Masthead({
  activeTab = "dispatches",
  onTabChange = () => {},
  onRequestItinerary = () => {},
}: MastheadProps) {
  return (
    <header className="w-full bg-[var(--paper)] text-[var(--ink)]">
      {/* Top Utility Register */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-[var(--hairline)]">
        <div className="label">ISSUE NO. 042 / VOL. IV</div>
        <div className="hidden md:block label">FIELD DISPATCHES &amp; ROUTE DESK</div>
        <div className="label">OCTOBER 2026</div>
      </div>

      {/* Main Register: Brand + Nav on Shared Baseline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6">
          {/* Brand Heading */}
          <div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-[var(--tr-display)] text-[var(--ink)]">
              THE TRAVEL AI JOURNAL
            </h1>
            <p className="meta mt-1 text-[var(--ink-soft)]">
              Independent Field Reports, Route Planning &amp; Tactile Guides
            </p>
          </div>

          {/* Navigation Links & Action */}
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
            <nav className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => onTabChange("dispatches")}
                className={`link cursor-pointer text-sm font-medium ${
                  activeTab === "dispatches" ? "border-b-2 border-[var(--ink)] font-semibold" : ""
                }`}
              >
                DISPATCHES
              </button>
              <button
                type="button"
                onClick={() => onTabChange("routes")}
                className={`link cursor-pointer text-sm font-medium ${
                  activeTab === "routes" ? "border-b-2 border-[var(--ink)] font-semibold" : ""
                }`}
              >
                ROUTES
              </button>
              <button
                type="button"
                onClick={() => onTabChange("fieldnotes")}
                className={`link cursor-pointer text-sm font-medium ${
                  activeTab === "fieldnotes" ? "border-b-2 border-[var(--ink)] font-semibold" : ""
                }`}
              >
                FIELD NOTES
              </button>
              <button
                type="button"
                onClick={() => onTabChange("archive")}
                className={`link cursor-pointer text-sm font-medium ${
                  activeTab === "archive" ? "border-b-2 border-[var(--ink)] font-semibold" : ""
                }`}
              >
                ARCHIVE
              </button>
            </nav>

            {/* Exactly ONE filled button in header */}
            <button
              type="button"
              onClick={onRequestItinerary}
              className="btn btn--stamp text-xs uppercase tracking-widest whitespace-nowrap"
            >
              REQUEST ITINERARY
            </button>
          </div>
        </div>
      </div>

      {/* Rule Strong Divider Beneath Header */}
      <div className="rule--strong" />
    </header>
  );
}
