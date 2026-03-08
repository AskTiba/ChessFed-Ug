import Link from "next/link";
import { prisma } from "@/lib/prisma";
import YearSelector from "@/components/YearSelector";

export default async function NationalTeamPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const year = searchParams.year || "2026";
  // In simulation, we'll grab the top performers
  const gpLeaders = await prisma.player.findMany({ take: 5 });
  const eloLeaders = await prisma.player.findMany({ orderBy: { rating: 'desc' }, take: 5 });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
            <div className="flex gap-8">
              <Link href="/grand-prix" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Grand Prix Standings</Link>
              <Link href="/rankings" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">National Rankings</Link>
            </div>
          </div>
        </div>
      </nav>

      <header className="pt-32 pb-20 bg-zinc-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mb-10 flex justify-center">
            <YearSelector currentYear={year} />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-8">
            Selection Year: {year}
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6 leading-tight">
            The National <br /> <span className="text-blue-500">Olympiad Squad</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed italic">
            Uganda's elite chess representatives. Selection is based on 2026 Grand Prix performance, national ELO benchmarks, and official trials.
          </p>
        </div>
      </header>

      <main className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1: Grand Prix Qualifiers */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter mb-2">Grand Prix Qualifiers</h2>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Top 5 Automatic Entries</p>
            </div>
            <Link href="/grand-prix" className="text-blue-600 font-black text-xs hover:underline uppercase tracking-widest">Full GP Leaderboard →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {gpLeaders.map((p: any, i: number) => (
              <div key={p.id} className="relative group perspective">
                <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl group-hover:border-blue-500/50 transition-all text-center overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 text-white font-black italic text-xs mb-6">#{i + 1}</span>
                  <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6 text-2xl font-black text-zinc-400">
                    {p.name.substring(0, 1)}
                  </div>
                  <h3 className="font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors leading-tight">{p.name}</h3>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">GP Points: 42.5</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Reserve Pool (ELO) */}
        <section className="mb-24">
          <div className="p-12 bg-zinc-900 rounded-[3rem] border border-zinc-800 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="max-w-2xl mb-12">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 text-blue-500">The Reserve Pool</h2>
                <p className="text-zinc-400 text-sm leading-relaxed italic">
                  The Technical Committee monitors the following high-rated players for wildcard selections and training camp call-ups based on national ELO performance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eloLeaders.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-zinc-600">W.{i+1}</span>
                      <p className="font-bold text-white">{p.name}</p>
                    </div>
                    <span className="text-blue-400 font-black italic">ELO {p.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Criteria & Awareness */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-zinc-900 dark:text-white">Selection Criteria</h3>
            <ul className="space-y-6">
              {[
                { t: "Grand Prix Dominance", d: "Top 5 players in the cumulative annual standings earn direct qualification." },
                { t: "Technical Wildcard", d: "The Federation Technical Committee may select 2 additional players based on potential." },
                { t: "Rating Threshold", d: "A minimum national ELO of 2100 is required for senior team consideration." },
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">{item.t}</p>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed italic">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-10 bg-blue-600 rounded-[2.5rem] text-white flex flex-col justify-center items-center text-center">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Represent Your Nation</h3>
            <p className="text-blue-100 text-sm mb-8 leading-relaxed max-w-xs">
              Every annual tournament counts. Enter the 2026 Season and start accumulating Grand Prix points today.
            </p>
            <Link href="/tournaments" className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 transition-all shadow-xl">
              FIND QUALIFIERS
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
