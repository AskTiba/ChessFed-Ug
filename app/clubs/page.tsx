import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ClubListClient from "./ClubListClient";

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const clubs = await prisma.club.findMany({
    orderBy: { name: 'asc' }
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
            The foundation of Ugandan chess. Explore the 57 official clubs that compete in the National League, their leadership, and elite player rosters.
          </p>
        </header>

        <ClubListClient initialClubs={clubs as any} />
      </main>
    </div>
  );
}
