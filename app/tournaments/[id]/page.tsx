import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TournamentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      sponsors: true,
      officials: true,
      _count: {
        select: { players: true }
      }
    }
  });

  if (!tournament) return notFound();

  const isRegistrationOpen = tournament.registrationDeadline 
    ? new Date(tournament.registrationDeadline) > new Date() 
    : true;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans pb-20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/tournaments" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Calendar
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                ♟️ ChessFed<span className="text-blue-600">UG</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-3 mb-6">
                {tournament.isGrandPrix && (
                  <span className="px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Official Grand Prix Event
                  </span>
                )}
                <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold">
                  {tournament.format} Format
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white mb-6 leading-tight italic uppercase tracking-tighter">
                {tournament.name}
              </h1>
              <div className="flex flex-wrap gap-8 text-zinc-600 dark:text-zinc-400 font-medium">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(tournament.startDate)}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {tournament.venue || "To Be Announced"}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-blue-500/5">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Registration Fee</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-bold text-zinc-400">UGX</span>
                <span className="text-5xl font-black text-zinc-900 dark:text-white">{(tournament.registrationFee || 0).toLocaleString()}</span>
              </div>
              {isRegistrationOpen ? (
                <Link href={`/tournaments/${tournament.id}/register`} className="block w-full text-center py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-500/25">
                  Secure Your Seat
                </Link>
              ) : (
                <button disabled className="block w-full py-4 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-bold rounded-2xl cursor-not-allowed">
                  Registration Closed
                </button>
              )}
              <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Deadline: {tournament.registrationDeadline ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(tournament.registrationDeadline) : "TBD"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Body */}
          <div className="lg:col-span-2 space-y-16">
            {/* History & Description */}
            <section>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
                Event Overview & History
              </h2>
              <div className="prose prose-zinc dark:prose-invert max-w-none text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                <p className="mb-6">{tournament.description || "No description available for this event yet."}</p>
                <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 italic">
                  <h4 className="text-zinc-900 dark:text-white font-bold not-italic mb-3">The Legacy</h4>
                  {tournament.history || "This tournament has a long-standing tradition in the Ugandan chess community."}
                </div>
              </div>
            </section>

            {/* Prize Fund Breakdown */}
            <section>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-green-500 rounded-full"></span>
                Prize Fund Breakdown
              </h2>
              <div className="p-8 bg-zinc-900 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10">
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-2">Total Prize Pool</p>
                  <p className="text-4xl font-black text-green-400 mb-8">UGX {(tournament.prizeFund || 0).toLocaleString()}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs font-bold text-zinc-500 mb-1">1ST PLACE</p>
                      <p className="text-lg font-bold">UGX {((tournament.prizeFund || 0) * 0.4).toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs font-bold text-zinc-500 mb-1">2ND PLACE</p>
                      <p className="text-lg font-bold">UGX {((tournament.prizeFund || 0) * 0.25).toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs font-bold text-zinc-500 mb-1">3RD PLACE</p>
                      <p className="text-lg font-bold">UGX {((tournament.prizeFund || 0) * 0.15).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Podium History */}
            <section>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-amber-500 rounded-full"></span>
                Podium History
              </h2>
              <div className="space-y-6">
                {(tournament as any).podiums?.map((p: any) => (
                  <div key={p.year} className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black italic text-zinc-900 dark:text-white uppercase tracking-tighter">{p.year} Results</h3>
                      <Link href="#" className="text-[10px] font-black uppercase text-blue-600 hover:underline">Full Standings →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {p.podium.map((rank: any) => (
                        <div key={rank.rank} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                            rank.rank === 1 ? 'bg-amber-100 text-amber-600' :
                            rank.rank === 2 ? 'bg-zinc-100 text-zinc-500' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {rank.rank}
                          </span>
                          <div>
                            <p className="font-bold text-sm text-zinc-900 dark:text-white">{rank.name}</p>
                            <p className="text-[10px] text-zinc-500 font-medium">Rating: {rank.rating}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            {/* Officials */}
            <section className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Tournament Officials</h3>
              <div className="space-y-6">
                {tournament.officials.map((official: any) => (
                  <div key={official.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white leading-none">{official.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{official.role}</p>
                    </div>
                  </div>
                ))}
                {tournament.officials.length === 0 && (
                  <p className="text-sm text-zinc-500">Officials to be confirmed.</p>
                )}
              </div>
            </section>

            {/* Sponsors */}
            <section>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Event Partners</h3>
              <div className="grid grid-cols-2 gap-4">
                {tournament.sponsors.map((sponsor: any) => (
                  <div key={sponsor.id} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
                    <p className="font-bold text-xs text-zinc-900 dark:text-white">{sponsor.name}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Stats */}
            <section className="p-8 rounded-3xl bg-blue-600 text-white">
              <h3 className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-6">Live Entry List</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black">{tournament._count.players}</span>
                <span className="text-blue-200 font-bold">Players Registered</span>
              </div>
              <div className="mt-6 pt-6 border-t border-blue-500/50 space-y-4">
                <Link href={`/tournaments/${tournament.id}/live`} className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-sm transition-all shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  ENTER LIVE CENTER
                </Link>
                <Link href="#" className="text-sm font-bold text-white hover:underline flex items-center justify-between">
                  View Full Starting List <span>→</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
