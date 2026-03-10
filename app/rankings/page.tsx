import Link from "next/link";
import { Suspense } from "react";
import FideRankings from "./FideRankings";

export default async function NationalRankingsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
            <div className="flex gap-8">
              <Link href="/tournaments" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Calendar</Link>
              <Link href="/grand-prix" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Grand Prix</Link>
            </div>
          </div>
        </div>
      </nav>

      <header className="pt-32 pb-20 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 skew-x-12 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
              Official FIDE ELO Ratings
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter italic">
              National <span className="text-blue-500">Rankings</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl italic">
              Directly synced with the FIDE database. Explore the official rankings of Uganda&apos;s strongest masters across Standard, Rapid, and Blitz.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-20 text-zinc-500 font-bold italic">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            Connecting to FIDE Servers...
          </div>
        }>
          <FideRankings />
        </Suspense>
      </main>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="p-12 bg-blue-600 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Are you in the Top 10?</h2>
            <p className="text-blue-100 font-medium">The elite few qualify for the official National Team squad selection. Check your eligibility for the 2026 Chess Olympiad.</p>
          </div>
          <Link href="/national-team" className="relative z-10 px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 transition-all shadow-xl">
            VIEW SELECTION SQUAD
          </Link>
        </div>
      </section>
    </div>
  );
}
