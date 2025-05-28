import { HydrateClient } from "~/trpc/server";
import { SpotifyAuthButtons } from "./_components/auth/spotify-auth-buttons";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-[hsl(280,100%,70%)]">Guessify</span>
        </h1>

        <SpotifyAuthButtons />
      </div>
    </HydrateClient>
  );
}
