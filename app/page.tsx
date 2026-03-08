import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white dark:bg-zinc-950 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                ♟️ ChessFed<span className="text-blue-600">UG</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="/tournaments" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">Calendar</Link>
              <Link href="/grand-prix" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">Grand Prix</Link>
              <Link href="/rankings" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">Rankings</Link>
              <Link href="/clubs" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">Clubs</Link>
              <Link href="/league" className="text-sm font-medium text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">League</Link>
              <Link href="/dashboard" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">Member Portal</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section: The Road to National Team */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-zinc-900/50 dark:to-zinc-950">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-bold mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              2026 Grand Prix Season is Live
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 leading-[1.1]">
              The Road to the <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                National Team
              </span> Starts Here.
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Uganda's official chess federation hub. Track Grand Prix standings, discover annual championship details, and secure your place in international Olympiads.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tournaments" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-500/30">
                View Tournament Calendar
              </Link>
              <Link href="/grand-prix" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                The Grand Prix Race
              </Link>
            </div>
          </div>
        </section>

        {/* Clubs & League Spotlight */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter mb-6">Club Supremacy</h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  Join one of Uganda's 20+ official chess clubs. Compete in the National League, build your team roster, and battle for the Division 1 title.
                </p>
                <div className="flex gap-4">
                  <Link href="/clubs" className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-2xl hover:scale-105 transition-all">
                    Explore Clubs
                  </Link>
                  <Link href="/league" className="px-6 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold rounded-2xl hover:bg-white dark:hover:bg-zinc-800 transition-all">
                    League Standings
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Kireka CC", rank: "1st", color: "bg-blue-600" },
                  { name: "City CC", rank: "2nd", color: "bg-zinc-800" },
                  { name: "SOM Katwe", rank: "3rd", color: "bg-zinc-800" },
                  { name: "Doves CC", rank: "4th", color: "bg-zinc-800" },
                ].map((club, i) => (
                  <div key={i} className={`p-6 rounded-3xl ${club.color} text-white shadow-xl`}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Division 1</p>
                    <p className="font-bold text-lg mb-1">{club.name}</p>
                    <p className="text-2xl font-black italic">{club.rank}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Annual Events Spotlight */}
        <section id="calendar" className="py-24 border-y border-zinc-100 dark:border-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">Featured Annual Events</h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  From the prestigious K Rwabushenyi Memorial to the Uganda National Championship. Get full history, sponsor details, and prize fund breakdowns.
                </p>
              </div>
              <Link href="/tournaments" className="text-blue-600 font-bold hover:underline">View All Events →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Uganda National Championship", type: "Grand Prix", date: "June 2026", status: "Registration Open", prize: "UGX 5,000,000" },
                { name: "K Rwabushenyi Memorial", type: "Grand Prix", date: "Dec 2026", status: "Upcoming", prize: "UGX 3,500,000" },
                { name: "Easter Chess Championship", type: "Open", date: "April 2026", status: "Closing Soon", prize: "UGX 2,000,000" },
              ].map((event, i) => (
                <div key={i} className="group relative p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 transition-all overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.type === 'Grand Prix' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {event.type}
                    </span>
                    <span className="text-sm font-medium text-zinc-500">{event.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{event.name}</h3>
                  <div className="space-y-2 mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                    <p className="flex justify-between"><span>Status:</span> <span className="font-semibold text-zinc-900 dark:text-white">{event.status}</span></p>
                    <p className="flex justify-between"><span>Prize Fund:</span> <span className="font-semibold text-green-600">{event.prize}</span></p>
                  </div>
                  <Link href="/tournaments" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
                    Full Event Portal <span>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grand Prix Explained - REFINED COLORS */}
        <section id="grand-prix" className="py-24 bg-zinc-900 dark:bg-zinc-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 skew-x-12 translate-x-1/4"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-6">The Grand Prix <span className="text-blue-500">System</span></h2>
                <div className="space-y-6 text-zinc-400">
                  <p className="text-lg italic">
                    The Grand Prix is the definitive season-long competition that identifies Uganda's most consistent chess talent. 
                  </p>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400">1</div>
                      <span>Participate in designated Grand Prix events throughout the calendar year.</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400">2</div>
                      <span>Earn cumulative points based on your final tournament rankings.</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400">3</div>
                      <span>The top scorers qualify for the National Team and international representations.</span>
                    </li>
                  </ul>
                  <Link href="/grand-prix" className="inline-block mt-8 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-500/20">
                    View Live GP Standings
                  </Link>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-10">
                <h3 className="text-white font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Top GP Leaders
                </h3>
                <div className="space-y-4">
                  {[
                    { name: "FM Harold Wanyama", points: 42.5, rank: 1 },
                    { name: "IM Arthur Ssegwanyi", points: 38.0, rank: 2 },
                    { name: "FM Patrick Kawuma", points: 35.5, rank: 3 },
                    { name: "WFM Shakira Ampaire", points: 31.0, rank: 4 },
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-blue-400 font-black italic w-4 text-center">{p.rank}</span>
                        <span className="text-zinc-100 font-bold">{p.name}</span>
                      </div>
                      <span className="text-blue-400 font-black italic">{p.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners & Sponsors */}
        <section className="py-24 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-12">Empowered by Official Federation Partners</h3>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">MTN Uganda</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">Stanbic Bank</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">Centenary Bank</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">KCCA</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">NCS Uganda</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <span className="text-2xl font-bold tracking-tighter text-zinc-900 dark:text-white">
                ♟️ ChessFed<span className="text-blue-600">UG</span>
              </span>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed italic">
                The official digital hub for the Uganda Chess Federation. Dedicated to excellence, transparency, and the growth of chess talent across the nation.
              </p>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white mb-6">Federation</h4>
              <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
                <li><Link href="/tournaments" className="hover:text-blue-600 transition-colors">Calendar</Link></li>
                <li><Link href="/grand-prix" className="hover:text-blue-600 transition-colors">Grand Prix</Link></li>
                <li><Link href="/rankings" className="hover:text-blue-600 transition-colors">National Rankings</Link></li>
                <li><Link href="/league" className="hover:text-blue-600 transition-colors">League Standings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white mb-6">Operations</h4>
              <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
                <li><Link href="/clubs" className="hover:text-blue-600 transition-colors">Clubs Directory</Link></li>
                <li><Link href="/admin" className="hover:text-blue-600 transition-colors">Admin Oversight</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Member Portal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center md:text-left font-medium">
              © 2026 Chess Federation Uganda. Built by Anthony Ngisiro.
            </p>
            <div className="flex gap-8">
              <Link href="#" className="text-xs font-bold text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Twitter</Link>
              <Link href="#" className="text-xs font-bold text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-widest">GitHub</Link>
              <Link href="/admin" className="text-xs font-bold text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Federation Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
