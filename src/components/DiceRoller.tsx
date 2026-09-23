import { useState } from 'react';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, RotateCcw } from 'lucide-react';

export function DiceRoller({ roomCode, roomState }: { roomCode: string, roomState: any }) {
  const { diceValues = [1, 1], isRolling = false } = roomState.gameState || {};
  const [localValues, setLocalValues] = useState([1, 1]);

  const rollDice = () => {
    socket.emit("update_game_state", {
      roomCode,
      state: { isRolling: true, diceValues: roomState.gameState?.diceValues || [1, 1] }
    });

    let rolls = 0;
    const interval = setInterval(() => {
      const newValues = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
      setLocalValues(newValues);
      rolls++;
      if (rolls > 15) {
        clearInterval(interval);
        socket.emit("update_game_state", {
          roomCode,
          state: { isRolling: false, diceValues: newValues }
        });
      }
    }, 80);
  };

  const currentValues = isRolling ? localValues : diceValues;

  return (
    <div className="flex flex-col items-center w-full max-w-sm space-y-12">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Dados de la Suerte</h3>
        <p className="text-zinc-400 text-sm">Úsalos para decidir retos o quién paga.</p>
      </div>

      <div className="flex gap-6">
        {currentValues.map((val: number, i: number) => (
          <motion.div
            key={i}
            animate={isRolling ? {
              rotateX: [0, 90, 180, 270, 360],
              rotateY: [0, 45, 90, 135, 180],
              scale: [1, 1.1, 1],
              y: [0, -20, 0]
            } : {}}
            transition={{ duration: 0.2, repeat: isRolling ? Infinity : 0 }}
            className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl relative"
          >
            <div className={`grid grid-cols-3 grid-rows-3 gap-2 w-16 h-16 pointer-events-none`}>
              {renderDots(val)}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-4xl font-bold text-white mb-8 tracking-tighter">
          {isRolling ? "???" : currentValues[0] + currentValues[1]}
        </p>

        <button
          onClick={rollDice}
          disabled={isRolling}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-2xl font-bold shadow-xl shadow-amber-900/20 active:scale-95 transition-all text-lg flex items-center gap-3"
        >
          <Dices className="w-6 h-6" />
          Lanzar Dados
        </button>
      </div>
    </div>
  );
}

function renderDots(value: number) {
  const dotPositions: { [key: number]: number[] } = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };

  const dots = [];
  for (let i = 0; i < 9; i++) {
    const isActive = dotPositions[value].includes(i);
    dots.push(
      <div 
        key={i} 
        className={`w-3 h-3 rounded-full transition-opacity duration-75 ${isActive ? 'bg-zinc-950 opacity-100' : 'bg-transparent opacity-0'}`} 
      />
    );
  }
  return dots;
}
