import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: 'asc' },
    include: {
      sponsors: true,
      _count: {
        select: { players: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Sign In</Link>
              <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">Join Federation</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">Official 2026 Calendar</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Browse Uganda's annual chess championships, regional opens, and the high-stakes Grand Prix events that lead to the national team.
          </p>
        </header>

        {/* Filter/Tabs Placeholder */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <button className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-bold whitespace-nowrap">All Events</button>
          <button className="px-5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-bold whitespace-nowrap hover:border-blue-500/50 transition-colors">Grand Prix Only</button>
          <button className="px-5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-bold whitespace-nowrap hover:border-blue-500/50 transition-colors">Open Tournaments</button>
          <button className="px-5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-bold whitespace-nowrap hover:border-blue-500/50 transition-colors">Schools & Youth</button>
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tournaments.map((tournament: any) => (
            <div key={tournament.id} className="group flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 hover:shadow-2xl hover:shadow-blue-500/5 transition-all overflow-hidden p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(tournament.startDate)}
                  </span>
                  {tournament.isGrandPrix && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold w-fit mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Grand Prix Event
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-zinc-400">UGX</span>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white leading-none">{(tournament.registrationFee || 0).toLocaleString()}</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                {tournament.name}
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {tournament.venue || "TBD"}
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {tournament.totalRounds} Rounds | {tournament.format}
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  {tournament._count.players} Players Registered
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {tournament.sponsors.map((s: any, idx: number) => (
                    <div key={idx} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-400 uppercase" title={s.name}>
                      {s.name.substring(0, 1)}
                    </div>
                  ))}
                </div>
                <Link 
                  href={`/tournaments/${tournament.id}`} 
                  className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-sm font-bold hover:scale-105 transition-transform"
                >
                  View Event Portal
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © 2026 Chess Federation Uganda. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
