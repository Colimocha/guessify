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
import { useEffect, useRef, useState } from "react";
import { type CallbackState } from "react-spotify-web-playback";
import { api } from "~/trpc/react";
import { PlaylistSelector } from "./playlist-selector";
import SpotifyPlayback from "./spotify-playback";

interface MusicPlayerClientProps {
  playlists: SimplifiedPlaylist[];
  token: string;
}

enum IntervalValue {
  Presage = 0,
  RandomS = 1,
  RandomR = 2,
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
  const [intervalValue, setIntervalValue] = useState<IntervalValue>(0);
  const [seekPosition, setSeekPosition] = useState<number>(0);

  const [isLocked, setLocked] = useState(true);
  const [isPlaying, setPlaying] = useState(false);
  const [isRepeat, setRepeat] = useState(false);
  const [isShuffle, setShuffle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

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
    setCountdown(countdown);
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

  const handleSetRepeatMode = () => {
    if (playerInstance) {
      if (isRepeat) repeatMode({ state: "off" });
      else repeatMode({ state: "context" });
    }
  };

  const { mutate: repeatMode } = api.spotify.setRepeatMode.useMutation({
    onSuccess: () => {
      setRepeat(!isRepeat);
    },
  });

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

  const getRandomPosition = () => {
    if (playerState?.track) {
      const trackDurationMs = playerState.track.durationMs;
      const intervalMs = initialCountdown * 1000; // 将倒计时秒数转换为毫秒

      // 确保不会超出歌曲总长度
      const maxStartPosition = trackDurationMs - intervalMs;

      if (maxStartPosition > 0) {
        // 生成一个随机的起始位置
        return Math.floor(Math.random() * maxStartPosition);
      }
    }
    return 0;
  };

  useEffect(() => {
    if (playerInstance && playerState) {
      setPlaying(playerState?.isPlaying);
    }

    if (playerState?.isPlaying) {
      startCountdown();

      if (playerInstance) {
        if (intervalValue === IntervalValue.RandomS) {
          playerInstance.seek(seekPosition).catch(console.error);
        } else if (intervalValue === IntervalValue.RandomR) {
          playerInstance.seek(getRandomPosition()).catch(console.error);
        } else {
          playerInstance.seek(0).catch(console.error);
        }
      }

      // 设置定时器，在倒计时结束后
      timerRef.current = setTimeout(() => {
        if (playerInstance) {
          playerInstance.pause().catch(console.error);
          if (intervalValue === IntervalValue.RandomS) {
            playerInstance.seek(seekPosition).catch(console.error);
          } else if (intervalValue === IntervalValue.RandomR) {
            playerInstance.seek(getRandomPosition()).catch(console.error);
          } else {
            playerInstance.seek(0).catch(console.error);
          }
          setPlaying(false);
        }
      }, initialCountdown * 1000);
    } else {
      stopCountdown();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playerState?.isPlaying, playerInstance, playerState, intervalValue]);

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

            {/* <button
              className="btn btn-circle btn-outline"
              onClick={handleSetRepeatMode}
            >
              {isRepeat ? <RepeatOnIcon /> : <RepeatIcon />}
            </button> */}
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
