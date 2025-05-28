"use client";

import {
  PauseOutlined as PauseOutlinedIcon,
  PlayArrowOutlined as PlayArrowOutlinedIcon,
  SkipNextOutlined as SkipNextOutlinedIcon,
  SkipPreviousOutlined as SkipPreviousOutlinedIcon,
} from "@mui/icons-material";
import { type Track } from "@spotify/web-api-ts-sdk";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePlayerConfigStore } from "../_store/player-config";

export default function MusicGame() {
  const { data: session } = useSession();
  const router = useRouter();

  const {
    gameTracks,
    countdown,
    intervalMode,
    currentTrack,
    setCurrentTrack,
    currentTrackIndex,
    setCurrentTrackIndex,
    totalTrackCount,
    trackRecords,
    setTrackRecords,
    showAnswer,
    setShowAnswer,
  } = usePlayerConfigStore();

  // Redirect to pre-setting page if no tracks are loaded
  useEffect(() => {
    if (!gameTracks || gameTracks.length === 0) {
      console.log(
        "[Gaming Page] No tracks loaded, redirecting to pre-setting page",
      );
      router.push("/pre-setting");
    }
  }, [gameTracks, router]);

  // Debug the state on initial load
  useEffect(() => {
    console.log("[Gaming Page] Initial load state:", {
      hasTracks: (gameTracks?.length ?? 0) > 0,
      trackCount: gameTracks?.length,
      currentIdx: currentTrackIndex,
      hasCurrentTrack: !!currentTrack,
    });
  }, [gameTracks, currentTrack, currentTrackIndex]);

  const [is_paused, setPaused] = useState<boolean>(true);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [current_track, setTrack] = useState<Spotify.Track | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);
  const [activeTimers, setActiveTimers] = useState<{
    intervalId?: NodeJS.Timeout;
    timeoutId?: NodeJS.Timeout;
  }>({});

  const access_token =
    typeof session?.accessToken === "string"
      ? session?.accessToken
      : (session?.accessToken?.access_token ?? "");

  // 游戏页面加载时初始化状态（只执行一次，不依赖于gameTracks）
  useEffect(() => {
    // 重置UI状态
    setCountdownRemaining(0);
    setPaused(true);
    setActiveTimers({});

    // 检查游戏所需的基本状态是否存在
    if (!gameTracks || gameTracks.length === 0) {
      console.warn("游戏歌曲列表为空，可能需要返回设置页面");
    }

    // 这个effect只在组件挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Calculate a random start point for a track based on its duration
  const calculateRandomStartPoint = useCallback(
    (trackDuration: number) => {
      // Ensure we don't start too close to the end of the track
      const maxStartPoint = Math.max(0, trackDuration - countdown * 1000);

      if (maxStartPoint <= 0) {
        // Track is shorter than countdown, always start from beginning
        return 0;
      }

      // Generate a random start point (in milliseconds)
      return Math.floor(Math.random() * maxStartPoint);
    },
    [countdown],
  );

  // Get or create track record for the current track
  const getTrackRecord = useCallback(
    (track: Track, _index: number) => {
      if (!trackRecords || !setTrackRecords)
        return { trackId: track.id, seedPoint: 0, trackDuration: 0 };

      // Get track duration in ms (from Spotify track object)
      const trackDuration = track.duration_ms ?? 0;

      // For Random Any Interval mode (mode 2), we need to generate a new random start point
      // each time the track is played, unlike mode 1 which uses a consistent random point
      if (intervalMode === 2) {
        // Calculate a new random start point every time
        const seedPoint = calculateRandomStartPoint(trackDuration);

        // Return a temporary record (don't save it)
        return {
          trackId: track.id,
          seedPoint,
          trackDuration,
        };
      }

      // For other modes, check if we already have a record for this track
      const existingRecord = trackRecords.find((r) => r.trackId === track.id);
      if (existingRecord) return existingRecord;

      // Calculate start point based on interval mode
      let seedPoint = 0;

      if (intervalMode === 0) {
        // Beginning-only mode - always start from 0
        seedPoint = 0;
      } else if (intervalMode === 1) {
        // Random single interval - calculate a random start point that stays consistent
        seedPoint = calculateRandomStartPoint(trackDuration);
      }

      // Create new record
      const newRecord = {
        trackId: track.id,
        seedPoint,
        trackDuration,
      };

      // Update track records state
      const newRecords = [...(trackRecords ?? []), newRecord];
      setTrackRecords(newRecords);

      return newRecord;
    },
    [intervalMode, trackRecords, setTrackRecords, calculateRandomStartPoint],
  ); // 清除所有活动计时器
  const clearAllTimers = useCallback(() => {
    // 使用函数形式访问最新的activeTimers，而不是在依赖项中包含它
    setActiveTimers((current) => {
      // 清除倒计时更新的intervalId
      if (current.intervalId) {
        clearInterval(current.intervalId);
      }

      // 清除停止播放的timeoutId
      if (current.timeoutId) {
        clearTimeout(current.timeoutId);
      }

      // 返回空对象重置计时器状态
      return {};
    });
  }, []);

  // 页面卸载时的清理函数
  useEffect(() => {
    return () => {
      // 清除所有计时器
      clearAllTimers();

      // 停止播放
      if (player) {
        try {
          void player.pause();
        } catch (err) {
          console.error("停止播放失败", err);
        }
      }

      // 断开播放器连接
      if (player) {
        try {
          void player.disconnect();
        } catch (err) {
          console.error("断开播放器失败", err);
        }
      }
    };
  }, [player, clearAllTimers]);

  // 切歌时用 Web API 播放指定曲目
  const triggerTrackPlayback = async (index: number) => {
    if (!gameTracks || !session?.accessToken || !deviceId) return;
    const track = gameTracks[index];
    if (!track?.uri) return;

    try {
      // Get or create track record with start position
      const record = getTrackRecord(track, index);

      // Start playback with position_ms parameter for interval modes
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [track.uri],
            position_ms: record.seedPoint,
          }),
        },
      );

      console.log(`Playing track at position: ${record.seedPoint}ms`);
      triggerCountdownAction();
    } catch (error) {
      console.error("Error triggering track playback:", error);
    }
  };

  const triggerCountdownAction = () => {
    // 首先清除之前的所有计时器，避免多个计时器同时运行
    clearAllTimers();

    // 重置并开始倒计时显示
    setCountdownRemaining(countdown);

    // 创建倒计时更新的interval
    const intervalId = setInterval(() => {
      setCountdownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 创建停止播放的timeout
    const timeoutId = setTimeout(() => {
      if (player && currentTrack) {
        // 停止播放
        void player.pause();

        // 根据不同的interval模式处理
        if (intervalMode === 0) {
          // 从头开始模式 - 恢复到开始位置
          void player.seek(0);
        } else if (intervalMode === 1 && trackRecords && currentTrack) {
          // 固定随机位置模式 - 恢复到预设的随机位置
          const record = trackRecords.find(
            (r) => r.trackId === currentTrack.id,
          );
          if (record) {
            void player.seek(record.seedPoint);
          } else {
            void player.seek(0);
          }
        } else if (intervalMode === 2) {
          // 完全随机位置模式
          void player.seek(0);
        }

        // 重置倒计时显示
        setCountdownRemaining(0);
      }
    }, countdown * 1000);

    // 保存当前活动的计时器，以便之后可以清除它们
    setActiveTimers({ intervalId, timeoutId });
  };

  const playPreviousTrack = async () => {
    if (
      gameTracks &&
      currentTrackIndex !== undefined &&
      setCurrentTrack &&
      setCurrentTrackIndex
    ) {
      // 切换歌曲前清除所有活动计时器
      clearAllTimers();
      setShowAnswer(false);

      const prevIndex = Math.max((currentTrackIndex ?? 0) - 1, 0);
      setCurrentTrack(gameTracks[prevIndex] ?? null);
      setCurrentTrackIndex(prevIndex);

      // 在状态更新后触发新歌曲的播放
      await triggerTrackPlayback(prevIndex);
    }
  };

  const playNextTrack = async () => {
    if (
      gameTracks &&
      currentTrackIndex !== undefined &&
      setCurrentTrack &&
      setCurrentTrackIndex
    ) {
      // 切换歌曲前清除所有活动计时器
      clearAllTimers();
      setShowAnswer(false);

      const nextIndex = Math.min(
        (currentTrackIndex ?? 0) + 1,
        (gameTracks.length ?? 1) - 1,
      );
      setCurrentTrack(gameTracks[nextIndex] ?? null);
      setCurrentTrackIndex(nextIndex);

      // 在状态更新后触发新歌曲的播放
      await triggerTrackPlayback(nextIndex);
    }
  };

  const togglePlayback = async () => {
    if (!player) return;

    if (is_paused) {
      // 如果当前是暂停状态，开始播放
      if (currentTrackIndex !== undefined) {
        // 先清除之前的计时器
        clearAllTimers();
        // 使用triggerTrackPlayback来设置正确的开始位置并启动新的倒计时
        await triggerTrackPlayback(currentTrackIndex);
      } else {
        // 否则只是恢复播放并启动倒计时
        await player.resume();
        triggerCountdownAction();
      }
    } else {
      // 如果正在播放，暂停并清除所有计时器
      await player.pause();
      clearAllTimers();
      setCountdownRemaining(0);
    }
  };

  return (
    <>
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 p-4">
        <div className="card bg-base-100 w-full max-w-sm flex-col items-center gap-2 p-12 shadow-xl">
          <div
            className="flex flex-col items-center justify-center gap-4"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <div className="relative flex items-center justify-center">
              <Image
                src={
                  showAnswer
                    ? (current_track?.album?.images?.[0]?.url ??
                      currentTrack?.album?.images?.[0]?.url ??
                      "/default-album-cover.png")
                    : "/default-album-cover.png"
                }
                alt="Album Cover"
                width={200}
                height={200}
                className="aspect-square rounded-full shadow-lg"
              />
            </div>

            {/* Countdown Progress Bar */}
            <div className="flex w-full flex-col items-center gap-1">
              <progress
                className="progress progress-success"
                value={countdownRemaining}
                max={countdown}
              />
            </div>

            {/* 歌名和歌手 */}
            <div className="w-full text-center">
              {showAnswer ? (
                <>
                  <h2 className="truncate text-2xl font-bold">
                    {current_track?.name ?? currentTrack?.name ?? ""}
                  </h2>
                  <p className="truncate text-lg text-gray-400">
                    {current_track?.artists?.[0]?.name ??
                      currentTrack?.artists?.[0]?.name ??
                      ""}
                  </p>
                </>
              ) : (
                <>
                  <div className="skeleton mb-2 h-7 w-full"></div>
                  <div className="skeleton h-6 w-full"></div>
                </>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-col items-center justify-center gap-4">
            {/* 播放控制按钮 */}
            <div className="card-actions justify-center gap-5">
              <button
                className="btn btn-circle btn-outline btn-success scale-90"
                onClick={playPreviousTrack}
                disabled={currentTrackIndex! <= 0}
              >
                <SkipPreviousOutlinedIcon />
              </button>
              <button
                className="btn btn-circle btn-success scale-125 text-white"
                onClick={togglePlayback}
              >
                {!is_paused ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
              </button>
              <button
                className="btn btn-circle btn-outline btn-success scale-90"
                onClick={playNextTrack}
                disabled={currentTrackIndex! >= totalTrackCount! - 1}
              >
                <SkipNextOutlinedIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      {false && (
        <div className="card bg-base-100 mt-8 w-full max-w-4xl p-6 shadow-sm">
          <h2 className="text-lg font-bold">Debug Information</h2>
          <pre className="text-sm break-all whitespace-pre-wrap">
            {JSON.stringify(
              {
                showAnswer,
                countdown,
                countdownRemaining,
                intervalMode:
                  intervalMode === 0
                    ? "Beginning Only"
                    : intervalMode === 1
                      ? "Random Single Interval"
                      : "Random Any Interval",
                currentTrackIndex,
                currentTrackId: currentTrack?.id,
                currentTrackName: currentTrack?.name,
                totalTracks: totalTrackCount,
                activeTimers: {
                  hasIntervalTimer: !!activeTimers.intervalId,
                  hasTimeoutTimer: !!activeTimers.timeoutId,
                },
                trackRecords: trackRecords?.map((r) => ({
                  trackId: r.trackId,
                  seedPoint: r.seedPoint / 1000 + " seconds",
                  duration: r.trackDuration / 1000 + " seconds",
                })),
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </>
  );
}
