import { z } from "zod";
import { SpotifyClient } from "~/lib/spotify/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const spotifyRouter = createTRPCRouter({
  getUserPlaylists: protectedProcedure.query(async ({ ctx }) => {
    const client = SpotifyClient.getInstance(ctx.session?.accessToken);
    const playlists = await client.currentUser.playlists.playlists();
    return playlists;
  }),

  getPlayerList: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      const playlist = await client.playlists.getPlaylistItems(input);
      return playlist;
    }),

  getTracks: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(async ({ input, ctx }) => {
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      const tracks = await client.tracks.get(input.playlistId);
      return tracks;
    }),

  setRepeatMode: protectedProcedure
    .input(
      z.object({
        state: z.union([
          z.literal("track"),
          z.literal("context"),
          z.literal("off"),
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      const playbackState = await client.player.getPlaybackState();
      const deviceId = playbackState.device.id;
      if (!deviceId) throw new Error("No device found");
      await client.player.setRepeatMode(input.state, deviceId);
    }),
});
