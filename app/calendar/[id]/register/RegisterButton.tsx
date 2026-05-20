"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerForTournamentAction } from "./actions";

export default function RegisterButton({ 
  tournamentId, 
  playerId 
}: { 
  tournamentId: string, 
  playerId: string 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!confirm("Are you sure you want to register for this tournament?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerForTournamentAction(tournamentId, playerId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to register.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRegister}
      disabled={isLoading}
      className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/25 disabled:opacity-50"
    >
      {isLoading ? "Processing Entry..." : "Confirm & Register"}
    </button>
  );
}
