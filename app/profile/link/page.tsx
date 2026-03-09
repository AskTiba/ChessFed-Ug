import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LinkPlayerButton from "./LinkPlayerButton";

export default async function LinkProfilePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // Check if already linked
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { playerId: true }
  });

  if (user?.playerId) redirect("/dashboard");

  const query = searchParams.q || "";
  const players = query 
    ? await prisma.player.findMany({
        where: {
          AND: [
            { name: { contains: query, mode: 'insensitive' } },
            { user: null } // Only show players NOT yet linked to an account
          ]
        },
        take: 10
      })
    : [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 max-w-3xl mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic mb-4">
            Link Your Federation Profile
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            To track your Grand Prix race and national ELO, we need to connect your login to your official federation record.
          </p>
        </header>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50">
          <form className="relative mb-10">
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Search your name (e.g. Harold Wanyama)..."
              className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </form>

          <div className="space-y-4">
            {players.length > 0 ? (
              players.map((player: any) => (
                <div key={player.id} className="flex items-center justify-between p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/50 transition-all group">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{player.name}</p>
                    <p className="text-xs text-zinc-500">FIDE: {player.fideId || "N/A"} | ELO: {player.rating}</p>
                  </div>
                  <LinkPlayerButton playerId={player.id} />
                </div>
              ))
            ) : query ? (
              <div className="text-center py-10">
                <p className="text-zinc-500 italic">No unlinked players found matching "{query}"</p>
                <p className="text-xs text-zinc-400 mt-2">If you aren't in the system, contact the federation to create your master record.</p>
              </div>
            ) : (
              <div className="text-center py-10 opacity-50">
                <svg className="w-12 h-12 mx-auto mb-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <p className="text-sm text-zinc-500">Search for your name above to begin linking.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
