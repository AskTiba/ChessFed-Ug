import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function NationalRankingsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  const players = await prisma.player.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { fideId: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { rating: 'desc' },
    take: 100,
  });

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
              <Link href="/grand-prix" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Grand Prix Race</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 italic uppercase tracking-tighter">
              Uganda Top 100
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The official national rankings for the Uganda Chess Federation. Search by name or FIDE ID to view the performance of our top-rated masters and rising stars.
            </p>
          </div>

          {/* Search Bar */}
          <form className="w-full md:w-96 relative group">
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Search master or FIDE ID..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </form>
        </div>

        {/* Top 3 Spotlight Cards */}
        {query === "" && players.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {players.slice(0, 3).map((player, i) => (
              <div key={player.id} className={`relative p-8 rounded-[2.5rem] border overflow-hidden group hover:scale-[1.02] transition-all ${
                i === 0 ? 'bg-zinc-900 text-white border-zinc-800 shadow-2xl shadow-blue-500/10' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
              }`}>
                <div className={`absolute top-0 right-0 p-6 font-black text-6xl opacity-10 ${i === 0 ? 'text-blue-500' : 'text-zinc-400'}`}>
                  {i + 1}
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                      {i === 0 ? 'National Champion' : 'Grandmaster Elite'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1 leading-tight">{player.name}</h3>
                  <p className={`text-sm mb-6 ${i === 0 ? 'text-zinc-400' : 'text-zinc-500'}`}>FIDE ID: {player.fideId}</p>
                  
                  <div className="flex items-end justify-between border-t border-zinc-100/10 pt-6 mt-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Current Rating</p>
                      <p className="text-3xl font-black italic tracking-tighter text-blue-600">{player.rating}</p>
                    </div>
                    <Link href={`/player/${player.id}`} className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${
                      i === 0 ? 'bg-white text-zinc-900 hover:bg-zinc-200' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105'
                    }`}>
                      Full Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rankings Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Rank</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">Master Name</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">FIDE ID</th>
                  <th className="px-8 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest text-right">ELO Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {players.map((player, index) => (
                  <tr key={player.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-zinc-400 font-bold tabular-nums">#{index + 1}</span>
                    </td>
                    <td className="px-8 py-6">
                      <Link href={`/player/${player.id}`} className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {player.name}
                      </Link>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-zinc-500 tabular-nums">{player.fideId || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums">
                          {player.rating}
                        </span>
                        <div className="w-16 h-1 bg-zinc-100 dark:bg-zinc-800 mt-1 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600" 
                            style={{ width: `${(player.rating / 2500) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {players.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-lg text-zinc-500">No masters found matching "{query}"</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
