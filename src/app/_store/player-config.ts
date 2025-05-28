import { type SimplifiedPlaylist, type Track } from "@spotify/web-api-ts-sdk";
import { create } from "zustand";

interface TrackRecord {
  trackId: string;
  seedPoint: number;
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
  showAnswer?: boolean;
  setShowAnswer?: (showAnswer: boolean) => void;
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
}

export const usePlayerConfigStore = create<PlayerConfigState>((set) => ({
  playlists: [],
  setPlaylists: (playlists) => set({ playlists }),
  selectedPlaylist: null,
  setSelectedPlaylist: (playlist) => set({ selectedPlaylist: playlist }),
  countdown: 5,
  setCountdown: (countdown) => set({ countdown }),
  intervalMode: 0,
  setIntervalMode: (mode) => set({ intervalMode: mode }),
  showAnswer: false,
  setShowAnswer: (showAnswer) => set({ showAnswer: showAnswer }),
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
  setPlayer: (player) => set({ player: player }),
  deviceId: null,
  setDeviceId: (deviceId) => set({ deviceId: deviceId }),
}));
