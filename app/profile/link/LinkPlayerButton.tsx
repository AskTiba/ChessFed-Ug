"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { linkPlayerAction } from "./actions";

export default function LinkPlayerButton({ playerId }: { playerId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLink = async () => {
    if (!confirm("Are you sure this is you? Linking is permanent and can only be changed by federation admins.")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await linkPlayerAction(playerId);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert(result.error || "Failed to link profile.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLink}
      disabled={isLoading}
      className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full text-xs font-bold hover:scale-105 transition-all disabled:opacity-50"
    >
      {isLoading ? "Linking..." : "This is Me"}
    </button>
  );
}
