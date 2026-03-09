import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PlayerDashboardPage() {
  // --- PREVIEW MODE BYPASS ---
  // const session = await getServerSession(authOptions);
  // if (!session?.user) redirect("/login");
  const session = { user: { name: "Anthony Ngisiro", email: "anthony@example.com" } };
  // ---------------------------

  // Find ANY player from the database to show the layout
  const firstPlayer = await prisma.player.findFirst();

  // Find the player associated with this user
  const user = await prisma.user.findFirst({
    where: { playerId: firstPlayer?.id },
    include: {
      player: {
        include: {
          grandPrixPoints: {
            include: { tournament: true }
          },
          tournaments: {
            orderBy: { startDate: 'desc' },
            take: 5
          }
        }
      }
    }
  });

  const player = user?.player || firstPlayer; // Fallback to first player for preview
  const totalGPPoints = player?.grandPrixPoints.reduce((sum: number, gp: any) => sum + gp.points, 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      {/* Dashboard Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              ♟️ ChessFed<span className="text-blue-600">UG</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/tournaments" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">Find Tournaments</Link>
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {session.user.name?.substring(0, 1) || "P"}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!player ? (
          <div className="mt-20 text-center bg-white dark:bg-zinc-900 p-12 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 italic uppercase tracking-tighter">Welcome, {session.user.name}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto italic">
              Your account is not yet linked to an official federation player profile. Link your profile to track your Grand Prix race and national ELO.
            </p>
            <Link href="/profile/link" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25">
              Link FIDE / National Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header / Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-10 bg-zinc-900 text-white rounded-[3rem] relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{player.name}</h1>
                  <p className="text-zinc-400 font-bold tracking-widest text-xs uppercase mb-8">FIDE ID: {player.fideId || "PENDING VERIFICATION"}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">National Rating</p>
                      <p className="text-4xl font-black italic text-blue-500">{player.rating}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Grand Prix Points</p>
                      <p className="text-4xl font-black italic text-amber-500">{totalGPPoints.toFixed(1)}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Federation Rank</p>
                      <p className="text-4xl font-black italic text-zinc-300">#42</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50">
                <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-6 italic text-lg">Member Portal</h3>
                <div className="space-y-4">
                  <Link href="/profile/edit" className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
                    <span className="font-bold text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 transition-colors">Edit My Profile</span>
                    <span className="text-zinc-400 group-hover:text-blue-600">→</span>
                  </Link>
                  <Link href="/tournaments" className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
                    <span className="font-bold text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 transition-colors">Register for Events</span>
                    <span className="text-zinc-400 group-hover:text-blue-600">→</span>
                  </Link>
                  <Link href="/grand-prix" className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group">
                    <span className="font-bold text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 transition-colors">View GP Standings</span>
                    <span className="text-zinc-400 group-hover:text-blue-600">→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Detailed History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Grand Prix Point Breakdown */}
              <section className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl shadow-zinc-200/50">
                <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Grand Prix History</h3>
                </div>
                <div className="p-8">
                  {player.grandPrixPoints.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">No Grand Prix points recorded in the 2026 season yet.</p>
                  ) : (
                    <div className="space-y-6">
                      {player.grandPrixPoints.map((gp: any) => (
                        <div key={gp.id} className="flex justify-between items-center group">
                          <div className="max-w-[70%]">
                            <p className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">{gp.tournament.name}</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                              {new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(gp.tournament.startDate)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-amber-500">+{gp.points}</span>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Performance */}
              <section className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl shadow-zinc-200/50">
                <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Recent Tournaments</h3>
                </div>
                <div className="p-8">
                  {player.tournaments.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">You haven't participated in any tournaments yet.</p>
                  ) : (
                    <div className="space-y-6">
                      {player.tournaments.map((t: any) => (
                        <Link href={`/tournaments/${t.id}`} key={t.id} className="flex justify-between items-center group">
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">{t.name}</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{t.venue || "Official Venue"}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Completed
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
