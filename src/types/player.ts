import { type SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";

export enum IntervalValue {
  Presage = 0,
  RandomS = 1,
  RandomR = 2,
}

export interface PlaylistSelectorProps {
  playlists: SimplifiedPlaylist[];
  onPlaylistSelect: (playlistId: string) => void;
  onCountDown: (countdown: number) => void;
  onIntervalValue: (value: number) => void;
}

export interface MusicPlayerClientProps {
  playlists: SimplifiedPlaylist[];
  token: string;
}
