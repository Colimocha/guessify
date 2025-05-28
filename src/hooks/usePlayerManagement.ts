import { useEffect, useState } from "react";
import { type Player } from "~/types/player-state";

/**
 * Custom hook for managing a list of players and their scores.
 *
 * @returns {Object} An object containing the following properties and methods:
 * - `players`: An array of player objects.
 * - `addPlayers`: A function to add a specified number of new players.
 * - `incrementScore`: A function to increment the score of a player by their ID.
 * - `decrementScore`: A function to decrement the score of a player by their ID.
 * - `deletePlayer`: A function to delete a player by their ID.
 * - `resetScore`: A function to reset the scores of all players to 0.
 * - `resetGame`: A function to reset the game by clearing all players.
 *
 * @example
 * const {
 *   players,
 *   addPlayers,
 *   incrementScore,
 *   decrementScore,
 *   deletePlayer,
 *   resetScore,
 *   resetGame,
 * } = usePlayerManagement();
 *
 * addPlayers(3); // Adds 3 new players
 * incrementScore(1); // Increments the score of the player with ID 1
 * decrementScore(1); // Decrements the score of the player with ID 1
 * deletePlayer(1); // Deletes the player with ID 1
 * resetScore(); // Resets the scores of all players to 0
 * resetGame(); // Clears all players
 */
export const usePlayerManagement = () => {
  const [players, setPlayers] = useState<Player[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("players");
      return saved ? (JSON.parse(saved) as Player[]) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  const addPlayers = (count: number) => {
    if (count > 0) {
      const currentPlayerCount = players.length;
      const newPlayers = Array.from({ length: count }, (_, index) => ({
        id: Date.now() + index,
        name: `P${currentPlayerCount + index + 1}`,
        score: 0,
      }));
      setPlayers([...players, ...newPlayers]);
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

  const decrementScore = (playerId: number) => {
    setPlayers(
      players.map((player) =>
        player.id === playerId
          ? { ...player, score: Math.max(0, player.score - 1) }
          : player,
      ),
    );
  };

  const deletePlayer = (playerId: number) => {
    setPlayers(players.filter((player) => player.id !== playerId));
  };

  const resetScore = () => {
    setPlayers(players.map((player) => ({ ...player, score: 0 })));
  };

  const resetGame = () => {
    setPlayers([]);
  };

  return {
    players,
    addPlayers,
    incrementScore,
    decrementScore,
    deletePlayer,
    resetScore,
    resetGame,
  };
};
