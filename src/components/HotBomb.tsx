import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Skull, RotateCcw } from 'lucide-react';

export function HotBomb({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { currentHolderId, isExploded, timeLeft } = roomState.gameState || { currentHolderId: null, isExploded: false, timeLeft: 15 };
  const players = roomState.players;
  
  const isHolder = socketId === currentHolderId;

  const startBomb = () => {
    if (players.length < 2) return;
    
    const randomPlayer = players[Math.floor(Math.random() * players.length)].id;
    const duration = 10 + Math.floor(Math.random() * 10); // 10-20 seconds
    
    socket.emit("update_game_state", {
      roomCode,
      state: {
        currentHolderId: randomPlayer,
        isExploded: false,
        timeLeft: duration
      }
    });

    // We rely on the host (P1) to maintain the countdown to avoid multiple emitters
    // but for simplicity in this server setup, we can emit a start_bomb_timer event
    // Or just handle it in server.ts (Ideal)
    socket.emit("start_bomb", { roomCode });
  };

  const passBomb = () => {
    if (!isHolder || isExploded) return;
    
    const otherPlayers = players.filter((p: any) => p.id !== socketId);
    const nextHolder = otherPlayers[Math.floor(Math.random() * otherPlayers.length)].id;
    
    socket.emit("update_game_state", {
      roomCode,
      state: {
        ...roomState.gameState,
        currentHolderId: nextHolder
      }
    });
  };

  const holderIndex = players.findIndex((p: any) => p.id === currentHolderId);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm space-y-10">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">La Bomba</h3>
        <p className="text-zinc-400 text-sm">Pásala antes de que sea tarde.</p>
      </div>

      <AnimatePresence mode="wait">
        {!currentHolderId ? (
          <motion.button 
            key="start"
            onClick={startBomb}
            disabled={players.length < 2}
            className="w-48 h-48 rounded-full bg-zinc-900 border-4 border-zinc-800 flex items-center justify-center shadow-2xl hover:bg-zinc-800 transition-colors group"
          >
            <Bomb className="w-20 h-20 text-zinc-600 group-hover:text-rose-500 transition-colors" />
          </motion.button>
        ) : (
          <motion.div 
            key="active"
            className="flex flex-col items-center space-y-8"
          >
            <motion.div 
              animate={isHolder && !isExploded ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className={`relative w-56 h-56 rounded-full flex items-center justify-center border-8 shadow-2xl transition-colors ${isExploded ? 'bg-red-500/20 border-red-500/50' : isHolder ? 'bg-rose-500 border-rose-400 shadow-rose-500/50' : 'bg-zinc-900 border-zinc-800'}`}
            >
              {isExploded ? (
                <Skull className="w-24 h-24 text-red-500" />
              ) : (
                <div 
                  className="cursor-pointer select-none"
                  onClick={passBomb}
                >
                  <Bomb className={`w-28 h-28 transform transition-transform ${isHolder ? 'text-white scale-110' : 'text-zinc-700'}`} />
                  {isHolder && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 bg-zinc-950/80 px-4 py-1 rounded-full text-xs font-bold text-white tracking-widest whitespace-nowrap">
                      ¡TOCA PARA PASAR!
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            <div className="text-center space-y-2">
              {isExploded ? (
                <div className="space-y-4">
                  <p className="text-xl font-bold text-red-500 uppercase tracking-tighter">¡BOOOOOOM!</p>
                  <p className="text-zinc-300">Explotó en las manos del <span className="text-white font-bold">Jugador {holderIndex + 1}</span></p>
                  <button 
                    onClick={startBomb}
                    className="flex items-center gap-2 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors mx-auto"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Otra ronda
                  </button>
                </div>
              ) : (
                <p className="text-zinc-400 font-medium">
                  {isHolder ? "¡LA TIENES TÚ!" : `Jugador ${holderIndex + 1} la tiene...`}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!currentHolderId && players.length < 2 && (
        <p className="text-rose-400 text-xs text-center border border-rose-400/20 bg-rose-400/5 px-4 py-2 rounded-lg">Se necesita al menos una persona extra para jugar.</p>
      )}
    </div>
  );
}
