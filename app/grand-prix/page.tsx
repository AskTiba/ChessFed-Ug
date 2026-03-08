import Link from "next/link";
import { prisma } from "@/lib/prisma";
import YearSelector from "@/components/YearSelector";

export default async function GrandPrixLeaderboardPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const year = searchParams.year || "2026";
  const players = await prisma.player.findMany({
    include: {
      grandPrixPoints: {
        include: {
          tournament: {
            select: { name: true }
          }
        }
      }
    }
  });

  const leaderboard = players
    .map(player => ({
      id: player.id,
      name: player.name,
      fideId: player.fideId,
      rating: player.rating,
      totalPoints: player.grandPrixPoints.reduce((sum: number, gp) => sum + gp.points, 0),
      events: player.grandPrixPoints.map(gp => gp.tournament.name),
      eventCount: player.grandPrixPoints.length,
    }))
    .filter(p => p.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
            <div className="flex gap-8">
              <Link href="/tournaments" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Calendar</Link>
              <Link href="/rankings" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">National Rankings</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-32 pb-16 bg-blue-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-500/20 skew-x-12 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-8">
              <YearSelector currentYear={year} />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-blue-100 text-xs font-bold uppercase tracking-widest mb-6">
              Official Season Standings ({year})
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter italic">
              The Grand Prix <br /> Race to the Top
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
              Track the cumulative performance of Uganda's elite players. Top scorers at the end of the season qualify for the National Team and international Olympiad representation.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Leaderboard Table */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-blue-500/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                      <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Rank</th>
                      <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Player Details</th>
                      <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Events</th>
                      <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest text-right">GP Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {leaderboard.map((player, index) => (
                      <tr key={player.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black ${
                            index === 0 ? 'bg-amber-100 text-amber-600' : 
                            index === 1 ? 'bg-zinc-100 text-zinc-500' : 
                            index === 2 ? 'bg-orange-100 text-orange-600' : 
                            'text-zinc-400'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">{player.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-medium text-zinc-500">FIDE: {player.fideId || 'N/A'}</span>
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded italic">ELO {player.rating}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {player.events.map((e, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded uppercase font-bold text-zinc-500" title={e}>
                                {e.split(' ').map(w => w[0]).join('')}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1 font-bold">{player.eventCount} Tournaments</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
                            {player.totalPoints.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar: System Info */}
          <div className="space-y-8">
            <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-black uppercase tracking-tighter mb-6 italic">The Selection Zone</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                The Top 5 players on this leaderboard at the end of the calendar year earn automatic qualification for the National Team training pool.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Qualification Cutoff</span>
                  <span className="font-bold">Dec 31, 2026</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Events Remaining</span>
                  <span className="font-bold">4 Major Events</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-black uppercase tracking-tighter mb-6 italic text-zinc-900 dark:text-white">Point Distribution</h3>
              <ul className="space-y-4">
                {[
                  { pos: "1st Place", pts: "10 pts" },
                  { pos: "2nd Place", pts: "8 pts" },
                  { pos: "3rd Place", pts: "6 pts" },
                  { pos: "4th Place", pts: "4 pts" },
                  { pos: "5th Place", pts: "2 pts" },
                ].map((row, i) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">{row.pos}</span>
                    <span className="font-bold text-blue-600">{row.pts}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[10px] text-zinc-400 italic">
                * Tied positions split points equally. Buchholz tie-breaks apply to rankings.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
