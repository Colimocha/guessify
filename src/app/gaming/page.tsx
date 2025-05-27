"use client";
import { useSession } from "next-auth/react";
import { usePlayerConfigStore } from "../_store/player-config";

export default function Gaming() {
  const { data: session, status } = useSession();
  const {
    playlists,
    setPlaylists,
    selectedPlaylist,
    setSelectedPlaylist,
    countdown,
    setCountdown,
    intervalMode,
    setIntervalMode,
  } = usePlayerConfigStore();

  return (
    <>
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 py-16">
        <div className="card bg-base-100 w-full max-w-4xl p-6 shadow-sm">
          <h2 className="text-lg font-bold">Debug Information</h2>
          <pre className="text-sm break-all whitespace-pre-wrap">
            {JSON.stringify(
              {
                session,
                selectedPlaylist,
                countdown,
                intervalMode,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </>
  );
}
