import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import JoinClubButton from "./JoinClubButton";

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const club = await prisma.club.findUnique({
    where: { id: params.id },
  });

  if (!club) return notFound();

  // In our simulation, prisma.club.findUnique also returns the players
  const players = await prisma.player.findMany({
    where: { clubId: club.id },
    orderBy: { rating: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans pb-20">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/clubs" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Clubs Directory
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                ♟️ ChessFed<span className="text-blue-600">UG</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      <header className="pt-32 pb-16 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-4xl font-black text-white italic shadow-2xl shadow-blue-500/20">
                {club.name.substring(0, 1)}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter mb-2">
                  {club.name}
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Official National League Member | Est. {club.founded}</p>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Roster Size</p>
                 <p className="text-xl font-black text-zinc-900 dark:text-white">{players.length}</p>
               </div>
               <div className="px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Avg Rating</p>
                 <p className="text-xl font-black text-blue-600">
                   {Math.round(players.reduce((sum: number, p: any) => sum + p.rating, 0) / (players.length || 1))}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-8 italic">Elite Roster</h2>
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Player</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {players.map((player: any) => (
                    <tr key={player.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400">
                            {player.name.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white">{player.name}</p>
                            {player.name === club.captain && (
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Team Captain</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-lg font-black text-zinc-900 dark:text-white italic">{player.rating}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-12">
            <section className="p-8 bg-zinc-900 text-white rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-black uppercase tracking-tighter mb-6 italic">Leadership</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Club Owner</p>
                  <p className="font-bold text-lg">{club.owner}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Team Captain</p>
                  <p className="font-bold text-lg text-blue-400">{club.captain}</p>
                </div>
              </div>
            </section>

            <section className="p-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">
              <h3 className="text-lg font-black uppercase tracking-tighter mb-4 italic text-zinc-900 dark:text-white">About the Club</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic mb-8">
                {club.description}
              </p>
              <JoinClubButton clubName={club.name} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
