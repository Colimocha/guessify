"use client";

import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";
import SkipPreviousOutlinedIcon from "@mui/icons-material/SkipPreviousOutlined";
import { type SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { useEffect, useRef, useState } from "react";
import { type CallbackState } from "react-spotify-web-playback";
import { api } from "~/trpc/react";
import { PlaylistSelector } from "./playlist-selector";
import SpotifyPlayback from "./spotify-playback";

interface MusicPlayerClientProps {
  playlists: SimplifiedPlaylist[];
  token: string;
}

export default function MusicPlayerGUI({
  playlists,
  token,
}: MusicPlayerClientProps) {
  const [initialCountdown, setInitialCountdown] = useState<number>(5);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [playerState, setPlayerState] = useState<CallbackState>();
  const [playerInstance, setPlayerInstance] = useState<Spotify.Player>();
  const [countdown, setCountdown] = useState(initialCountdown);

  const [isLocked, setLocked] = useState(true);
  const [isPlaying, setPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
  };

  const handleCallbackState = (state: CallbackState) => {
    console.log("🚀 ~ handleCallbackState ~ state:", state);
    return setPlayerState(state);
  };

  const handlePlayerInstance = (player: Spotify.Player) => {
    console.log("🚀 ~ handlePlayerInstance ~ player:", player);
    return setPlayerInstance(player);
  };

  const handleUpdateCountdown = (countdown: number) => {
    setInitialCountdown(countdown);
    setCountdown(countdown);
  };

  const handlePlayButton = () => {
    if (playerInstance) {
      playerInstance.togglePlay().catch(console.error);
      setPlaying(!isPlaying);
    }
  };

  const handleNextTrack = () => {
    if (playerInstance) {
      playerInstance.nextTrack().catch(console.error);
      setLocked(true);
    }
  };

  const handlePreviousTrack = () => {
    if (playerInstance) {
      playerInstance.previousTrack().catch(console.error);
    }
  };

  const handleSetRepeatMode = () => {
    if (playerInstance) repeatMode({ state: "context" });
  };

  const { mutate: repeatMode } = api.spotify.setRepeatMode.useMutation({
    onSuccess: () => console.log("Set repeat mode!"),
  });

  const initRepeatMode = () => {
    if (playerInstance) {
      playerInstance
        .getCurrentState()
        .then((state) => {
          if (state && state.repeat_mode !== 2) {
            handleSetRepeatMode();
          }
        })
        .catch(console.error);
    }
  };

  const startCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setCountdown(initialCountdown);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCountdown(initialCountdown);
  };

  useEffect(() => {
    if (playerInstance && playerState) {
      initRepeatMode();
      setPlaying(playerState?.isPlaying);
    }

    if (playerState?.isPlaying) {
      startCountdown();
    } else {
      stopCountdown();
    }

    if (playerState?.isPlaying && playerInstance) {
      timerRef.current = setTimeout(() => {
        playerInstance.pause().catch(console.error);
        playerInstance.seek(0).catch(console.error);
        setPlaying(false);
      }, initialCountdown * 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playerState?.isPlaying, playerInstance, playerState]);

  return (
    <>
      {/* init spotify playback component */}
      <div>
        {selectedPlaylistId && (
          <div hidden={true}>
            <SpotifyPlayback
              token={token}
              playlist={selectedPlaylistId}
              onCallbackState={handleCallbackState}
              playerInstance={handlePlayerInstance}
            />
          </div>
        )}
      </div>

      {/* Playlist Selector */}
      <PlaylistSelector
        playlists={playlists}
        onPlaylistSelect={handlePlaylistSelect}
        onCountDown={handleUpdateCountdown}
      />
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure>
          <div className="flex min-h-[320px] w-full items-center justify-center">
            <button className="btn-circle btn-ghost size-64 text-9xl">
              {countdown}
            </button>
          </div>
        </figure>

        <div className="card-body">
          <div className="mb-5 flex gap-2">
            <div className="w-full">
              {isLocked ? (
                <>
                  <h2 className="skeleton mb-3 h-6 w-40"></h2>
                  <div className="skeleton h-4 w-28"></div>
                </>
              ) : (
                <>
                  <h2 className="card-title">{playerState?.track.name}</h2>
                  <p className="text-gray-400">
                    {playerState?.track.artists[0]?.name}
                  </p>
                </>
              )}
            </div>
            <button
              className="btn btn-circle btn-outline"
              onClick={() => setLocked(!isLocked)}
            >
              {isLocked ? <LockOpenOutlinedIcon /> : <LockOutlinedIcon />}
            </button>
          </div>

          <div className="card-actions justify-center">
            <button
              className="btn btn-circle btn-outline"
              onClick={handlePreviousTrack}
            >
              <SkipPreviousOutlinedIcon />
            </button>
            <button
              className="btn btn-circle btn-outline"
              onClick={handlePlayButton}
            >
              {isPlaying ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
            </button>
            <button className="btn btn-circle btn-outline hidden">
              <ReplayOutlinedIcon />
            </button>
            <button
              className="btn btn-circle btn-outline"
              onClick={handleNextTrack}
            >
              <SkipNextOutlinedIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
