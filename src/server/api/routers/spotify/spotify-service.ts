import { z } from "zod";
import { SpotifyClient } from "~/server/api/routers/spotify/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const spotifyRouter = createTRPCRouter({
  getCurrentUserProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.accessToken) throw new Error("Access token is missing");
    const client = SpotifyClient.getInstance(ctx.session?.accessToken);
    const userProfile = await client.currentUser.profile();
    return userProfile;
  }),
  getCurrentUserIsPremium: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.accessToken) throw new Error("Access token is missing");
    const client = SpotifyClient.getInstance(ctx.session?.accessToken);
    const userProfile = await client.currentUser.profile();
    return userProfile.product === "premium";
  }),
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
  activeDevice: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.accessToken) throw new Error("Access token is missing");
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      const response = await client.player.transferPlayback([input], false);
      return response;
    }),
  playTrack: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        trackUri: z.string(),
        position_ms: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.accessToken) throw new Error("Access token is missing");
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      // Correct positional arguments: device_id, context_uri (undefined), uris (array)
      await client.player.startResumePlayback(
        input.deviceId,
        undefined,
        [input.trackUri],
        undefined,
        input.position_ms ?? 0,
      );
      return { ok: true };
    }),
  nextTrack: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.accessToken) throw new Error("Access token is missing");
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      await client.player.skipToNext(input.deviceId);
      return { ok: true };
    }),
  prevTrack: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.accessToken) throw new Error("Access token is missing");
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      await client.player.skipToPrevious(input.deviceId);
      return { ok: true };
    }),
});
