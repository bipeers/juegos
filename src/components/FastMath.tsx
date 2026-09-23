import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Check, X } from 'lucide-react';

function generateProblem() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * (a * b > 100 ? 2 : 3))]; // Less multiplication for simplicity
  
  let result;
  switch(op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    default: result = a + b;
  }
  
  // Generate options
  const options = new Set([result]);
  while(options.size < 4) {
    options.add(result + (Math.floor(Math.random() * 10) - 5));
  }
  
  return {
    equation: `${a} ${op === '*' ? '×' : op} ${b}`,
    answer: result,
    options: Array.from(options).sort(() => Math.random() - 0.5)
  };
}

export function FastMath({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { problem = null, winnerId = null } = roomState.gameState || {};
  const players = roomState.players;

  const nextRound = () => {
    socket.emit("update_game_state", {
      roomCode,
      state: {
        problem: generateProblem(),
        winnerId: null
      }
    });
  };

  const handleSelect = (option: number) => {
    if (winnerId || !problem) return;

    if (option === problem.answer) {
      socket.emit("update_game_state", {
        roomCode,
        state: { ...roomState.gameState, winnerId: socketId }
      });
    } else {
      // Penalty or just wrong? Let's just say only correct counts for now
    }
  };

  useEffect(() => {
    if (players[0]?.id === socketId && !problem) {
      nextRound();
    }
  }, []);

  const winnerIndex = players.findIndex((p: any) => p.id === winnerId);

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Cálculo Rápido</h3>
        <p className="text-zinc-400 text-sm">Sé el primero en tocar la respuesta correcta.</p>
      </div>

      <AnimatePresence mode="wait">
        {problem && (
          <motion.div
            key={problem.equation}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center gap-8"
          >
            <div className="w-full py-12 bg-zinc-900 border-2 border-zinc-800 rounded-3xl text-center shadow-xl">
              <h4 className="text-5xl font-mono font-bold text-white tracking-widest">
                {problem.equation}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              {problem.options.map((option: number, i: number) => (
                <button
                  key={i}
                  disabled={!!winnerId}
                  onClick={() => handleSelect(option)}
                  className={`py-6 rounded-2xl border-2 text-3xl font-mono font-bold transition-all active:scale-95 ${
                    winnerId === socketId && option === problem.answer 
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : winnerId && option === problem.answer
                      ? 'bg-zinc-800 border-emerald-500/50 text-emerald-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {winnerId && (
        <motion.div
            initial={{ opacity:0, y: 10 }}
            animate={{ opacity:1, y: 0 }}
            className="flex flex-col items-center gap-4 w-full"
        >
            <p className={`font-bold ${winnerId === socketId ? 'text-emerald-400' : 'text-rose-400'}`}>
                {winnerId === socketId ? '¡Correcto!' : `¡Jugador ${winnerIndex + 1} fue más rápido!`}
            </p>
            <button 
                onClick={nextRound}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all border border-zinc-700 font-medium"
            >
                Siguiente Problema
            </button>
        </motion.div>
      )}
    </div>
  );
}
