"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Club {
  id: string;
  name: string;
  description: string | null;
  founded: number | null;
  captain: string | null;
  owner: string | null;
}

export default function ClubListClient({ initialClubs }: { initialClubs: Club[] }) {
  const [searchQuery, setSearchInput] = useState("");

  const filteredClubs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return initialClubs;

    return initialClubs.filter(
      (club) =>
        club.name.toLowerCase().includes(query) ||
        (club.description?.toLowerCase().includes(query)) ||
        (club.captain?.toLowerCase().includes(query)) ||
        (club.owner?.toLowerCase().includes(query))
    );
  }, [searchQuery, initialClubs]);

  return (
    <div className="space-y-12">
      {/* Search and Filters */}
      <div className="max-w-2xl">
        <div className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by club name, captain, or description..."
            className="w-full px-8 py-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-xl shadow-zinc-200/50 dark:shadow-none text-zinc-900 dark:text-white"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest self-center mr-2">Quick Stats:</p>
            <span className="px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {initialClubs.length} Total Clubs
            </span>
            <span className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {filteredClubs.length} Results
            </span>
        </div>
      </div>

      {/* Results Grid */}
      {filteredClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClubs.map((club) => (
            <div key={club.id} className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-black text-zinc-400 italic border border-zinc-200 dark:border-zinc-700">
                  {club.name.substring(0, 1)}
                </div>
                {club.founded && (
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-2">Est. {club.founded}</span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                {club.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2 italic flex-grow">
                {club.description || "Official National League competitive team."}
              </p>

              <div className="space-y-4 mb-8 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-400 uppercase tracking-widest">Captain</span>
                  <span className="font-black text-zinc-900 dark:text-white">{club.captain || "TBD"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-400 uppercase tracking-widest">Owner</span>
                  <span className="font-black text-zinc-900 dark:text-white">{club.owner || "Private"}</span>
                </div>
              </div>

              <Link 
                href={`/clubs/${club.id}`}
                className="block w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-center rounded-2xl text-sm font-black hover:scale-105 transition-all"
              >
                VIEW ROSTER
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 p-20 text-center text-zinc-500 font-medium italic">
          No clubs found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
}
