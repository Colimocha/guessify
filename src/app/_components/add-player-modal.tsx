import { useState } from "react";

interface AddPlayerModalProps {
  onAdd: (count: number) => void;
}

export const AddPlayerModal = ({ onAdd }: AddPlayerModalProps) => {
  const [playerCount, setPlayerCount] = useState<string>("");

  const handleAdd = () => {
    const count = parseInt(playerCount);
    if (count > 0) {
      onAdd(count);
      setPlayerCount("");
      const modal = document.getElementById(
        "add_player_modal",
      ) as HTMLDialogElement;
      modal.close();
    }
  };

  return (
    <dialog id="add_player_modal" className="modal">
      <div className="modal-box">
        <h3 className="mb-4 text-lg font-bold">Add Players</h3>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="8"
            value={playerCount}
            onChange={(e) => setPlayerCount(e.target.value)}
            placeholder="Enter player count"
            className="input input-bordered w-full"
          />
          <button className="btn btn-primary" onClick={handleAdd}>
            Ok
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>Close</button>
      </form>
    </dialog>
  );
};
