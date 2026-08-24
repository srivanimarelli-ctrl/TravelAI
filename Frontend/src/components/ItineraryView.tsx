"use client";

import React from "react";

export interface Activity {
  time: string;
  title: string;
  description: string;
  meta?: string;
}

export interface TravelLeg {
  type: "transit";
  mode: string;
  duration: string;
  details: string;
}

export interface DayPlan {
  dayNumber: string;
  date: string;
  title: string;
  activities: Activity[];
  transit?: TravelLeg;
}

export interface ItineraryViewProps {
  title: string;
  subtitle: string;
  dispatchRef: string;
  totalDays: string;
  totalCost: string;
  days: DayPlan[];
  onBackToResults?: () => void;
  onPrintOrSave?: () => void;
}

export function ItineraryView({
  title,
  subtitle,
  dispatchRef,
  totalDays,
  totalCost,
  days,
  onBackToResults,
  onPrintOrSave,
}: ItineraryViewProps) {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-8 text-[var(--ink)]">
      {/* Document Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--hairline-strong)] mb-8">
        <button
          type="button"
          onClick={onBackToResults}
          className="link text-xs uppercase tracking-widest font-semibold cursor-pointer"
        >
          &larr; BACK TO DISPATCH LIST
        </button>
        <div className="flex items-center gap-4">
          <span className="label">DOCUMENT STATUS: VERIFIED FIELD ROUTE</span>
          <button
            type="button"
            onClick={onPrintOrSave}
            className="btn btn--ghost text-xs uppercase"
          >
            PRINT / DISPATCH COPY
          </button>
        </div>
      </div>

      {/* Document Header (Travel Publication Style - No cards!) */}
      <div className="mb-10 pb-6 border-b border-[var(--hairline)]">
        <div className="flex items-center gap-3 mb-2">
          <span className="label label--accent">FIELD ITINERARY REPORT</span>
          <span className="text-xs text-[var(--ink-faint)]">•</span>
          <span className="meta">{dispatchRef}</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl text-[var(--ink)] mb-3">
          {title}
        </h1>

        <p className="text-lg text-[var(--ink-soft)] font-serif italic max-w-3xl mb-6">
          {subtitle}
        </p>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 bg-[var(--paper-alt)] border border-[var(--hairline-strong)] rounded-[3px]">
          <div>
            <div className="label">TOTAL DURATION</div>
            <div className="meta text-lg text-[var(--ink)] mt-0.5">{totalDays}</div>
          </div>
          <div>
            <div className="label">ESTIMATED EXPENDITURE</div>
            <div className="meta text-lg text-[var(--ink)] mt-0.5">{totalCost}</div>
          </div>
          <div>
            <div className="label">ROUTE TYPE</div>
            <div className="meta text-lg text-[var(--ink)] mt-0.5">OVERLAND &amp; RAIL</div>
          </div>
          <div>
            <div className="label">SEASONALITY</div>
            <div className="meta text-lg text-[var(--ink)] mt-0.5">AUTUMN OPTIMAL</div>
          </div>
        </div>
      </div>

      {/* Main Timeline (Document style, 2px rule at x:34px on desktop) */}
      <div className="relative pl-0 sm:pl-16">
        {/* 2px Vertical Rule line on Desktop */}
        <div className="hidden sm:block absolute left-[34px] top-4 bottom-4 w-[2px] bg-[var(--hairline-strong)]" />

        <div className="space-y-12">
          {days.map((day) => (
            <div key={day.dayNumber} className="relative">
              {/* Day Marker Circle on Timeline */}
              <div className="hidden sm:flex absolute -left-[45px] top-1.5 w-6 h-6 rounded-full border border-[var(--accent)] bg-[var(--paper)] items-center justify-center shadow-sm">
                <span className="font-mono text-[10px] font-semibold text-[var(--accent)]">
                  {day.dayNumber}
                </span>
              </div>

              {/* Day Header */}
              <div className="pb-3 border-b border-[var(--hairline-strong)] mb-4">
                <div className="flex items-center gap-3">
                  <span className="label label--accent font-bold">DAY {day.dayNumber}</span>
                  <span className="text-xs text-[var(--ink-faint)]">•</span>
                  <span className="meta">{day.date}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-[var(--ink)] mt-1">
                  {day.title}
                </h2>
              </div>

              {/* Activity Rows Split by Soft Rules */}
              <div className="space-y-4">
                {day.activities.map((activity, actIdx) => (
                  <React.Fragment key={actIdx}>
                    <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr] gap-2 sm:gap-4 items-start py-2">
                      {/* Left Gutter Tabular Mono Time */}
                      <div className="font-mono tabular-nums text-sm font-medium text-[var(--ink-soft)] pt-0.5">
                        {activity.time}
                      </div>

                      {/* Right Activity Content */}
                      <div>
                        <h4 className="font-body text-base font-semibold text-[var(--ink)]">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-[var(--ink-soft)] leading-relaxed mt-1">
                          {activity.description}
                        </p>
                        {activity.meta && (
                          <div className="meta text-xs text-[var(--ink-faint)] mt-1.5">
                            {activity.meta}
                          </div>
                        )}
                      </div>
                    </div>
                    {actIdx < day.activities.length - 1 && <div className="rule--soft" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Dashed Transit Leg Segment */}
              {day.transit && (
                <div className="my-6 py-3 px-4 bg-[var(--paper-alt)]/50 border-y border-dashed border-[var(--hairline-strong)] flex items-center justify-between text-xs">
                  <span className="label">TRANSIT LEG</span>
                  <span className="meta font-medium text-[var(--ink)]">
                    - - - {day.transit.duration} ({day.transit.mode}): {day.transit.details} - - -
                  </span>
                  <span className="label label--accent">RESERVED</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
