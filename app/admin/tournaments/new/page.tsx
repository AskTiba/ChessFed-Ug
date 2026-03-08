"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createTournamentAction } from "./actions";

export default function NewTournamentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      format: formData.get("format") as string,
      isGrandPrix: formData.get("isGrandPrix") === "on",
      startDate: formData.get("startDate") as string,
      totalRounds: parseInt(formData.get("totalRounds") as string || "7"),
      registrationDeadline: formData.get("registrationDeadline") as string,
      prizeFund: parseInt(formData.get("prizeFund") as string || "0"),
      registrationFee: parseInt(formData.get("registrationFee") as string || "0"),
    };

    try {
      const result = await createTournamentAction(data);
      if (result.success) {
        alert("Tournament created successfully (Simulation Mode)");
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Failed to create tournament.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans pb-20">
      <nav className="fixed top-0 w-full z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/admin" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Oversight
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 max-w-4xl mx-auto px-4">
        <header className="mb-12">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic uppercase tracking-tighter mb-2">Initialize Event</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs text-blue-600">Registering a new entity in the 2026 Federation Calendar</p>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-10 md:p-16 space-y-10">
          
          {/* Basic Info Section */}
          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-4">1. Core Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Official Name</label>
                <input name="name" required type="text" placeholder="e.g. Uganda Open 2026" className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Event Format</label>
                <select name="format" className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold appearance-none">
                  <option value="Swiss System">Swiss System</option>
                  <option value="Round Robin">Round Robin</option>
                  <option value="Double Round Robin">Double Round Robin</option>
                  <option value="Knockout">Knockout</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50">
              <input name="isGrandPrix" type="checkbox" id="gp" className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
              <label htmlFor="gp" className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest italic cursor-pointer">Designate as Grand Prix Event</label>
            </div>
          </section>

          {/* Logistics Section */}
          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-4">2. Logistics & Deadlines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Start Date</label>
                <input name="startDate" required type="date" className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Total Rounds</label>
                <input name="totalRounds" required type="number" defaultValue={7} className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Reg. Deadline</label>
                <input name="registrationDeadline" required type="date" className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
              </div>
            </div>
          </section>

          {/* Financials Section */}
          <section className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-4">3. Prize Fund & Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Prize Fund (UGX)</label>
                <input name="prizeFund" required type="number" placeholder="5,000,000" className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-green-600" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Entry Fee (UGX)</label>
                <input name="registrationFee" required type="number" placeholder="30,000" className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
              </div>
            </div>
          </section>

          <div className="pt-10 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-12 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-105 transition-all shadow-2xl disabled:opacity-50 uppercase tracking-widest italic"
            >
              {isLoading ? "Broadcasting..." : "PUBLISH TO CALENDAR"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
