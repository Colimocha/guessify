import { type SimplifiedPlaylist, type Track } from "@spotify/web-api-ts-sdk";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Debug logs to help understand when state is hydrated from storage
const log = (message: string) => {
  if (typeof window !== "undefined") {
    console.log(`[PlayerConfigStore] ${message}`);
  }
};

interface TrackRecord {
  trackId: string;
  seedPoint: number;
  trackDuration: number;
  guessed?: boolean; // Track if this song was correctly guessed
}

interface PlayerConfigState {
  playlists: SimplifiedPlaylist[];
  setPlaylists: (playlists: SimplifiedPlaylist[]) => void;
  selectedPlaylist: SimplifiedPlaylist | null;
  setSelectedPlaylist: (playlist: SimplifiedPlaylist | null) => void;
  countdown: number;
  setCountdown: (countdown: number) => void;
  intervalMode: number;
  setIntervalMode: (mode: number) => void;
  showAnswer: boolean;
  setShowAnswer: (showAnswer: boolean) => void;
  gameTracks?: Track[];
  setGameTracks?: (tracks: Track[]) => void;
  currentTrack?: Track | null;
  setCurrentTrack?: (track: Track | null) => void;
  currentTrackIndex?: number;
  setCurrentTrackIndex?: (index: number) => void;
  totalTrackCount?: number;
  setTotalTrackCount?: (count: number) => void;
  trackRecords?: TrackRecord[];
  setTrackRecords?: (records: TrackRecord[]) => void;
  player?: Spotify.Player | null;
  setPlayer?: (player: Spotify.Player | null) => void;
  deviceId?: string | null;
  setDeviceId?: (deviceId: string | null) => void;
  resetGameState: () => void;
}

export const usePlayerConfigStore = create<PlayerConfigState>()(
  persist(
    (set) => ({
      playlists: [],
      setPlaylists: (playlists) => set({ playlists }),
      selectedPlaylist: null,
      setSelectedPlaylist: (playlist) => set({ selectedPlaylist: playlist }),
      countdown: 5,
      setCountdown: (countdown) => set({ countdown }),
      intervalMode: 0,
      setIntervalMode: (mode) => set({ intervalMode: mode }),
      showAnswer: false,
      setShowAnswer: (showAnswer) => set({ showAnswer }),
      gameTracks: [],
      setGameTracks: (tracks) => set({ gameTracks: tracks }),
      currentTrack: null,
      setCurrentTrack: (track) => set({ currentTrack: track }),
      currentTrackIndex: 0,
      setCurrentTrackIndex: (index) => set({ currentTrackIndex: index }),
      totalTrackCount: 0,
      setTotalTrackCount: (count) => set({ totalTrackCount: count }),
      trackRecords: [],
      setTrackRecords: (records) => set({ trackRecords: records }),
      player: null,
      setPlayer: (player) => set({ player }),
      deviceId: null,
      setDeviceId: (deviceId) => set({ deviceId }),
      resetGameState: () =>
        set({
          trackRecords: [],
          currentTrack: null,
          currentTrackIndex: 0,
          totalTrackCount: 0,
          gameTracks: [],
        }),
    }),
    {
      name: "music-guesser-storage", // unique name for localStorage key
      partialize: (state) => ({
        // List the states you want to persist (don't persist player instances)
        gameTracks: state.gameTracks,
        currentTrack: state.currentTrack,
        currentTrackIndex: state.currentTrackIndex,
        totalTrackCount: state.totalTrackCount,
        trackRecords: state.trackRecords,
        countdown: state.countdown,
        intervalMode: state.intervalMode,
        showAnswer: state.showAnswer,
      }),
      // Add this to debug when the store is hydrated from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          log("State hydrated from localStorage");
          log(`Found ${state.gameTracks?.length ?? 0} game tracks in storage`);
        } else {
          log("Failed to hydrate state from localStorage");
        }
      },
    },
  ),
);
