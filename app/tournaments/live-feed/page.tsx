"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

type TabView = "details" | "standings" | "roster" | "pairings";

interface FedTournament {
  id: string;
  name: string;
}

function ChessResultsLiveFeed() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Query Sync
  const initialId = searchParams.get("id") || "";
  const [inputId, setInputId] = useState(initialId);
  const [activeId, setActiveId] = useState(initialId);

  // View & Round Controllers
  const [activeTab, setActiveTab] = useState<TabView>("standings");
  const [activeRound, setActiveRound] = useState(1);

  // Roster/Standings/Pairings loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Federation Index List states
  const [fedTournaments, setFedTournaments] = useState<FedTournament[] | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [listLoading, setListLoading] = useState(false);

  // Details parsed for current tournament
  const [details, setDetails] = useState<{
    name: string;
    organizer: string | null;
    chiefArbiter: string | null;
    location: string | null;
    rounds: number;
  } | null>(null);

  // Tab contents state
  const [tabData, setTabData] = useState<any>(null);

  // Initial Sync from URL parameter
  useEffect(() => {
    setInputId(initialId);
    setActiveId(initialId);
    if (initialId) {
      fetchDetails(initialId);
    } else {
      fetchFederationList();
    }
  }, [initialId]);

  // Fetch Uganda Registered Tournaments Index from Chess-Results
  const fetchFederationList = async () => {
    setListLoading(true);
    setError(null);
    setDetails(null);
    setTabData(null);
    try {
      const res = await fetch("/api/external/chess-results?view=list");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load Uganda tournaments list");
      setFedTournaments(json.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setListLoading(false);
    }
  };

  // Fetch Core Details for active ID
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
      // Automatically default to showing current standings
      fetchViewData(id, "standings");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Tab Specific details (standings, roster, pairings)
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
      setError("Please enter a valid numeric Chess-Results Tournament ID.");
      return;
    }
    triggerTournamentView(cleanId);
  };

  const triggerTournamentView = (id: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("id", id);
    router.push(`?${params.toString()}`);
  };

  const handleBackToList = () => {
    setInputId("");
    setActiveId("");
    setDetails(null);
    setTabData(null);
    const params = new URLSearchParams(window.location.search);
    params.delete("id");
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

  // Filter list by name keyword
  const filteredList = (fedTournaments || []).filter((t) =>
    t.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 font-sans pb-24 text-white pt-24">
      {/* Navigation Header */}
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
                Calendar
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

        {error && (
          <div className="max-w-3xl mx-auto p-8 bg-red-950/20 border border-red-900/40 rounded-[2.5rem] text-center text-red-400 mb-12">
            <p className="font-bold mb-2">Failed to Connect Live Feed</p>
            <p className="text-xs">{error}</p>
          </div>
        )}

        {/* ─── CASE A: NO TOURNAMENT SELECTED - RENDER SEARCHABLE INDEX ─── */}
        {!activeId && (
          <div className="space-y-12 animate-fade-in">
            {/* Search and ID Connect Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* ID Input Form */}
              <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] space-y-4">
                <h3 className="font-black text-sm uppercase tracking-wider text-blue-400">
                  Connect by Chess-Results ID
                </h3>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    placeholder="Enter ID (e.g. 1380546)..."
                    className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-white pr-28 text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    GO ⚡
                  </button>
                </form>
                <p className="text-[10px] text-zinc-500 font-bold leading-relaxed uppercase">
                  Paste the numeric ID from any Chess-Results tournament URL (e.g. tnr1380546.aspx $\rightarrow$ ID is 1380546)
                </p>
              </div>

              {/* Text Search Filter */}
              <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] space-y-4">
                <h3 className="font-black text-sm uppercase tracking-wider text-emerald-400">
                  Filter Uganda Tournaments
                </h3>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Type name (e.g. 'Makerere', 'Elevation', 'Youth')..."
                  className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-white text-sm"
                />
                <p className="text-[10px] text-zinc-500 font-bold leading-relaxed uppercase">
                  Instantly searches matches across active tournament registries
                </p>
              </div>
            </div>

            {/* Federation tournaments list grid */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                    Uganda Federation Registries
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Active Tournaments on Chess-Results Server for 2026
                  </p>
                </div>

                <button
                  onClick={fetchFederationList}
                  disabled={listLoading}
                  className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-all flex items-center gap-2"
                >
                  {listLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    "🔄 Refresh Index"
                  )}
                </button>
              </div>

              {listLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-12">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-28 bg-zinc-950 rounded-3xl border border-zinc-800 animate-pulse p-6 space-y-4">
                      <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                      <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredList.length === 0 ? (
                <div className="p-20 border border-dashed border-zinc-800 rounded-[2rem] text-center text-zinc-500 font-bold italic">
                  No tournaments found matching &quot;{searchFilter}&quot;.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto pr-2">
                  {filteredList.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => triggerTournamentView(t.id)}
                      className="group p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-white/[0.02] rounded-3xl cursor-pointer transition-all flex flex-col justify-between gap-4 shadow-xl hover:shadow-2xl"
                    >
                      <div>
                        {/* Dynamic Live Tag if name contains 2026 or similar */}
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-black uppercase tracking-widest">
                            ID: {t.id}
                          </span>
                          {t.name.toLowerCase().includes("championship") && (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-600/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20 animate-pulse">
                              LIVE EVENT
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm line-clamp-2 leading-relaxed uppercase">
                          {t.name}
                        </h3>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                          CHESS-RESULTS UGA
                        </span>
                        <span className="text-xs font-black text-blue-500 group-hover:translate-x-1 transition-transform">
                          VIEW DATA ⚡
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── CASE B: ACTIVE TOURNAMENT VIEW - PARSE DETAILS, STANDINGS, ROSTERS ─── */}
        {activeId && details && (
          <div className="space-y-8 animate-fade-in">
            {/* Header / Back Action Bar */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleBackToList}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-full text-xs font-black uppercase tracking-widest text-zinc-300 transition-all flex items-center gap-2 hover:scale-105"
              >
                ← Return to Uganda List
              </button>

              <span className="text-xs font-mono text-zinc-500 font-bold uppercase">
                Active ID: {activeId}
              </span>
            </div>

            {/* Tournament Details Banner Card */}
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-600 via-yellow-500 to-green-600"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    ⚡ Real-Time DOM Resolve Active
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white uppercase leading-tight mb-4 max-w-2xl">
                    {details.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    <span>📍 Venue: {details.location || "Uganda"}</span>
                    <span>👤 Organizer: {details.organizer || "UCF Arbiter Team"}</span>
                    {details.chiefArbiter && <span>👤 Arbiter: {details.chiefArbiter}</span>}
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 min-w-[140px] text-center">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Rounds</p>
                  <p className="text-2xl font-black italic text-blue-400">{details.rounds}</p>
                </div>
              </div>
            </div>

            {/* Tab Pill Selector */}
            <div className="flex flex-wrap border-b border-zinc-800 bg-zinc-900/50 p-4 rounded-[2rem] gap-2">
              {[
                { key: "standings", label: "Standings & Tiebreaks" },
                { key: "roster", label: "Federation Roster" },
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

            {/* Table Display */}
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-20 font-bold italic text-zinc-500 gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  Parsing Chess-Results Data Matrix...
                </div>
              ) : !tabData || tabData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 font-bold italic text-zinc-500">
                  No data parsed for this view yet. Standard standings/pairings might not be uploaded.
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
                          <th className="pb-4 text-center">Rating</th>
                          {tabData[0]?.tiebreak1 !== undefined && <th className="pb-4 text-center">TB 1</th>}
                          {tabData[0]?.tiebreak2 !== undefined && <th className="pb-4 text-center">TB 2</th>}
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
                            {p.tiebreak1 !== undefined && <td className="py-4 text-center font-mono text-zinc-400 text-xs">{p.tiebreak1}</td>}
                            {p.tiebreak2 !== undefined && <td className="py-4 text-center font-mono text-zinc-400 text-xs">{p.tiebreak2}</td>}
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
                          <th className="pb-4">Title</th>
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
