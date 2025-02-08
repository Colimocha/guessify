"use client";

import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";

type Player = {
  id: number;
  name: string;
  score: number;
};

export const GameBoard = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([
        ...players,
        {
          id: Date.now(),
          name: newPlayerName,
          score: 0,
        },
      ]);
      setNewPlayerName("");
      const modal = document.getElementById(
        "add_player_modal",
      ) as HTMLDialogElement;
      modal.close();
    }
  };

  const incrementScore = (playerId: number) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId
          ? { ...player, score: player.score + 1 }
          : player,
      ),
    );
  };

  const deletePlayer = (playerId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayers(players.filter((player) => player.id !== playerId));
  };

  const resetScore = () => {
    setPlayers(players.map((player) => ({ ...player, score: 0 })));
  };

  const resetGame = () => {
    setPlayers([]);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-lg">
      <div className="join mt-4 flex">
        {/* 打开模态框的按钮 */}
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
          <>
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
          </>
        )}
      </div>
      {/* 模态框 */}
      <dialog id="add_player_modal" className="modal">
        <div className="modal-box">
          <h3 className="mb-4 text-lg font-bold">添加新玩家</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="请输入玩家名字"
              className="input input-bordered w-full"
            />
            <button className="btn btn-primary" onClick={addPlayer}>
              确定
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>关闭</button>
        </form>
      </dialog>

      {/* 玩家列表 */}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-1">
        {players.map((player) => (
          <div
            key={player.id}
            className="card relative h-24 w-24 cursor-pointer bg-base-100 shadow-xl transition-all hover:bg-base-200"
            onClick={() => incrementScore(player.id)}
          >
            <button
              className="btn btn-circle btn-xs absolute -right-2 -top-2 bg-red-500 text-white hover:bg-red-700"
              onClick={(e) => deletePlayer(player.id, e)}
            >
              ✕
            </button>
            <div className="card-body items-center p-3">
              <h2 className="card-title">{player.name}</h2>
              <p className="text-3xl font-bold">{player.score}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
