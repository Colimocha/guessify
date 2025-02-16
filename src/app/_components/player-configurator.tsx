"use client";

import { Settings as SettingsIcon } from "@mui/icons-material";
import { type SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
import { useState } from "react";

const COUNTDOWN_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30, 60];

const INTERVAL_OPTIONS = [
  { name: "Presage Interval", value: 0 },
  { name: "Random Single Interval", value: 1 },
  { name: "Random Any Interval", value: 2 },
] as const;

interface PlaylistSelectorProps {
  playlists: SimplifiedPlaylist[];
  onPlaylistSelect: (playlistId: string) => void;
  onCountDown: (countdown: number) => void;
  onIntervalValue: (value: number) => void;
}

export function PlayerConfigurator({
  playlists,
  onPlaylistSelect,
  onCountDown,
  onIntervalValue,
}: PlaylistSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [selectedCountdown, setSelectedCountdown] = useState(5);
  const [selectedInterval, setSelectedInterval] = useState(0);

  const handleSubmit = () => {
    onPlaylistSelect(selectedPlaylist);
    onCountDown(selectedCountdown);
    onIntervalValue(selectedInterval);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-circle btn-primary absolute top-0 right-0 z-10 m-2"
        onClick={() => setIsOpen(true)}
      >
        <SettingsIcon />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-box">
            <h3 className="mb-4 text-lg font-bold">Settings</h3>
            <div className="flex flex-col gap-4">

              <div className="flex items-center gap-2">
                <label className="input flex items-center gap-2 w-1/2">
                  Playlists
                </label>
                <select
                  className="select select-bordered w-full"
                  defaultValue=""
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                >
                  <option value="" disabled>
                    Playlists
                  </option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.uri}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="input flex items-center gap-2 w-1/2">Countdown(s)</label>
                <select
                  className="select select-bordered w-full"
                  defaultValue={5}
                  onChange={(e) =>
                    setSelectedCountdown(Number(e.currentTarget.value))
                  }
                >
                  <option value="" disabled>
                    Countdown(s)
                  </option>
                  {COUNTDOWN_OPTIONS.map((countdown) => (
                    <option key={countdown} value={countdown}>
                      {countdown}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="input flex items-center gap-2 w-1/2">Interval</label>
                <select
                  className="select select-bordered w-full"
                  defaultValue={0}
                  onChange={(e) =>
                    setSelectedInterval(Number(e.currentTarget.value))
                  }
                >
                  <option value="" disabled>
                    Interval Mode
                  </option>
                  {INTERVAL_OPTIONS.map((data) => (
                    <option key={data.name} value={data.value}>
                      {data.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
