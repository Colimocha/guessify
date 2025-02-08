import { z } from "zod";
import { SpotifyClient } from "~/lib/spotify/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const spotifyRouter = createTRPCRouter({
  fetchUserPlaylists: protectedProcedure.query(async ({ ctx }) => {
    const client = SpotifyClient.getInstance(ctx.session?.accessToken);
    const playlists = await client.currentUser.playlists.playlists();
    return playlists;
  }),

  fetchPlayerList: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      const playlist = await client.playlists.getPlaylistItems(input);
      return playlist;
    }),

  fetchTracks: protectedProcedure
    .input(z.object({ playlistId: z.string() }))
    .query(async ({ input, ctx }) => {
      const client = SpotifyClient.getInstance(ctx.session?.accessToken);
      const tracks = await client.tracks.get(input.playlistId);
      return tracks;
    }),
});
