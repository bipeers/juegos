import { useState } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Users } from 'lucide-react';

export function RandomPicker({ roomCode, roomState }: { roomCode: string, roomState: any }) {
  const { selectedPlayerId, isSpinning } = roomState.gameState || { selectedPlayerId: null, isSpinning: false };
  const [localDisplayId, setLocalDisplayId] = useState<string | null>(null);

  const players = roomState.players;

  const spin = () => {
    if (players.length < 2) return;
    
    socket.emit("update_game_state", {
      roomCode,
      state: { selectedPlayerId: null, isSpinning: true }
    });

    let spins = 0;
    const maxSpins = 20;
    
    const interval = setInterval(() => {
      spins++;
      const randomId = players[Math.floor(Math.random() * players.length)].id;
      setLocalDisplayId(randomId);

      if (spins >= maxSpins) {
        clearInterval(interval);
        const finalWinner = players[Math.floor(Math.random() * players.length)].id;
        socket.emit("update_game_state", {
          roomCode,
          state: { selectedPlayerId: finalWinner, isSpinning: false }
        });
      }
    }, 150);
  };

  const displayedId = isSpinning ? localDisplayId : selectedPlayerId;
  const displayPlayerIndex = players.findIndex((p:any) => p.id === displayedId);
  const isMe = displayedId === socket.id;

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-12">
        <div className="text-center">
          <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Sorteo de la Suerte</h3>
          <p className="text-zinc-400 text-sm">¿A quién le toca? Gira para averiguarlo.</p>
        </div>

        <div className="relative w-48 h-48 rounded-full bg-zinc-900 border-4 border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden">
           <AnimatePresence mode="popLayout">
             {displayedId ? (
               <motion.div
                 key={displayedId}
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 1.5, opacity: 0 }}
                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
                 className="text-center"
               >
                 {isMe ? (
                     <div className="flex justify-center flex-col items-center">
                         <Target className="w-12 h-12 text-rose-500 mb-2" />
                         <span className="text-2xl font-bold text-white">¡TÚ!</span>
                     </div>
                 ) : (
                     <div className="flex justify-center flex-col items-center">
                         <Users className="w-10 h-10 text-emerald-500 mb-2" />
                         <span className="text-xl font-medium text-emerald-400">Jugador {displayPlayerIndex + 1}</span>
                     </div>
                 )}
               </motion.div>
             ) : (
               <div className="text-zinc-600">
                 <Target className="w-16 h-16" />
               </div>
             )}
           </AnimatePresence>
        </div>

        <button
          onClick={spin}
          disabled={isSpinning || players.length < 2}
          className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-zinc-800 text-white rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all font-medium active:scale-95 text-lg"
        >
          {isSpinning ? 'Girando...' : 'Girar Ruleta'}
        </button>
    </div>
  );
}
