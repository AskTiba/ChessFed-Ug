import Link from "next/link";
import { prisma } from "@/lib/prisma";
import YearSelector from "@/components/YearSelector";
import { Suspense } from "react";

async function LeaderboardContent({ searchParams }: { searchParams: { year?: string } }) {
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
    .map((player: any) => ({
      id: player.id,
      name: player.name,
      fideId: player.fideId,
      rating: player.rating,
      totalPoints: player.grandPrixPoints.reduce((sum: number, gp: any) => sum + gp.points, 0),
      events: player.grandPrixPoints.map((gp: any) => gp.tournament.name),
      eventCount: player.grandPrixPoints.length,
    }))
    .filter((p: any) => p.totalPoints > 0)
    .sort((a: any, b: any) => b.totalPoints - a.totalPoints);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Main Leaderboard Table */}
      <div className="lg:col-span-3">
        <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-800/50 border-b border-zinc-800">
                  <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-widest">Rank</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-widest">Player Details</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-widest">Events</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">GP Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {leaderboard.map((player: any, index: number) => (
                  <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-xs ${
                        index === 0 ? 'bg-yellow-500 text-black' : 
                        index === 1 ? 'bg-zinc-700 text-white' : 
                        index === 2 ? 'bg-orange-600/80 text-white' : 
                        'text-zinc-600 border border-zinc-800'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="font-bold text-white group-hover:text-yellow-500 transition-colors">{player.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">FIDE: {player.fideId || 'N/A'}</span>
                          <span className="text-[10px] font-black text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded italic border border-blue-900/30 uppercase tracking-widest">ELO {player.rating}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {player.events.map((e: any, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-zinc-800 rounded uppercase font-bold text-zinc-400 border border-zinc-700" title={e}>
                            {e.split(' ').map((w: string) => w[0]).join('')}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 font-bold italic">{player.eventCount} Tournaments</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-2xl font-black text-white tracking-tighter italic group-hover:text-yellow-500 transition-colors">
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
        <div className="p-8 bg-zinc-900 border border-zinc-800 text-white rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-blue-400 italic">The Selection Zone</h3>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed italic">
            The Top 5 players on this leaderboard at the end of the calendar year earn automatic qualification for the National Team training pool.
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] border-b border-zinc-800 pb-2 font-black uppercase tracking-widest">
              <span className="text-zinc-500">Qualification Cutoff</span>
              <span>Dec 31, 2026</span>
            </div>
            <div className="flex justify-between items-center text-[10px] border-b border-zinc-800 pb-2 font-black uppercase tracking-widest">
              <span className="text-zinc-500">Events Remaining</span>
              <span>4 Major Events</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem]">
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 italic text-yellow-500">Point Distribution</h3>
          <ul className="space-y-4">
            {[
              { pos: "1st Place", pts: "10 pts" },
              { pos: "2nd Place", pts: "8 pts" },
              { pos: "3rd Place", pts: "6 pts" },
              { pos: "4th Place", pts: "4 pts" },
              { pos: "5th Place", pts: "2 pts" },
            ].map((row, i) => (
              <li key={i} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-zinc-500">{row.pos}</span>
                <span className="text-white">{row.pts}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[10px] text-zinc-500 italic font-bold">
            * Tied positions split points equally. Buchholz tie-breaks apply to rankings.
          </p>
        </div>
      </div>

    </div>
  );
}

export default async function GrandPrixLeaderboardPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const year = searchParams.year || "2026";

  return (
    <div className="min-h-screen bg-zinc-950 font-sans pb-20 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
            <div className="flex gap-8">
              <Link href="/tournaments" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Calendar</Link>
              <Link href="/rankings" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">National Rankings</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header - REFINED DARK THEME */}
      <header className="pt-32 pb-20 bg-zinc-900 border-b border-zinc-800 overflow-hidden relative">
        {/* National Pride Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-yellow-500 to-red-600 opacity-50"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-500/5 skew-x-12 translate-x-1/4"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-10">
              <Suspense fallback={<div className="h-10 w-48 bg-zinc-800 animate-pulse rounded-xl" />}>
                <YearSelector currentYear={year} />
              </Suspense>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
              Official Season Standings ({year})
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter italic">
              The Grand Prix <br /> <span className="text-yellow-500">Race to the Top</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl italic">
              Track the cumulative performance of Uganda's elite players. Top scorers at the end of the season qualify for the National Team and international Olympiad representation.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <Suspense fallback={
          <div className="flex items-center justify-center p-20 text-zinc-500 font-bold italic animate-pulse">
            Calculating Seasonal Standings...
          </div>
        }>
          <LeaderboardContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
