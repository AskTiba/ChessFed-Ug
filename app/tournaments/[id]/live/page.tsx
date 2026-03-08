import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MOCK_PAIRINGS, MOCK_STANDINGS } from "@/lib/mock-store";

export default async function TournamentLivePage({ params }: { params: { id: string } }) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
  });

  if (!tournament) return notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href={`/tournaments/${tournament.id}`} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Tournament Portal
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                ♟️ ChessFed<span className="text-blue-600">UG</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-red-600 font-black uppercase tracking-widest text-sm italic">Live Center</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter mb-2">
            {tournament.name}
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Round 4 in Progress | Kira Road Arena</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Pairings Column */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
              <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Pairings - Round 4</h3>
                <div className="flex gap-2">
                   <button className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold">Prev</button>
                   <button className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold">Next</button>
                </div>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {MOCK_PAIRINGS.map((p, idx) => (
                  <div key={idx} className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-zinc-50 dark:hover:bg-blue-900/10 transition-colors">
                    <div className="flex items-center gap-4 w-full md:w-[40%]">
                      <span className="text-xs font-black text-zinc-400">T.{p.table}</span>
                      <p className="font-bold text-zinc-900 dark:text-white truncate">{p.white}</p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <span className="px-4 py-1 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-black rounded-lg">
                        {p.result || "vs"}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-4 w-full md:w-[40%]">
                      <p className="font-bold text-zinc-900 dark:text-white truncate text-right">{p.black}</p>
                      <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Standings Sidebar */}
          <div className="space-y-8">
            <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
               <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic text-sm">Standings after Round 3</h3>
              </div>
              <div className="p-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {MOCK_STANDINGS.map((s, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="px-4 py-4 font-bold text-zinc-400">{s.rank}</td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-zinc-900 dark:text-white leading-none">{s.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-1">{s.rating}</p>
                        </td>
                        <td className="px-4 py-4 text-right font-black text-blue-600">{s.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Link href="#" className="block mt-6 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors">
                  View Full Standings →
                </Link>
              </div>
            </section>

            {/* Live Board Placeholder */}
            <section className="bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
               <h3 className="font-black uppercase tracking-tighter italic text-xs mb-6 text-blue-400">Featured Board 1</h3>
               <div className="aspect-square bg-zinc-800 rounded-xl mb-6 flex items-center justify-center border border-white/5">
                 <svg className="w-12 h-12 text-zinc-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
               </div>
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                 <span>Wanyama</span>
                 <span className="text-blue-400">1/2 - 1/2</span>
                 <span>Ssegwanyi</span>
               </div>
               <p className="mt-4 text-[10px] text-zinc-500 text-center font-bold">CLICK TO VIEW PGN</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
