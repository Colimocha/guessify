import { type NextAuthConfig } from "next-auth";
import { type JWT } from "next-auth/jwt";
import Spotify from "next-auth/providers/spotify";
import { env } from "~/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

// Spotify OAuth 2.0 scope
const scope =
  "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state user-library-read user-library-modify playlist-read-private playlist-read-collaborative";

const CLIENT_ID = env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN_URL = env.SPOTIFY_REFRESH_TOKEN_URL;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64",
    );
    const response = await fetch(SPOTIFY_REFRESH_TOKEN_URL, {
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
      refresh_token?: string;
      scope?: string;
      token_type?: string;
      error?: string;
      error_description?: string;
    };

    if (!response.ok) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
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
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      authorization: "https://accounts.spotify.com/authorize?scope=" + scope,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          sub: account.providerAccountId, // 确保用户ID
        };
      }
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires)
        return token;
      const refreshed = await refreshAccessToken(token);
      return refreshed;
    },
    async session(params) {
      const { session, token } = params;
      // 类型安全判断 error 字段
      if (typeof token === "object" && "error" in token && token.error) {
        // 抛出 Error 以兼容 Awaitable<Session | DefaultSession>
        throw new Error("SessionInvalid");
      }
      return {
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
      };
    },
  },
} satisfies NextAuthConfig;
