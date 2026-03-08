"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { distributeGPPointsAction } from "./actions";

export default function DistributeGPPointsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("id") || "t1";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const rankings = [
      { playerId: "p1", points: 10 },
      { playerId: "p2", points: 8 },
      { playerId: "p3", points: 6 },
      { playerId: "p7", points: 4 },
      { playerId: "p5", points: 2 },
    ];

    try {
      const result = await distributeGPPointsAction(tournamentId, rankings);
      if (result.success) {
        alert("Grand Prix points distributed successfully (Simulation Mode)");
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Failed to distribute points.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      <nav className="fixed top-0 w-full z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Oversight
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 max-w-4xl mx-auto px-4">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter mb-2">Finalize GP Rankings</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs text-amber-600">Assigning Season Points for Event ID: {tournamentId}</p>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-10 md:p-16">
          <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 mb-10">
            <p className="text-sm font-bold text-blue-800 dark:text-blue-400 leading-relaxed italic">
              <strong>Chief Arbiter's Rule:</strong> Grand Prix points must be awarded based on the final Buchholz-corrected standings. Ensure tie-breaks are resolved before distribution.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { pos: "1st Place", pts: 10, defaultPlayer: "FM Harold Wanyama" },
              { pos: "2nd Place", pts: 8, defaultPlayer: "IM Arthur Ssegwanyi" },
              { pos: "3rd Place", pts: 6, defaultPlayer: "FM Patrick Kawuma" },
              { pos: "4th Place", pts: 4, defaultPlayer: "Master 7" },
              { pos: "5th Place", pts: 2, defaultPlayer: "Emanuel Egesa" },
            ].map((row, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 group">
                <div className="flex items-center gap-4 w-full md:w-32">
                  <span className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black italic text-xs">{i+1}</span>
                  <span className="font-black text-zinc-400 uppercase text-[10px] tracking-widest">{row.pos}</span>
                </div>
                <div className="flex-grow w-full relative">
                  <input type="text" readOnly defaultValue={row.defaultPlayer} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm" />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="w-full md:w-32 text-right">
                  <span className="text-xl font-black text-amber-500">+{row.pts} PTS</span>
                </div>
              </div>
            ))}

            <div className="pt-10 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 mt-10">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic max-w-xs">
                * Points will be added to cumulative season totals upon broadcast.
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl disabled:opacity-50 uppercase tracking-widest italic"
              >
                {isLoading ? "Auditing Points..." : "BROADCAST GP POINTS"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
