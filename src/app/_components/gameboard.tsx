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
    <div className="">
      <div className="join flex">
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
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-square btn-neutral join-item">
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
              <button className="btn btn-outline btn-error" onClick={resetGame}>
                Reset Game
              </button>
            </li>
          </ul>
        </div>
      </div>

      <AddPlayerModal onAdd={addPlayers} />

      <div className="mt-6 grid grid-rows-5 gap-2">
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
