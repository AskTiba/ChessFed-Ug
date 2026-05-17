"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PlayerReport {
  rank: number;
  name: string;
  fideId: string | null;
  rating: number;
  points: number;
  matched: boolean;
  dbPlayerName?: string;
  dbPlayerRating?: number;
  dbPlayerId?: string;
  federation?: string;
}

interface DryRunResponse {
  success: boolean;
  dryRun: boolean;
  meta: {
    name: string;
    venue: string;
    city: string;
    startDate: string;
    endDate: string;
    rounds: number;
    totalPlayers: number;
    matchedCount: number;
    unmatchedCount: number;
  };
  players: PlayerReport[];
}

export default function AdminImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form Configuration States
  const [isGrandPrix, setIsGrandPrix] = useState(false);
  const [autoCreatePlayers, setAutoCreatePlayers] = useState(true);
  
  // Loading & Data States
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [report, setReport] = useState<DryRunResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"matched" | "unmatched">("matched");

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setReport(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      if (["trf", "txt", "csv", "tsv"].includes(ext || "")) {
        setFile(selectedFile);
        triggerDryRun(selectedFile);
      } else {
        setError("Unsupported file format! Please upload a FIDE .trf, .txt, or .csv spreadsheet.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setReport(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      triggerDryRun(selectedFile);
    }
  };

  // Dry-Run Validation Fetch
  const triggerDryRun = async (selectedFile: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("isGrandPrix", isGrandPrix.toString());
      formData.append("dryRun", "true");
      formData.append("autoCreatePlayers", autoCreatePlayers.toString());

      const res = await fetch("/api/admin/import-tournament", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to validate tournament file.");
      }

      setReport(data);
    } catch (err) {
      setError((err as Error).message);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  // Final Seeding Execution Trigger
  const handleImportExecute = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isGrandPrix", isGrandPrix.toString());
      formData.append("dryRun", "false");
      formData.append("autoCreatePlayers", autoCreatePlayers.toString());

      const res = await fetch("/api/admin/import-tournament", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete tournament import.");
      }

      setSuccessMsg(data.message);
      setTimeout(() => {
        router.push(`/tournaments/${data.tournamentId}`);
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setReport(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans pb-20 text-white pt-24">
      {/* Admin Nav */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold tracking-tighter text-white">
                ♟️ ChessFed<span className="text-blue-500">UG</span>
              </Link>
              <span className="px-3 py-1 rounded-md bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                Universal Importer
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">
            Tournament Importer
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
            Seed Off-Line Standings, Pairings & Ratings to Supabase
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Controls & File Drop Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] space-y-6">
              <h2 className="text-lg font-black uppercase tracking-tighter italic text-blue-400">
                1. Import Settings
              </h2>

              {/* Grand Prix Switch */}
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold text-sm">Grand Prix Event</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Distribute GP points to Top 5</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isGrandPrix}
                    onChange={(e) => setIsGrandPrix(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </label>
              </div>

              {/* Auto Create Players Switch */}
              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-bold text-sm">Auto-Register Players</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Register unmatched players as members</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCreatePlayers}
                    onChange={(e) => setAutoCreatePlayers(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`relative p-10 bg-zinc-900/40 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging ? "border-blue-500 bg-blue-500/5 shadow-2xl shadow-blue-500/10" : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".trf,.txt,.csv,.tsv"
                className="hidden"
              />

              {!file ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white mb-6 group-hover:scale-105 transition-transform">
                    ♟️
                  </div>
                  <h3 className="font-bold text-sm mb-2">Drag & Drop Tournament File</h3>
                  <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">
                    Supports FIDE TRF (.trf, .txt) and Excel sheets (.csv, .tsv)
                  </p>
                </>
              ) : (
                <div className="w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    File Loaded
                  </div>
                  <p className="font-bold text-sm truncate max-w-[200px] mx-auto text-white">{file.name}</p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="mt-6 px-4 py-2 bg-red-950/40 text-red-400 hover:bg-red-950/80 rounded-full text-xs font-black uppercase tracking-widest border border-red-900/30 transition-all"
                  >
                    Clear File
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-6 bg-red-950/20 border border-red-900/40 rounded-[2rem] text-red-400 text-xs font-bold leading-relaxed">
                ⚠️ {error}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-6 bg-emerald-950/20 border border-emerald-900/40 rounded-[2rem] text-emerald-400 text-xs font-bold leading-relaxed animate-pulse">
                🎉 {successMsg} redirecting...
              </div>
            )}

            {/* Execute Import Button */}
            {report && !successMsg && (
              <button
                onClick={handleImportExecute}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "EXECUTE SEEDING TRANSACTION"
                )}
              </button>
            )}
          </div>

          {/* Dry-Run Report Preview Column */}
          <div className="lg:col-span-2">
            {!report ? (
              <div className="h-full min-h-[300px] border border-zinc-800 rounded-[2.5rem] bg-zinc-900/10 flex flex-col items-center justify-center p-12 text-center text-zinc-500 font-bold italic">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    Parsing FIDE Data Matrix...
                  </>
                ) : (
                  "Upload a file to preview data resolution."
                )}
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                {/* Metadata Dashboard */}
                <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[2.5rem]">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
                    Dry-Run Preview Successful
                  </span>
                  
                  <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-6 leading-none truncate">
                    {report.meta.name}
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "Rounds Parsed", val: report.meta.rounds },
                      { label: "Total Players", val: report.meta.totalPlayers },
                      { label: "Matched Members", val: report.meta.matchedCount, color: "text-emerald-400" },
                      { label: "Unmatched Guests", val: report.meta.unmatchedCount, color: report.meta.unmatchedCount > 0 ? "text-yellow-500" : "text-zinc-500" }
                    ].map((stat, idx) => (
                      <div key={idx} className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-xl font-black italic ${stat.color || "text-white"}`}>{stat.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player List Roster Match Comparison */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                  <div className="flex border-b border-zinc-800 bg-zinc-900/50 p-4">
                    <button
                      onClick={() => setActiveTab("matched")}
                      className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === "matched" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      Matched ({report.meta.matchedCount})
                    </button>
                    <button
                      onClick={() => setActiveTab("unmatched")}
                      className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === "unmatched" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      Unmatched ({report.meta.unmatchedCount})
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="overflow-x-auto max-h-[400px]">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            <th className="pb-4">Rank</th>
                            <th className="pb-4">Player Details</th>
                            <th className="pb-4">FIDE ID</th>
                            <th className="pb-4 text-center">Score</th>
                            <th className="pb-4 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                          {report.players
                            .filter(p => (activeTab === "matched" ? p.matched : !p.matched))
                            .map((p, idx) => (
                              <tr key={idx} className="group hover:bg-white/5 transition-colors">
                                <td className="py-4 font-black italic text-zinc-600 text-sm">{p.rank}</td>
                                <td className="py-4">
                                  <p className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">{p.name}</p>
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">ELO {p.rating}</span>
                                </td>
                                <td className="py-4 font-mono text-zinc-400 text-xs">{p.fideId || "N/A"}</td>
                                <td className="py-4 text-center font-black text-white italic">{p.points.toFixed(1)}</td>
                                <td className="py-4 text-right">
                                  {p.matched ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-900/30">
                                      ✓ Matched
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-950/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-900/30">
                                      {autoCreatePlayers ? "+ Register" : "⚠️ Unmatched"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
