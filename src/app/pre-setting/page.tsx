"use client";

import type { PlaylistedTrack, Track } from "@spotify/web-api-ts-sdk";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { usePlayerConfigStore } from "../_store/player-config";

const COUNTDOWN_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30, 60] as const;
const INTERVAL_OPTIONS = [
  { name: "Presage Interval", value: 0 },
  { name: "Random Single Interval", value: 1 },
  { name: "Random Any Interval", value: 2 },
] as const;

export default function PreSetting() {
  const { data: session, status } = useSession();
  const [isShowDebug, setIsShowDebug] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    playlists,
    setPlaylists,
    selectedPlaylist,
    setSelectedPlaylist,
    countdown,
    setCountdown,
    intervalMode,
    setIntervalMode,
    gameTracks,
    setGameTracks,
    setCurrentTrack,
    setCurrentTrackIndex,
    setTotalTrackCount,
    currentTrack,
  } = usePlayerConfigStore();

  const { data: playlistData, isLoading: playlistLoading } =
    api.spotify.getUserPlaylists.useQuery(undefined, {
      enabled: status === "authenticated",
    });
  useEffect(() => {
    if (playlistData?.items) setPlaylists(playlistData.items);
  }, [playlistData, setPlaylists]);

  const { data: isPremium, isLoading: isPremiumLoading } =
    api.spotify.getCurrentUserIsPremium.useQuery(undefined, {
      enabled: status === "authenticated",
    });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  const setGameTracksSafe = setGameTracks ?? (() => undefined);
  const setCurrentTrackSafe = setCurrentTrack ?? (() => undefined);
  const setCurrentTrackIndexSafe = setCurrentTrackIndex ?? (() => undefined);
  const setTotalTrackCountSafe = setTotalTrackCount ?? (() => undefined);
  const getPlayerListMutation = api.spotify.getPlayerList.useMutation();

  function shuffleArray<T>(array: T[]): T[] {
    const arr: T[] = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp: T = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = temp;
    }
    return arr;
  }

  async function handlePlayClick() {
    if (!selectedPlaylist) return;
    setLoading(true);
    try {
      // 获取歌单所有歌曲
      const res = await getPlayerListMutation.mutateAsync(selectedPlaylist.id);
      const tracks = (res.items ?? [])
        .map((item: PlaylistedTrack<Track>) => item.track)
        .filter((t): t is Track => Boolean(t));
      const shuffledTracks = shuffleArray(tracks);
      setGameTracksSafe(shuffledTracks);
      setCurrentTrackSafe(shuffledTracks[0] ?? null);
      setCurrentTrackIndexSafe(0);
      setTotalTrackCountSafe(shuffledTracks.length);
      router.push("/gaming");
    } catch {
      alert("获取歌单歌曲失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 py-16">
      <div className="card bg-base-100 w-full flex-row items-center gap-4 rounded-lg p-6 shadow-sm">
        <span
          className={`badge ${status === "authenticated" ? "badge-success" : "badge-error"}`}
        >
          {status === "authenticated"
            ? "Spotify Connected"
            : "Spotify Not Connected"}
        </span>

        {isPremiumLoading ? (
          <span
            className={`badge ${isPremium ? "badge-info" : "badge-warning"}`}
          >
            <span className="loading loading-spinner loading-xs"></span>{" "}
            Checking Premium Status...
          </span>
        ) : (
          <span
            className={`badge ${isPremium ? "badge-info" : "badge-warning"}`}
          >
            {isPremium ? "Premium" : "Non-Premium"}
          </span>
        )}

        {/* show/hide debug information */}
        <label className="toggle text-base-content">
          <input
            type="checkbox"
            checked={isShowDebug}
            onChange={(e) => {
              setIsShowDebug(e.target.checked);
            }}
          />
          <svg
            aria-label="enabled"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="4"
              fill="none"
              stroke="currentColor"
            >
              <path d="M20 6 9 17l-5-5"></path>
            </g>
          </svg>
          <svg
            aria-label="disabled"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </label>

        <button
          className="btn btn-primary absolute end-5"
          disabled={!selectedPlaylist || loading}
          onClick={handlePlayClick}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Loading...
            </>
          ) : (
            "Play!"
          )}
        </button>
      </div>
      <div className="card bg-base-100 w-full flex-row gap-8 rounded-lg p-6 shadow-sm">
        {/* 左侧 歌单选择 */}
        <div className="flex w-1/2 flex-col gap-4">
          {/* 显示你选中的歌单 */}
          {selectedPlaylist ? (
            <div className="flex items-center gap-3 border-b-2 p-2">
              {selectedPlaylist.images?.[0]?.url && (
                <Image
                  src={selectedPlaylist.images[0].url}
                  alt={selectedPlaylist.name}
                  width={48}
                  height={48}
                  className="rounded"
                />
              )}
              <span className="truncate">{selectedPlaylist.name}</span>
            </div>
          ) : (
            <div className="text-base-content/60 p-4 text-center">
              Choose a playlist to start
            </div>
          )}

          <div className="divide-base-200 bg-base-100 max-h-80 divide-y overflow-y-auto rounded-lg shadow">
            {playlistLoading && (
              <div className="p-4 text-center">Loading...</div>
            )}

            {/* 歌单列表 */}
            {!playlistLoading &&
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className={`hover:bg-base-200 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition`}
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  {playlist.images?.[0]?.url && (
                    <Image
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      width={48}
                      height={48}
                      className="rounded"
                    />
                  )}
                  <span className="truncate">{playlist.name}</span>
                </div>
              ))}
            {!playlistLoading && playlists.length === 0 && (
              <div className="text-base-content/60 py-4 text-center">
                No playlists found. Please create a playlist on Spotify.
              </div>
            )}
          </div>
        </div>
        {/* 右侧 玩法设置 */}
        <div className="flex w-1/2 flex-col gap-6">
          <div>
            <label className="label w-full">Countdown</label>

            <div className="join mt-2">
              {COUNTDOWN_OPTIONS.map((count) => (
                <input
                  key={count}
                  type="radio"
                  name="countdown"
                  className="join-item btn"
                  aria-label={`${count}`}
                  value={count}
                  checked={countdown === count}
                  onChange={() => setCountdown(count)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label w-full">Interval Mode</label>
            <div className="join join-vertical mt-2 w-full">
              {INTERVAL_OPTIONS.map((data) => (
                <input
                  key={data.value}
                  type="radio"
                  name="intervalMode"
                  className="join-item btn"
                  aria-label={data.name}
                  value={data.value}
                  checked={intervalMode === data.value}
                  onChange={() => setIntervalMode(data.value)}
                />
              ))}
            </div>
          </div>
          <div className="label">New gameplay is coming soon!</div>
        </div>
      </div>

      {/* Debug status */}
      {!isShowDebug && (
        <div className="card bg-base-100 w-full max-w-4xl p-6 shadow-sm">
          <h2 className="text-lg font-bold">Debug Information</h2>
          <pre className="text-sm break-all whitespace-pre-wrap">
            {gameTracks && gameTracks?.length > 0
              ? `Game Tracks: ${gameTracks?.length} tracks: ${gameTracks
                  .map((t) => t.name)
                  .join(", ")}`
              : "No game tracks loaded yet."}
            <br />
            <br />
            {JSON.stringify(
              {
                session,
                selectedPlaylist,
                countdown,
                intervalMode,
                currentTrack,
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
