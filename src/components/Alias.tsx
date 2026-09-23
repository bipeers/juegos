import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ArrowRight, Brain } from 'lucide-react';

const ALIAS_CARDS = [
  { word: "Pizza", taboo: ["Queso", "Italiana", "Masa", " Pepperoni"] },
  { word: "Aeropuerto", taboo: ["Avión", "Viajar", "Maletas", "Pista"] },
  { word: "Gimnasio", taboo: ["Músculos", "Ejercicio", "Pesas", "Entrenar"] },
  { word: "Instagram", taboo: ["Fotos", "Red Social", "Likes", "Stories"] },
  { word: "Netflix", taboo: ["Películas", "Series", "Streaming", "Ver"] },
  { word: "Hispanoamérica", taboo: ["Países", "Continente", "Latino", "Sur"] },
  { word: "Harry Potter", taboo: ["Mago", "Varita", "Cine", "Pelirrojo"] },
  { word: "Fútbol", taboo: ["Balón", "Gol", "Deporte", "Portero"] },
  { word: "WhatsApp", taboo: ["Chat", "Mensajes", "App", "Teléfono"] },
  { word: "Batman", taboo: ["Héroe", "Gotham", "Murciélago", "Cueva"] },
];

export function Alias({ roomCode, roomState }: { roomCode: string, roomState: any }) {
  const { currentIndex = 0 } = roomState.gameState || {};

  const nextCard = () => {
    socket.emit("update_game_state", {
      roomCode,
      state: {
        currentIndex: (currentIndex + 1) % ALIAS_CARDS.length
      }
    });
  };

  const currentCard = ALIAS_CARDS[currentIndex];

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <div className="mb-6 text-center">
        <h3 className="text-3xl font-bold text-white tracking-tight">Prohibido decir...</h3>
        <p className="text-zinc-400 text-sm mt-1">Explica la palabra sin usar las palabras prohibidas.</p>
      </div>

      <div className="relative w-full aspect-[4/5] mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute inset-0 bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-8 flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 opacity-5 rotate-12">
               <Brain className="w-48 h-48" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Palabra a adivinar</span>
              <h2 className="text-4xl font-bold text-white mb-8 border-b-4 border-amber-500 pb-2">
                {currentCard.word}
              </h2>

              <div className="w-full space-y-4">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-widest block mb-4">No puedes decir:</span>
                <div className="flex flex-wrap justify-center gap-3">
                  {currentCard.taboo.map((w, i) => (
                    <span key={i} className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-medium line-through decoration-rose-500/50">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={nextCard}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all shadow-lg text-lg font-medium active:scale-95 border border-zinc-700"
      >
        Siguiente Palabra
        <ArrowRight className="w-5 h-5 ml-2 opacity-50" />
      </button>

      <div className="mt-6 flex items-center gap-2 text-zinc-500 text-xs">
          <Volume2 className="w-4 h-4" />
          <span>¡Muestra esta tarjeta solo al moderador!</span>
      </div>
    </div>
  );
}
