import { socket } from '../socket';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export function TapChallenge({ roomCode, roomState, socketId }: { roomCode: string, roomState: any, socketId: string }) {
  const { progress = 50, winner = null } = roomState.gameState || {};
  
  const playerIndex = roomState.players.findIndex((p: any) => p.id === socketId);
  const isP1 = playerIndex === 0;
  const isSpectator = playerIndex > 1;

  const handleTap = (isBot: boolean = false, botIndex: number = -1) => {
    if (winner) return;
    
    // Tap power: moves progress by 2%
    const pIdx = isBot ? botIndex : playerIndex;
    if (pIdx === -1) return;

    const change = pIdx === 0 ? -3 : 3;
    let newProgress = progress + change;
    
    let newWinner = null;
    if (newProgress <= 0) {
      newProgress = 0;
      newWinner = roomState.players[0].id;
    } else if (newProgress >= 100) {
      newProgress = 100;
      newWinner = roomState.players[1].id;
    }

    socket.emit("update_game_state", {
      roomCode,
      state: {
        progress: newProgress,
        winner: newWinner
      }
    });
  };

  useEffect(() => {
    if (winner) return;
    
    // El host (P1) maneja la lógica de los bots
    const isHost = roomState.players[0]?.id === socketId;
    if (!isHost) return;

    const bots = roomState.players.filter((p: any) => p.isBot);
    if (bots.length === 0) return;

    const interval = setInterval(() => {
        bots.forEach((bot: any) => {
            const botIdx = roomState.players.findIndex((p: any) => p.id === bot.id);
            if (botIdx === 0 || botIdx === 1) { 
                if (Math.random() > 0.4) {
                    handleTap(true, botIdx);
                }
            }
        });
    }, 300);

    return () => clearInterval(interval);
  }, [winner, roomState.players, progress]);

  const resetGame = () => {
    socket.emit("update_game_state", {
      roomCode,
      state: {
         progress: 50,
         winner: null
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-white">Tira y afloja</h3>
        <p className="text-sm text-zinc-400">Toca el botón tan rápido como puedas para ganar terreno.</p>
      </div>

      <div className="w-full relative h-12 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden shadow-inner">
        {/* P1 Zone */}
        <motion.div 
          className="absolute top-0 bottom-0 left-0 bg-rose-500 rounded-l-full"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.1 }}
        />
        {/* P2 Zone */}
        <motion.div 
          className="absolute top-0 bottom-0 right-0 bg-sky-500 rounded-r-full"
          animate={{ width: `${100 - progress}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.1 }}
        />
        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-1 -ml-[0.5px] bg-zinc-950/50 z-10" />
      </div>

      {isSpectator ? (
        <div className="w-full text-center p-6 bg-zinc-900 border border-zinc-800 rounded-3xl mt-4">
           <p className="text-zinc-400 font-medium">Eres espectador</p>
           <p className="text-zinc-600 text-sm mt-1">Apoya a tu favorito mientras juegan.</p>
        </div>
      ) : (
        <button
          onClick={() => handleTap(false)}
          disabled={winner}
          className={`w-40 h-40 rounded-full text-2xl font-bold text-white shadow-[0_0_40px_rgba(0,0,0,0.5)] active:scale-95 transition-transform select-none touch-manipulation focus:outline-none ${playerIndex === 0 ? 'bg-rose-500 shadow-rose-500/20' : playerIndex === 1 ? 'bg-sky-500 shadow-sky-500/20' : 'bg-zinc-800'}`}
        >
          ¡TOCA!
        </button>
      )}

      {winner && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <p className="text-xl font-medium text-white">
            {winner === socketId ? '¡HAS GANADO!' : 'HAS PERDIDO...'}
          </p>
          <button 
            onClick={resetGame}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Revancha
          </button>
        </motion.div>
      )}
    </div>
  );
}
