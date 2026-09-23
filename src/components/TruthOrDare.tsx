import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MessageSquare, Zap, RotateCcw } from 'lucide-react';

const TRUTHS = [
  "¿Quién es la persona de este grupo que mejor te cae?",
  "¿Qué es lo más vergonzoso que has hecho en una cita?",
  "¿Alguna vez has mentido en este grupo?",
  "¿Cuál es tu mayor inseguridad?",
  "¿Qué fue lo primero que pensaste de la persona a tu derecha?",
  "¿Has stalkeado a alguien aquí recientemente?",
  "¿Cuál es el secreto más grande que guardas?"
];

const DARES = [
  "Baila sin música durante 30 segundos.",
  "Envía un mensaje a tu ex diciendo 'Te extraño' (solo broma).",
  "Imita a alguien de este grupo hasta que lo adivinen.",
  "Deja que alguien del grupo publique algo en tus historias de IG.",
  "Bebe un trago de lo que sea que tengas en la mesa.",
  "Canta el estribillo de tu canción favorita a todo pulmón.",
  "Dale tu celular a la persona de la izquierda por 1 minuto."
];

export function TruthOrDare({ roomCode, roomState }: { roomCode: string, roomState: any }) {
  const { type = null, index = 0 } = roomState.gameState || {};
  
  const selectType = (t: 'truth' | 'dare') => {
    const list = t === 'truth' ? TRUTHS : DARES;
    socket.emit("update_game_state", {
      roomCode,
      state: {
        type: t,
        index: Math.floor(Math.random() * list.length)
      }
    });
  };

  const reset = () => {
    socket.emit("update_game_state", {
      roomCode,
      state: { type: null, index: 0 }
    });
  };

  const content = type === 'truth' ? TRUTHS[index] : DARES[index];

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold text-white tracking-tight">Verdad o Reto</h3>
        <p className="text-zinc-400 text-sm mt-1">La honestidad tiene un precio.</p>
      </div>

      <AnimatePresence mode="wait">
        {!type ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 w-full gap-4"
          >
            <button 
              onClick={() => selectType('truth')}
              className="group p-8 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-3xl text-center space-y-2 transition-all active:scale-95"
            >
              <MessageSquare className="w-12 h-12 text-indigo-400 mx-auto" />
              <h4 className="text-2xl font-bold text-indigo-300">VERDAD</h4>
            </button>
            <button 
              onClick={() => selectType('dare')}
              className="group p-8 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-3xl text-center space-y-2 transition-all active:scale-95"
            >
              <Zap className="w-12 h-12 text-amber-400 mx-auto" />
              <h4 className="text-2xl font-bold text-amber-300">RETO</h4>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6"
          >
            <div className={`p-10 rounded-3xl border-2 text-center shadow-2xl relative overflow-hidden ${type === 'truth' ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
              <div className="absolute top-4 left-4 opacity-10">
                {type === 'truth' ? <MessageSquare className="w-20 h-20" /> : <Zap className="w-20 h-20" />}
              </div>
              <p className="text-xl md:text-2xl font-medium text-white leading-relaxed relative z-10">
                "{content}"
              </p>
            </div>

            <button 
              onClick={reset}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Otra persona
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
