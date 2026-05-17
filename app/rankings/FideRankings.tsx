"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FidePlayer {
  fideId: number;
  name: string;
  country: string;
  nationalRank?: number | null;
  sex: string | null;
  title: string | null;
  rating: number;
  games: number;
  kFactor: number;
  rapidRating: number;
  rapidGames: number;
  blitzRating: number;
  blitzGames: number;
  birthday: number | null;
  flag: string | null;
  syncedAt: string;
}

interface RankingsResponse {
  players: FidePlayer[];
  meta: {
    count: number;
    country: string;
    sort: string;
    lastSync: {
      syncedAt: string;
      period: string;
      totalPlayers: number;
    } | null;
  };
}

type RatingType = "standard" | "rapid" | "blitz";

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchRankings(
  query: string,
  ratingType: RatingType,
  activeOnly: boolean
): Promise<RankingsResponse> {
  // If the query is a FIDE ID (numbers only), use the Lichess API exactly like before
  // This allows finding any FIDE player globally, not just Ugandan ones in our DB.
  if (query && /^\d+$/.test(query.trim())) {
    const res = await fetch(`https://lichess.org/api/fide/player/${query.trim()}`);
    if (!res.ok) {
        if (res.status === 404) {
          return { players: [], meta: { count: 0, country: "Global", sort: ratingType, lastSync: null } };
        }
        throw new Error("Lichess FIDE API Error");
    }
    const data = await res.json();
    
    return {
      players: [{
        fideId: data.id,
        name: data.name,
        country: data.federation,
        nationalRank: null, // Global searches don't get a Ugandan rank
        sex: data.gender || null,
        title: data.title || null,
        rating: data.standard || 0,
        games: 0,
        kFactor: 0,
        rapidRating: data.rapid || 0,
        rapidGames: 0,
        blitzRating: data.blitz || 0,
        blitzGames: 0,
        birthday: data.year || null,
        flag: null,
        syncedAt: new Date().toISOString(),
      }],
      meta: {
        count: 1,
        country: "Global",
        sort: ratingType,
        lastSync: null
      }
    };
  }

  // Otherwise, use our local FIDE bulk database for name searches and rankings list
  const params = new URLSearchParams({
    country: "UGA",
    sort: ratingType,
    limit: "200",
  });

  if (activeOnly) params.set("active", "true");
  if (query) params.set("q", query);

  const res = await fetch(`/api/fide/rankings?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load rankings from database");
  return res.json();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRatingValue(player: FidePlayer, type: RatingType): number {
  switch (type) {
    case "rapid":
      return player.rapidRating;
    case "blitz":
      return player.blitzRating;
    default:
      return player.rating;
  }
}

function formatSyncDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FideRankings() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  // Dual-State Search Pattern (Transient vs. Locked)
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);

  // Filter state
  const [ratingType, setRatingType] = useState<RatingType>("standard");
  const [activeOnly, setActiveOnly] = useState(false);

  // Sync with URL changes (e.g. back button)
  useEffect(() => {
    setSearchInput(initialQuery);
    setSubmittedQuery(initialQuery);
  }, [initialQuery]);

  // TanStack Query
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["fide-rankings", "UGA", submittedQuery, ratingType, activeOnly],
    queryFn: () => fetchRankings(submittedQuery, ratingType, activeOnly),
  });

  const players = data?.players || [];
  const lastSync = data?.meta?.lastSync;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchInput.trim());

    const params = new URLSearchParams(window.location.search);
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // ─── Rating Type Tabs ────────────────────────────────────────────────────

  const ratingTabs: { key: RatingType; label: string; color: string }[] = [
    { key: "standard", label: "Standard", color: "blue" },
    { key: "rapid", label: "Rapid", color: "purple" },
    { key: "blitz", label: "Blitz", color: "orange" },
  ];

  // ─── Error State ─────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="p-10 text-center bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-[2rem] border border-red-100 dark:border-red-900/50">
        <p className="font-bold mb-2">Failed to load FIDE data</p>
        <p className="text-sm">
          {(error as Error).message ||
            "The ranking service might be temporarily unavailable."}
        </p>
        <p className="text-xs mt-4 text-red-400">
          If the database has not been synced yet, an admin needs to trigger a
          FIDE sync from the Admin Console.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── Data Freshness Indicator ──────────────────────────────────── */}
      {lastSync && (
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-900/50 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
            </span>
            FIDE Official Data — {lastSync.period}
          </div>
          <span className="text-zinc-400 font-medium">
            Synced {formatSyncDate(lastSync.syncedAt)} · {lastSync.totalPlayers}{" "}
            players
          </span>
        </div>
      )}

      {/* ─── Search Bar ────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto mb-8">
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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
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

      {/* ─── Filters: Rating Type + Active Toggle ──────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="inline-flex bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1.5 border border-zinc-200 dark:border-zinc-800">
          {ratingTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRatingType(tab.key)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                ratingType === tab.key
                  ? tab.color === "blue"
                    ? "bg-blue-600 text-white shadow-lg"
                    : tab.color === "purple"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-orange-600 text-white shadow-lg"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="inline-flex bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1.5 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveOnly(false)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              !activeOnly
                ? "bg-zinc-800 dark:bg-zinc-700 text-white shadow-lg"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            All Players
          </button>
          <button
            onClick={() => setActiveOnly(true)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeOnly
                ? "bg-green-600 text-white shadow-lg"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Active Only
          </button>
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-zinc-500 font-bold italic">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          Retrieving Official FIDE Rankings...
        </div>
      ) : players.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 p-20 text-center text-zinc-500 font-medium italic">
          {submittedQuery
            ? `No players found matching "${submittedQuery}"`
            : "No ranking data available. An admin needs to trigger a FIDE sync."}
        </div>
      ) : (
        <>
          {/* ─── Top 3 Spotlight Cards ─────────────────────────────────── */}
          {submittedQuery === "" && players.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {players.slice(0, 3).map((player, i) => (
                <div
                  key={player.fideId}
                  className={`relative p-8 rounded-[2.5rem] border overflow-hidden group hover:scale-[1.02] transition-all ${
                    i === 0
                      ? "bg-zinc-900 text-white border-zinc-800 shadow-2xl shadow-blue-500/10"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                  }`}
                >
                  <div
                    className={`absolute top-0 right-0 p-6 font-black text-6xl opacity-10 ${
                      i === 0 ? "text-blue-500" : "text-zinc-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                        {i === 0
                          ? "National No. 1"
                          : i === 1
                          ? "Contender"
                          : "Elite Class"}
                      </p>
                      {player.title && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase">
                          {player.title}
                        </span>
                      )}
                      {player.flag === "i" && (
                        <span className="px-2 py-0.5 bg-zinc-700 text-zinc-400 text-[9px] font-black rounded uppercase">
                          Inactive
                        </span>
                      )}
                    </div>
                    <Link href={`/players/${player.fideId}`}>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2 leading-tight hover:text-blue-500 transition-colors cursor-pointer">
                        {player.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <p
                        className={`text-4xl font-black italic ${
                          i === 0 ? "text-white" : "text-blue-600"
                        }`}
                      >
                        {getRatingValue(player, ratingType)}
                      </p>
                      <span className="text-[10px] font-bold opacity-50 uppercase">
                        {ratingType}
                      </span>
                    </div>

                    {/* All rating types at a glance */}
                    <div className="flex gap-3 mt-4">
                      {ratingType !== "standard" && player.rating > 0 && (
                        <span className="text-[9px] font-bold text-blue-400">
                          STD: {player.rating}
                        </span>
                      )}
                      {ratingType !== "rapid" && player.rapidRating > 0 && (
                        <span className="text-[9px] font-bold text-purple-400">
                          RPD: {player.rapidRating}
                        </span>
                      )}
                      {ratingType !== "blitz" && player.blitzRating > 0 && (
                        <span className="text-[9px] font-bold text-orange-400">
                          BLZ: {player.blitzRating}
                        </span>
                      )}
                    </div>

                    <p className="mt-4 text-xs font-bold opacity-50 uppercase tracking-widest">
                      FIDE ID: {player.fideId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Main Rankings Table ───────────────────────────────────── */}
          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest">
                      Rank
                    </th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest">
                      Player
                    </th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest hidden sm:table-cell">
                      FIDE ID
                    </th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest text-right">
                      Standard
                    </th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest text-right hidden md:table-cell">
                      Rapid
                    </th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest text-right hidden md:table-cell">
                      Blitz
                    </th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-400 uppercase tracking-widest text-right hidden lg:table-cell">
                      Born
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {players.map((player, index) => (
                    <tr
                      key={player.fideId}
                      className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <span className="text-zinc-400 font-bold tabular-nums">
                          {player.nationalRank ? `#${player.nationalRank}` : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Link href={`/players/${player.fideId}`}>
                            <p className="font-bold text-zinc-900 dark:text-white hover:text-blue-600 transition-colors cursor-pointer">
                              {player.name}
                            </p>
                          </Link>
                          {player.title && (
                            <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[8px] font-black rounded uppercase">
                              {player.title}
                            </span>
                          )}
                          {player.flag === "i" && (
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter border border-zinc-200 dark:border-zinc-700 px-1 rounded">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">
                          {player.country}
                          {player.sex === "F" && " · ♀"}
                        </p>
                      </td>
                      <td className="px-6 py-5 hidden sm:table-cell">
                        <span className="text-sm font-medium text-zinc-500 tabular-nums">
                          {player.fideId}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span
                          className={`text-xl font-black italic tracking-tighter ${
                            ratingType === "standard"
                              ? "text-blue-600"
                              : "text-zinc-900 dark:text-white"
                          }`}
                        >
                          {player.rating || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right hidden md:table-cell">
                        <span
                          className={`text-lg font-bold tabular-nums ${
                            ratingType === "rapid"
                              ? "text-purple-600 italic"
                              : "text-zinc-400"
                          }`}
                        >
                          {player.rapidRating || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right hidden md:table-cell">
                        <span
                          className={`text-lg font-bold tabular-nums ${
                            ratingType === "blitz"
                              ? "text-orange-600 italic"
                              : "text-zinc-400"
                          }`}
                        >
                          {player.blitzRating || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right hidden lg:table-cell">
                        <span className="text-sm font-medium text-zinc-400 tabular-nums">
                          {player.birthday || "—"}
                        </span>
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
