import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Timer, AlertCircle } from 'lucide-react';

export function ReflexDuel({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { status = 'idle', readyTime = null, winnerId = null, startTime = null } = roomState.gameState || {};
  const players = roomState.players;
  const isP1 = players[0]?.id === socketId;
  const isP2 = players[1]?.id === socketId;

  const startDuel = () => {
    if (players.length < 2) return;
    
    // Set a random delay between 2 and 5 seconds
    const delay = 2000 + Math.random() * 3000;
    const readyAt = Date.now() + delay;

    socket.emit("update_game_state", {
      roomCode,
      state: {
        status: 'waiting',
        readyTime: readyAt,
        winnerId: null,
        startTime: null
      }
    });

    // Auto-trigger the "GO" signal from the host perspective
    if (isP1) {
      setTimeout(() => {
        socket.emit("update_game_state", {
          roomCode,
          state: {
            status: 'active',
            readyTime: readyAt,
            winnerId: null,
            startTime: Date.now()
          }
        });
      }, delay);
    }
  };

  const handleTap = () => {
    if (status === 'waiting') {
      // Early tap penalty
      socket.emit("update_game_state", {
        roomCode,
        state: {
          status: 'finished',
          winnerId: players.find((p: any) => p.id !== socketId)?.id,
          penalty: true
        }
      });
      return;
    }

    if (status === 'active' && !winnerId) {
      const reactionTime = Date.now() - startTime;
      socket.emit("update_game_state", {
        roomCode,
        state: {
          status: 'finished',
          winnerId: socketId,
          reactionTime
        }
      });
    }
  };

  const winnerIndex = players.findIndex((p: any) => p.id === winnerId);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm space-y-10">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Duelo de Reflejos</h3>
        <p className="text-zinc-400 text-sm">Toca el botón solo cuando se ponga verde.</p>
      </div>

      <div className="w-full aspect-square flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {status === 'idle' || status === 'finished' ? (
            <motion.button
              key="start"
              onClick={startDuel}
              disabled={players.length < 2}
              className="w-48 h-48 rounded-full bg-zinc-900 border-4 border-zinc-800 flex flex-col items-center justify-center shadow-2xl hover:bg-zinc-800 transition-colors group"
            >
              {winnerId ? (
                <>
                  <Zap className={`w-12 h-12 mb-2 ${winnerId === socketId ? 'text-emerald-500' : 'text-rose-500'}`} />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {winnerId === socketId ? '¡Ganaste!' : 'Perdiste...'}
                  </span>
                </>
              ) : (
                <>
                  <Timer className="w-12 h-12 text-zinc-600 group-hover:text-amber-500 transition-colors mb-2" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Iniciar Duelo</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.div
              key="action"
              onClick={handleTap}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-full aspect-square rounded-3xl cursor-pointer flex items-center justify-center transition-colors duration-75 select-none touch-manipulation shadow-[0_0_50px_rgba(0,0,0,0.5)] ${status === 'active' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500/10 border-2 border-red-500/20'}`}
            >
              {status === 'active' ? (
                <Zap className="w-32 h-32 text-white animate-pulse" />
              ) : (
                <div className="text-center">
                   <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-2" />
                   <p className="text-rose-500 font-bold tracking-tighter text-3xl">¡ESPERA!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status === 'finished' && winnerId && (
         <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl w-full text-center">
           <p className="text-zinc-300 text-sm">
             {roomState.gameState.penalty ? "¡Falsa salida!" : `Reacción: ${roomState.gameState.reactionTime}ms`}
           </p>
           <p className="text-xs text-zinc-500 mt-1">Ganador: Jugador {winnerIndex + 1}</p>
         </div>
      )}
    </div>
  );
}
