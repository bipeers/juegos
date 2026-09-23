import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Play } from 'lucide-react';

const COLORS = [
  { name: 'ROJO', class: 'text-rose-500' },
  { name: 'AZUL', class: 'text-sky-500' },
  { name: 'VERDE', class: 'text-emerald-500' },
  { name: 'AMARILLO', class: 'text-amber-400' },
  { name: 'PÚRPURA', class: 'text-purple-500' },
];

export function StroopChallenge({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { currentWord = null, currentColorClass = '', winnerId = null } = roomState.gameState || {};
  const players = roomState.players;

  const nextChallenge = () => {
    const textEntry = COLORS[Math.floor(Math.random() * COLORS.length)];
    const colorEntry = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    socket.emit("update_game_state", {
      roomCode,
      state: {
        currentWord: textEntry.name,
        currentColorClass: colorEntry.class,
        currentColorName: colorEntry.name,
        winnerId: null
      }
    });
  };

  const handleSelect = (colorName: string) => {
    if (winnerId || !currentWord) return;

    if (colorName === roomState.gameState.currentColorName) {
      socket.emit("update_game_state", {
        roomCode,
        state: { ...roomState.gameState, winnerId: socketId }
      });
    }
  };

  if (players[0]?.id === socketId && !currentWord) {
    nextChallenge();
  }

  const winnerIndex = players.findIndex((p: any) => p.id === winnerId);

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-12">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Mente Ágil</h3>
        <p className="text-zinc-400 text-sm italic">¿De qué color es la palabra?</p>
      </div>

      {currentWord && (
        <motion.div 
            key={currentWord + currentColorClass}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full text-center py-16 bg-zinc-900 border-2 border-zinc-800 rounded-3xl shadow-2xl"
        >
             <h4 className={`text-6xl font-black tracking-tighter ${currentColorClass}`}>
               {currentWord}
             </h4>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-3 w-full">
        {COLORS.map((color, i) => (
          <button
            key={i}
            onClick={() => handleSelect(color.name)}
            disabled={!!winnerId}
            className={`p-4 rounded-xl border border-zinc-800 bg-zinc-950 font-bold transition-all active:scale-90 ${color.class} ${winnerId && color.name === roomState.gameState.currentColorName ? 'ring-2 ring-emerald-500' : ''}`}
          >
            {color.name}
          </button>
        ))}
      </div>

      {winnerId && (
        <div className="flex flex-col items-center gap-4">
           <p className="text-emerald-400 font-medium">
             {winnerId === socketId ? "¡Reflejos de acero!" : `¡Jugador ${winnerIndex + 1} ganó!`}
           </p>
           <button onClick={nextChallenge} className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl shadow-lg font-medium transition-colors">
              Siguiente
           </button>
        </div>
      )}
    </div>
  );
}
