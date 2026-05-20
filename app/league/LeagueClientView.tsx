"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Club {
  id: string;
  name: string;
  description: string | null;
  founded: number | null;
  captain: string | null;
  owner: string | null;
}

interface LeagueEvent {
  crId: string;
  name: string;
  startDate: string;
  liveData: {
    standings: any;
    roster: any;
    pairings: any;
  } | null;
}

export default function LeagueClientView({ 
  initialLeagues, 
  clubsMap 
}: { 
  initialLeagues: LeagueEvent[]; 
  clubsMap: Club[]; 
}) {
  const router = useRouter();

  // Group leagues by Year
  const seasonsMap = useMemo(() => {
    const map = new Map<number, LeagueEvent[]>();
    initialLeagues.forEach(l => {
      const year = new Date(l.startDate).getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(l);
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]); // Sort years descending
  }, [initialLeagues]);

  const [selectedYear, setSelectedYear] = useState<number>(seasonsMap[0]?.[0] || 2026);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    seasonsMap[0]?.[1]?.[0]?.crId || initialLeagues[0]?.crId || ""
  );
  const [activeTab, setActiveTab] = useState<"standings" | "pairings" | "boards">("standings");
  const [activeRound, setActiveRound] = useState<number>(1);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHydrating, setIsHydrating] = useState<boolean>(false);

  // Get all leagues for the currently selected year
  const currentYearLeagues = useMemo(() => {
    return seasonsMap.find(s => s[0] === selectedYear)?.[1] || [];
  }, [selectedYear, seasonsMap]);

  const currentLeague = useMemo(() => {
    return currentYearLeagues.find((l) => l.crId === selectedCategoryId) || currentYearLeagues[0] || initialLeagues[0];
  }, [selectedCategoryId, currentYearLeagues, initialLeagues]);

  // Client-side auto-hydration effect for unpopulated DB archives
  useEffect(() => {
    if (!currentLeague?.crId) return;
    const crId = currentLeague.crId;
    
    const needsStandings = !currentLeague.liveData?.standings;
    const needsRoster = !currentLeague.liveData?.roster;
    const needsPairings = !currentLeague.liveData?.pairings;

    if (needsStandings || needsRoster || needsPairings) {
      setIsHydrating(true);
      
      const hydrate = async () => {
        try {
          if (needsStandings) await fetch(`/api/external/chess-results?id=${crId}&view=standings`);
          if (needsRoster) await fetch(`/api/external/chess-results?id=${crId}&view=roster`);
          if (needsPairings) await fetch(`/api/external/chess-results?id=${crId}&view=pairings&rd=1`);
          
          router.refresh(); // Refresh server component data seamlessly without a hard browser reload
        } catch (err) {
          console.error("Auto-hydration failed:", err);
        } finally {
          setIsHydrating(false);
        }
      };

      hydrate();
    }
  }, [currentLeague, router]);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    const yearLeagues = seasonsMap.find(s => s[0] === year)?.[1] || [];
    if (yearLeagues.length > 0) {
      setSelectedCategoryId(yearLeagues[0].crId);
    }
    setActiveRound(1);
    setIsOpen(false);
  };

  // Parse JSON blobs safely
  const standingsData = useMemo(() => {
    if (!currentLeague?.liveData?.standings) return null;
    const raw = currentLeague.liveData.standings;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }, [currentLeague]);

  const pairingsData = useMemo(() => {
    if (!currentLeague?.liveData?.pairings) return null;
    const raw = currentLeague.liveData.pairings;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }, [currentLeague]);

  const rosterData = useMemo(() => {
    if (!currentLeague?.liveData?.roster) return null;
    const raw = currentLeague.liveData.roster;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }, [currentLeague]);

  // Extract participating clubs/teams count and matching DB club IDs
  const participatingClubs = useMemo(() => {
    const teamsMap = new Map<string, any>();

    if (standingsData?.players && Array.isArray(standingsData.players)) {
      standingsData.players.forEach((p: any) => {
        // If p.teamName exists, use it. Otherwise if p.name does NOT contain a comma (meaning it's a team name like "Kireka A"), use p.name.
        const teamName = p.teamName || (p.name && !p.name.includes(',') ? p.name : null);
        if (teamName && !teamsMap.has(teamName)) {
          // Find matching DB club
          const matched = clubsMap.find(c => c.name.toLowerCase() === teamName.toLowerCase() || teamName.toLowerCase().includes(c.name.toLowerCase()));
          teamsMap.set(teamName, {
            name: teamName,
            dbId: matched?.id || `club-${teamName.toLowerCase().replace(/\s+/g, '-')}`,
            played: p.played ?? p.games ?? "-",
            won: p.won ?? "-",
            drawn: p.drawn ?? "-",
            lost: p.lost ?? "-",
            matchPoints: p.matchPoints ?? p.points ?? 0,
            boardPoints: p.gamePoints ?? "-",
            rank: p.rank ?? "-",
            startingRank: p.startingRank ?? "-",
            tiebreak: p.tiebreaks ? Object.values(p.tiebreaks)[0] : p.tiebreak1 ?? p.rating ?? "-"
          });
        }
      });
    }

    if (teamsMap.size === 0 && rosterData && Array.isArray(rosterData)) {
      rosterData.forEach((p: any) => {
        const teamName = p.teamName;
        if (teamName && !teamsMap.has(teamName)) {
          const matched = clubsMap.find(c => c.name.toLowerCase() === teamName.toLowerCase() || teamName.toLowerCase().includes(c.name.toLowerCase()));
          teamsMap.set(teamName, {
            name: teamName,
            dbId: matched?.id || `club-${teamName.toLowerCase().replace(/\s+/g, '-')}`,
            played: "-", won: "-", drawn: "-", lost: "-", matchPoints: 0, boardPoints: "-", rank: "-", startingRank: "-", tiebreak: "-"
          });
        }
      });
    }

    // Fallback to active DB clubs if no scraped teams found
    if (teamsMap.size === 0) {
      clubsMap.forEach((c, idx) => {
        teamsMap.set(c.name, {
          name: c.name, dbId: c.id, played: "-", won: "-", drawn: "-", lost: "-", matchPoints: 0, boardPoints: "-", rank: idx + 1, startingRank: idx + 1, tiebreak: "-"
        });
      });
    }

    // Convert to array and sort by matchPoints descending
    return Array.from(teamsMap.values()).sort((a, b) => {
      const mpA = parseFloat(a.matchPoints) || 0;
      const mpB = parseFloat(b.matchPoints) || 0;
      return mpB - mpA;
    });
  }, [standingsData, rosterData, clubsMap]);

  // Extract Best Players by Board
  const bestPlayersByBoard = useMemo(() => {
    const boardsMap = new Map<number, any[]>();

    // 1. Try scanning rosterData
    if (rosterData && Array.isArray(rosterData)) {
      rosterData.forEach((p: any) => {
        const boardNum = p.boardNumber || p.board || p.startingRank || 1;
        if (!boardsMap.has(boardNum)) boardsMap.set(boardNum, []);
        boardsMap.get(boardNum)!.push({
          name: p.name,
          teamName: p.teamName || "Contender Team",
          rating: p.rating || 1200,
          points: p.points ?? p.gamePoints ?? p.score ?? "-",
          games: p.games ?? p.played ?? "-"
        });
      });
    }

    // 2. Fallback to standingsData players if roster empty
    if (boardsMap.size === 0 && standingsData?.players && Array.isArray(standingsData.players)) {
      standingsData.players.forEach((p: any, idx: number) => {
        const boardNum = p.boardNumber || p.board || (idx % 5) + 1;
        if (!boardsMap.has(boardNum)) boardsMap.set(boardNum, []);
        boardsMap.get(boardNum)!.push({
          name: p.name || `Board ${boardNum} Specialist`,
          teamName: p.teamName || p.name || "League Contender",
          rating: p.rating || 1400,
          points: p.points ?? p.gamePoints ?? p.matchPoints ?? "-",
          games: p.played ?? p.games ?? "-"
        });
      });
    }

    // Sort players within each board by points/rating descending
    const sortedBoards: { board: number; players: any[] }[] = [];
    boardsMap.forEach((playersList, boardNum) => {
      const sorted = [...playersList].sort((a, b) => {
        const ptsA = parseFloat(a.points) || 0;
        const ptsB = parseFloat(b.points) || 0;
        if (ptsB !== ptsA) return ptsB - ptsA;
        return (b.rating || 0) - (a.rating || 0);
      });
      sortedBoards.push({ board: boardNum, players: sorted.slice(0, 10) }); // Top 10 per board
    });

    return sortedBoards.sort((a, b) => a.board - b.board);
  }, [rosterData, standingsData]);

  const roundsCount = Object.keys(pairingsData || {}).length || 5;

  return (
    <div className="space-y-12 pb-24">
      {/* Auto-Hydration Indicator Banner */}
      {isHydrating && (
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-[2rem] p-6 flex items-center justify-between gap-4 animate-pulse backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-4">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 animate-ping flex-shrink-0"></span>
            <p className="text-sm font-bold text-blue-200 leading-tight">
              ⚡ <span className="font-black text-white uppercase tracking-wider">Hydration Engine Active:</span> Automatically scraping & permanently archiving Chess-Results live data into PostgreSQL...
            </p>
          </div>
          <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest px-4 py-2 bg-blue-950/80 rounded-xl border border-blue-800 flex-shrink-0 shadow-inner">
            Caching Archive
          </span>
        </div>
      )}

      {/* League Selection & Filter Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-yellow-500 via-red-500 to-black rounded-t-[2.5rem]"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
              UGANDA CHESS FEDERATION • ELITE DIVISION
            </span>
            <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter text-white uppercase leading-tight">
              {currentLeague?.name || "Uganda National Chess League"}
            </h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-2">
              Season Start Date: {currentLeague?.startDate ? new Date(currentLeague.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Active Season"}
            </p>
          </div>

          <div className="w-full md:w-auto min-w-[340px] relative z-50">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
              Select League Season / Edition Year
            </label>
            
            {/* Custom Premium Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-6 py-4 bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 hover:border-yellow-500/50 rounded-2xl font-bold text-white text-sm flex items-center justify-between gap-4 transition-all shadow-xl group text-left"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 text-xs font-black flex-shrink-0 shadow-inner">
                  🏆
                </div>
                <div className="truncate">
                  <p className="text-sm font-black text-white truncate group-hover:text-yellow-500 transition-colors">
                    Uganda Chess League • {selectedYear}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                    {currentYearLeagues.length} {currentYearLeagues.length === 1 ? 'Category' : 'Categories'} Loaded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px] font-black text-zinc-300">
                  {seasonsMap.length} Seasons
                </span>
                <svg 
                  className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-yellow-500' : 'group-hover:text-white'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Floating Glassmorphism Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 left-0 md:left-auto md:right-0 mt-3 w-full md:w-[440px] bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/60 rounded-3xl p-3 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 divide-y divide-zinc-800/60 max-h-[380px] overflow-y-auto animate-fade-in ring-1 ring-white/5">
                <div className="px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest flex justify-between items-center bg-zinc-950/40 rounded-2xl mb-2 border border-zinc-800/50">
                  <span>Available Annual Seasons</span>
                  <span className="text-yellow-500">{seasonsMap.length} Years Loaded</span>
                </div>
                
                <div className="space-y-1 pt-2">
                  {seasonsMap.map(([year, leagues]) => {
                    const isSelected = year === selectedYear;
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className={`w-full text-left p-4 rounded-2xl flex items-center justify-between gap-4 transition-all group ${
                          isSelected 
                            ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 shadow-lg scale-[1.02]' 
                            : 'hover:bg-zinc-800/60 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black flex-shrink-0 transition-all ${
                            isSelected ? 'bg-yellow-500 text-black shadow-md scale-110 font-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white'
                          }`}>
                            {isSelected ? '★' : '🏆'}
                          </div>
                          <div className="truncate">
                            <p className={`font-bold text-sm truncate transition-colors ${
                              isSelected ? 'text-white font-black' : 'text-zinc-300 group-hover:text-white'
                            }`}>
                              Uganda Chess League • {year}
                            </p>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase block mt-0.5">
                              {leagues.length} {leagues.length === 1 ? 'Category / Division' : 'Categories / Divisions'}
                            </span>
                          </div>
                        </div>

                        <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full flex-shrink-0 transition-all ${
                          isSelected ? 'bg-yellow-500 text-black font-black shadow' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200'
                        }`}>
                          {year}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category / Division Sub-Selector Pill Bar */}
      {currentYearLeagues.length > 1 && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-fade-in backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
              Select Season Category / Division:
            </span>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {currentYearLeagues.map((l) => {
              const isCatActive = l.crId === selectedCategoryId;
              let cleanName = l.name.replace(new RegExp(selectedYear.toString(), 'g'), '').trim();
              if (!cleanName || cleanName.toLowerCase() === "national chess league" || cleanName.toLowerCase() === "uganda chess league") {
                cleanName = "Elite Division / Main Event";
              }
              return (
                <button
                  key={l.crId}
                  onClick={() => {
                    setSelectedCategoryId(l.crId);
                    setActiveRound(1);
                  }}
                  className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                    isCatActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 font-black border border-blue-500/50' 
                      : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
                  }`}
                >
                  <span>{isCatActive ? '🔹' : '🔸'}</span>
                  <span>{cleanName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-zinc-800 bg-zinc-900/50 p-4 rounded-[2rem] gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "standings", label: "🏆 League Standings" },
            { key: "pairings", label: "⚔️ Round Pairings" },
            { key: "boards", label: "🏅 Best Players by Board" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.key ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/10 font-black scale-105" : "text-zinc-500 hover:text-white bg-zinc-900/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Participating Clubs Indicator Pill */}
        <div className="px-5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-3 shadow-inner">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-zinc-300">
            Total Participating Clubs / Teams: <strong className="text-yellow-500 font-black">{participatingClubs.length}</strong>
          </span>
        </div>
      </div>

      {/* Tab 1: STANDINGS */}
      {activeTab === "standings" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-6 mb-6">
            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">
                Official Division Standings & Club Profiles
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Click on any Club / Team name to view their full Elite Roster & Leadership profile
              </p>
            </div>
          </div>

          {!standingsData?.players || standingsData.players.length === 0 ? (
            <div className="p-20 border border-dashed border-zinc-800 rounded-[2rem] text-center text-zinc-500 font-bold italic">
              Standings matrix is currently unpopulated for this league edition.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800/20">
                    <th className="py-4 px-6">Rank</th>
                    <th className="py-4 px-6">Club / Team Name</th>
                    <th className="py-4 px-4 text-center">Played</th>
                    <th className="py-4 px-4 text-center">+</th>
                    <th className="py-4 px-4 text-center">=</th>
                    <th className="py-4 px-4 text-center">-</th>
                    <th className="py-4 px-6 text-center font-bold text-yellow-500">MP</th>
                    <th className="py-4 px-6 text-center font-bold text-blue-400">BP</th>
                    <th className="py-4 px-6 text-right font-bold text-zinc-400">TB1 / Rtg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {participatingClubs.map((club: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                      <td className="py-5 px-6 font-black italic text-zinc-500 text-sm">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs ${idx === 0 ? 'bg-yellow-500 text-black font-black' : idx < 3 ? 'bg-blue-600 text-white font-bold' : 'text-zinc-400 border border-zinc-800'}`}>
                          {club.rank !== "-" ? club.rank : idx + 1}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <Link href={`/clubs/${club.dbId}`} className="inline-flex items-center gap-2 font-bold text-white group-hover:text-yellow-500 transition-all text-base hover:underline">
                          <span>{club.name}</span>
                          <svg className="w-4 h-4 text-zinc-500 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </Link>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase block mt-0.5">SNo: {club.startingRank !== "-" ? club.startingRank : idx + 1}</span>
                      </td>
                      <td className="py-5 px-4 text-center font-bold text-zinc-300">{club.played}</td>
                      <td className="py-5 px-4 text-center font-bold text-emerald-400">{club.won}</td>
                      <td className="py-5 px-4 text-center font-bold text-zinc-400">{club.drawn}</td>
                      <td className="py-5 px-4 text-center font-bold text-rose-400">{club.lost}</td>
                      <td className="py-5 px-6 text-center font-black text-white text-lg">{club.matchPoints}</td>
                      <td className="py-5 px-6 text-center font-black text-blue-400 italic text-base">{club.boardPoints}</td>
                      <td className="py-5 px-6 text-right font-mono text-zinc-400 text-xs">{club.tiebreak}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: PAIRINGS */}
      {activeTab === "pairings" && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-6 mb-6 gap-4">
            <div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">
                Round-by-Round League Pairings
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Team Confrontations & Individual Board Battles
              </p>
            </div>

            {/* Round Selector Pill */}
            <div className="flex flex-wrap items-center gap-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-3">Round:</span>
              {Array.from({ length: roundsCount }, (_, i) => i + 1).map((rd) => (
                <button
                  key={rd}
                  onClick={() => setActiveRound(rd)}
                  className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                    activeRound === rd ? "bg-yellow-500 text-black shadow font-black scale-105" : "text-zinc-400 hover:text-white bg-zinc-900"
                  }`}
                >
                  {rd}
                </button>
              ))}
            </div>
          </div>

          {!pairingsData || !pairingsData[activeRound] || pairingsData[activeRound].length === 0 ? (
            <div className="p-20 border border-dashed border-zinc-800 rounded-[2rem] text-center text-zinc-500 font-bold italic">
              Pairings data for Round {activeRound} is currently unpopulated in the federation matrix.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800/20">
                    <th className="py-4 px-6">Match / Bo</th>
                    <th className="py-4 px-6">White (Rating)</th>
                    <th className="py-4 px-6 text-center">Result</th>
                    <th className="py-4 px-6 text-right">Black (Rating)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {pairingsData[activeRound].map((p: any, idx: number) => (
                    <React.Fragment key={idx}>
                      {/* Main Match Pairing Row */}
                      <tr className={`group transition-colors ${p.isMatch || p.whiteName?.includes(' ') === false ? 'bg-zinc-800/30 font-bold border-t border-zinc-700/50' : 'hover:bg-white/5'}`}>
                        <td className="py-4 px-6 font-black italic text-zinc-500 text-sm">
                          {p.isMatch ? `Match ${p.table}` : p.table}
                        </td>
                        <td className="py-4 px-6">
                          <p className={`font-bold text-sm transition-colors ${p.isMatch || p.whiteName?.includes(' ') === false ? 'text-yellow-500 text-base' : 'text-white group-hover:text-blue-400'}`}>
                            {p.whiteName}
                          </p>
                          {p.whiteRating ? <span className="text-[10px] font-bold text-zinc-500 uppercase">ELO {p.whiteRating}</span> : null}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full font-black text-xs border ${p.isMatch || p.whiteName?.includes(' ') === false ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105' : 'bg-zinc-950 text-zinc-400 border-zinc-800/50'}`}>
                            {p.result || "v"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className={`font-bold text-sm transition-colors ${p.isMatch || p.whiteName?.includes(' ') === false ? 'text-yellow-500 text-base' : 'text-white group-hover:text-blue-400'}`}>
                            {p.blackName}
                          </p>
                          {p.blackRating ? <span className="text-[10px] font-bold text-zinc-500 uppercase">ELO {p.blackRating}</span> : null}
                        </td>
                      </tr>
                      {/* Nested Board Pairings Rows */}
                      {p.boardPairings?.map((bp: any, bidx: number) => (
                        <tr key={`bp-${idx}-${bidx}`} className="bg-zinc-950/40 hover:bg-zinc-900/40 transition-colors border-none text-xs">
                          <td className="py-2.5 px-6 font-mono text-zinc-600 pl-12">
                            └─ Bo. {bp.table}
                          </td>
                          <td className="py-2.5 px-6 pl-12">
                            <span className="text-zinc-300 font-medium">{bp.whiteName}</span>
                            {bp.whiteRating ? <span className="text-[9px] font-mono text-zinc-500 ml-2">({bp.whiteRating})</span> : null}
                          </td>
                          <td className="py-2.5 px-6 text-center font-bold text-zinc-400 font-mono">
                            {bp.result}
                          </td>
                          <td className="py-2.5 px-6 text-right pr-12">
                            {bp.blackRating ? <span className="text-[9px] font-mono text-zinc-500 mr-2">({bp.blackRating})</span> : null}
                            <span className="text-zinc-300 font-medium">{bp.blackName}</span>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: BEST PLAYERS BY BOARD */}
      {activeTab === "boards" && (
        <div className="space-y-12 animate-fade-in">
          {bestPlayersByBoard.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-20 text-center text-zinc-500 font-bold italic">
              Individual board performance metrics are currently unpopulated for this league edition.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bestPlayersByBoard.map((boardGroup) => (
                <div key={boardGroup.board} className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-xl flex flex-col">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-yellow-500 flex items-center justify-center text-black font-black text-lg italic shadow-md">
                        {boardGroup.board}
                      </div>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">
                        Board {boardGroup.board} Specialists
                      </h4>
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2.5 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
                      Top {boardGroup.players.length}
                    </span>
                  </div>

                  <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-800/10">
                          <th className="py-3 px-4">Player</th>
                          <th className="py-3 px-4">Club / Team</th>
                          <th className="py-3 px-4 text-center">Games</th>
                          <th className="py-3 px-4 text-right font-bold text-yellow-500">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50 text-xs">
                        {boardGroup.players.map((pl, pidx) => (
                          <tr key={pidx} className="group hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-white group-hover:text-yellow-500 transition-colors">{pl.name}</p>
                              <span className="text-[9px] font-mono text-zinc-500">ELO {pl.rating}</span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-zinc-300">{pl.teamName}</td>
                            <td className="py-3.5 px-4 text-center font-bold text-zinc-400">{pl.games}</td>
                            <td className="py-3.5 px-4 text-right font-black italic text-yellow-500 text-sm">{pl.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
