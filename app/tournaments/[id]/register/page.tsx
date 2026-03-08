import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import RegisterButton from "./RegisterButton";

export default async function TournamentRegistrationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.id },
    include: {
      players: {
        select: { id: true }
      }
    }
  });

  if (!tournament) return notFound();

  // Find the player associated with this user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { player: true }
  });

  const player = user?.player;
  const isAlreadyRegistered = player ? tournament.players.some(p => p.id === player.id) : false;
  
  const isDeadlinePassed = tournament.registrationDeadline 
    ? new Date(tournament.registrationDeadline) < new Date() 
    : false;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href={`/tournaments/${tournament.id}`} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Portal
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-10 md:p-16">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic mb-4">
              Tournament Entry
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg font-bold">
              {tournament.name}
            </p>
          </header>

          {!player ? (
            <div className="text-center p-8 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-200 dark:border-amber-800/50">
              <p className="text-amber-800 dark:text-amber-400 font-bold mb-6">
                You must link your Federation Profile before you can register for tournaments.
              </p>
              <Link href="/profile/link" className="inline-block px-8 py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 transition-all">
                Link Profile Now
              </Link>
            </div>
          ) : isAlreadyRegistered ? (
            <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-3xl border border-green-200 dark:border-green-800/50">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-xl font-bold text-green-900 dark:text-green-400 mb-2">Registration Confirmed</h2>
              <p className="text-green-700 dark:text-green-500 mb-8">
                You are officially registered for this event. We'll notify you when the pairings for Round 1 are live.
              </p>
              <Link href="/dashboard" className="inline-block px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-2xl hover:scale-105 transition-all">
                Go to Dashboard
              </Link>
            </div>
          ) : isDeadlinePassed ? (
            <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-800/50">
              <p className="text-red-800 dark:text-red-400 font-bold">
                Registration for this tournament closed on {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(tournament.registrationDeadline!)}.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="p-8 bg-zinc-50 dark:bg-zinc-800 rounded-3xl space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-zinc-200 dark:border-zinc-700 pb-4">
                  <span className="text-zinc-500 font-bold uppercase tracking-widest">Player Name</span>
                  <span className="font-black text-zinc-900 dark:text-white">{player.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-zinc-200 dark:border-zinc-700 pb-4">
                  <span className="text-zinc-500 font-bold uppercase tracking-widest">Entry Fee</span>
                  <span className="font-black text-blue-600">UGX {(tournament.registrationFee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-bold uppercase tracking-widest">FIDE ELO</span>
                  <span className="font-black text-zinc-900 dark:text-white italic">{player.rating}</span>
                </div>
              </div>

              <div className="text-xs text-zinc-500 italic leading-relaxed text-center px-4">
                By registering, you agree to the Uganda Chess Federation's tournament rules and code of conduct. Entry fees must be cleared before Round 1.
              </div>

              <RegisterButton tournamentId={tournament.id} playerId={player.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
