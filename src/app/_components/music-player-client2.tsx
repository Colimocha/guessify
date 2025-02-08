"use client";

import {
  type Playlist,
  type PlaylistedTrack,
  type SimplifiedPlaylist,
  type Track,
} from "@spotify/web-api-ts-sdk";
import { useState } from "react";
import { type SpotifyPlayer } from "spotify-web-playback-ts";
import { api } from "~/trpc/react";
import { PlaylistSelector } from "./playlist-selector";

interface MusicPlayerClientProps {
  playlists: SimplifiedPlaylist[];
  token: string;
}

export function MusicPlayerClient2({
  playlists,
  token,
}: MusicPlayerClientProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [playlist, setPlaylist] = useState<
    PlaylistedTrack<Track>[] | undefined
  >(undefined);
  const [player, setPlayer] = useState<SpotifyPlayer | undefined>(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState<Track>();

  const {
    mutate: fetchPlaylist,
    isLoading,
    error,
  } = api.spotify.fetchPlayerList.useMutation({
    onSuccess: (data: Playlist<Track>) => {
      console.log("🚀 ~ mutate tracks:", data);
      const shuffledTracks = data.tracks.items.sort(() => Math.random() - 0.5);
      setPlaylist(shuffledTracks);
      console.log("🚀 ~ playlist:", playlist);
    },
  });

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    // 调用 mutation
    fetchPlaylist(playlistId);
  };

  // 处理播放器操作的安全函数
  const handlePreviousTrack = () => {
    if (player) void player.previousTrack();
  };

  const handleTogglePlay = () => {
    if (player) void player.togglePlay();
  };

  const handleNextTrack = () => {
    if (player) void player.nextTrack();
  };

  return (
    <div>
      <PlaylistSelector
        playlists={playlists}
        onPlaylistSelect={handlePlaylistSelect}
      />
      {isLoading && <div>加载中...</div>}
      {error && <div>加载失败: {error.message}</div>}
      {selectedPlaylistId && (
        <div className="mt-4">当前选中的播放列表 ID: {selectedPlaylistId}</div>
      )}

      <div className="container">

      </div>
    </div>
  );
}
