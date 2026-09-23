import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, RefreshCw } from 'lucide-react';

const CAPITALS = [
  { country: "España", capital: "Madrid" },
  { country: "Francia", capital: "París" },
  { country: "Italia", capital: "Roma" },
  { country: "México", capital: "Ciudad de México" },
  { country: "Japón", capital: "Tokio" },
  { country: "Brasil", capital: "Brasilia" },
  { country: "Argentina", capital: "Buenos Aires" },
  { country: "Alemania", capital: "Berlín" },
  { country: "Colombia", capital: "Bogotá" },
  { country: "Canadá", capital: "Ottawa" },
];

export function GeographyQuiz({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { current = null, options = [], winnerId = null } = roomState.gameState || {};
  const players = roomState.players;

  const nextQuestion = () => {
    const entry = CAPITALS[Math.floor(Math.random() * CAPITALS.length)];
    const others = CAPITALS.filter(c => c.capital !== entry.capital).sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [entry.capital, ...others.map(o => o.capital)].sort(() => Math.random() - 0.5);

    socket.emit("update_game_state", {
      roomCode,
      state: {
        current: entry,
        options: allOptions,
        winnerId: null
      }
    });
  };

  const handleSelect = (capital: string) => {
    if (winnerId || !current) return;

    if (capital === current.capital) {
      socket.emit("update_game_state", {
        roomCode,
        state: { ...roomState.gameState, winnerId: socketId }
      });
    }
  };

  if (players[0]?.id === socketId && !current) {
    nextQuestion();
  }

  const winnerIndex = players.findIndex((p: any) => p.id === winnerId);

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Geografía</h3>
        <p className="text-zinc-400 text-sm">¿Cuál es la capital de...?</p>
      </div>

      {current && (
        <div className="w-full space-y-6">
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-10 text-center shadow-xl">
             <Globe className="w-12 h-12 text-sky-500 mx-auto mb-4 opacity-50" />
             <h4 className="text-4xl font-bold text-white tracking-widest">{current.country}</h4>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            {options.map((option: string, i: number) => (
              <button
                key={i}
                disabled={!!winnerId}
                onClick={() => handleSelect(option)}
                className={`py-4 px-2 rounded-xl border font-medium transition-all active:scale-95 ${
                  winnerId === socketId && option === current.capital
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : winnerId && option === current.capital
                    ? 'bg-zinc-800 border-emerald-500/50 text-emerald-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {winnerId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
           <p className={winnerId === socketId ? 'text-emerald-400' : 'text-rose-400'}>
             {winnerId === socketId ? "¡Lo sabías!" : `¡Jugador ${winnerIndex + 1} se adelantó!`}
           </p>
           <button onClick={nextQuestion} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700">
             Siguiente país
           </button>
        </motion.div>
      )}
    </div>
  );
}
