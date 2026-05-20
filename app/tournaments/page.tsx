"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import YearWheelPicker from "@/components/YearWheelPicker";

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
  const [selectedYear, setSelectedYear] = useState("2026");

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
      fetchFederationList(selectedYear);
    }
  }, [initialId]);

  // Fetch Uganda Registered Tournaments Index from Chess-Results
  const fetchFederationList = async (yearStr?: string) => {
    const yr = yearStr || selectedYear;
    setListLoading(true);
    setError(null);
    setDetails(null);
    setTabData(null);
    try {
      const res = await fetch(`/api/external/chess-results?view=list&year=${yr}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load Uganda tournaments list");
      setFedTournaments(json.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setListLoading(false);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (!activeId) {
      fetchFederationList(year);
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
      // Automatically default to showing final round standings
      const finalRound = json.data?.rounds || 5;
      setActiveRound(finalRound);
      fetchViewData(id, "standings", finalRound);
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
      if (tab === "pairings" || tab === "standings") {
        fetchViewData(activeId, tab, activeRound);
      } else {
        fetchViewData(activeId, tab);
      }
    }
  };

  const handleRoundChange = (rd: number) => {
    setActiveRound(rd);
    if (activeId && (activeTab === "pairings" || activeTab === "standings")) {
      fetchViewData(activeId, activeTab, rd);
    }
  };

  // Filter list by name keyword and sort by startDate descending (latest on top), fallback to ID descending
  const filteredList = (fedTournaments || [])
    .filter((t: any) => t.name.toLowerCase().includes(searchFilter.toLowerCase()))
    .sort((a: any, b: any) => {
      if (a.startDate && b.startDate) {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return parseInt(b.id) - parseInt(a.id);
    });

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
                Tournament Directory
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/calendar" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                Calendar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8 bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800/80 shadow-2xl">
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white mb-3">
              Chess-Results Browser
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
              Browse, search, and parse standings, rosters, and pairings for all tournaments across Uganda
            </p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Filter by Season</span>
            <YearWheelPicker selectedYear={selectedYear} onYearChange={handleYearChange} />
          </div>
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

            {/* Federation tournaments list table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                    Uganda Federation Directory ({selectedYear})
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Sorted by latest start date descending
                  </p>
                </div>

                <button
                  onClick={() => fetchFederationList(selectedYear)}
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
                <div className="space-y-4 p-6">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="h-16 bg-zinc-950 rounded-2xl border border-zinc-800 animate-pulse p-4 flex justify-between items-center">
                      <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                      <div className="h-4 bg-zinc-800 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : filteredList.length === 0 ? (
                <div className="p-20 border border-dashed border-zinc-800 rounded-[2rem] text-center text-zinc-500 font-bold italic">
                  No tournaments found matching &quot;{searchFilter}&quot;.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[650px] overflow-y-auto pr-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest sticky top-0 bg-zinc-900 z-10">
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Tournament Name</th>
                        <th className="py-4 px-6 text-center">Date / Season</th>
                        <th className="py-4 px-6 text-center">Status / Tier</th>
                        <th className="py-4 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredList.map((t: any) => (
                        <tr
                          key={t.id}
                          onClick={() => triggerTournamentView(t.id)}
                          className="group hover:bg-white/[0.03] cursor-pointer transition-colors"
                        >
                          <td className="py-5 px-6 font-mono text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                            {t.id}
                          </td>
                          <td className="py-5 px-6 font-bold text-white group-hover:text-blue-400 transition-colors text-sm uppercase leading-relaxed max-w-xl">
                            {t.name}
                          </td>
                          <td className="py-5 px-6 text-center font-mono text-xs text-zinc-400">
                            {t.startDate ? new Date(t.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : t.year || selectedYear}
                          </td>
                          <td className="py-5 px-6 text-center">
                            {t.isActive ? (
                              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/40 animate-pulse inline-flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ACTIVE NOW
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20 inline-block">
                                Official Registry
                              </span>
                            )}
                          </td>
                          <td className="py-5 px-6 text-right font-black text-xs text-blue-500 group-hover:translate-x-1 transition-transform">
                            VIEW DATA ⚡
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    📋 Chess-Results Database Record
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

            {/* Round Pairing & Standings Controller */}
            {(activeTab === "pairings" || activeTab === "standings") && (
              <div className="flex flex-wrap items-center gap-3 p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] justify-center">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest mr-2">
                  {activeTab === "pairings" ? "Select Round Pairings:" : "Standings after Round:"}
                </span>
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
                <div className="space-y-6 p-8 animate-pulse">
                  <div className="h-6 bg-zinc-800 rounded-xl w-1/3 mb-8"></div>
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="h-12 bg-zinc-850 rounded-2xl border border-zinc-800/80 flex justify-between items-center px-6">
                        <div className="h-4 bg-zinc-700/50 rounded w-1/4"></div>
                        <div className="h-4 bg-zinc-700/50 rounded w-1/3"></div>
                        <div className="h-4 bg-zinc-700/50 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !tabData || tabData.length === 0 ? (
                activeTab === "pairings" ? (
                  <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-950/50 text-center max-w-2xl mx-auto my-8">
                    <span className="text-4xl mb-4">📋</span>
                    <h3 className="text-base font-black italic uppercase tracking-wider text-zinc-300 mb-2">Historical Pairings Archive Unavailable</h3>
                    <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                      The Chief Arbiter for this event published the official Final Standings, but individual round-by-round board pairings were not synchronized to the public federation server.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-950/50 text-center max-w-2xl mx-auto my-8">
                    <span className="text-4xl mb-4">⚠️</span>
                    <h3 className="text-base font-black italic uppercase tracking-wider text-zinc-300 mb-2">Federation Data Matrix Unpopulated</h3>
                    <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                      Standard standings or roster files have not been uploaded for this event view.
                    </p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  {/* VIEW 1: STANDINGS */}
                  {activeTab === "standings" && (() => {
                    const isTeamLeague = tabData?.formatType === "TEAM_LEAGUE";
                    const playersList = tabData?.players || (Array.isArray(tabData) ? tabData : []);
                    const tbHeadersList = tabData?.tbHeaders || (playersList[0]?.tiebreak1 !== undefined ? ["TB1", "TB2"] : []);

                    return (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800/20">
                            <th className="py-4 px-4">Rank</th>
                            <th className="py-4 px-4">{isTeamLeague ? "Team / Club Name" : "Player Name"}</th>
                            {!isTeamLeague && <th className="py-4 px-4">FED</th>}
                            {!isTeamLeague && <th className="py-4 px-4 text-center">Rating</th>}
                            {isTeamLeague && <th className="py-4 px-4 text-center">P</th>}
                            {isTeamLeague && <th className="py-4 px-4 text-center">+</th>}
                            {isTeamLeague && <th className="py-4 px-4 text-center">=</th>}
                            {isTeamLeague && <th className="py-4 px-4 text-center">-</th>}
                            {isTeamLeague && <th className="py-4 px-4 text-center font-bold text-yellow-500">MP</th>}
                            {isTeamLeague && <th className="py-4 px-4 text-center font-bold text-blue-400">BP</th>}
                            {tbHeadersList.map((h: string, i: number) => (
                              <th key={i} className="py-4 px-4 text-center font-bold text-zinc-400">{h}</th>
                            ))}
                            {!isTeamLeague && <th className="py-4 px-4 text-right font-bold text-yellow-500">Points</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {playersList.map((p: any, idx: number) => (
                            <tr key={idx} className="group hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4 font-black italic text-zinc-500 text-sm">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${idx === 0 ? 'bg-yellow-500 text-black font-black' : idx < 3 ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 border border-zinc-800'}`}>
                                  {p.rank}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-bold text-white group-hover:text-yellow-500 transition-colors text-sm">{p.name}</p>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">SNo: {p.startingRank}</span>
                              </td>
                              {!isTeamLeague && <td className="py-4 px-4 text-xs font-bold text-zinc-400">{p.federation}</td>}
                              {!isTeamLeague && <td className="py-4 px-4 text-center font-mono text-zinc-300 text-sm">{p.rating}</td>}
                              {isTeamLeague && <td className="py-4 px-4 text-center font-bold text-zinc-300">{p.played ?? "-"}</td>}
                              {isTeamLeague && <td className="py-4 px-4 text-center font-bold text-emerald-400">{p.won ?? "-"}</td>}
                              {isTeamLeague && <td className="py-4 px-4 text-center font-bold text-zinc-400">{p.drawn ?? "-"}</td>}
                              {isTeamLeague && <td className="py-4 px-4 text-center font-bold text-rose-400">{p.lost ?? "-"}</td>}
                              {isTeamLeague && <td className="py-4 px-4 text-center font-black text-white text-base">{p.matchPoints ?? p.points}</td>}
                              {isTeamLeague && <td className="py-4 px-4 text-center font-black text-blue-400 italic">{p.gamePoints ?? "-"}</td>}
                              {tbHeadersList.map((h: string, i: number) => (
                                <td key={i} className="py-4 px-4 text-center font-mono text-zinc-400 text-xs tabular-nums">
                                  {p.tiebreaks ? p.tiebreaks[h] : (i === 0 ? p.tiebreak1 : p.tiebreak2) ?? "-"}
                                </td>
                              ))}
                              {!isTeamLeague && <td className="py-4 px-4 text-right font-black text-yellow-500 italic text-lg">{typeof p.points === 'number' ? p.points.toFixed(1) : p.points}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* VIEW 2: ROSTER */}
                  {activeTab === "roster" && (() => {
                    const isTeamLeague = tabData?.formatType === "TEAM_LEAGUE" || (Array.isArray(tabData) && tabData.some((p: any) => p.teamName));
                    const rosterPlayers = tabData?.players || (Array.isArray(tabData) ? tabData : []);

                    return (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800/20">
                            <th className="py-4 px-4">SNo.</th>
                            {isTeamLeague && <th className="py-4 px-4">Team / Club Name</th>}
                            {isTeamLeague && <th className="py-4 px-4 text-center">Board</th>}
                            <th className="py-4 px-4">Player Name</th>
                            <th className="py-4 px-4">Title</th>
                            <th className="py-4 px-4">FED</th>
                            <th className="py-4 px-4 text-right">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {rosterPlayers.map((p: any, idx: number) => (
                            <tr key={idx} className="group hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4 font-black italic text-zinc-600 text-sm">{p.startingRank}</td>
                              {isTeamLeague && (
                                <td className="py-4 px-4">
                                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 font-bold text-xs text-blue-400 border border-zinc-700">
                                    {p.teamName || "Reserve / Sub"}
                                  </span>
                                </td>
                              )}
                              {isTeamLeague && (
                                <td className="py-4 px-4 text-center font-black text-yellow-500 text-xs">
                                  {p.boardNumber ? `Bo. ${p.boardNumber}` : "-"}
                                </td>
                              )}
                              <td className="py-4 px-4">
                                <p className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">{p.name}</p>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">FIDE ID: {p.fideId || "N/A"}</span>
                              </td>
                              <td className="py-4 px-4 text-xs">
                                {p.title ? (
                                  <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-bold border border-blue-500/20 text-[10px]">
                                    {p.title}
                                  </span>
                                ) : (
                                  <span className="text-zinc-600 font-medium">-</span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-xs font-bold text-zinc-400">{p.federation}</td>
                              <td className="py-4 px-4 text-right font-mono text-white text-sm">{p.rating}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {/* VIEW 3: PAIRINGS */}
                  {activeTab === "pairings" && (() => {
                    const pairingsList = Array.isArray(tabData) ? tabData : [];

                    return (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800/20">
                            <th className="py-4 px-4">Tbl / Bo</th>
                            <th className="py-4 px-4">White (White ELO)</th>
                            <th className="py-4 px-4 text-center">Result</th>
                            <th className="py-4 px-4 text-right">Black (Black ELO)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {pairingsList.map((p: any, idx: number) => (
                            <React.Fragment key={idx}>
                              {/* Main Match Pairing Row */}
                              <tr className={`group transition-colors ${p.isMatch ? 'bg-zinc-800/30 font-bold border-t border-zinc-700/50' : 'hover:bg-white/5'}`}>
                                <td className="py-4 px-4 font-black italic text-zinc-500 text-sm">
                                  {p.isMatch ? `Match ${p.table}` : p.table}
                                </td>
                                <td className="py-4 px-4">
                                  <p className={`font-bold text-sm transition-colors ${p.isMatch ? 'text-yellow-500 text-base' : 'text-white group-hover:text-blue-400'}`}>
                                    {p.whiteName}
                                  </p>
                                  {!p.isMatch && <span className="text-[10px] font-bold text-zinc-500 uppercase">ELO {p.whiteRating}</span>}
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full font-black text-xs border ${p.isMatch ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105' : 'bg-zinc-950 text-zinc-400 border-zinc-800/50'}`}>
                                    {p.result}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <p className={`font-bold text-sm transition-colors ${p.isMatch ? 'text-yellow-500 text-base' : 'text-white group-hover:text-blue-400'}`}>
                                    {p.blackName}
                                  </p>
                                  {!p.isMatch && <span className="text-[10px] font-bold text-zinc-500 uppercase">ELO {p.blackRating}</span>}
                                </td>
                              </tr>
                              {/* Nested Board Pairings Rows */}
                              {p.isMatch && p.boardPairings?.map((bp: any, bidx: number) => (
                                <tr key={`bp-${idx}-${bidx}`} className="bg-zinc-950/40 hover:bg-zinc-900/40 transition-colors border-none text-xs">
                                  <td className="py-2.5 px-4 font-mono text-zinc-600 pl-8">
                                    └─ Bo. {bp.table}
                                  </td>
                                  <td className="py-2.5 px-4 pl-8">
                                    <span className="text-zinc-300 font-medium">{bp.whiteName}</span>
                                    <span className="text-[9px] font-mono text-zinc-500 ml-2">({bp.whiteRating})</span>
                                  </td>
                                  <td className="py-2.5 px-4 text-center font-bold text-zinc-400 font-mono">
                                    {bp.result}
                                  </td>
                                  <td className="py-2.5 px-4 text-right pr-8">
                                    <span className="text-[9px] font-mono text-zinc-500 mr-2">({bp.blackRating})</span>
                                    <span className="text-zinc-300 font-medium">{bp.blackName}</span>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
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
