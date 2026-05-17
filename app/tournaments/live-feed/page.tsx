"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

type TabView = "details" | "standings" | "roster" | "pairings";

import { Suspense } from "react";

function ChessResultsLiveFeed() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search parameters & states
  const initialId = searchParams.get("id") || "";
  const [inputId, setInputId] = useState(initialId);
  const [activeId, setActiveId] = useState(initialId);
  const [activeTab, setActiveTab] = useState<TabView>("standings");
  const [activeRound, setActiveRound] = useState(1);

  // Data States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tournament details state
  const [details, setDetails] = useState<{
    name: string;
    organizer: string | null;
    chiefArbiter: string | null;
    location: string | null;
    rounds: number;
  } | null>(null);

  // Tab contents state
  const [tabData, setTabData] = useState<any>(null);

  // Recommended Chess-Results IDs for testing
  const featuredTournaments = [
    { id: "1015694", name: "FIDE World Cup 2026 Sandbox" },
    { id: "1012356", name: "Uganda National Juniors 2026" },
    { id: "986754", name: "Central Uganda Open GP" },
  ];

  // Sync state with URL
  useEffect(() => {
    setInputId(initialId);
    setActiveId(initialId);
    if (initialId) {
      fetchDetails(initialId);
    }
  }, [initialId]);

  // Handle Fetching Tournament Details
  const fetchDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    setDetails(null);
    setTabData(null);

    try {
      const res = await fetch(`/api/external/chess-results?id=${id}&view=details`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load tournament details");

      setDetails(json.data);
      // Fetch initial standings automatically once details succeed
      fetchViewData(id, "standings");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Fetching specific tab content
  const fetchViewData = async (id: string, view: TabView, roundNum?: number) => {
    setLoading(true);
    setError(null);
    setTabData(null);

    try {
      const rd = roundNum || activeRound;
      const res = await fetch(`/api/external/chess-results?id=${id}&view=${view}&rd=${rd}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Failed to load ${view} data`);

      setTabData(json.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputId.trim();
    if (!cleanId || !/^\d+$/.test(cleanId)) {
      setError("Please enter a valid numeric Tournament ID.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set("id", cleanId);
    router.push(`?${params.toString()}`);
  };

  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    if (activeId) {
      fetchViewData(activeId, tab);
    }
  };

  const handleRoundChange = (rd: number) => {
    setActiveRound(rd);
    if (activeId && activeTab === "pairings") {
      fetchViewData(activeId, "pairings", rd);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans pb-24 text-white pt-24">
      {/* Dynamic Nav Header */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold tracking-tighter text-white">
                ♟️ ChessFed<span className="text-blue-500">UG</span>
              </Link>
              <span className="px-3 py-1 rounded-md bg-emerald-600/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                Live Scraper Widget
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/tournaments" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                Back to Calendar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white mb-3">
            Live Chess-Results Feed
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
            Grab real-time pairings and standings dynamically from FIDE databases
          </p>
        </header>

        {/* Input Form Search Console */}
        <div className="max-w-2xl mx-auto mb-16 space-y-6">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="Paste Chess-Results Tournament ID (e.g. 1015694)..."
              className="w-full px-8 py-6 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-2xl text-center placeholder-zinc-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:scale-105"
            >
              {loading ? "FETCHING..." : "CONNECT LIVE"}
            </button>
          </form>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mr-2">Featured:</span>
            {featuredTournaments.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setInputId(t.id);
                  const params = new URLSearchParams(window.location.search);
                  params.set("id", t.id);
                  router.push(`?${params.toString()}`);
                }}
                className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white transition-all"
              >
                {t.name} (ID: {t.id})
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto p-8 bg-red-950/20 border border-red-900/40 rounded-[2.5rem] text-center text-red-400">
            <p className="font-bold mb-2">Failed to Connect Live Feed</p>
            <p className="text-xs">{error}</p>
            <p className="text-[10px] text-red-500 font-bold mt-4 uppercase">
              Tip: Confirm the ID is active on Chess-Results and that your internet is connected.
            </p>
          </div>
        )}

        {/* Dynamic Display Console */}
        {details && (
          <div className="space-y-8 animate-fade-in">
            {/* Tournament Details Header Card */}
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] relative overflow-hidden">
              {/* Dynamic Glow Line */}
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-red-600 via-yellow-500 to-green-600"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    ⚡ Live Connection Verified
                  </span>
                  <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none mb-4">
                    {details.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
                    <span>📍 Venue: {details.location || "TBD"}</span>
                    <span>👤 Organizer: {details.organizer || "TBD"}</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 min-w-[150px] text-center">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Rounds Scheduled</p>
                  <p className="text-2xl font-black italic text-blue-400">{details.rounds}</p>
                </div>
              </div>
            </div>

            {/* Dynamic View Selector Tab Bar */}
            <div className="flex flex-wrap border-b border-zinc-800 bg-zinc-900/50 p-4 rounded-[2rem] gap-2">
              {[
                { key: "standings", label: "Standings Ranks" },
                { key: "roster", label: "Player Roster" },
                { key: "pairings", label: "Round Pairings" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as TabView)}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.key ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Round Pairing Controller */}
            {activeTab === "pairings" && (
              <div className="flex flex-wrap items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] justify-center">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest mr-2">Select Round:</span>
                {Array.from({ length: details.rounds }, (_, idx) => idx + 1).map((rd) => (
                  <button
                    key={rd}
                    onClick={() => handleRoundChange(rd)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                      activeRound === rd ? "bg-blue-600 text-white" : "bg-zinc-950 text-zinc-500 hover:text-white border border-zinc-800"
                    }`}
                  >
                    {rd}
                  </button>
                ))}
              </div>
            )}

            {/* Dynamic Rendering Tables */}
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-20 font-bold italic text-zinc-500 gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  Dynamic DOM Parser running...
                </div>
              ) : !tabData || tabData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 font-bold italic text-zinc-500">
                  No data populated for this view yet. Standard pairings might not be uploaded.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* VIEW 1: STANDINGS */}
                  {activeTab === "standings" && (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          <th className="pb-4">Rank</th>
                          <th className="pb-4">Player Name</th>
                          <th className="pb-4">FED</th>
                          <th className="pb-4 text-center">Standard Rating</th>
                          <th className="pb-4 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {tabData.map((p: any, idx: number) => (
                          <tr key={idx} className="group hover:bg-white/5 transition-colors">
                            <td className="py-4 font-black italic text-zinc-600 text-sm">{p.rank}</td>
                            <td className="py-4">
                              <p className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">{p.name}</p>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">SNo: {p.startingRank}</span>
                            </td>
                            <td className="py-4 text-xs font-bold text-zinc-400">{p.federation}</td>
                            <td className="py-4 text-center font-mono text-zinc-300 text-sm">{p.rating}</td>
                            <td className="py-4 text-right font-black text-white italic text-lg">{p.points.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* VIEW 2: ROSTER */}
                  {activeTab === "roster" && (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          <th className="pb-4">SNo.</th>
                          <th className="pb-4">Player Name</th>
                          <th className="pb-4">FIDE Title</th>
                          <th className="pb-4">FED</th>
                          <th className="pb-4 text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {tabData.map((p: any, idx: number) => (
                          <tr key={idx} className="group hover:bg-white/5 transition-colors">
                            <td className="py-4 font-black italic text-zinc-600 text-sm">{p.startingRank}</td>
                            <td className="py-4">
                              <p className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">{p.name}</p>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">FIDE ID: {p.fideId || "N/A"}</span>
                            </td>
                            <td className="py-4 text-xs">
                              {p.title ? (
                                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-bold border border-blue-500/20 text-[10px]">
                                  {p.title}
                                </span>
                              ) : (
                                <span className="text-zinc-600 font-medium">-</span>
                              )}
                            </td>
                            <td className="py-4 text-xs font-bold text-zinc-400">{p.federation}</td>
                            <td className="py-4 text-right font-mono text-white text-sm">{p.rating}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* VIEW 3: PAIRINGS */}
                  {activeTab === "pairings" && (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                          <th className="pb-4">Tbl</th>
                          <th className="pb-4">White (White ELO)</th>
                          <th className="pb-4 text-center">Result</th>
                          <th className="pb-4 text-right">Black (Black ELO)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {tabData.map((p: any, idx: number) => (
                          <tr key={idx} className="group hover:bg-white/5 transition-colors">
                            <td className="py-4 font-black italic text-zinc-600 text-sm">{p.table}</td>
                            <td className="py-4">
                              <p className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">{p.whiteName}</p>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">ELO {p.whiteRating}</span>
                            </td>
                            <td className="py-4 text-center">
                              <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-zinc-950 font-black text-xs text-zinc-400 border border-zinc-800/50">
                                {p.result}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <p className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">{p.blackName}</p>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">ELO {p.blackRating}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ChessResultsLiveFeedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-20 font-bold italic text-zinc-500 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        Initializing Live Feed...
      </div>
    }>
      <ChessResultsLiveFeed />
    </Suspense>
  );
}
