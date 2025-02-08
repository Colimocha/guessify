"use client";

import { type SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";

interface PlaylistSelectorProps {
  playlists: SimplifiedPlaylist[];
  onPlaylistSelect: (playlistId: string) => void;
  onCountDown: (countdown: number) => void;
}

export function PlaylistSelector({
  playlists,
  onPlaylistSelect,
  onCountDown,
}: PlaylistSelectorProps) {
  return (
    <div className="join mb-6 flex justify-center w-96">
      <select
        className="max-w-s join-item select w-full"
        onChange={(e) => onPlaylistSelect(e.target.value)}
      >
        <option value="">加载歌单</option>
        {playlists.map((playlist) => (
          <option key={playlist.id} value={playlist.uri}>
            {playlist.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Countdown"
        className="input join-item w-full max-w-xs"
        onInput={(e) => onCountDown(Number(e.currentTarget.value))}
        defaultValue={5}
      />
    </div>
  );
}
