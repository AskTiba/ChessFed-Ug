"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface FidePlayer {
  id: number;
  name: string;
  federation: string;
  year: number;
  flag: string | null; // "i" for inactive
  rating: number; 
  standard: number;
  rapid?: number;
  blitz?: number;
  title?: string;
  photo?: {
    medium: string;
  };
}

interface MirrorRow {
  fideid: number;
  name: string;
  country: string;
  birthday: number;
  flag: string | null;
  rating: number;
  rapid_rating: number;
  blitz_rating: number;
  title: string | null;
}

async function fetchRankings(query: string) {
  // If the query is a FIDE ID, use the Lichess API for a professional lookup as per docs
  if (query && /^\d+$/.test(query)) {
    const res = await fetch(`https://lichess.org/api/fide/player/${query}`);
    if (!res.ok) {
        if (res.status === 404) return [];
        throw new Error("Lichess FIDE API Error");
    }
    const data = await res.json();
    
    // Normalize Lichess data to our FidePlayer interface
    return [{
      id: data.id,
      name: data.name,
      federation: data.federation,
      year: data.year,
      flag: null, // Lichess doesn't provide the flag directly
      rating: data.standard,
      standard: data.standard,
      rapid: data.rapid,
      blitz: data.blitz,
      title: data.title
    }] as FidePlayer[];
  }

  // Otherwise, use the Fly.io mirror for bulk lists or name searches
  let url = `https://fide-players.fly.dev/players/players.json?country=UGA&_sort_desc=rating&_size=100`;
  
  if (query) {
    // Searching by name - using name__contains for Datasette mirror
    url = `https://fide-players.fly.dev/players/players.json?name__contains=${encodeURIComponent(query)}&country=UGA&_size=50`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("FIDE Mirror API Error");
  const data = await res.json();
  
  // Normalize Mirror data (it uses different field names like fideid, country, rating)
  return (data.rows as MirrorRow[]).map(row => ({
    id: row.fideid,
    name: row.name,
    federation: row.country,
    year: row.birthday,
    flag: row.flag,
    rating: row.rating,
    standard: row.rating,
    rapid: row.rapid_rating > 0 ? row.rapid_rating : undefined,
    blitz: row.blitz_rating > 0 ? row.blitz_rating : undefined,
    title: row.title || undefined
  })) as FidePlayer[];
}

export default function FideRankings() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  // 1. "Transient" state for the input field (updates every keystroke)
  const [searchInput, setSearchInput] = useState(initialQuery);

  // 2. "Locked" state for the actual query (only updates on Submit)
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);

  // Sync with URL if it changes (e.g. back button)
  useEffect(() => {
    setSearchInput(initialQuery);
    setSubmittedQuery(initialQuery);
  }, [initialQuery]);

  // 3. The Query (React Query / TanStack Query)
  const { data: players, isLoading, isFetching, error } = useQuery({
    queryKey: ["fide-rankings", "UGA", submittedQuery],
    queryFn: () => fetchRankings(submittedQuery),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchInput.trim());
    
    // Update URL without full reload
    const params = new URLSearchParams(window.location.search);
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (error) {
    return (
      <div className="p-10 text-center bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-[2rem] border border-red-100 dark:border-red-900/50">
        <p className="font-bold mb-2">Failed to load FIDE data</p>
        <p className="text-sm">{(error as Error).message || "The FIDE service might be temporarily unavailable."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Search Bar Implementation (Dual-State Pattern) */}
      <div className="max-w-2xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative group">
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or FIDE ID..." 
            className="w-full px-8 py-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-xl shadow-zinc-200/50 dark:shadow-none"
          />
          <button 
            type="submit" 
            disabled={isFetching}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isFetching ? (
              <div className="w-5 h-5 border-2 border-zinc-400 border-t-white dark:border-zinc-600 dark:border-t-zinc-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </form>
        {isFetching && submittedQuery !== "" && (
            <p className="text-center mt-4 text-xs font-bold text-blue-600 animate-pulse uppercase tracking-widest">
                Searching FIDE Database...
            </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-zinc-500 font-bold italic">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          Retrieving Official FIDE Rankings...
        </div>
      ) : !players || players.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 p-20 text-center text-zinc-500 font-medium italic">
          No players found matching &quot;{submittedQuery}&quot;
        </div>
      ) : (
        <>
          {/* Top 3 Spotlight Cards */}
          {submittedQuery === "" && players.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {players.slice(0, 3).map((player, i) => (
                <div key={player.id} className={`relative p-8 rounded-[2.5rem] border overflow-hidden group hover:scale-[1.02] transition-all ${
                  i === 0 ? 'bg-zinc-900 text-white border-zinc-800 shadow-2xl shadow-blue-500/10' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
                }`}>
                  <div className={`absolute top-0 right-0 p-6 font-black text-6xl opacity-10 ${i === 0 ? 'text-blue-500' : 'text-zinc-400'}`}>
                    {i + 1}
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                        {i === 0 ? 'National No. 1' : i === 1 ? 'Contender' : 'Elite Class'}
                        </p>
                        {player.title && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase">
                                {player.title}
                            </span>
                        )}
                    </div>
                    <Link href={`/players/${player.id}`}>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 leading-tight hover:text-blue-500 transition-colors cursor-pointer">{player.name}</h3>
                    </Link>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-4xl font-black italic ${i === 0 ? 'text-white' : 'text-blue-600'}`}>
                            {player.standard || player.rating}
                        </p>
                        <span className="text-[10px] font-bold opacity-50 uppercase">Standard</span>
                    </div>
                    <p className="mt-4 text-xs font-bold opacity-50 uppercase tracking-widest">FIDE ID: {player.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Rankings Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Rank</th>
                    <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Player</th>
                    <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">FIDE ID</th>
                    <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest text-right">ELO Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {players.map((player, index) => (
                    <tr key={player.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-zinc-400 font-bold tabular-nums">
                            {submittedQuery === "" ? `#${index + 1}` : "-"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                            <Link href={`/players/${player.id}`}>
                                <p className="font-bold text-zinc-900 dark:text-white hover:text-blue-600 transition-colors cursor-pointer">{player.name}</p>
                            </Link>
                            {player.title && (                                <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[8px] font-black rounded uppercase">
                                    {player.title}
                                </span>
                            )}
                            {player.flag === "i" && (
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter border border-zinc-200 dark:border-zinc-700 px-1 rounded">Inactive</span>
                            )}
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{player.federation}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-medium text-zinc-500 tabular-nums">{player.id}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-black text-zinc-900 dark:text-white italic tracking-tighter">
                                {player.standard || player.rating}
                            </span>
                            <div className="flex gap-2 mt-1">
                                {player.rapid && <span className="text-[8px] font-bold text-blue-500">R: {player.rapid}</span>}
                                {player.blitz && <span className="text-[8px] font-bold text-orange-500">B: {player.blitz}</span>}
                            </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
