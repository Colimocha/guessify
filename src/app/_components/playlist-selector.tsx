"use client";

import { type SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";

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
        defaultValue={""}
        onChange={(e) => onPlaylistSelect(e.target.value)}
      >
        <option value="" disabled>
          加载歌单
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
        <option value="5" disabled>
          选择秒数
        </option>
        {[1, 2, 3, 5, 10, 15, 20, 30, 60].map((countdown) => (
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
        <option value="0" disabled>
          选择区间
        </option>
        {[
          { name: "前奏", value: 0 },
          { name: "随机", value: 1 },
        ].map((data) => (
          <option key={data.name} value={data.value}>
            {data.name}
          </option>
        ))}
      </select>
      {/* <input
        type="number"
        step={5}
        placeholder="Countdown"
        className="input join-item w-full max-w-xs"
        onInput={(e) => onCountDown(Number(e.currentTarget.value))}
        defaultValue={5}
      /> */}
    </div>
  );
}
