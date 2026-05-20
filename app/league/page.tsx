import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LeagueClientView from "./LeagueClientView";

export const dynamic = "force-dynamic";

export default async function LeagueStandingsPage() {
  // Fetch real league tournaments from Database Archive (Strictly National League events)
  const leagueTournaments = await prisma.tournament.findMany({
    where: {
      AND: [
        { name: { contains: "League" } },
        { 
          OR: [
            { name: { contains: "National" } },
            { name: { contains: "Uganda" } }
          ]
        },
        { NOT: { name: { contains: "Blitz" } } },
        { NOT: { name: { contains: "Makerere" } } },
        { NOT: { name: { contains: "Schools" } } },
        { NOT: { name: { contains: "Junior" } } },
        { NOT: { name: { contains: "Youth" } } }
      ]
    },
    orderBy: { startDate: 'desc' },
    include: { liveData: true }
  });

  // Fetch DB clubs metadata
  const dbClubs = await prisma.club.findMany({
    orderBy: { name: 'asc' }
  });

  // Filter out any tournaments with missing/empty crId to prevent duplicate React keys
  const validLeagues = leagueTournaments.filter(t => t.crId && t.crId.trim() !== "");

  const formattedLeagues = validLeagues.map(t => ({
    crId: t.crId!,
    name: t.name,
    startDate: t.startDate.toISOString(),
    liveData: t.liveData ? {
      standings: t.liveData.standings,
      roster: t.liveData.roster,
      pairings: t.liveData.pairings
    } : null
  }));

  return (
    <div className="min-h-screen bg-zinc-950 font-sans pb-20 text-white pt-24">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold tracking-tighter text-white">
                ♟️ ChessFed<span className="text-blue-500">UG</span>
              </Link>
              <span className="px-3 py-1 rounded-md bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-500/30">
                National League Portal
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/tournaments" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                Tournaments Directory
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <header className="mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-zinc-900/50 p-12 rounded-[3rem] border border-zinc-800/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-500/5 skew-x-12 translate-x-1/4"></div>
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-6">
              Uganda National Chess League • Elite Tier
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter italic">
              League <span className="text-yellow-500">Hub & Clubs</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl italic">
              The pinnacle of Ugandan club competition. Explore historical league tables, active team rosters, round pairings, best players by board, and official club directories in one consolidated portal.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <LeagueClientView initialLeagues={formattedLeagues} clubsMap={dbClubs as any} />
      </main>
    </div>
  );
}
