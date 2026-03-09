import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

async function RankingsContent({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || "";
  
  const players = await prisma.player.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { fideId: { contains: query, mode: 'insensitive' } },
      ]
    },
    orderBy: { rating: 'desc' },
    take: 100
  });

  return (
    <>
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <form className="relative group">
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Search by name or FIDE ID..." 
              className="w-full px-8 py-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold shadow-xl shadow-zinc-200/50 dark:shadow-none"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl hover:scale-105 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
        </div>

        {/* Top 3 Spotlight Cards */}
        {query === "" && players.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {players.slice(0, 3).map((player: any, i: number) => (
              <div key={player.id} className={`relative p-8 rounded-[2.5rem] border overflow-hidden group hover:scale-[1.02] transition-all ${
                i === 0 ? 'bg-zinc-900 text-white border-zinc-800 shadow-2xl shadow-blue-500/10' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
              }`}>
                <div className={`absolute top-0 right-0 p-6 font-black text-6xl opacity-10 ${i === 0 ? 'text-blue-500' : 'text-zinc-400'}`}>
                  {i + 1}
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-4">
                    {i === 0 ? 'National No. 1' : i === 1 ? 'Contender' : 'Elite Class'}
                  </p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{player.name}</h3>
                  <p className={`text-4xl font-black italic ${i === 0 ? 'text-white' : 'text-blue-600'}`}>{player.rating}</p>
                  <p className="mt-4 text-xs font-bold opacity-50 uppercase tracking-widest">FIDE ID: {player.fideId}</p>
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
                {players.map((player: any, index: number) => (
                  <tr key={player.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-zinc-400 font-bold tabular-nums">#{index + 1}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">{player.name}</p>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{player.federation}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-zinc-500 tabular-nums">{player.fideId}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-xl font-black text-zinc-900 dark:text-white italic tracking-tighter">{player.rating}</span>
                    </td>
                  </tr>
                ))}
                {players.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-500 font-medium italic">
                      No players found matching "{query}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </>
  );
}

export default async function NationalRankingsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
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
              National ELO Ratings
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter italic">
              Top 100 <span className="text-blue-500">Rankings</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl italic">
              Explore the official active rankings of Uganda's strongest chess masters. Performance data is updated monthly following FIDE rating list releases.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <Suspense fallback={
          <div className="flex items-center justify-center p-20 text-zinc-500 font-bold italic animate-pulse">
            Retrieving Official Rankings...
          </div>
        }>
          <RankingsContent searchParams={searchParams} />
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
