"use client";

import {
  PersonAddAlt as PersonAddAltIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { usePlayerManagement } from "~/hooks/usePlayerManagement";
import { AddPlayerModal } from "./add-player-modal";
import { PlayerCard } from "./player-card";

export const GameBoard = () => {
  const {
    players,
    addPlayers,
    incrementScore,
    decrementScore,
    deletePlayer,
    resetScore,
    resetGame,
  } = usePlayerManagement();

  return (
    <div className="rounded-xl border-2 border-gray-300 p-4 shadow-md shadow-white">
      <div className="join mt-4 flex">
        <button
          className="btn btn-square btn-primary join-item"
          onClick={() => {
            const modal = document.getElementById(
              "add_player_modal",
            ) as HTMLDialogElement;
            modal.showModal();
          }}
        >
          <PersonAddAltIcon />
        </button>
        {players.length > 0 && (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-square join-item"
            >
              <SettingsIcon />
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content z-[1] w-52 gap-2 rounded-box bg-base-100 p-2 shadow"
            >
              <li>
                <button
                  className="btn btn-outline btn-warning"
                  onClick={resetScore}
                >
                  Reset Score
                </button>
              </li>
              <li>
                <button
                  className="btn btn-outline btn-error"
                  onClick={resetGame}
                >
                  Reset Game
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <AddPlayerModal onAdd={addPlayers} />

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-1 lg:grid-cols-1">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onIncrement={incrementScore}
            onDecrement={decrementScore}
            onDelete={deletePlayer}
          />
        ))}
      </div>
    </div>
  );
};
