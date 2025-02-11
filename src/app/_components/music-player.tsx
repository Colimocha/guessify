import { type Page, type SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import MusicPlayerGUI from "./music-player-gui";

export default async function MusicPlayer() {
  const session = await auth();
  let data: Page<SimplifiedPlaylist> | undefined;

  if (!session) return null;
  const accessToken = session.accessToken?.access_token;
  if (!accessToken) return null;

  if (session?.user) {
    data = await api.spotify.getUserPlaylists();
  }

  return (
    <HydrateClient>
      <div>
        <MusicPlayerGUI playlists={data?.items ?? []} token={accessToken} />
      </div>
    </HydrateClient>
  );
}
