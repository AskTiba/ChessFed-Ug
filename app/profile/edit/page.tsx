import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfileEditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { player: true }
  });

  const player = user?.player;

  if (!player) {
    redirect("/profile/link");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 max-w-3xl mx-auto px-4">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic mb-4">
            Edit Federation Profile
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage your public information, club affiliations, and contact details.
          </p>
        </header>

        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl p-8 md:p-12">
          <div className="flex items-center gap-6 mb-12 p-6 bg-zinc-50 dark:bg-zinc-800 rounded-3xl border border-zinc-100 dark:border-zinc-700">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black italic">
              {player.name.substring(0, 1)}
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">{player.name}</p>
              <p className="text-sm text-zinc-500 font-medium">FIDE ID: {player.fideId || "Unlinked"}</p>
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mt-1 italic">Verified Master Record</p>
            </div>
          </div>

          <ProfileForm player={player} />
        </div>

        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-2xl text-xs text-amber-800 dark:text-amber-400 leading-relaxed italic">
          <strong>Note:</strong> Sensitive information like your Name and FIDE ID are locked to your official federation record. If you need to correct these, please submit a "Correction Request" to the Federation Admin.
        </div>
      </main>
    </div>
  );
}
