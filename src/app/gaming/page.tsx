"use client";

import {
  PauseOutlined as PauseOutlinedIcon,
  PlayArrowOutlined as PlayArrowOutlinedIcon,
  ReplayOutlined as ReplayOutlinedIcon,
  SkipNextOutlined as SkipNextOutlinedIcon,
  SkipPreviousOutlined as SkipPreviousOutlinedIcon,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePlayerConfigStore } from "../_store/player-config";

export default function Gaming() {
  const { data: session } = useSession();

  const {
    gameTracks,
    countdown,
    currentTrack,
    setCurrentTrack,
    currentTrackIndex,
    setCurrentTrackIndex,
    totalTrackCount,
  } = usePlayerConfigStore();

  const [is_paused, setPaused] = useState<boolean>(false);
  const [is_active, setActive] = useState<boolean>(false);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [current_track, setTrack] = useState<Spotify.Track | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const access_token =
    typeof session?.accessToken === "string"
      ? session?.accessToken
      : (session?.accessToken?.access_token ?? "");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Guessify",
        getOAuthToken: (cb) => {
          cb(access_token);
        },
        volume: 1,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        console.log("Ready with Device ID", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().catch((error) => {
          console.error("Failed to get current state:", error);
        });
      });

      player.connect().catch((error) => {
        console.error("Failed to connect to Spotify Player:", error);
      });
    };
  }, [access_token]);

  // 切歌时用 Web API 播放指定曲目
  const playTrackByIndex = async (index: number) => {
    if (!gameTracks || !session?.accessToken || !deviceId) return;
    const track = gameTracks[index];
    if (!track?.uri) return;
    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [track.uri] }),
      },
    );
  };

  const handlePrev = async () => {
    if (
      gameTracks &&
      currentTrackIndex !== undefined &&
      setCurrentTrack &&
      setCurrentTrackIndex
    ) {
      const prevIndex = Math.max((currentTrackIndex ?? 0) - 1, 0);
      await playTrackByIndex(prevIndex);
      setCurrentTrack(gameTracks[prevIndex] ?? null);
      setCurrentTrackIndex(prevIndex);
    }
  };

  const handleNext = async () => {
    if (
      gameTracks &&
      currentTrackIndex !== undefined &&
      setCurrentTrack &&
      setCurrentTrackIndex
    ) {
      const nextIndex = Math.min(
        (currentTrackIndex ?? 0) + 1,
        (gameTracks.length ?? 1) - 1,
      );
      await playTrackByIndex(nextIndex);
      setCurrentTrack(gameTracks[nextIndex] ?? null);
      setCurrentTrackIndex(nextIndex);
    }
  };

  const handlePlayPause = async () => {
    if (!player) return;
    if (!is_active) {
      await playTrackByIndex(currentTrackIndex ?? 0);
      setActive(true);
      setPaused(false);
    } else {
      void player.togglePlay();
    }
  };

  return (
    <>
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 p-4">
        <div className="card bg-base-100 w-full max-w-2xl flex-row items-center gap-6 p-6 shadow-xl">
          {true ? (
            <>
              {/* 左侧 唱片和倒计时 */}
              <div className="flex w-1/2 flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="flex size-40 items-center justify-center rounded-full bg-gradient-to-tr from-green-400 via-black to-green-700 shadow-inner">
                    <span className="text-4xl text-white">{countdown}</span>
                  </div>
                </div>
              </div>

              {/* 右侧 歌名、歌手、播放控制 */}
              <div className="flex flex-1 flex-col items-center justify-center gap-6">
                {/* 歌名和歌手 */}
                <div className="w-full text-center">
                  <h2 className="truncate text-2xl font-bold">
                    {current_track?.name ?? currentTrack?.name ?? ""}
                  </h2>
                  <p className="truncate text-lg text-gray-400">
                    {current_track?.artists?.[0]?.name ??
                      currentTrack?.artists?.[0]?.name ??
                      ""}
                  </p>
                </div>

                {/* 播放控制按钮 */}
                <div className="card-actions justify-center gap-5">
                  <button
                    className="btn btn-circle btn-outline btn-info scale-90"
                    onClick={handlePrev}
                    disabled={currentTrackIndex! <= 0}
                  >
                    <SkipPreviousOutlinedIcon />
                  </button>
                  <button
                    className="btn btn-circle btn-primary scale-125 text-white"
                    onClick={handlePlayPause}
                  >
                    {!is_paused ? (
                      <PauseOutlinedIcon />
                    ) : (
                      <PlayArrowOutlinedIcon />
                    )}
                  </button>
                  <button className="btn btn-circle btn-outline hidden">
                    <ReplayOutlinedIcon />
                  </button>
                  <button
                    className="btn btn-circle btn-outline btn-info scale-90"
                    onClick={handleNext}
                    disabled={currentTrackIndex! >= totalTrackCount! - 1}
                  >
                    <SkipNextOutlinedIcon />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex w-full flex-col items-center justify-center">
                <span className="text-2xl font-bold">
                  Spotify Player Not Active
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="card bg-base-100 w-full max-w-4xl p-6 shadow-sm">
        <h2 className="text-lg font-bold">Debug Information</h2>
        <pre className="text-sm break-all whitespace-pre-wrap">
          {JSON.stringify(
            {
              currentTrackIndex,
            },
            null,
            2,
          )}
        </pre>
      </div>
    </>
  );
}
