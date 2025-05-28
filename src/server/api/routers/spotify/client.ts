import { type AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { SPOTIFY_CONFIG } from "./config";

export class SpotifyClient {
  private static instance: SpotifyApi;

  public static getInstance(accessToken: AccessToken): SpotifyApi {
    if (!this.instance) {
      this.instance = SpotifyApi.withAccessToken(
        SPOTIFY_CONFIG.clientId,
        accessToken,
      );
    }

    return this.instance;
  }
}
