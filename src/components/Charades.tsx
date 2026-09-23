import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Drama, ArrowRight } from 'lucide-react';

const CHARADES_CARDS = [
  "Titanic (Película)",
  "El Rey León (Película)",
  "Un pingüino bailando",
  "Harry Potter (Personaje)",
  "Haciendo una videollamada",
  "Spiderman (Personaje)",
  "Un gato asustado",
  "Alguien comiendo algo muy picante",
  "Bailando reggaetón",
  "Juego de Tronos (Serie)",
  "Afeitándose en el espejo",
  "Intentando atrapar una mosca",
  "La casa de papel (Serie)",
  "Un robot sin batería",
  "Darth Vader (Personaje)",
  "Un náufrago en una isla",
  "Alguien que acaba de ganar la lotería",
  "Una estatua que cobra vida",
];

export function Charades({ roomCode, roomState }: { roomCode: string, roomState: any }) {
  const { currentIndex = 0 } = roomState.gameState || {};

  const nextCard = () => {
    socket.emit("update_game_state", {
      roomCode,
      state: {
        currentIndex: (currentIndex + 1) % CHARADES_CARDS.length
      }
    });
  };

  const currentCard = CHARADES_CARDS[currentIndex];

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <div className="mb-6 text-center">
        <h3 className="text-3xl font-bold text-white tracking-tight">Mímica</h3>
        <p className="text-zinc-400 text-sm mt-1">Actúa sin decir ni una sola palabra.</p>
      </div>

      <div className="relative w-full aspect-[4/3] mb-8 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-indigo-950/50 border-2 border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl"
          >
            <div className="p-4 bg-indigo-500/20 rounded-full mb-6">
              <Drama className="w-12 h-12 text-indigo-400" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {currentCard}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={nextCard}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all shadow-lg text-lg font-medium active:scale-95 border border-zinc-700"
      >
        Cambiar tarjeta
        <ArrowRight className="w-5 h-5 ml-2 opacity-50" />
      </button>

      <div className="mt-8 bg-zinc-900/50 p-4 border border-zinc-800/50 rounded-xl text-center">
        <p className="text-xs text-zinc-400">Pasa el teléfono a quien le toque actuar.</p>
      </div>
    </div>
  );
}
