import { Close as CloseIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { type Player } from "~/types/player";

interface PlayerCardProps {
  player: Player;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onDelete: (id: number) => void;
}

export const PlayerCard = ({
  player,
  onIncrement,
  onDecrement,
  onDelete,
}: PlayerCardProps) => {
  return (
    <div
      className="card relative h-24 w-24 cursor-pointer bg-base-100 shadow-xl transition-all hover:bg-base-200"
      onClick={() => onIncrement(player.id)}
    >
      <button
        className="btn btn-circle btn-xs absolute -right-1 -top-1 bg-red-500 text-white hover:bg-red-700"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(player.id);
        }}
      >
        <CloseIcon fontSize="small" />
      </button>
      <button
        className="btn btn-circle btn-xs absolute -right-1 top-6 bg-red-800 text-white hover:bg-red-950"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement(player.id);
        }}
      >
        <RemoveIcon fontSize="small" />
      </button>
      <div className="card-body items-center p-3">
        <h2 className="card-title">{player.name}</h2>
        <p className="text-3xl font-bold">{player.score}</p>
      </div>
    </div>
  );
};
