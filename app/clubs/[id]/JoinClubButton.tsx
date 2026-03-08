"use client";

import { useState } from "react";

export default function JoinClubButton({ clubName }: { clubName: string }) {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = () => {
    setIsLoading(true);
    // Simulation
    setTimeout(() => {
      setIsLoading(false);
      setIsJoined(true);
      alert(`Request to join ${clubName} sent successfully (Simulation Mode)`);
    }, 1200);
  };

  if (isJoined) {
    return (
      <button 
        disabled
        className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-black rounded-2xl text-sm uppercase tracking-widest cursor-not-allowed"
      >
        REQUEST PENDING
      </button>
    );
  }

  return (
    <button 
      onClick={handleJoin}
      disabled={isLoading}
      className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl text-sm hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer uppercase tracking-widest"
    >
      {isLoading ? "SENDING..." : "JOIN THIS CLUB"}
    </button>
  );
}
