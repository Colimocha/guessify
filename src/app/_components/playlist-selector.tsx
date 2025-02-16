"use client";

import { type SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";

const COUNTDOWN_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30, 60];

const INTERVAL_OPTIONS = [
  { name: "Presage", value: 0 },
  { name: "RandomS", value: 1 },
  { name: "RandomR", value: 2 },
] as const;

interface PlaylistSelectorProps {
  playlists: SimplifiedPlaylist[];
  onPlaylistSelect: (playlistId: string) => void;
  onCountDown: (countdown: number) => void;
  onIntervalValue: (value: number) => void;
}

export function PlaylistSelector({
  playlists,
  onPlaylistSelect,
  onCountDown,
  onIntervalValue,
}: PlaylistSelectorProps) {
  return (
    <div className="join mb-6 flex w-96 justify-center">
      <select
        className="max-w-s join-item select w-full"
        defaultValue=""
        onChange={(e) => onPlaylistSelect(e.target.value)}
      >
        <option value="" disabled>
          Playlist
        </option>
        {playlists.map((playlist) => (
          <option key={playlist.id} value={playlist.uri}>
            {playlist.name}
          </option>
        ))}
      </select>
      <select
        className="max-w-s join-item select w-full"
        defaultValue={5}
        onChange={(e) => onCountDown(Number(e.currentTarget.value))}
      >
        <option value="" disabled>
          Seconds
        </option>
        {COUNTDOWN_OPTIONS.map((countdown) => (
          <option key={countdown} value={countdown}>
            {countdown}
          </option>
        ))}
      </select>
      <select
        className="max-w-s join-item select w-full"
        defaultValue={0}
        onChange={(e) => onIntervalValue(Number(e.currentTarget.value))}
      >
        <option value="" disabled>
          Interval
        </option>
        {INTERVAL_OPTIONS.map((data) => (
          <option key={data.name} value={data.value}>
            {data.name}
          </option>
        ))}
      </select>
    </div>
  );
}
