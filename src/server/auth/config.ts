import { type NextAuthConfig } from "next-auth";
import { type JWT } from "next-auth/jwt";
import Spotify from "next-auth/providers/spotify";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

// Spotify OAuth 2.0 scope
const scope =
  "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-library-read user-library-modify playlist-read-private playlist-read-collaborative";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN_URL = process.env.SPOTIFY_REFRESH_TOKEN_URL;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64",
    );

    const response = await fetch(SPOTIFY_REFRESH_TOKEN_URL!, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken ?? "",
      }),
    });

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

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
      authorization: "https://accounts.spotify.com/authorize?scope=" + scope,
    }),
  ],
  callbacks: {
    // 添加 jwt 回调来存储 Spotify tokens
    async jwt({ token, account, user }) {
      // if (account && user) {
      //   token.accessToken = account.access_token;
      //   token.refreshToken = account.refresh_token;
      //   token.accessTokenExpires = (account.expires_at ?? 0) * 1000 || 0; // expires_at 单位为秒，转换为毫秒
      //   token.expires = account.expires_at;
      // }

      if (account && user) {
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
        };
      }

      // 检测 token 是否过期，如果过期则获取新 token
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires)
        return token;

      return await refreshAccessToken(token);

      // return token;
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
        expires_in: token.expires,
        refresh_token: token.refreshToken,
        expires: token.accessTokenExpires,
      },
    }),
  },
} satisfies NextAuthConfig;
