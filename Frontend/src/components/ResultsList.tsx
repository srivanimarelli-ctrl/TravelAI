"use client";

import React from "react";
import Image from "next/image";
import { jitter } from "../lib/seed";

export interface DestinationItem {
  id: string;
  title: string;
  dispatchNo: string;
  region: string;
  image: string;
  highlights: string;
  duration: string;
  route: string;
  price: string;
  aiReason?: string;
  featuredQuote?: string;
}

export interface ResultsListProps {
  items: DestinationItem[];
  onSelectRoute: (item: DestinationItem) => void;
  selectedId?: string;
}

export function ResultsList({ items, onSelectRoute, selectedId }: ResultsListProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      {/* Section Document Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--hairline-strong)] mb-6">
        <div className="flex items-center gap-3">
          <span className="label label--accent">CURATED FIELD DISPATCHES</span>
          <span className="text-xs text-[var(--ink-faint)]">•</span>
          <span className="meta">{items.length} ROUTES AVAILABLE</span>
        </div>
        <div className="label">SORT: EDITORIAL MERIT</div>
      </div>

      {/* Article Rows List */}
      <div className="flex flex-col">
        {items.map((item, index) => {
          const isFifthRow = (index + 1) % 5 === 0;
          const rotJitter = jitter(item.id, 2.5);
          const isSelected = selectedId === item.id;

          // Rhythm Breaker Row (Every 5th item)
          if (isFifthRow) {
            return (
              <React.Fragment key={item.id}>
                {/* Rhythm Breaker: Full Bleed Image with Overlaid Type */}
                <article
                  onClick={() => onSelectRoute(item)}
                  className="my-8 relative cursor-pointer overflow-hidden rounded-[3px] border border-[var(--hairline-strong)] group"
                  data-testid={`result-row-featured-${item.id}`}
                >
                  <div className="relative h-72 sm:h-96 w-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-90"
                      sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                    {/* Editorial Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-[var(--ink)]/40 to-transparent p-6 sm:p-10 flex flex-col justify-end">
                      <div className="label text-[var(--paper-alt)] mb-2">
                        SPECIAL DISPATCH — {item.dispatchNo}
                      </div>
                      <h3 className="font-display text-3xl sm:text-4xl text-[var(--paper)] mb-2">
                        {item.title}
                      </h3>
                      {item.featuredQuote && (
                        <p className="font-display italic text-lg text-[var(--paper-alt)] max-w-2xl mb-4">
                          &ldquo;{item.featuredQuote}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--paper)]/20 text-[var(--paper-alt)]">
                        <span className="meta text-[var(--paper-alt)]">
                          {item.duration} · {item.route}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="font-mono tabular-nums text-xl font-medium text-[var(--paper)]">
                            {item.price}
                          </span>
                          <span className="btn btn--stamp text-xs uppercase">EXPLORE ROUTE →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
                <div className="rule my-2" />
              </React.Fragment>
            );
          }

          // Standard 3-Column Grid Article Row
          return (
            <React.Fragment key={item.id}>
              <article
                onClick={() => onSelectRoute(item)}
                className={`py-6 cursor-pointer group transition-colors duration-200 ${
                  isSelected ? "bg-[var(--paper-alt)]/40 px-3 -mx-3 rounded-[3px]" : ""
                }`}
                data-testid={`result-row-${item.id}`}
              >
                {/* Desktop: 152px 1fr auto | Mobile: Stacked */}
                <div className="grid grid-cols-1 md:grid-cols-[152px_1fr_auto] gap-6 items-center">
                  {/* Column 1: Portrait 4:5 Image */}
                  <div
                    className="relative w-full md:w-[152px] aspect-[4/5] overflow-hidden rounded-[3px] bg-[var(--paper-deep)] img-hover-scale shadow-[var(--lift)]"
                    style={{
                      transform: `rotate(${rotJitter}deg)`,
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="152px"
                    />
                  </div>

                  {/* Column 2: Editorial Details */}
                  <div className="flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="label">{item.dispatchNo}</span>
                      <span className="text-xs text-[var(--ink-faint)]">•</span>
                      <span className="label text-[var(--ink-soft)]">{item.region}</span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors duration-200">
                      {item.title}
                    </h3>

                    <p className="text-sm text-[var(--ink-soft)] line-clamp-2 leading-relaxed">
                      {item.highlights}
                    </p>

                    {/* AI Recommendation Reason (Invisible presentation, natural text) */}
                    {item.aiReason && (
                      <p className="text-xs text-[var(--ink-soft)] italic flex items-center gap-1.5 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        {item.aiReason}
                      </p>
                    )}

                    <div className="meta mt-1">
                      {item.duration} · {item.route}
                    </div>
                  </div>

                  {/* Column 3: Price & Action */}
                  <div className="flex flex-row md:flex-col items-baseline md:items-end justify-between md:justify-center gap-2 md:gap-3 border-t md:border-t-0 border-[var(--hairline)] pt-3 md:pt-0">
                    <div>
                      <div className="font-mono tabular-nums text-2xl font-normal text-[var(--ink)] text-right">
                        {item.price}
                      </div>
                      <div className="meta text-xs text-right text-[var(--ink-faint)]">PER TRAVELLER</div>
                    </div>

                    <span className="link text-xs uppercase font-medium text-[var(--ink)] group-hover:text-[var(--accent)]">
                      VIEW ROUTE &rarr;
                    </span>
                  </div>
                </div>
              </article>
              <div className="rule" />
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
