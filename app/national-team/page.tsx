import Link from "next/link";
import { prisma } from "@/lib/prisma";
import YearSelector from "@/components/YearSelector";
import { Suspense } from "react";

async function NationalTeamContent({ searchParams }: { searchParams: { year?: string } }) {
  const year = searchParams.year || "2026";
  const players = await prisma.player.findMany({
    take: 10,
    orderBy: { rating: 'desc' }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Primary Selection List */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
          <span className="w-8 h-1 bg-yellow-500 rounded-full"></span>
          Current Selection Pool
        </h2>
        
        <div className="space-y-4">
          {players.map((p: any, i: number) => (
            <div key={p.id} className="flex items-center justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-[2rem] hover:border-yellow-500/50 transition-all group">
              <div className="flex items-center gap-6">
                <span className="text-zinc-700 font-black italic text-2xl group-hover:text-yellow-500/20 transition-colors w-8">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-bold text-white text-lg">{p.name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">FIDE {p.fideId}</span>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">ELO {p.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-green-900/20 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                  Qualified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Criteria Sidebar */}
      <div className="space-y-8">
        <section className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-yellow-500">Selection Criteria</h3>
          <ul className="space-y-6">
            <li className="flex gap-4">
              <span className="text-zinc-700 font-black">01</span>
              <p className="text-xs text-zinc-400 leading-relaxed italic">Top 3 performers from the final Grand Prix standings earn automatic slots.</p>
            </li>
            <li className="flex gap-4">
              <span className="text-zinc-700 font-black">02</span>
              <p className="text-xs text-zinc-400 leading-relaxed italic">The reigning National Champion occupies the top board position.</p>
            </li>
            <li className="flex gap-4">
              <span className="text-zinc-700 font-black">03</span>
              <p className="text-xs text-zinc-400 leading-relaxed italic">One wildcard entry decided by the Technical Committee based on FIDE performance.</p>
            </li>
          </ul>
        </section>

        <section className="p-8 bg-blue-600 rounded-[2.5rem] text-white">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4">Olympiad 2026</h3>
          <p className="text-xl font-black italic uppercase tracking-tighter mb-6">Final squad announcement scheduled for Sept 2026.</p>
          <Link href="/tournaments" className="px-6 py-3 bg-black text-white text-[10px] font-black rounded-xl hover:bg-zinc-900 transition-all uppercase tracking-widest">
            FIND QUALIFIERS
          </Link>
        </section>
      </div>
    </div>
  );
}

export default async function NationalTeamPage(props: {
  searchParams: Promise<{ year?: string }>;
}) {
  const searchParams = await props.searchParams;
  const year = searchParams.year || "2026";

  return (
    <div className="min-h-screen bg-zinc-950 font-sans pb-20 text-white">
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
            <div className="flex gap-8">
              <Link href="/rankings" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">National Rankings</Link>
              <Link href="/grand-prix" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Grand Prix</Link>
            </div>
          </div>
        </div>
      </nav>

      <header className="pt-32 pb-20 bg-zinc-900 border-b border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black via-yellow-500 to-red-600 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-10">
              <Suspense fallback={<div className="h-10 w-48 bg-zinc-800 animate-pulse rounded-xl" />}>
                <YearSelector currentYear={year} />
              </Suspense>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-6">
              National Selection Pool ({year})
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter italic">
              Uganda <span className="text-yellow-500">Olympiad Squad</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl italic">
              Meet the elite pool of players currently eligible for national team representation in the upcoming FIDE Chess Olympiad.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <Suspense fallback={
          <div className="flex items-center justify-center p-20 text-zinc-500 font-bold italic animate-pulse">
            Loading Selection Pool...
          </div>
        }>
          <NationalTeamContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
