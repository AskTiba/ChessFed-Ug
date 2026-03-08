import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ClubsPage() {
  const clubs = await prisma.club.findMany();

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
              <Link href="/league" className="text-sm font-bold text-blue-600 hover:underline transition-colors">League Standings</Link>
              <Link href="/tournaments" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Calendar</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4 italic uppercase tracking-tighter">
            Clubs Directory
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            The foundation of Ugandan chess. Explore the 20+ official clubs that compete in the National League, their leadership, and elite player rosters.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clubs.map((club: any) => (
            <div key={club.id} className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-8 hover:shadow-2xl hover:shadow-blue-500/5 transition-all">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-black text-zinc-400 italic border border-zinc-200 dark:border-zinc-700">
                  {club.name.substring(0, 1)}
                </div>
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest mt-2">Est. {club.founded}</span>
              </div>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                {club.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2 italic">
                {club.description}
              </p>

              <div className="space-y-4 mb-8 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-400 uppercase tracking-widest">Captain</span>
                  <span className="font-black text-zinc-900 dark:text-white">{club.captain}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-400 uppercase tracking-widest">Owner</span>
                  <span className="font-black text-zinc-900 dark:text-white">{club.owner}</span>
                </div>
              </div>

              <Link 
                href={`/clubs/${club.id}`}
                className="block w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-center rounded-2xl text-sm font-black hover:scale-105 transition-all"
              >
                VIEW ROSTER
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
