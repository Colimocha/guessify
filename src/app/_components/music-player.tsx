import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import MusicPlayerGUI from "./music-player-gui";

export default async function MusicPlayer() {
  try {
    const session = await auth();
    if (!session?.accessToken?.access_token) return null;

    const data = session.user
      ? await api.spotify.getUserPlaylists()
      : undefined;

    return (
      <HydrateClient>
        <div className="min-h-[200px]">
          {data ? (
            <MusicPlayerGUI
              playlists={data.items}
              token={session.accessToken.access_token}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              加载中...
            </div>
          )}
        </div>
      </HydrateClient>
    );
  } catch (error) {
    console.error("Music player error:", error);
    return <div>加载音乐播放器时出错</div>;
  }
}
