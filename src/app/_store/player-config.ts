import { type SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { create } from "zustand";

interface PlayerConfigState {
  playlists: SimplifiedPlaylist[];
  setPlaylists: (playlists: SimplifiedPlaylist[]) => void;
  selectedPlaylist: SimplifiedPlaylist | null;
  setSelectedPlaylist: (playlist: SimplifiedPlaylist | null) => void;
  countdown: number;
  setCountdown: (countdown: number) => void;
  intervalMode: number;
  setIntervalMode: (mode: number) => void;
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
}));
