"use client";

import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ShuffleOnIcon from "@mui/icons-material/ShuffleOn";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";
import SkipPreviousOutlinedIcon from "@mui/icons-material/SkipPreviousOutlined";
import { type SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { type CallbackState } from "react-spotify-web-playback";
import { api } from "~/trpc/react";
import { IntervalValue } from "~/types/player";
import { PlaylistSelector } from "./playlist-selector";
import SpotifyPlayback from "./spotify-playback";

interface MusicPlayerClientProps {
  playlists: SimplifiedPlaylist[];
  token: string;
}
const useCountdown = (initialValue: number, onComplete: () => void) => {
  const [count, setCount] = useState(initialValue);
  const intervalRef = useRef<NodeJS.Timeout>();

  const start = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setCount(initialValue);
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialValue, onComplete]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCount(initialValue);
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { count, start, stop };
};

export default function MusicPlayerGUI({
  playlists,
  token,
}: MusicPlayerClientProps) {
  const [initialCountdown, setInitialCountdown] = useState<number>(5);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [playerState, setPlayerState] = useState<CallbackState>();
  const [playerInstance, setPlayerInstance] = useState<Spotify.Player>();
  const [intervalValue, setIntervalValue] = useState<IntervalValue>(0);
  const [seekPosition, setSeekPosition] = useState<number>(0);

  const [isLocked, setLocked] = useState(true);
  const [isPlaying, setPlaying] = useState(false);
  const [isShuffle, setShuffle] = useState(false);
  const [isRepeat, setRepeat] = useState(false);

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
  };

  const handleCallbackState = (state: CallbackState) => {
    return setPlayerState(state);
  };

  const handlePlayerInstance = (player: Spotify.Player) => {
    return setPlayerInstance(player);
  };

  const handleUpdateCountdown = (countdown: number) => {
    setInitialCountdown(countdown);
  };

  const handleUpdateIntervalValue = (value: number) => {
    setIntervalValue(value);
  };

  const handlePlayButton = () => {
    if (playerInstance) {
      playerInstance.togglePlay().catch(console.error);
      setPlaying(!isPlaying);
    }
  };

  const handleNextTrack = () => {
    if (playerInstance) {
      setLocked(true);
      playerInstance.nextTrack().catch(console.error);
      setSeekPosition(
        intervalValue === IntervalValue.RandomS ? getRandomPosition() : 0,
      );
    }
  };

  const handlePreviousTrack = () => {
    if (playerInstance) {
      setLocked(true);
      playerInstance.previousTrack().catch(console.error);
      setSeekPosition(
        intervalValue === IntervalValue.RandomS ? getRandomPosition() : 0,
      );
    }
  };

  const handleSetShuffleMode = () => {
    if (playerInstance) {
      if (isShuffle) shuffleMode(false);
      else shuffleMode(true);
    }
  };

  const { mutate: shuffleMode } = api.spotify.setShuffle.useMutation({
    onSuccess: () => {
      setShuffle(!isShuffle);
    },
  });

  const { mutate: repeatMode } = api.spotify.setRepeatMode.useMutation({
    onSuccess: () => {
      setRepeat(!isRepeat);
    },
  });

  const initializePlayerSettings = useCallback(() => {
    if (playerInstance && playerState) {
      if (playerState.shuffle === false) {
        shuffleMode(true);
      }
      if (playerState.repeat === "off") {
        repeatMode({ state: "context" });
      }
    }
  }, [playerInstance, playerState, shuffleMode, repeatMode]);

  const getRandomPosition = useCallback(() => {
    if (playerState?.track) {
      const trackDurationMs = playerState.track.durationMs;
      const intervalMs = initialCountdown * 1000;
      const maxStartPosition = trackDurationMs - intervalMs;
      if (maxStartPosition > 0) {
        return Math.floor(Math.random() * maxStartPosition);
      }
    }
    return 0;
  }, [initialCountdown, playerState?.track]);

  const {
    count: countdown,
    start: startCountdown,
    stop: stopCountdown,
  } = useCountdown(initialCountdown, () => {
    if (playerInstance) {
      playerInstance.pause().catch(console.error);
      handleSeekPosition();
      setPlaying(false);
    }
  });

  const handleSeekPosition = useCallback(() => {
    if (!playerInstance) return;
    if (playerInstance) {
      initializePlayerSettings();
    }

    const position =
      intervalValue === IntervalValue.RandomS
        ? seekPosition
        : intervalValue === IntervalValue.RandomR
          ? getRandomPosition()
          : 0;

    playerInstance.seek(position).catch(console.error);
  }, [
    getRandomPosition,
    intervalValue,
    playerInstance,
    seekPosition,
    initializePlayerSettings,
  ]);

  useEffect(() => {
    if (!playerInstance || !playerState) return;

    setPlaying(playerState.isPlaying);

    if (playerState.isPlaying) {
      startCountdown();
      handleSeekPosition();
    } else {
      stopCountdown();
    }
  }, [handleSeekPosition, playerInstance, playerState]);

  return (
    <>
      <div>
        {selectedPlaylistId && (
          <div hidden={true} className="">
            <SpotifyPlayback
              token={token}
              playlist={selectedPlaylistId}
              onCallbackState={handleCallbackState}
              playerInstance={handlePlayerInstance}
            />
          </div>
        )}
      </div>

      <PlaylistSelector
        playlists={playlists}
        onPlaylistSelect={handlePlaylistSelect}
        onCountDown={handleUpdateCountdown}
        onIntervalValue={handleUpdateIntervalValue}
      />
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure>
          <div className="flex min-h-[320px] w-full items-center justify-center">
            <button className="btn-circle btn-ghost size-64 animate-pulse text-9xl ring ring-primary ring-offset-2 ring-offset-base-100">
              {countdown}
            </button>
          </div>
        </figure>

        <div className="card-body">
          <div className="mb-5 flex gap-2">
            <div className="w-full">
              {isLocked ? (
                <>
                  <h2 className="skeleton mb-3 h-6 w-60"></h2>
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

          <div className="card-actions justify-center gap-5">
            <button
              className="btn btn-circle btn-outline btn-info scale-90"
              onClick={handlePreviousTrack}
            >
              <SkipPreviousOutlinedIcon />
            </button>
            <button
              className="btn btn-circle btn-primary scale-125 text-white"
              onClick={handlePlayButton}
            >
              {isPlaying ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
            </button>
            <button className="btn btn-circle btn-outline hidden">
              <ReplayOutlinedIcon />
            </button>
            <button
              className="btn btn-circle btn-outline btn-info scale-90"
              onClick={handleNextTrack}
            >
              <SkipNextOutlinedIcon />
            </button>
            <button
              className="btn btn-circle btn-outline absolute right-3 top-3"
              onClick={handleSetShuffleMode}
            >
              {isShuffle ? <ShuffleOnIcon /> : <ShuffleIcon />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
