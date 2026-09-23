import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const COUPLE_QUESTIONS = [
  "¿Cuál es tu recuerdo favorito de nosotros?",
  "Si pudiéramos viajar a donde sea mañana, ¿a dónde iríamos?",
  "¿Qué es algo que hago que siempre te hace sonreír?",
  "¿Cuál ha sido la mejor comida que hemos compartido?",
  "¿Qué cualidad mía admiras más?",
  "Si tuviéramos que repetir una cita, ¿cuál sería?",
  "¿Qué meta te gustaría que logremos juntos este año?",
  "¿Cuál es el hábito más gracioso que tengo?",
  "Si hicieran una película de nosotros, ¿qué actores seríamos?",
  "¿Cuál fue tu primera impresión de mí y cómo cambió?"
];

const GROUP_QUESTIONS = [
  "¿Qué es lo más loco que han hecho juntos?",
  "Cuenten la peor cita que han tenido cada uno.",
  "Si tuvieran que vivir en la casa de alguien de este grupo por un mes, ¿de quién sería?",
  "¿Qué hábito extraño tiene cada miembro del grupo?",
  "¿Cuál es el recuerdo más gracioso que tienen juntos?",
  "Si el grupo formara una banda musical, ¿qué rol tendría cada uno?",
  "¿Qué es lo que más aprecian de su amistad?",
  "¿Quién es el más probable de desaparecer en una fiesta?",
  "Si estallara el fin del mundo mañana, ¿qué rol tomaría cada uno?",
  "Comparta un secreto inofensivo que nadie más sepa de aquí."
];

const NEVER_HAVE_I_EVER = [
  "Yo nunca, nunca he fingido estar enfermo para no ir a un evento social.",
  "Yo nunca, nunca me he olvidado del cumpleaños de un amigo cercano.",
  "Yo nunca, nunca he comido algo del suelo asumiendo la 'regla de los 5 segundos'.",
  "Yo nunca, nunca he usado el cepillo de dientes de otra persona.",
  "Yo nunca, nunca me he cortado el pelo yo mismo en un ataque de ansiedad.",
  "Yo nunca, nunca he mandado un mensaje quejándome de alguien a esa misma persona.",
  "Yo nunca, nunca he estado despierto más de 24 horas y luego he alucinado cosas.",
  "Yo nunca, nunca me he caído en público y he fingido que era a propósito.",
  "Yo nunca, nunca he stalkeado a un ex.",
  "Yo nunca, nunca he llorado viendo una película de dibujos animados."
];

export function ConversationStarters({ roomCode, roomState }: { roomCode: string, roomState: any }) {
  const currentIndex = roomState.gameState?.questionIndex || 0;

  const nextQuestion = () => {
    let limit = COUPLE_QUESTIONS.length;
    if (roomState.currentGame === 'trivia_group') limit = GROUP_QUESTIONS.length;
    else if (roomState.currentGame === 'never_have_i_ever') limit = NEVER_HAVE_I_EVER.length;

    socket.emit("update_game_state", {
      roomCode,
      state: {
        questionIndex: (currentIndex + 1) % limit
      }
    });
  };

  let deck = COUPLE_QUESTIONS;
  let title = "Conociéndonos...";
  let styleLine = "from-rose-500/20 to-rose-900/40 border-rose-500/30 shadow-rose-900/10 text-rose-50";

  if (roomState.currentGame === 'trivia_group') {
    deck = GROUP_QUESTIONS;
    title = "Anécdotas del Grupo";
    styleLine = "from-indigo-500/20 to-indigo-900/40 border-indigo-500/30 shadow-indigo-900/10 text-indigo-50";
  } else if (roomState.currentGame === 'never_have_i_ever') {
    deck = NEVER_HAVE_I_EVER;
    title = "Yo Nunca, Nunca";
    styleLine = "from-amber-500/20 to-amber-900/40 border-amber-500/30 shadow-amber-900/10 text-amber-50";
  }

  const currentQuestion = deck[currentIndex] || deck[0];

  return (
    <div className="flex flex-col items-center w-full max-w-sm">
       <div className="mb-8 text-center">
        <h3 className="text-2xl font-medium text-white italic font-serif">{title}</h3>
      </div>

      <div className="relative w-full aspect-[4/3] mb-8 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, rotateX: 20, y: 20 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, rotateX: -20, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`absolute inset-0 bg-gradient-to-br border rounded-3xl p-8 flex items-center justify-center text-center shadow-xl ${styleLine}`}
          >
            <p className="text-xl md:text-2xl font-medium leading-relaxed drop-shadow-md">
              "{currentQuestion}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={nextQuestion}
        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl transition-all shadow-lg text-lg font-medium active:scale-95"
      >
        Siguiente tarjeta
        <ArrowRight className="w-5 h-5 ml-2 opacity-50" />
      </button>
    </div>
  );
}
