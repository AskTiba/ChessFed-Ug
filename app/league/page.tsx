import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function LeagueStandingsPage() {
  const standings = await prisma.leagueStanding.findMany();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans pb-20">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
            <div className="flex gap-8">
              <Link href="/clubs" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Clubs Directory</Link>
              <Link href="/tournaments" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Calendar</Link>
            </div>
          </div>
        </div>
      </nav>

      <header className="pt-32 pb-16 bg-blue-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-500/20 skew-x-12 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-blue-100 text-xs font-bold uppercase tracking-widest mb-6">
              National League - Division 1
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter italic">
              League Standings
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
              The battle for club supremacy. Track match points, board wins, and the race for the national club title.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rank</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Club</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">MP</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">GP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {standings.map((s: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${idx < 3 ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}>
                          {s.rank}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <Link href={`/clubs/${s.clubId}`} className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-8 py-6 text-center font-black text-zinc-900 dark:text-white">{s.matchPoints}</td>
                      <td className="px-8 py-6 text-right font-black text-blue-600 italic">{s.gamePoints.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem]">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-blue-400">Legend</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-zinc-500">MP</span>
                  <span>Match Points (2 for win, 1 for draw)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-zinc-500">GP</span>
                  <span>Game Points (Individual board wins)</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">
              <h3 className="text-lg font-black uppercase tracking-tighter mb-4 italic text-zinc-900 dark:text-white">Promotion Zone</h3>
              <p className="text-xs text-zinc-500 leading-relaxed italic">
                The top 2 clubs from Division 1 qualify for the East African Club Championships.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
