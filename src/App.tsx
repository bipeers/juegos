import { useState, useEffect } from "react";
import { socket } from "./socket";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Users, Gamepad2, Heart, Sparkles, X, Circle, RotateCcw, Beer, Target, EyeOff, Bomb, MessageSquare, QrCode, Zap, Dices, Drama, Calculator, Brain, Globe, Palette, Layers, Search } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { TicTacToe } from "./components/TicTacToe";
import { ConversationStarters } from "./components/ConversationStarters";
import { TapChallenge } from "./components/TapChallenge";
import { RandomPicker } from "./components/RandomPicker";
import { SpyGame } from "./components/SpyGame";
import { MatchPerfecto } from "./components/MatchPerfecto";
import { TruthOrDare } from "./components/TruthOrDare";
import { HotBomb } from "./components/HotBomb";
import { ReflexDuel } from "./components/ReflexDuel";
import { DiceRoller } from "./components/DiceRoller";
import { Charades } from "./components/Charades";
import { FastMath } from "./components/FastMath";
import { Alias } from "./components/Alias";
import { MemoryMatch } from "./components/MemoryMatch";
import { WordScramble } from "./components/WordScramble";
import { GeographyQuiz } from "./components/GeographyQuiz";
import { StroopChallenge } from "./components/StroopChallenge";
import { PatternSequence } from "./components/PatternSequence";

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomState, setRoomState] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
      const urlParams = new URLSearchParams(window.location.search);
      const initialCode = urlParams.get('code');
      if (initialCode) {
        setRoomCode(initialCode.toUpperCase());
        setJoinCode(initialCode.toUpperCase());
        socket.emit("join_room", { roomCode: initialCode.toUpperCase() });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      setRoomState(null);
    }

    function onRoomState(state: any) {
      setRoomState(state);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_state", onRoomState);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room_state", onRoomState);
      socket.disconnect();
    };
  }, []);

  const createRoom = (mode: 'couple' | 'group') => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomCode(code);
    socket.emit("join_room", { roomCode: code, mode });
  };

  const joinRoom = () => {
    if (joinCode.trim().length > 0) {
      setRoomCode(joinCode.toUpperCase());
      socket.emit("join_room", { roomCode: joinCode.toUpperCase() });
    }
  };

  const leaveRoom = () => {
    socket.emit("leave_room", roomCode);
    setRoomCode("");
    setRoomState(null);
    setJoinCode("");
  };

  const setGame = (gameType: string) => {
    socket.emit("set_game", { roomCode, gameType });
  };

  if (!isConnected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-50 font-sans">
        <div className="animate-pulse flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 animate-bounce" />
          <span>Conectando a la mesa...</span>
        </div>
      </div>
    );
  }

  const maxPlayers = roomState?.mode === 'group' ? 10 : 2;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-rose-500/30 overflow-hidden">
      {/* Dynamic Background Noise/Gradient */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 -z-10" />

      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-500/10 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 text-rose-400">
          <Heart className="w-5 h-5 fill-rose-500" />
          <span className="font-semibold tracking-tight text-zinc-100">CitaPlay</span>
        </div>
        {roomState && (
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono text-zinc-400 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800 shadow-inner">
             <span className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-0.5 rounded-md text-zinc-300">
               <Users className="w-3.5 h-3.5"/> 
               {roomState.players.length}/{maxPlayers}
             </span>
             <div className="w-px h-3 bg-zinc-700" />
             <span className="text-zinc-300 hidden md:inline">Sala: <span className="text-rose-300 tracking-widest ml-1">{roomCode}</span></span>
             <button onClick={() => setShowQR(true)} className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 px-2 py-0.5 hover:bg-zinc-800 rounded-md transition-colors">
               <QrCode className="w-4 h-4" />
               <span className="text-xs font-semibold hidden sm:inline">Invitar</span>
             </button>
             <button onClick={leaveRoom} className="text-rose-400 hover:text-rose-300 py-0.5 px-1 sm:px-2 hover:bg-rose-500/10 rounded-md transition-colors">Salir</button>
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto p-6 flex flex-col items-center justify-center min-h-[calc(100vh-70px)]">
        <AnimatePresence mode="wait">
          {!roomState ? (
            <motion.div 
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              className="w-full space-y-10 py-10"
            >
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-medium tracking-tight text-zinc-100">¿Quiénes juegan hoy?</h1>
                <p className="text-zinc-400 text-sm">Crea una sala para compartir u únete a una existente.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => createRoom('couple')}
                       className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-2xl transition-all active:scale-[0.97]"
                     >
                       <Heart className="w-8 h-8" />
                       <span className="font-medium text-sm">Mesa de Pareja</span>
                     </button>
                     <button 
                       onClick={() => createRoom('group')}
                       className="flex flex-col items-center justify-center gap-3 py-6 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-2xl transition-all active:scale-[0.97]"
                     >
                       <Users className="w-8 h-8" />
                       <span className="font-medium text-sm">Mesa de Grupo</span>
                     </button>
                </div>
                
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink-0 mx-4 text-zinc-600 font-mono text-xs uppercase tracking-widest">o únete con código</span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                <div className="flex bg-zinc-900 rounded-xl p-1.5 border border-zinc-800 focus-within:border-zinc-700 transition-colors shadow-inner">
                  <input 
                    type="text" 
                    placeholder="INGRESAR CÓDIGO..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full bg-transparent px-4 font-mono text-zinc-200 outline-none uppercase placeholder:text-zinc-700 text-sm"
                    maxLength={4}
                  />
                  <button 
                    onClick={joinRoom}
                    disabled={joinCode.length === 0}
                    className="py-2.5 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Unirse
                  </button>
                </div>
              </div>
            </motion.div>
         ) : !roomState.currentGame ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
              className="w-full space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 mb-4 shadow-xl shadow-black/50">
                  <Gamepad2 className="w-8 h-8 text-rose-500" />
                </div>
                <h2 className="text-2xl font-medium text-white">{roomState.mode === 'group' ? 'Actividades de Grupo' : 'Eligir Juego'}</h2>
                <p className="text-zinc-400 text-sm">Selecciona una tarjeta para empezar la diversión.</p>
              </div>

              <div className="grid gap-4">
                {roomState.mode === 'couple' ? (
                  <>
                    <GameCard 
                      title="Sincronía" 
                      description="¿Piensan igual? Dilemas de pareja."
                      icon={<Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />}
                      onClick={() => setGame('match_perfecto')}
                    />
                    <GameCard 
                      title="Reflejos" 
                      description="Duelo de reacción rápida."
                      icon={<Zap className="w-6 h-6 text-amber-500" />}
                      onClick={() => setGame('reflex_duel')}
                    />
                    <GameCard 
                      title="Cálculo" 
                      description="A ver quién es el genio matemático."
                      icon={<Calculator className="w-6 h-6 text-indigo-400" />}
                      onClick={() => setGame('fast_math')}
                    />
                    <GameCard 
                      title="Preguntas en Pareja" 
                      description="Cartas para romper el hielo y conocerse mejor."
                      icon={<Heart className="w-6 h-6 text-rose-500" />}
                      onClick={() => setGame('trivia')}
                    />
                    <GameCard 
                      title="Tres en Raya" 
                      description="El clásico. A ver quién paga el postre."
                      icon={<X className="w-6 h-6 text-sky-500" />}
                      onClick={() => setGame('tictactoe')}
                    />
                    <GameCard 
                      title="Reto de Toques" 
                      description="Sincronización letal. ¡Gana territorio!"
                      icon={<Sparkles className="w-6 h-6 text-amber-500" />}
                      onClick={() => setGame('tap')}
                    />
                  </>
                ) : (
                  <>
                    <GameCard 
                      title="Círculos" 
                      description="Prueba tu rapidez mental."
                      icon={<Palette className="w-6 h-6 text-emerald-400" />}
                      onClick={() => setGame('stroop')}
                    />
                    <GameCard 
                      title="Anagrama" 
                      description="Descifra la palabra oculta."
                      icon={<Search className="w-6 h-6 text-amber-400" />}
                      onClick={() => setGame('scramble')}
                    />
                    <GameCard 
                      title="Memoria" 
                      description="Encuentra las parejas iguales."
                      icon={<Brain className="w-6 h-6 text-rose-400" />}
                      onClick={() => setGame('memory')}
                    />
                    <GameCard 
                      title="Capitales" 
                      description="¿Cuánto sabes de geografía?"
                      icon={<Globe className="w-6 h-6 text-sky-400" />}
                      onClick={() => setGame('geography')}
                    />
                    <GameCard 
                      title="Patrones" 
                      description="Sigue la secuencia de luces."
                      icon={<Layers className="w-6 h-6 text-purple-400" />}
                      onClick={() => setGame('pattern')}
                    />
                    <GameCard 
                      title="Mímica" 
                      description="Actúa sin decir ni una palabra."
                      icon={<Drama className="w-6 h-6 text-indigo-500" />}
                      onClick={() => setGame('charades')}
                    />
                    <GameCard 
                      title="Tabú" 
                      description="Explica sin usar palabras prohibidas."
                      icon={<Brain className="w-6 h-6 text-rose-400" />}
                      onClick={() => setGame('alias')}
                    />
                    <GameCard 
                      title="Dados" 
                      description="La suerte manda en la mesa."
                      icon={<Dices className="w-6 h-6 text-amber-500" />}
                      onClick={() => setGame('dice_roller')}
                    />
                    <GameCard 
                      title="Verdad o Reto" 
                      description="¿Te atreves? Diversión asegurada."
                      icon={<MessageSquare className="w-6 h-6 text-amber-500" />}
                      onClick={() => setGame('truth_or_dare')}
                    />
                    <GameCard 
                      title="La Bomba" 
                      description="No dejes que explote en tus manos."
                      icon={<Bomb className="w-6 h-6 text-rose-500" />}
                      onClick={() => setGame('hot_bomb')}
                    />
                    <GameCard 
                      title="Preguntas Grupales" 
                      description="Debate y anécdotas para todos."
                      icon={<Users className="w-6 h-6 text-indigo-500" />}
                      onClick={() => setGame('trivia_group')}
                    />
                    <GameCard 
                      title="El Infiltrado" 
                      description="Encuentra al espía entre ustedes."
                      icon={<EyeOff className="w-6 h-6 text-red-500" />}
                      onClick={() => setGame('spy_game')}
                    />
                    <GameCard 
                      title="Yo Nunca Nunca" 
                      description="Descubre los secretos del grupo."
                      icon={<Beer className="w-6 h-6 text-amber-500" />}
                      onClick={() => setGame('never_have_i_ever')}
                    />
                    <GameCard 
                      title="El Sorteo" 
                      description="Ruleta de la suerte (o castigo)."
                      icon={<Target className="w-6 h-6 text-emerald-500" />}
                      onClick={() => setGame('random_picker')}
                    />
                  </>
                )}
              </div>
            </motion.div>
         ) : (
            <motion.div
               key="game"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full h-full flex flex-col items-center justify-center pt-8"
            >
              <button 
                onClick={() => setGame('')} 
                className="mb-8 px-4 py-2 text-sm font-medium text-zinc-400 bg-zinc-900/80 hover:bg-zinc-800 hover:text-zinc-200 rounded-full border border-zinc-800 transition-colors flex items-center gap-2"
              >
                ← Volver al Menú
              </button>
              
              {roomState.players.length === 1 ? (
                 <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-800 rounded-3xl mb-8 shadow-xl text-center w-full max-w-sm">
                    <h3 className="text-xl font-medium text-white mb-2">{roomState.mode === 'group' ? 'Esperando Jugadores' : 'Esperando a tu cita...'}</h3>
                    <p className="text-zinc-400 text-sm mb-6">Muestra este código para que se unan y comience el juego.</p>
                    <div className="p-4 bg-white rounded-2xl shadow-inner mb-6">
                       <QRCodeSVG value={`${window.location.origin}?code=${roomCode}`} size={160} />
                    </div>
                    <div className="bg-zinc-950 rounded-xl py-3 px-6 flex items-center justify-center border border-zinc-800 w-full mb-2">
                       <span className="text-sm text-zinc-500 mr-3">Código:</span>
                       <span className="font-mono text-white tracking-widest text-2xl">{roomCode}</span>
                    </div>
                    
                    <button 
                       onClick={() => socket.emit("add_bot", { roomCode })}
                       className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors text-xs font-medium w-full"
                    >
                       🤖 Añadir bot (Pruebas)
                    </button>
                 </div>
              ) : (
                <>
                  {roomState.currentGame === 'tictactoe' && <TicTacToe roomCode={roomCode} roomState={roomState} />}
                  {(roomState.currentGame === 'trivia' || roomState.currentGame === 'trivia_group' || roomState.currentGame === 'never_have_i_ever') && <ConversationStarters roomCode={roomCode} roomState={roomState} />}
                  {roomState.currentGame === 'tap' && <TapChallenge roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'random_picker' && <RandomPicker roomCode={roomCode} roomState={roomState} />}
                  {roomState.currentGame === 'spy_game' && <SpyGame roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'match_perfecto' && <MatchPerfecto roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'truth_or_dare' && <TruthOrDare roomCode={roomCode} roomState={roomState} />}
                  {roomState.currentGame === 'hot_bomb' && <HotBomb roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'reflex_duel' && <ReflexDuel roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'dice_roller' && <DiceRoller roomCode={roomCode} roomState={roomState} />}
                  {roomState.currentGame === 'charades' && <Charades roomCode={roomCode} roomState={roomState} />}
                  {roomState.currentGame === 'fast_math' && <FastMath roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'alias' && <Alias roomCode={roomCode} roomState={roomState} />}
                  {roomState.currentGame === 'memory' && <MemoryMatch roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'scramble' && <WordScramble roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'geography' && <GeographyQuiz roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'stroop' && <StroopChallenge roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                  {roomState.currentGame === 'pattern' && <PatternSequence roomCode={roomCode} roomState={roomState} socketId={socket.id} />}
                </>
              )}
            </motion.div>
         )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                 <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-medium text-white mb-2">Escanea para Unirte</h3>
              <p className="text-sm text-zinc-400 mb-6">Apunta tu cámara a este código</p>
              
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-2xl shadow-inner">
                  <QRCodeSVG value={`${window.location.origin}?code=${roomCode}`} size={180} />
                </div>
              </div>
              
              <div className="bg-zinc-950 rounded-xl p-3 flex items-center justify-between border border-zinc-800">
                 <span className="font-mono text-zinc-300 tracking-widest text-lg ml-2">{roomCode}</span>
                 <button 
                   onClick={() => navigator.clipboard.writeText(`${window.location.origin}?code=${roomCode}`)}
                   className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-white flex items-center gap-2"
                 >
                   <Copy className="w-4 h-4" />
                   <span className="text-xs uppercase font-semibold">Copiar Link</span>
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GameCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50 hover:border-zinc-700 rounded-2xl transition-all group shadow-lg"
    >
      <div className="flex items-center gap-5">
         <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">
           {icon}
         </div>
         <div>
           <h3 className="text-zinc-100 font-medium text-lg leading-tight">{title}</h3>
           <p className="text-zinc-400 text-sm mt-1">{description}</p>
         </div>
      </div>
    </button>
  )
}
