import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { motion } from 'framer-motion';
import { X, Circle, RotateCcw } from 'lucide-react';

export function TicTacToe({ roomCode, roomState }: { roomCode: string, roomState: any }) {
  const { board, xIsNext, winner } = roomState.gameState || { board: Array(9).fill(null), xIsNext: true, winner: null };

  const handlePlay = (i: number, isBot: boolean = false) => {
    if (board[i] || winner) return;
    
    const playerIndex = roomState.players.findIndex((p: any) => p.id === socket.id);
    if (!isBot && playerIndex === -1) return;
    // P1 is X, P2 is O. Si es un bot, saltamos esta validación
    if (!isBot) {
        if (playerIndex === 0 && !xIsNext) return; 
        if (playerIndex === 1 && xIsNext) return; 
    }

    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    
    const newWinner = calculateWinner(newBoard);

    socket.emit("update_game_state", {
      roomCode,
      state: {
        board: newBoard,
        xIsNext: !xIsNext,
        winner: newWinner
      }
    });
  };

  useEffect(() => {
    if (winner) return;
    
    // El host (P1) maneja la lógica de los bots
    const isHost = roomState.players[0]?.id === socket.id;
    if (!isHost) return;

    const currentPlayer = roomState.players[xIsNext ? 0 : 1];
    
    if (currentPlayer?.isBot) {
        const timer = setTimeout(() => {
            const available = board.map((c: any, i: number) => c === null ? i : null).filter((c: any) => c !== null);
            if (available.length > 0) {
                const randomMove = available[Math.floor(Math.random() * available.length)];
                handlePlay(randomMove, true);
            }
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [board, xIsNext, winner]);

  const resetGame = () => {
    socket.emit("update_game_state", {
      roomCode,
      state: {
        board: Array(9).fill(null),
        xIsNext: true,
        winner: null
      }
    });
  };

  const playerIndex = roomState.players.findIndex((p: any) => p.id === socket.id);
  let status;
  if (winner) {
    status = `Ganador: ${winner === 'Draw' ? 'Empate' : winner}`;
  } else {
    status = `Turno de: ${xIsNext ? 'X' : 'O'}`;
  }

  const isMyTurn = (playerIndex === 0 && xIsNext) || (playerIndex === 1 && !xIsNext);
  const mySymbol = playerIndex === 0 ? 'X' : playerIndex === 1 ? 'O' : 'Espectador';

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-medium text-zinc-100">{status}</h3>
        <p className="text-zinc-500 text-sm mt-1">Eres: <span className="font-bold text-zinc-300">{mySymbol}</span> {!winner && isMyTurn && <span className="text-rose-400">¡Tu turno!</span>}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-zinc-800 p-2 rounded-2xl w-full max-w-[280px]">
        {board.map((cell: any, i: number) => (
          <button
            key={i}
            onClick={() => handlePlay(i)}
            disabled={!!cell || !!winner || !isMyTurn}
            className="aspect-square bg-zinc-950 rounded-xl flex items-center justify-center text-4xl disabled:opacity-80 transition-colors hover:bg-zinc-900"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: cell ? 1 : 0 }}
              className="flex items-center justify-center"
            >
              {cell === 'X' && <X className="w-12 h-12 text-rose-500" strokeWidth={2.5} />}
              {cell === 'O' && <Circle className="w-10 h-10 text-sky-500" strokeWidth={3} />}
            </motion.div>
          </button>
        ))}
      </div>

      {winner && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={resetGame}
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl transition-colors font-medium shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
          Jugar de nuevo
        </motion.button>
      )}
    </div>
  );
}

function calculateWinner(squares: any[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  if (!squares.includes(null)) return 'Draw';
  return null;
}
