import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw } from 'lucide-react';

const WORDS = [
  { word: 'JAVA', hint: 'Lenguaje de programación' },
  { word: 'REACT', hint: 'Biblioteca de UI' },
  { word: 'PIZZA', hint: 'Comida italiana' },
  { word: 'PLAYA', hint: 'Lugar con mar' },
  { word: 'LEON', hint: 'Rey de la selva' },
  { word: 'SOLAR', hint: 'Energía renovable' },
  { word: 'GRIFO', hint: 'Sale agua de él' },
  { word: 'CABLE', hint: 'Transporta electricidad' },
];

export function WordScramble({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { currentWord = null, scrambled = '', hint = '', winnerId = null } = roomState.gameState || {};
  const [guess, setGuess] = useState('');
  const players = roomState.players;

  const nextWord = () => {
    const entry = WORDS[Math.floor(Math.random() * WORDS.length)];
    const scrambledWord = entry.word.split('').sort(() => Math.random() - 0.5).join('');
    
    socket.emit("update_game_state", {
      roomCode,
      state: {
        currentWord: entry.word,
        scrambled: scrambledWord,
        hint: entry.hint,
        winnerId: null
      }
    });
    setGuess('');
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (winnerId || !currentWord) return;

    if (guess.toUpperCase() === currentWord) {
      socket.emit("update_game_state", {
        roomCode,
        state: { ...roomState.gameState, winnerId: socketId }
      });
    } else {
      setGuess('');
    }
  };

  useEffect(() => {
    if (players[0]?.id === socketId && !currentWord) {
      nextWord();
    }
  }, []);

  const winnerIndex = players.findIndex((p: any) => p.id === winnerId);

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Anagrama</h3>
        <p className="text-zinc-400 text-sm">Descifra la palabra antes que los demás.</p>
      </div>

      <div className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-10 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">Palabra Mezclada</p>
        <h4 className="text-4xl font-bold text-white tracking-widest mb-6">
          {scrambled}
        </h4>
        <div className="inline-block px-4 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-500 font-medium italic">
          Pista: {hint}
        </div>
      </div>

      <form onSubmit={handleGuess} className="w-full space-y-4">
        <input 
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={!!winnerId}
          placeholder="Escribe tu respuesta..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 px-6 text-center text-xl text-white outline-none focus:border-rose-500 transition-colors uppercase"
        />
        <button 
          type="submit"
          disabled={!!winnerId || !guess}
          className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          ADIVINAR
        </button>
      </form>

      {winnerId && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-4"
        >
          <p className="text-emerald-400 font-medium">
            {winnerId === socketId ? "¡Correcto! Eres un genio." : `¡Jugador ${winnerIndex + 1} adivinó primero!`}
          </p>
          <button onClick={nextWord} className="text-xs text-zinc-400 underline flex items-center gap-1 mx-auto">
            <RefreshCw className="w-3 h-3" /> Siguiente palabra
          </button>
        </motion.div>
      )}
    </div>
  );
}
