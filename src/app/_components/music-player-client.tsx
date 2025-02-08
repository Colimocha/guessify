"use client";

import {
  type Playlist,
  type SimplifiedPlaylist,
  type Track,
} from "@spotify/web-api-ts-sdk";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { PlaylistSelector } from "./playlist-selector";

declare global {
  interface Window {
    Spotify: typeof Spotify;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface MusicPlayerClientProps {
  playlists: SimplifiedPlaylist[];
  token: string;
}

export function MusicPlayerClient({
  playlists,
  token,
}: MusicPlayerClientProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [playlist, setPlaylist] = useState<PlaylistedTrack<Track>[] | undefined>(
    undefined,
  );
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState<Spotify.Track>();

  // 使用 TRPC 的 mutation
  const {
    mutate: fetchPlaylist,
    isLoading,
    error,
  } = api.spotify.fetchPlayerList.useMutation({
    onSuccess: (data: Playlist<Track>) => {
      console.log("🚀 ~ mutate tracks:", data);
      const shuffledTracks = data.tracks.items.sort(() => Math.random() - 0.5);
      setPlaylist(shuffledTracks);
    },
  });

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    // 调用 mutation
    fetchPlaylist(playlistId);
  };

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 1,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        void player.getCurrentState().then((state) => {
          setActive(!!state);
        });
      });

      void player.connect();
    };

    // 清理函数
    return () => {
      player?.disconnect();
    };
  }, [player, token]); // 添加 token 作为依赖项

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
        {current_track && (
          <div className="main-wrapper">
            <Image
              src={current_track.album.images[0]!.url}
              className="now-playing__cover"
              alt=""
            />

            <div className="now-playing__side">
              <div className="now-playing__name">{current_track.name}</div>

              <div className="now-playing__artist">
                {current_track.artists.map((artist) => artist.name).join(", ")}
              </div>
            </div>

            <button
              className="btn-spotify"
              onClick={handlePreviousTrack}
              disabled={!is_active}
            >
              &lt;&lt;
            </button>

            <button
              className="btn-spotify"
              onClick={handleTogglePlay}
              disabled={!is_active}
            >
              {is_paused ? "PLAY" : "PAUSE"}
            </button>

            <button
              className="btn-spotify"
              onClick={handleNextTrack}
              disabled={!is_active}
            >
              &gt;&gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
