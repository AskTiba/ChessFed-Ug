"use client";

import { useState } from "react";

export default function ChessResultsArchivePanel() {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [rawData, setRawData] = useState("");
  const [overWriteExisting, setOverWriteExisting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isHydratingAll, setIsHydratingAll] = useState(false);
  const [hydrationStatus, setHydrationStatus] = useState<string | null>(null);

  const handleHydrateAll = async () => {
    if (!result?.importedTournaments?.length) return;
    setIsHydratingAll(true);
    setHydrationStatus("Initializing background scraper loop...");

    const list = result.importedTournaments;
    let successCount = 0;

    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      setHydrationStatus(`Scraping & Archiving ${i + 1} of ${list.length}: ${t.name} (crId: ${t.crId})...`);
      try {
        await fetch(`/api/external/chess-results?id=${t.crId}&view=standings`);
        await fetch(`/api/external/chess-results?id=${t.crId}&view=roster`);
        await fetch(`/api/external/chess-results?id=${t.crId}&view=pairings&rd=1`);
        successCount++;
      } catch (err: any) {
        console.error(`Failed to hydrate ${t.crId}:`, err);
      }
    }

    setHydrationStatus(`🎉 Background Hydration Complete! Successfully populated ${successCount} of ${list.length} tournament archives into permanent PostgreSQL storage.`);
    setIsHydratingAll(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawData(text);
        setActiveTab("paste"); // Switch to paste tab so they can see/edit the loaded text
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawData.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/archive-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawData, overWriteExisting }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message || "An unknown error occurred during import." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="p-8 bg-zinc-900 text-white rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <header className="mb-6 flex justify-between items-start">
        <div>
          <span className="px-3 py-1 rounded-md bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30 mb-3 inline-block">
            Option A Seeding Engine
          </span>
          <h3 className="text-xl font-black tracking-tighter text-white italic uppercase">
            Chess-Results Bulk Archive
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Import years of historical tournaments (2014–Date) instantly via Excel/CSV exports.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-zinc-800/50 p-1 rounded-xl mb-6 border border-zinc-700/50">
        <button
          type="button"
          onClick={() => setActiveTab("paste")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "paste"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          📋 Raw Text Paste
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === "upload"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          📁 Upload Excel / CSV
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "paste" ? (
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
              Paste Excel Rows / CSV Data
            </label>
            <textarea
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="1380546; 2026 Africa Youth Chess Championship; UCF; Arbiter Name; Kampala; 2026/01/01; 2026/01/05&#10;1015694; 2025 National Open..."
              rows={6}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-200 font-mono focus:border-blue-500 focus:outline-none transition-colors placeholder:text-zinc-700"
            ></textarea>
          </div>
        ) : (
          <div className="border-2 border-dashed border-zinc-700 hover:border-blue-500 bg-zinc-950/50 rounded-2xl p-8 text-center transition-colors group cursor-pointer relative">
            <input
              type="file"
              accept=".csv,.tsv,.txt,.xls,.xlsx"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <svg
              className="w-10 h-10 mx-auto mb-3 text-zinc-600 group-hover:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xs font-bold text-zinc-300 mb-1">Drag & Drop your Chess-Results export</p>
            <p className="text-[10px] text-zinc-500 font-medium">Supports .xls (HTML), .csv, .tsv, and .txt</p>
          </div>
        )}

        {/* Options */}
        <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
          <label htmlFor="overwrite" className="text-xs font-bold text-zinc-300 cursor-pointer">
            Overwrite existing tournament details
          </label>
          <input
            id="overwrite"
            type="checkbox"
            checked={overWriteExisting}
            onChange={(e) => setOverWriteExisting(e.target.checked)}
            className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !rawData.trim()}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>PROCESSING ARCHIVE SEEDING...</span>
            </>
          ) : (
            <span>⚡ EXECUTE BULK ARCHIVE SEEDING</span>
          )}
        </button>
      </form>

      {/* Results Display */}
      {result && (
        <div className={`mt-6 p-6 rounded-2xl border ${result.success ? "bg-green-950/40 border-green-800/50 text-green-200" : "bg-red-950/40 border-red-800/50 text-red-200"}`}>
          {result.success ? (
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                <span>🎉 SEEDING SUCCESSFUL</span>
                <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px]">
                  {result.importedCount} Imported
                </span>
              </h4>
              <p className="text-xs text-green-300/80 mb-4 font-medium">
                Successfully populated database with historical records. Attached crIds are now active for Option A Lichess/Chess-Results lookups!
              </p>

              {/* Background Hydration Button */}
              <div className="mb-6 p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-black text-white uppercase tracking-wider">
                      ⚡ Step 2: Hydrate Full Standings & Pairings
                    </h5>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Automatically scrape & archive detailed team standings, player rosters, and round 1 pairings into permanent database storage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleHydrateAll}
                    disabled={isHydratingAll}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    {isHydratingAll ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>HYDRATING ARCHIVES...</span>
                      </>
                    ) : (
                      <span>⚡ HYDRATE ALL {result.importedCount} ARCHIVES</span>
                    )}
                  </button>
                </div>

                {hydrationStatus && (
                  <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl text-[11px] font-mono text-blue-200 animate-fade-in">
                    {hydrationStatus}
                  </div>
                )}
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1 pr-2 text-[10px] font-mono divide-y divide-green-800/30">
                {result.importedTournaments?.map((t: any) => (
                  <div key={t.id} className="py-1 flex justify-between items-center">
                    <span className="font-bold truncate max-w-[200px]">{t.name}</span>
                    <span className="text-green-400">crId: {t.crId}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-1">⚠️ SEEDING FAILED</h4>
              <p className="text-xs text-red-300 font-medium">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
