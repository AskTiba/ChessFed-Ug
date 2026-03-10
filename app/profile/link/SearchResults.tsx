"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { linkPlayerAction } from "./actions";
import { useRouter } from "next/navigation";

interface FidePlayer {
  id: number;
  name: string;
  federation: string;
  rating: number;
  title?: string;
}

interface SearchResultsProps {
  initialQuery: string;
  localPlayers: any[];
}

async function searchFidePlayers(query: string) {
  if (!query || query.length < 3) return [];
  
  // Searching the mirror for Ugandan players matching the query
  const res = await fetch(`https://fide-players.fly.dev/players/players.json?country=UGA&_size=10`);
  if (!res.ok) return [];
  const data = await res.json();
  
  const players = data.rows as FidePlayer[];
  return players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
}

export default function SearchResults({ initialQuery, localPlayers }: SearchResultsProps) {
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const router = useRouter();

  const { data: fidePlayers, isLoading: isLoadingFide } = useQuery({
    queryKey: ["fide-search", initialQuery],
    queryFn: () => searchFidePlayers(initialQuery),
    enabled: initialQuery.length >= 3,
  });

  const handleLink = async (playerId: string, isFide: boolean, fideData?: any) => {
    setIsLinking(playerId);
    
    // If it's a FIDE player not in our DB, we'd need a different action or handle it in the same one
    // For now, let's assume we can pass the data to linkPlayerAction which will handle import if needed
    const result = await linkPlayerAction(playerId, isFide ? fideData : undefined);
    
    if (result.success) {
      router.push("/dashboard");
    } else {
      alert(result.error);
      setIsLinking(null);
    }
  };

  if (!initialQuery) return null;

  const combinedPlayers = [...localPlayers.map(p => ({ ...p, isLocal: true }))];
  
  // Add FIDE players that aren't already in local results (avoid duplicates)
  if (fidePlayers) {
    fidePlayers.forEach(fp => {
      if (!combinedPlayers.some(lp => lp.fideId === fp.id.toString())) {
        combinedPlayers.push({
          id: fp.id.toString(),
          name: fp.name,
          fideId: fp.id.toString(),
          rating: fp.rating,
          isLocal: false,
          title: fp.title
        } as any);
      }
    });
  }

  return (
    <div className="space-y-4">
      {combinedPlayers.length > 0 ? (
        combinedPlayers.map((player) => (
          <div key={player.id} className="flex items-center justify-between p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/50 transition-all group">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-zinc-900 dark:text-white">{player.name}</p>
                {player.title && (
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded uppercase">
                        {player.title}
                    </span>
                )}
                {!player.isLocal && (
                    <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[8px] font-black rounded uppercase">FIDE Mirror</span>
                )}
              </div>
              <p className="text-xs text-zinc-500">FIDE: {player.fideId || "N/A"} | ELO: {player.rating}</p>
            </div>
            
            <button
                onClick={() => handleLink(player.id, !player.isLocal, player)}
                disabled={isLinking !== null}
                className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                    isLinking === player.id 
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                    : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-105 active:scale-95'
                }`}
            >
                {isLinking === player.id ? 'Linking...' : 'Link Profile'}
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-zinc-500 italic">No players found matching "{initialQuery}"</p>
          {isLoadingFide && <p className="text-xs text-blue-500 animate-pulse mt-2">Checking official FIDE records...</p>}
        </div>
      )}
    </div>
  );
}
