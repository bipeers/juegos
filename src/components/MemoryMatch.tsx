import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, RefreshCw } from 'lucide-react';

const EMOJIS = ['🍕', '🍔', '🍦', '🍩', '🍎', '🍓', '🍇', '🍉', '🥑', '🌮'];

export function MemoryMatch({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { cards = [], flippedIndices = [], matchedPairs = [], currentPlayerId = null } = roomState.gameState || {};
  const players = roomState.players;
  const isMyTurn = socketId === currentPlayerId;

  const initGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ id, emoji, matched: false }));
    
    socket.emit("update_game_state", {
      roomCode,
      state: {
        cards: shuffled,
        flippedIndices: [],
        matchedPairs: [],
        currentPlayerId: players[0].id
      }
    });
  };

  const handleCardClick = (index: number) => {
    if (!isMyTurn || flippedIndices.length === 2 || flippedIndices.includes(index) || cards[index].matched) return;

    const newFlipped = [...flippedIndices, index];
    
    if (newFlipped.length === 2) {
      const first = cards[newFlipped[0]];
      const second = cards[newFlipped[1]];

      if (first.emoji === second.emoji) {
        const newMatched = [...matchedPairs, first.emoji];
        const newCards = cards.map((c: any, i: number) => 
          newFlipped.includes(i) ? { ...c, matched: true } : c
        );
        
        socket.emit("update_game_state", {
          roomCode,
          state: {
            ...roomState.gameState,
            cards: newCards,
            flippedIndices: [],
            matchedPairs: newMatched
          }
        });
      } else {
        socket.emit("update_game_state", {
          roomCode,
          state: { ...roomState.gameState, flippedIndices: newFlipped }
        });

        setTimeout(() => {
          const nextPlayerIdx = (players.findIndex((p: any) => p.id === currentPlayerId) + 1) % players.length;
          socket.emit("update_game_state", {
            roomCode,
            state: {
              ...roomState.gameState,
              flippedIndices: [],
              currentPlayerId: players[nextPlayerIdx].id
            }
          });
        }, 1500);
      }
    } else {
      socket.emit("update_game_state", {
        roomCode,
        state: { ...roomState.gameState, flippedIndices: newFlipped }
      });
    }
  };

  useEffect(() => {
    if (players[0]?.id === socketId && cards.length === 0) {
      initGame();
    }
  }, []);

  const turnIndex = players.findIndex((p: any) => p.id === currentPlayerId);

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Parejas</h3>
        <p className="text-zinc-400 text-sm">Entrena tu memoria y encuentra los pares.</p>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full">
        {cards.map((card: any, i: number) => (
          <div 
            key={i}
            onClick={() => handleCardClick(i)}
            className={`aspect-square rounded-xl cursor-pointer transition-all duration-300 transform preserve-3d ${
              flippedIndices.includes(i) || card.matched ? 'rotate-y-180' : ''
            }`}
          >
            <div className={`absolute inset-0 rounded-xl flex items-center justify-center text-3xl border-2 transition-colors ${
              card.matched ? 'bg-emerald-500/20 border-emerald-500/50' : 
              flippedIndices.includes(i) ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-900 border-zinc-800'
            }`}>
              {(flippedIndices.includes(i) || card.matched) ? card.emoji : <Brain className="w-6 h-6 text-zinc-700" />}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isMyTurn ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
          <span className="text-sm font-medium text-zinc-100">
            {isMyTurn ? "Tu turno" : `Turno: Jugador ${turnIndex + 1}`}
          </span>
        </div>
        <button onClick={initGame} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
