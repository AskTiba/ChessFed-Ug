import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const playerCount = await prisma.player.count();
  const clubs = await prisma.club.findMany();
  const tournaments = await prisma.tournament.findMany({ take: 5 });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      {/* Admin Nav */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold tracking-tighter text-white">
                ♟️ ChessFed<span className="text-blue-500">UG</span>
              </Link>
              <span className="px-3 py-1 rounded-md bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                Admin Console
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Switch to Player View</Link>
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter mb-2">Federation Oversight</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Managing 2026 Season Operations</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/tournaments/new" className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
              + NEW TOURNAMENT
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Players", val: playerCount, color: "text-blue-600" },
            { label: "Active Clubs", val: clubs.length, color: "text-zinc-900 dark:text-white" },
            { label: "GP Events", val: "4/7", color: "text-amber-500" },
            { label: "Revenue (Mock)", val: "UGX 4.2M", color: "text-green-600" },
          ].map((stat, i) => (
            <div key={i} className="p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className={`text-3xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Tournaments Table */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-6 italic">Event Management</h3>
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-none">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tournament</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">GP</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {tournaments.map((t: any) => (
                    <tr key={t.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-zinc-900 dark:text-white">{t.name}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">Starts: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(t.startDate)}</p>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {t.isGrandPrix ? (
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 inline-block"></span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/tournaments/${t.id}/edit`} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <Link href={`/admin/grand-prix/distribute?id=${t.id}`} className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-amber-600 transition-colors" title="Distribute GP Points">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-8">
            <section className="p-8 bg-zinc-900 text-white rounded-[2.5rem]">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-blue-400">Quick Operations</h3>
              <div className="space-y-4">
                <button className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 rounded-2xl text-left flex justify-between items-center group transition-all">
                  <span className="font-bold text-sm">Assign Arbiters</span>
                  <span className="text-zinc-500 group-hover:text-white">→</span>
                </button>
                <button className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 rounded-2xl text-left flex justify-between items-center group transition-all">
                  <span className="font-bold text-sm">Verify New Players</span>
                  <span className="text-zinc-500 group-hover:text-white">→</span>
                </button>
                <button className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 rounded-2xl text-left flex justify-between items-center group transition-all">
                  <span className="font-bold text-sm">League Roster Lock</span>
                  <span className="text-zinc-500 group-hover:text-white">→</span>
                </button>
              </div>
            </section>

            <section className="p-8 bg-blue-600 text-white rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-4">GP Audit</h3>
              <p className="text-xs text-blue-100 leading-relaxed mb-6 italic">
                3 Grand Prix events are pending final point audits. Ensure all results are verified by the Chief Arbiter.
              </p>
              <Link href="/admin/grand-prix/audit" className="text-[10px] font-black uppercase bg-white text-blue-600 px-4 py-2 rounded-lg">
                RUN AUDIT ENGINE
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
