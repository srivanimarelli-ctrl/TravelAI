"use client";

import React, { useState } from "react";
import { Masthead } from "../components/Masthead";
import { SearchDesk } from "../components/SearchDesk";
import { ResultsList, DestinationItem } from "../components/ResultsList";
import { ItineraryView, DayPlan } from "../components/ItineraryView";
import { LoadingState, EmptyState, ErrorState } from "../components/StateViews";

// Curated Real Place Dispatch Sample Data
const SAMPLE_DISPATCHES: DestinationItem[] = [
  {
    id: "disp-042",
    dispatchNo: "DISPATCH 042",
    region: "JAPAN / HONSHU TRAVERSE",
    title: "Kyoto, Kanazawa & the Alpine Passages",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
    highlights: "Historic tea houses of Higashiyama, traditional lacquerware artisans in Kanazawa, and high-mountain train passes across the Japanese Alps.",
    duration: "14 DAYS",
    route: "OVERLAND & SHINKANSEN",
    price: "$3,450",
    aiReason: "Selected for autumn foliage peak and low regional precipitation.",
    featuredQuote: "In the backstreets of Kanazawa, copper kettle steam rises against cedar eaves unchanged since 1840.",
  },
  {
    id: "disp-038",
    dispatchNo: "DISPATCH 038",
    region: "PORTUGAL / ATLANTIC COAST",
    title: "Lisbon Alfama, Sintra & the Douro Valley",
    image: "https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?q=80&w=800&auto=format&fit=crop",
    highlights: "Cobblestone alleys of Alfama, hand-painted azulejo tile workshops, terraced vineyards of the Douro, and Atlantic coastal cliffs.",
    duration: "10 DAYS",
    route: "SCENIC RAIL & RIVER",
    price: "$2,180",
    aiReason: "Recommended for vintage harvest season in the Douro river basin.",
  },
  {
    id: "disp-031",
    dispatchNo: "DISPATCH 031",
    region: "ITALY / TYRRHENIAN COAST",
    title: "Amalfi Coast Passages, Ravello & Capri",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop",
    highlights: "High cliffside footpaths of the Sentiero degli Dei, lemon groves of Ravello, and historic maritime anchorages.",
    duration: "7 DAYS",
    route: "COASTAL FERRY & WALKING",
    price: "$2,890",
    aiReason: "Optimal for off-peak cliff trails with moderate afternoon sea breeze.",
  },
  {
    id: "disp-027",
    dispatchNo: "DISPATCH 027",
    region: "SCOTLAND / HIGHLANDS & ISLES",
    title: "Isle of Skye, Glen Coe & Torridon Coast",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop",
    highlights: "Ancient geological ridges of the Quiraing, quiet lochside distilleries, and coastal single-track roads.",
    duration: "9 DAYS",
    route: "SELF-DRIVE & FERRY",
    price: "$2,420",
    aiReason: "Ideal for crisp atmosphere and early evening light across lochs.",
  },
  {
    id: "disp-019",
    dispatchNo: "DISPATCH 019",
    region: "SWITZERLAND / ENGADIN VALLEY",
    title: "Swiss Alpine Rail, St. Moritz & Soglio Pass",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop",
    highlights: "Narrow-gauge Bernina Express crossings, stone-paved alpine hamlets, and high larch forest footpaths.",
    duration: "12 DAYS",
    route: "PANORAMIC ALPINE RAIL",
    price: "$4,150",
    aiReason: "Highlights iconic narrow-gauge mountain passes with minimal transfer friction.",
    featuredQuote: "The train rounds the Landwasser Viaduct with silent precision, suspended 65 meters above pine valley mist.",
  },
  {
    id: "disp-014",
    dispatchNo: "DISPATCH 014",
    region: "MEXICO / OAXACA HIGHLANDS",
    title: "Oaxaca Artisan Villages & Sierra Norte",
    image: "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?q=80&w=800&auto=format&fit=crop",
    highlights: "Hand-loomed rug workshops of Teotitlán del Valle, ancestral clay studios, and high cloud-forest trails.",
    duration: "8 DAYS",
    route: "OVERLAND & TRAIL",
    price: "$1,850",
    aiReason: "Curated for authentic craft workshops and mountain eco-lodges.",
  },
];

// Sample Detailed Itinerary Days for Kyoto & Kanazawa
const SAMPLE_ITINERARY_DAYS: DayPlan[] = [
  {
    dayNumber: "01",
    date: "WEDNESDAY, OCTOBER 14, 2026",
    title: "Arrival in Kyoto & Evening Walk in Higashiyama",
    activities: [
      {
        time: "15:00",
        title: "Check-in at Machiya Residence in Gion",
        description: "Settle into a restored wooden townhouse featuring traditional tatami matting and private courtyard gardens.",
        meta: "COORDINATES: 35.0037° N, 135.7772° E · ENTRY PERMIT VERIFIED",
      },
      {
        time: "17:30",
        title: "Twilight Walk along Ninenzaka & Sannenzaka",
        description: "Explore quiet stone stairways flanked by wooden shopfronts as street lanterns illuminate cedar facades.",
        meta: "ESTIMATED DISTANCE: 3.2 KM WALKING",
      },
      {
        time: "19:30",
        title: "Seasonal Kaiseki Dinner at Kennin-ji Sub-temple",
        description: "Multi-course meal highlighting autumn matsutake mushrooms, grilled river fish, and local dashi broths.",
        meta: "RESERVATION ID: #KY-8820",
      },
    ],
    transit: {
      type: "transit",
      mode: "Express Rail",
      duration: "1h 15m",
      details: "Kansai Airport Haruka Express to Kyoto Station",
    },
  },
  {
    dayNumber: "02",
    date: "THURSDAY, OCTOBER 15, 2026",
    title: "Morning Tea Ceremony & Northern Temple Gardens",
    activities: [
      {
        time: "08:30",
        title: "Private Matcha Preparation at Daitoku-ji",
        description: "Join tea master Hayashi-san in a 17th-century tea pavilion overlooking raked gravel gardens.",
        meta: "DURATION: 90 MINS · PRIVATE DISPATCH ACCESS",
      },
      {
        time: "11:00",
        title: "Study of Moss & Stone at Koto-in",
        description: "Contemplate maple canopy shadows along stone path passages.",
        meta: "NOTE: QUIET PHOTOGRAPHY ONLY",
      },
      {
        time: "14:00",
        title: "Woodblock Printmaker Workshop in Kamigyo",
        description: "Observe historic cherry wood block carving and natural pigment printing techniques.",
        meta: "WORKSHOP REF: #W-104",
      },
    ],
  },
  {
    dayNumber: "03",
    date: "FRIDAY, OCTOBER 16, 2026",
    title: "Shinkansen to Kanazawa & Castle District",
    activities: [
      {
        time: "09:15",
        title: "Board Tsurugi Express for Kanazawa",
        description: "Overland transit through Fukui prefecture past coastal mountain ridges.",
        meta: "JR PASS VALIDATED · SEAT 04A CAR 2",
      },
      {
        time: "12:30",
        title: "Kenroku-en Garden Walking Inspection",
        description: "Examine the iconic two-legged stone lantern and pine branch rope bracing (Yukitsuri).",
        meta: "WEATHER OPTIMAL: 18°C CLEAR",
      },
      {
        time: "16:00",
        title: "Gold Leaf Artisanal Gilding Studio Visit",
        description: "Demonstration of beating gold into sub-micron sheets in Higashi Chaya district.",
        meta: "DEMONSTRATION DURATION: 45 MINS",
      },
    ],
    transit: {
      type: "transit",
      mode: "Hokuriku Shinkansen",
      duration: "2h 05m",
      details: "Kyoto Station to Kanazawa Station Direct",
    },
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("dispatches");
  const [origin, setOrigin] = useState("Lisbon, Portugal");
  const [destination, setDestination] = useState("Kyoto & Kanazawa");
  const [dates, setDates] = useState("Oct 14 — Oct 28");
  const [guests, setGuests] = useState("2 Guests");
  const [budget, setBudget] = useState("Tactile / Medium");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<DestinationItem | null>(null);
  const [viewState, setViewState] = useState<"results" | "itinerary" | "loading" | "empty" | "error">("results");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setViewState("loading");

    // Simulate natural fetch transition
    setTimeout(() => {
      setIsSearching(false);
      if (destination.toLowerCase().includes("nonexistent")) {
        setViewState("empty");
      } else {
        setViewState("results");
      }
    }, 600);
  };

  const handleSelectRoute = (route: DestinationItem) => {
    setSelectedRoute(route);
    setViewState("itinerary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToResults = () => {
    setViewState("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setOrigin("Lisbon, Portugal");
    setDestination("");
    setDates("Oct 14 — Oct 28");
    setGuests("2 Guests");
    setAiPrompt("");
    setViewState("results");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--ink)] font-body">
      {/* Surface 1: Publication Masthead */}
      <Masthead
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (viewState === "itinerary") setViewState("results");
        }}
        onRequestItinerary={() => {
          const el = document.getElementById("search-desk-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <main className="flex-1 w-full pb-20">
        {/* Surface 2: Search Desk */}
        <div id="search-desk-section">
          <SearchDesk
            origin={origin}
            destination={destination}
            dates={dates}
            guests={guests}
            budget={budget}
            aiPrompt={aiPrompt}
            onOriginChange={(e) => setOrigin(e.target.value)}
            onDestinationChange={(e) => setDestination(e.target.value)}
            onDatesChange={(e) => setDates(e.target.value)}
            onGuestsChange={(e) => setGuests(e.target.value)}
            onBudgetChange={(e) => setBudget(e.target.value)}
            onAiPromptChange={(e) => setAiPrompt(e.target.value)}
            onSubmit={handleSearchSubmit}
            isSearching={isSearching}
          />
        </div>

        {/* Dynamic View States */}
        {viewState === "loading" && <LoadingState />}

        {viewState === "empty" && (
          <EmptyState onReset={handleResetFilters} />
        )}

        {viewState === "error" && (
          <ErrorState onRetry={() => setViewState("results")} />
        )}

        {viewState === "results" && (
          /* Surface 3: Results Article List */
          <ResultsList
            items={SAMPLE_DISPATCHES}
            onSelectRoute={handleSelectRoute}
            selectedId={selectedRoute?.id}
          />
        )}

        {viewState === "itinerary" && (
          /* Surface 4: Itinerary Travel Document */
          <ItineraryView
            title={selectedRoute?.title || "Kyoto, Kanazawa & the Alpine Passages"}
            subtitle="An overland field traverse across ancient castle districts, cedar temple gardens, and high mountain rail lines."
            dispatchRef={selectedRoute?.dispatchNo || "DISPATCH 042"}
            totalDays={selectedRoute?.duration || "14 DAYS"}
            totalCost={selectedRoute?.price || "$3,450"}
            days={SAMPLE_ITINERARY_DAYS}
            onBackToResults={handleBackToResults}
            onPrintOrSave={() => window.print()}
          />
        )}
      </main>

      {/* Footer: Editorial Publication Colophon */}
      <footer className="w-full bg-[var(--paper-alt)] border-t border-[var(--hairline-strong)] py-12 mt-auto text-[var(--ink-soft)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="font-display text-2xl text-[var(--ink)] mb-2">
                THE TRAVEL AI JOURNAL
              </h3>
              <p className="text-sm text-[var(--ink-soft)] max-w-md leading-relaxed">
                An independent publication and route desk dedicated to tactile, slow, and authentic field travel dispatches across historical overland corridors.
              </p>
            </div>
            <div>
              <div className="label mb-3">EDITIONS</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="link">OCTOBER 2026 DISPATCHES</a></li>
                <li><a href="#" className="link">JAPAN ALPINE TRAVERSE</a></li>
                <li><a href="#" className="link">ATLANTIC COASTAL ROUTES</a></li>
                <li><a href="#" className="link">HIGHLAND RAIL ARCHIVE</a></li>
              </ul>
            </div>
            <div>
              <div className="label mb-3">DESK COLOPHON</div>
              <div className="meta text-xs space-y-1">
                <p>PUBLISHED IN LISBON &amp; KYOTO</p>
                <p>TYPESET IN INSTRUMENT SERIF</p>
                <p>DIGITAL FIELD SPECIFICATION 042</p>
                <p>ISSN 2049-8812</p>
              </div>
            </div>
          </div>

          <div className="rule my-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs meta text-[var(--ink-faint)]">
            <p>&copy; 2026 THE TRAVEL AI JOURNAL. ALL RIGHTS RESERVED.</p>
            <p>TACTILE EDITORIAL REDESIGN · VERIFIED ACCORDING TO DESK SPECIFICATION</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
