import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';

const CHALLENGES = [
  { q: "¿Playa o Montaña?", o1: "Playa", o2: "Montaña" },
  { q: "¿Pizza o Sushi?", o1: "Pizza", o2: "Sushi" },
  { q: "¿Cine en casa o Salir de fiesta?", o1: "Cine", o2: "Fiesta" },
  { q: "¿Perros o Gatos?", o1: "Perros", o2: "Gatos" },
  { q: "¿Viaje planeado o Aventura improvisada?", o1: "Planeado", o2: "Improvisado" },
  { q: "¿Dulce o Salado?", o1: "Dulce", o2: "Salado" },
  { q: "¿Madrugar o Trasnochar?", o1: "Madrugar", o2: "Trasnochar" },
];

export function MatchPerfecto({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { currentIndex = 0, selections = {} } = roomState.gameState || {};
  const currentChallenge = CHALLENGES[currentIndex];
  
  const playerIndex = roomState.players.findIndex((p: any) => p.id === socketId);
  const mySelection = selections[socketId];
  
  const otherPlayer = roomState.players.find((p: any) => p.id !== socketId);
  const otherSelection = otherPlayer ? selections[otherPlayer.id] : null;

  const bothSelected = roomState.players.length === 2 && selections[roomState.players[0].id] && selections[roomState.players[1].id];

  const handleSelect = (option: string) => {
    if (mySelection) return;
    socket.emit("update_game_state", {
      roomCode,
      state: {
        ...roomState.gameState,
        selections: { ...selections, [socketId]: option }
      }
    });
  };

  const nextChallenge = () => {
    socket.emit("update_game_state", {
      roomCode,
      state: {
        currentIndex: (currentIndex + 1) % CHALLENGES.length,
        selections: {}
      }
    });
  };

  const isMatch = bothSelected && selections[roomState.players[0].id] === selections[roomState.players[1].id];

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white italic">Sincronía</h3>
        <p className="text-zinc-400 text-sm mt-1">¿Qué tanto piensan igual?</p>
      </div>

      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <h4 className="text-xl font-medium text-zinc-100">{currentChallenge.q}</h4>
        
        <div className="grid grid-cols-1 gap-3">
          <OptionButton 
            text={currentChallenge.o1} 
            selected={mySelection === currentChallenge.o1}
            revealed={bothSelected}
            isMatch={isMatch}
            othersChoice={otherSelection === currentChallenge.o2}
            onClick={() => handleSelect(currentChallenge.o1)}
          />
          <OptionButton 
            text={currentChallenge.o2} 
            selected={mySelection === currentChallenge.o2}
            revealed={bothSelected}
            isMatch={isMatch}
            othersChoice={otherSelection === currentChallenge.o1}
            onClick={() => handleSelect(currentChallenge.o2)}
          />
        </div>
      </div>

      <AnimatePresence>
        {bothSelected && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-4 w-full"
          >
            {isMatch ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <Sparkles className="w-4 h-4" />
                ¡CONEXIÓN TOTAL!
              </div>
            ) : (
              <div className="text-rose-400 font-medium bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">
                Ouch, polos opuestos...
              </div>
            )}
            
            <button 
              onClick={nextChallenge}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-medium border border-zinc-700"
            >
              Siguiente Dilema
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!bothSelected && mySelection && (
        <p className="text-zinc-500 text-sm animate-pulse">Esperando a tu pareja...</p>
      )}
    </div>
  );
}

function OptionButton({ text, selected, revealed, isMatch, onClick }: { text: string, selected: boolean, revealed: boolean, isMatch: boolean, othersChoice: boolean, onClick: () => void }) {
  let bgColor = "bg-zinc-950 border-zinc-800 hover:border-zinc-700";
  if (selected) bgColor = "bg-rose-500/20 border-rose-500/50";
  if (revealed && selected) {
    bgColor = isMatch ? "bg-emerald-500/20 border-emerald-500/50" : "bg-rose-500/20 border-rose-500/50";
  }

  return (
    <button 
      onClick={onClick}
      disabled={revealed || selected}
      className={`w-full py-4 px-6 rounded-2xl border text-lg font-medium transition-all flex items-center justify-between ${bgColor}`}
    >
      <span className={selected || (revealed && isMatch) ? "text-white" : "text-zinc-400"}>{text}</span>
      {selected && !revealed && <Check className="w-5 h-5 text-rose-500" />}
      {revealed && selected && isMatch && <Check className="w-5 h-5 text-emerald-500" />}
      {revealed && selected && !isMatch && <X className="w-5 h-5 text-rose-500" />}
    </button>
  );
}
