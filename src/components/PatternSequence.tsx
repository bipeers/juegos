import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Play, RefreshCw } from 'lucide-react';

export function PatternSequence({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { sequence = [], userStep = 0, isShowing = false, winnerId = null } = roomState.gameState || {};
  const players = roomState.players;
  const isP1 = players[0]?.id === socketId;

  const startRound = () => {
    const newSymbol = Math.floor(Math.random() * 4);
    socket.emit("update_game_state", {
      roomCode,
      state: {
        sequence: [...sequence, newSymbol],
        userStep: 0,
        isShowing: true,
        winnerId: null
      }
    });

    // Handle the visual display (purely client side or server controlled? 
    // Let's do a simple client side timer for the 'isShowing' state for now)
    setTimeout(() => {
        socket.emit("update_game_state", {
            roomCode,
            state: { ...roomState.gameState, sequence: [...sequence, newSymbol], isShowing: false }
        });
    }, (sequence.length + 1) * 800 + 500);
  };

  const handlePress = (index: number) => {
    if (isShowing || winnerId) return;

    if (index === sequence[userStep]) {
      if (userStep === sequence.length - 1) {
        // Round won!
        socket.emit("update_game_state", {
          roomCode,
          state: { ...roomState.gameState, winnerId: socketId }
        });
      } else {
        socket.emit("update_game_state", {
          roomCode,
          state: { ...roomState.gameState, userStep: userStep + 1 }
        });
      }
    } else {
        // Fail
        socket.emit("update_game_state", {
            roomCode,
            state: { sequence: [], userStep: 0, isShowing: false, winnerId: null }
        });
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-12">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Secuencia</h3>
        <p className="text-zinc-400 text-sm">Memoriza el patrón de luces.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full aspect-square p-4 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => handlePress(i)}
            disabled={isShowing || winnerId}
            className={`rounded-2xl transition-all shadow-inner active:scale-95 ${
              i === 0 ? 'bg-rose-500/20 border-rose-500/40' :
              i === 1 ? 'bg-sky-500/20 border-sky-500/40' :
              i === 2 ? 'bg-emerald-500/20 border-emerald-500/40' :
              'bg-amber-500/20 border-amber-500/40'
            } border-4 ${isShowing && sequence[userStep] === i ? 'opacity-100 scale-105 brightness-150 shadow-[0_0_20px]' : 'opacity-40'}`}
            style={{ 
                boxShadow: isShowing && sequence[userStep] === i ? `0 0 40px ${i === 0 ? '#f43f5e' : i === 1 ? '#0ea5e9' : i === 2 ? '#10b981' : '#f59e0b'}` : ''
            }}
          />
        ))}
      </div>

      <div className="w-full space-y-4">
        {winnerId ? (
            <div className="text-center space-y-4">
                <p className="text-emerald-400 font-bold">¡Bien hecho! Nivel {sequence.length} completado.</p>
                <button onClick={startRound} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                    <Play className="w-5 h-5" /> Subir de Nivel
                </button>
            </div>
        ) : !isShowing && sequence.length > 0 ? (
            <div className="text-center">
                <p className="text-zinc-400 text-sm font-mono tracking-widest uppercase">Tu turno: {userStep}/{sequence.length}</p>
            </div>
        ) : sequence.length === 0 ? (
            <button onClick={startRound} className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-bold transition-all active:scale-95">
                EMPEZAR NIVEL 1
            </button>
        ) : (
            <div className="text-center italic text-zinc-500 animate-pulse">Presta atención...</div>
        )}
      </div>
    </div>
  );
}
