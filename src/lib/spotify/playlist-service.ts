import { type AccessToken } from "@spotify/web-api-ts-sdk";
import { SpotifyClient } from "./client";

export class PlaylistService {
  private spotify;

  constructor(accessToken: AccessToken) {
    this.spotify = SpotifyClient.getInstance(accessToken);
  }

  async getCurrentUserPlaylists() {
    try {
      const response = await this.spotify.currentUser.playlists.playlists();
      return response.items;
    } catch (error) {
      console.error("获取歌单失败:", error);
      throw error;
    }
  }
}
