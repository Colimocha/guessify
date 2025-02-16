"use client";
import SpotifyPlayer, { type CallbackState } from "react-spotify-web-playback";

interface MusicPlayerClientProps {
  token: string;
  playlist: string;
  onCallbackState: (state: CallbackState) => void;
  playerInstance: (player: Spotify.Player) => void;
}

export default function SpotifyPlayback({
  token,
  playlist,
  onCallbackState,
  playerInstance,
}: MusicPlayerClientProps) {
  return (
    <>
      <SpotifyPlayer
        token={token}
        uris={[playlist]}
        play={true}
        callback={(state) => onCallbackState(state)}
        getPlayer={(player) => playerInstance(player)}
      />
    </>
  );
}
