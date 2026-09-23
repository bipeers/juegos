import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, EyeOff, RotateCcw, UserSecret } from 'lucide-react';

const WORD_BANK = [
  { category: "Lugares", word: "Cine" },
  { category: "Lugares", word: "Aeropuerto" },
  { category: "Lugares", word: "Playa" },
  { category: "Lugares", word: "Gimnasio" },
  { category: "Lugares", word: "Supermercado" },
  { category: "Comida", word: "Pizza" },
  { category: "Comida", word: "Hamburguesa" },
  { category: "Comida", word: "Sushi" },
  { category: "Comida", word: "Helado" },
  { category: "Deportes", word: "Fútbol" },
  { category: "Deportes", word: "Tenis" },
  { category: "Deportes", word: "Natación" },
  { category: "Animales", word: "Perro" },
  { category: "Animales", word: "Gato" },
  { category: "Animales", word: "León" },
  { category: "Cosas", word: "Teléfono" },
  { category: "Cosas", word: "Computadora" },
  { category: "Cosas", word: "Cama" },
];

export function SpyGame({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { status, word, category, spyId, activePlayers } = roomState.gameState || { status: 'waiting' };
  const players = roomState.players;

  const startGame = () => {
    if (players.length < 3) {
        alert("Se necesitan al menos 3 jugadores para El Infiltrado.");
        return;
    }

    const randomEntry = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    const randomSpy = players[Math.floor(Math.random() * players.length)].id;
    const currentActive = players.map((p: any) => p.id);

    socket.emit("update_game_state", {
      roomCode,
      state: {
        status: 'playing',
        word: randomEntry.word,
        category: randomEntry.category,
        spyId: randomSpy,
        activePlayers: currentActive
      }
    });
  };

  const endGame = () => {
    socket.emit("update_game_state", {
      roomCode,
      state: {
        status: 'waiting',
        word: null,
        category: null,
        spyId: null
      }
    });
  };

  const isSpy = socketId === spyId;
  const isPlaying = status === 'playing';
  const isObserver = isPlaying && activePlayers && !activePlayers.includes(socketId);

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-8">
      <div className="text-center">
         <h3 className="text-2xl font-bold tracking-tight text-white mb-2">El Infiltrado</h3>
         <p className="text-zinc-400 text-sm">
           {isPlaying 
             ? "Haz preguntas con cuidado y descúbrelo." 
             : "Un jugador no sabrá la palabra secreta."}
         </p>
      </div>

      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center w-full space-y-6"
          >
            <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl w-full text-center shadow-lg">
                <EyeOff className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-80" />
                <p className="text-zinc-300">Jugadores conectados: <span className="font-bold text-white">{players.length}</span></p>
                <p className="text-zinc-500 text-xs mt-2">(Mínimo 3 jugadores)</p>
            </div>
            
            <button
               onClick={startGame}
               disabled={players.length < 3}
               className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all flex justify-center items-center gap-2"
            >
               <Play className="w-5 h-5" />
               Repartir Roles
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full space-y-6"
          >
             {isObserver ? (
                <div className="p-8 w-full bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-4">
                   <Eye className="w-12 h-12 text-zinc-600 mx-auto opacity-50" />
                   <h4 className="text-xl font-bold text-white">Ronda en curso</h4>
                   <p className="text-zinc-400 text-sm">El juego ya comenzó. Se te ocultará la palabra para no hacer spoilers.</p>
                   <p className="text-emerald-400 text-sm mt-4">¡Te unirás automáticamente en la siguiente ronda!</p>
                </div>
             ) : (
                 <div className={`p-8 w-full rounded-3xl border text-center shadow-xl relative overflow-hidden ${isSpy ? 'bg-red-950/30 border-red-900/50' : 'bg-zinc-900 border-zinc-800'}`}>
                    {/* Background watermark */}
                    <div className="absolute -right-8 -bottom-8 opacity-5">
                       <Eye className="w-48 h-48" />
                    </div>

                    <div className="relative z-10 space-y-4">
                      <p className="text-sm text-zinc-400 uppercase tracking-widest font-mono">Categoría: {category}</p>
                      
                      {isSpy ? (
                        <div className="space-y-2 py-4">
                          <h4 className="text-3xl font-bold text-red-400 uppercase tracking-wider">¡Eres el Infiltrado!</h4>
                          <p className="text-zinc-400 text-sm">Disimula y averigua la palabra a o descarta el tema.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          <p className="text-zinc-400">La palabra secreta es:</p>
                          <h4 className="text-4xl font-bold text-white tracking-widest">{word}</h4>
                        </div>
                      )}
                    </div>
                 </div>
             )}

             {!isObserver && (
                 <div className="w-full bg-zinc-900/50 p-4 border border-zinc-800/50 rounded-xl text-center">
                     <p className="text-sm text-zinc-300">Por turnos, hagan 1 pregunta a otra persona sobre algo relacionado con la palabra.</p>
                 </div>
             )}

             <button
               onClick={endGame}
               className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-all flex justify-center items-center gap-2"
            >
               <RotateCcw className="w-5 h-5" />
               Terminar Ronda y Revelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
