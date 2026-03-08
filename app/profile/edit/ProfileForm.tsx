"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "./actions";

export default function ProfileForm({ player }: { player: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      club: formData.get("club") as string,
      region: formData.get("region") as string,
      bio: formData.get("bio") as string,
    };

    try {
      const result = await updateProfileAction(data);
      if (result.success) {
        alert("Profile updated successfully (Simulation Mode)");
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Failed to update profile.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Club Affiliation */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Current Club</label>
          <input
            name="club"
            type="text"
            placeholder="e.g. Kireka Chess Club"
            className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            defaultValue={player?.club || "Kireka Chess Club"}
          />
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Region / City</label>
          <select 
            name="region"
            className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium appearance-none"
          >
            <option value="Central (Kampala)">Central (Kampala)</option>
            <option value="Western (Mbarara)">Western (Mbarara)</option>
            <option value="Eastern (Jinja)">Eastern (Jinja)</option>
            <option value="Northern (Gulu)">Northern (Gulu)</option>
          </select>
        </div>
      </div>

      {/* Bio / Experience */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Professional Bio</label>
        <textarea
          name="bio"
          rows={4}
          placeholder="Tell the federation about your chess journey..."
          className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium resize-none"
          defaultValue="Active FIDE-rated player since 2018. Represented Uganda in regional youth games."
        ></textarea>
      </div>

      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          Discard Changes
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-500/25 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
