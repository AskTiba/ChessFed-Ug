import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface FidePlayerDetails {
  id: number;
  name: string;
  federation: string;
  year: number | null;
  sex?: string;
  title?: string;
  standard: number;
  rapid?: number;
  blitz?: number;
  games?: number;
  kFactor?: number;
  flag?: string | null;
  syncedAt?: string;
}

interface PlayerApiResponse {
  source: string;
  player: FidePlayerDetails;
}

async function getPlayerDetails(
  id: string
): Promise<{ player: FidePlayerDetails; source: string } | null> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // ─── Source 1: Our own API (checks DB first, then Lichess fallback) ───
  try {
    const res = await fetch(`${baseUrl}/api/fide/player/${id}`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data: PlayerApiResponse = await res.json();
      return { player: data.player, source: data.source };
    }
  } catch (err) {
    console.warn(`Own API failed for player ${id}, trying Lichess directly...`, err);
  }

  // ─── Source 2: Direct Lichess fallback (in case our API is down) ──────
  try {
    const res = await fetch(`https://lichess.org/api/fide/player/${id}`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        player: {
          id: data.id,
          name: data.name,
          federation: data.federation,
          year: data.year,
          title: data.title,
          standard: data.standard,
          rapid: data.rapid,
          blitz: data.blitz,
        },
        source: "lichess-direct",
      };
    }
  } catch (err) {
    console.error(`All sources failed for player ${id}:`, err);
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getPlayerDetails(id);

  if (!result) {
    return { title: "Player Not Found | ChessFed Uganda" };
  }

  return {
    title: `${result.player.name} — FIDE Profile | ChessFed Uganda`,
    description: `Official FIDE ratings and profile for ${result.player.name} (${result.player.federation}). Standard: ${result.player.standard}, Rapid: ${result.player.rapid || "N/A"}, Blitz: ${result.player.blitz || "N/A"}.`,
  };
}

export default async function PlayerProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const result = await getPlayerDetails(params.id);

  if (!result) {
    notFound();
  }

  const { player, source } = result;

  const ratings = [
    {
      label: "Standard",
      value: player.standard,
      color: "bg-blue-600",
      text: "text-blue-600",
    },
    {
      label: "Rapid",
      value: player.rapid || 0,
      color: "bg-purple-600",
      text: "text-purple-600",
    },
    {
      label: "Blitz",
      value: player.blitz || 0,
      color: "bg-orange-600",
      text: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      <header className="pt-32 pb-40 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 skew-x-12 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-8">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-zinc-800 rounded-[2.5rem] border-4 border-zinc-800 flex items-center justify-center text-6xl shadow-2xl overflow-hidden">
              {player.title ? (
                <span className="font-black italic text-blue-500 opacity-50">
                  {player.title}
                </span>
              ) : (
                <span className="opacity-20">♟️</span>
              )}
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                Official FIDE Profile
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight uppercase tracking-tighter italic">
                {player.name}
              </h1>
              <div className="flex flex-wrap gap-6 text-zinc-400 font-bold uppercase tracking-widest text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">Federation:</span>
                  <span className="text-white">{player.federation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">FIDE ID:</span>
                  <span className="text-white">{player.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-600">Born:</span>
                  <span className="text-white">{player.year || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Cards */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ratings.map((r) => (
                <div
                  key={r.label}
                  className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden group"
                >
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 ${r.color} opacity-5 rounded-full -mr-8 -mt-8 transition-all group-hover:scale-110`}
                  ></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                    {r.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-4xl font-black italic tracking-tighter ${r.text}`}
                    >
                      {r.value || "---"}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      ELO
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-zinc-900 p-12 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8">
                Performance Insights
              </h3>
              <div className="space-y-6">
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Dominant Format
                  </p>
                  <p className="text-lg font-black italic uppercase">
                    {player.standard >= (player.rapid || 0) &&
                    player.standard >= (player.blitz || 0)
                      ? "Classical Standard"
                      : (player.rapid || 0) >= (player.blitz || 0)
                      ? "Rapid Specialist"
                      : "Blitz Machine"}
                  </p>
                </div>
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    FIDE Title Status
                  </p>
                  <p className="text-lg font-black italic uppercase">
                    {player.title
                      ? `${player.title} (Confirmed)`
                      : "Candidate / Unrated"}
                  </p>
                </div>
                {player.flag === "i" && (
                  <div className="p-6 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                    <p className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-2">
                      Activity Status
                    </p>
                    <p className="text-lg font-black italic uppercase text-amber-700 dark:text-amber-400">
                      Inactive (No rated games recently)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Quick Stats */}
          <div className="space-y-8">
            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
              <h4 className="text-lg font-black italic uppercase tracking-tighter mb-4 relative z-10">
                Verification
              </h4>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs font-bold text-blue-100 uppercase">
                    FIDE Registered
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest bg-white text-blue-600 px-2 py-0.5 rounded">
                    YES
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs font-bold text-blue-100 uppercase">
                    Data Source
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest bg-white text-blue-600 px-2 py-0.5 rounded">
                    {source === "chessfed-db"
                      ? "Official"
                      : source === "lichess"
                      ? "Lichess"
                      : "Fallback"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs font-bold text-blue-100 uppercase">
                    Status
                  </span>
                  <span
                    className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      player.flag === "i"
                        ? "bg-amber-500 text-white"
                        : "bg-white text-blue-600"
                    }`}
                  >
                    {player.flag === "i" ? "INACTIVE" : "ACTIVE"}
                  </span>
                </div>
              </div>
              <Link
                href={`https://ratings.fide.com/profile/${player.id}`}
                target="_blank"
                className="mt-8 w-full block py-4 bg-zinc-900 text-white text-center font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all"
              >
                View on FIDE.com
              </Link>
            </div>

            <div className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
              <h4 className="text-sm font-black italic uppercase tracking-widest text-zinc-500 mb-6">
                Bio Notes
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium italic">
                Official player record for {player.name}. Ratings are synced
                monthly from the World Chess Federation (FIDE) official bulk
                download.
              </p>
              {player.syncedAt && (
                <p className="text-[10px] text-zinc-400 mt-4 font-bold uppercase tracking-widest">
                  Last synced:{" "}
                  {new Date(player.syncedAt).toLocaleDateString("en-UG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
