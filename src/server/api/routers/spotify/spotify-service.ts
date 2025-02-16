import { z } from "zod";
import { SpotifyClient } from "~/server/api/routers/spotify/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const spotifyRouter = createTRPCRouter({
  getUserPlaylists: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.accessToken) throw new Error("Access token is missing");
    const client = SpotifyClient.getInstance(ctx.session?.accessToken);
    const playlists = await client.currentUser.playlists.playlists();
    return playlists;
  }),

  getPlayerList: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.accessToken) throw new Error("Access token is missing");
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      const playlist = await client.playlists.getPlaylistItems(input);
      return playlist;
    }),

  getTracks: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.accessToken) throw new Error("Access token is missing");
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
      if (!ctx.session?.accessToken) throw new Error("Access token is missing");
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      const playbackState = await client.player.getPlaybackState();
      const deviceId = playbackState.device.id;
      let query = `?state=${input.state}`;
      if (deviceId) {
        query += `&device_id=${deviceId}`;
      }
      await fetch(`https://api.spotify.com/v1/me/player/repeat${query}`, {
        headers: {
          Authorization: `Bearer ${ctx.session?.accessToken.access_token}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      });
    }),

  setShuffle: protectedProcedure
    .input(z.boolean())
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.accessToken) throw new Error("Access token is missing");
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      const playbackState = await client.player.getPlaybackState();
      const deviceId = playbackState.device.id;
      let query = `?state=${input}`;
      if (deviceId) {
        query += `&device_id=${deviceId}`;
      }
      await fetch(`https://api.spotify.com/v1/me/player/shuffle${query}`, {
        headers: {
          Authorization: `Bearer ${ctx.session?.accessToken.access_token}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      });
    }),
});
