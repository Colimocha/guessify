import { type AccessToken } from "@spotify/web-api-ts-sdk";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Spotify from "next-auth/providers/spotify";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken: AccessToken;
  }
}

// Spotify OAuth 2.0 scope
const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-library-read user-library-modify playlist-read-private playlist-read-collaborative'

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization:
        "https://accounts.spotify.com/authorize?scope=" + scope,
    }),
  ],
  callbacks: {
    // 添加 jwt 回调来存储 Spotify tokens
    async jwt({ token, account, user }) {
      // 首次登录时
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = (account.expires_at ?? 0) * 1000; // expires_at 单位为秒，转换为毫秒
        token.expires = account.expires_at;
      }
      // ...existing token refresh logic if needed...
      return token;
    },
    // 修改 session 回调以返回 access token 到前端
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
      accessToken: {
        access_token: token.accessToken,
        token_type: "Bearer",
        expires_in: token.expires,
        refresh_token: token.refreshToken,
        expires: token.accessTokenExpires,
      }, // 附加 Spotify access token
      // ...可附加更多 token 信息，如 refreshToken 等...
    }),
  },
} satisfies NextAuthConfig;
