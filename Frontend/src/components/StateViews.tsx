"use client";

import React from "react";

export interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Compiling field dispatches & route maps..." }: LoadingStateProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      {/* Thin Accent Progress Rule at Top of Content Region */}
      <div className="w-full h-[2px] bg-[var(--accent)] animate-pulse mb-8" />

      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="label label--accent mb-2">FIELD DESK COMPUTING</div>
        <p className="font-display text-2xl text-[var(--ink)] mb-4">{message}</p>

        {/* Paper Alt Skeleton Blocks (No shimmer, strictly static paper blocks) */}
        <div className="w-full max-w-2xl space-y-4 mt-4">
          <div className="h-16 bg-[var(--paper-alt)] border border-[var(--hairline)] rounded-[3px]" />
          <div className="h-16 bg-[var(--paper-alt)] border border-[var(--hairline)] rounded-[3px]" />
          <div className="h-16 bg-[var(--paper-alt)] border border-[var(--hairline)] rounded-[3px]" />
        </div>
      </div>
    </div>
  );
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export function EmptyState({
  title = "No Dispatches Found Matching Field Parameters",
  description = "Adjust your origin, destination, or date window to expand your route search across available dispatches.",
  onReset,
}: EmptyStateProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 my-16 text-center">
      <div className="p-8 sm:p-12 bg-[var(--paper-alt)]/50 border border-[var(--hairline-strong)] rounded-[3px] shadow-[var(--lift)] flex flex-col items-center">
        <span className="label mb-3">DESK NOTICE — ZERO MATCHES</span>
        <h2 className="font-display text-3xl sm:text-4xl text-[var(--ink)] mb-4 max-w-xl">
          {title}
        </h2>
        <p className="text-base text-[var(--ink-soft)] max-w-lg mb-8 leading-relaxed">
          {description}
        </p>

        {/* Single Ghost Action Button */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="btn btn--ghost uppercase tracking-widest text-xs py-2.5 px-6"
          >
            RESET FIELD PARAMETERS
          </button>
        )}
      </div>
    </div>
  );
}

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "An error occurred while reading dispatch records.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 my-12">
      <div className="p-6 bg-[var(--accent-wash)] border border-[var(--accent)] rounded-[3px]">
        <div className="label label--accent mb-1">DISPATCH SYSTEM NOTICE</div>
        <h3 className="font-display text-2xl text-[var(--accent-deep)] mb-2">
          Unable to Retrieve Route Data
        </h3>
        <p className="text-sm text-[var(--ink-soft)] mb-4">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn btn--stamp text-xs uppercase"
          >
            RETRY SEARCH
          </button>
        )}
      </div>
    </div>
  );
}
