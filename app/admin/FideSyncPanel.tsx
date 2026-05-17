"use client";

import { useState, useEffect } from "react";

interface SyncStatus {
  lastSync: {
    id: string;
    syncedAt: string;
    period: string;
    totalRows: number;
    status: string;
    error: string | null;
  } | null;
  totalPlayersInDb: number;
}

export default function FideSyncPanel() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Fetch current sync status on mount
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  async function fetchSyncStatus() {
    try {
      const res = await fetch("/api/fide/sync");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // Silent fail — status display is best-effort
    }
  }

  async function triggerSync() {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      const res = await fetch("/api/fide/sync", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setSyncResult(
          `✅ Successfully synced ${data.totalPlayers} players (${data.period}) in ${data.elapsedSeconds}s`
        );
        // Refresh status
        await fetchSyncStatus();
      } else {
        setSyncError(data.error || "Sync failed with unknown error");
      }
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : "Network error during sync"
      );
    } finally {
      setIsSyncing(false);
    }
  }

  const lastSync = status?.lastSync;
  const isStale =
    lastSync &&
    new Date().getTime() - new Date(lastSync.syncedAt).getTime() >
      45 * 24 * 60 * 60 * 1000; // 45 days

  return (
    <section className="p-8 bg-zinc-900 text-white rounded-[2.5rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-green-400">
            FIDE Data Sync
          </h3>
          {status && (
            <span
              className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                status.totalPlayersInDb > 0
                  ? "bg-green-600/20 text-green-400 border border-green-500/30"
                  : "bg-red-600/20 text-red-400 border border-red-500/30"
              }`}
            >
              {status.totalPlayersInDb > 0
                ? `${status.totalPlayersInDb} Players`
                : "Not Synced"}
            </span>
          )}
        </div>

        {/* Status Display */}
        {lastSync && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-bold uppercase">
                Last Sync
              </span>
              <span
                className={`font-bold ${
                  isStale ? "text-amber-400" : "text-zinc-300"
                }`}
              >
                {new Date(lastSync.syncedAt).toLocaleDateString("en-UG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-bold uppercase">Period</span>
              <span className="text-zinc-300 font-bold">{lastSync.period}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-bold uppercase">Status</span>
              <span
                className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                  lastSync.status === "SUCCESS"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-red-600/20 text-red-400"
                }`}
              >
                {lastSync.status}
              </span>
            </div>
            {isStale && (
              <div className="p-3 bg-amber-600/10 border border-amber-500/20 rounded-xl mt-2">
                <p className="text-[10px] text-amber-400 font-bold uppercase">
                  ⚠️ Data is over 45 days old. Consider re-syncing.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sync Result/Error */}
        {syncResult && (
          <div className="p-3 bg-green-600/10 border border-green-500/20 rounded-xl mb-4">
            <p className="text-xs text-green-400 font-bold">{syncResult}</p>
          </div>
        )}
        {syncError && (
          <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-xl mb-4">
            <p className="text-xs text-red-400 font-bold">❌ {syncError}</p>
          </div>
        )}

        {/* Sync Button */}
        <button
          onClick={triggerSync}
          disabled={isSyncing}
          className={`w-full py-4 font-black rounded-2xl text-xs uppercase tracking-widest transition-all ${
            isSyncing
              ? "bg-zinc-800 text-zinc-500 cursor-wait"
              : "bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02] shadow-lg shadow-green-500/20"
          }`}
        >
          {isSyncing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin"></span>
              Downloading FIDE Data...
            </span>
          ) : (
            "Sync FIDE Rankings Now"
          )}
        </button>

        <p className="text-[9px] text-zinc-600 mt-3 text-center italic">
          Downloads ~46MB from ratings.fide.com and updates the database.
          <br />
          FIDE publishes new ratings on the 1st of each month.
        </p>
      </div>
    </section>
  );
}
