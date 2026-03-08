"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ClubManagementClient({ 
  club, 
  initialPlayers 
}: { 
  club: any; 
  initialPlayers: any[] 
}) {
  const [players, setPlayers] = useState(initialPlayers);
  const [isLocking, setIsLocking] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleRemovePlayer = (playerId: string, playerName: string) => {
    if (playerName === club.captain) {
      alert("Cannot remove the Team Captain. Please appoint a new captain first.");
      return;
    }

    if (confirm(`Are you sure you want to remove ${playerName} from the roster?`)) {
      // Simulation: Update local state
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      alert(`${playerName} removed from roster (Simulation Mode)`);
    }
  };

  const handleAddPlayer = () => {
    const name = prompt("Enter Player Name:");
    if (!name) return;

    const rating = parseInt(prompt("Enter Player ELO Rating:", "1200") || "1200");
    
    setIsAdding(true);
    
    // Simulation
    setTimeout(() => {
      const newPlayer = {
        id: `p-new-${Date.now()}`,
        name,
        rating,
        clubId: club.id
      };
      setPlayers(prev => [...prev, newPlayer].sort((a, b) => b.rating - a.rating));
      setIsAdding(false);
      alert(`${name} added to roster (Simulation Mode)`);
    }, 800);
  };

  const handleLockRoster = () => {
    setIsLocking(true);
    // Simulation
    setTimeout(() => {
      alert("Roster has been LOCKED for the next League Round (Simulation Mode)");
      setIsLocking(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      {/* Club Admin Nav */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold tracking-tighter text-white">
                ♟️ ChessFed<span className="text-blue-500">UG</span>
              </Link>
              <span className="px-3 py-1 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest border border-zinc-700">
                Club Manager
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href={`/clubs/${club.id}`} className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Public Page</Link>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                {club.name.substring(0, 1)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter mb-2">{club.name}</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">League Operations Portal</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleAddPlayer}
              disabled={isAdding}
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl text-sm hover:scale-105 transition-all shadow-xl disabled:opacity-50 cursor-pointer"
            >
              {isAdding ? "ADDING..." : "+ ADD PLAYER"}
            </button>
            <button 
              onClick={handleLockRoster}
              disabled={isLocking}
              className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLocking ? "LOCKING..." : "LOCK LEAGUE ROSTER"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Roster Management */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Official 12-Man Roster</h3>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                {players.length} / 12 Slots Filled
              </span>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-none">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Player</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {players.map((p: any) => (
                    <tr key={p.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-bold text-zinc-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">ELO {p.rating}</p>
                      </td>
                      <td className="px-8 py-6">
                        {p.name === club.captain ? (
                          <span className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">Captain</span>
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Member</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleRemovePlayer(p.id, p.name)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition-colors cursor-pointer" 
                            title="Remove from Roster"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {players.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-zinc-500 italic font-medium">
                        No players found in this roster.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Club Info & Operations */}
          <div className="space-y-8">
            <section className="p-8 bg-zinc-900 text-white rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-blue-400">Club Ownership</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Owner Contact</p>
                  <p className="font-bold text-sm">{club.owner}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Registration Status</p>
                  <span className="px-3 py-1 rounded-full bg-green-600 text-white text-[10px] font-black">ACTIVE</span>
                </div>
              </div>
            </section>

            <section className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-6 italic">League Progress</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Match Points</span>
                  <span className="text-2xl font-black italic text-zinc-900 dark:text-white">12.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Game Points</span>
                  <span className="text-2xl font-black italic text-blue-600">42.5</span>
                </div>
              </div>
              <Link href="/league" className="block mt-8 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors">
                FULL LEAGUE TABLE →
              </Link>
            </section>

            <section className="p-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-[2.5rem]">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-amber-800 dark:text-amber-400 italic">Roster Rule</h3>
              <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-relaxed italic font-medium">
                Changes to the core 12-man roster must be finalized 48 hours before the start of any League Round. Locked rosters cannot be modified during active match days.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
