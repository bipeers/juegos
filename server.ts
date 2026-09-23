import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

// Resolving dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Real-time State
  const rooms = new Map<string, any>();

  io.on("connection", (socket) => {
    socket.on("join_room", (payload) => {
      const roomCode = typeof payload === 'string' ? payload : payload.roomCode;
      const mode = (typeof payload === 'object' && payload.mode) ? payload.mode : 'couple';

      socket.join(roomCode);
      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, {
          players: [],
          gameState: null,
          currentGame: null,
          mode: mode
        });
      }
      
      const room = rooms.get(roomCode);
      const isCoupleAndFull = room.mode === 'couple' && room.players.length >= 2;
      const isGroupAndFull = room.mode === 'group' && room.players.length >= 20;

      if (!isCoupleAndFull && !isGroupAndFull && !room.players.find((p: any) => p.id === socket.id)) {
         room.players.push({
           id: socket.id,
           score: 0,
           ready: false
         });
      }

      io.to(roomCode).emit("room_state", room);
    });

    socket.on("leave_room", (roomCode) => {
      socket.leave(roomCode);
      const room = rooms.get(roomCode);
      if (room) {
        room.players = room.players.filter((p: any) => p.id !== socket.id);
        io.to(roomCode).emit("room_state", room);
        if (room.players.length === 0) {
            rooms.delete(roomCode);
        }
      }
    });

    socket.on("disconnecting", () => {
      for (const roomCode of socket.rooms) {
        if (roomCode !== socket.id) {
            const room = rooms.get(roomCode);
            if (room) {
                room.players = room.players.filter((p: any) => p.id !== socket.id);
                io.to(roomCode).emit("room_state", room);
                if (room.players.length === 0) {
                    rooms.delete(roomCode);
                }
            }
        }
      }
    });

    socket.on("start_bomb", ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (room && room.gameState) {
            if (room.bombInterval) clearInterval(room.bombInterval);
            
            room.bombInterval = setInterval(() => {
                const r = rooms.get(roomCode);
                if (!r || !r.gameState || r.gameState.isExploded || r.currentGame !== 'hot_bomb') {
                    clearInterval(room.bombInterval);
                    return;
                }
                
                r.gameState.timeLeft -= 1;
                if (r.gameState.timeLeft <= 0) {
                    r.gameState.isExploded = true;
                    clearInterval(room.bombInterval);
                }
                io.to(roomCode).emit("room_state", r);
            }, 1000);
        }
    });

    socket.on("add_bot", ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (room) {
            const botCount = room.players.filter((p: any) => p.isBot).length;
            room.players.push({
                id: `bot_${botCount + 1}_${Math.random().toString(36).substring(2,6)}`,
                isBot: true,
                score: 0,
                ready: true
            });
            io.to(roomCode).emit("room_state", room);
        }
    });

    socket.on("set_game", ({ roomCode, gameType }) => {
        const room = rooms.get(roomCode);
        if (room) {
            room.currentGame = gameType;
            if (gameType === 'tictactoe') {
                room.gameState = {
                    board: Array(9).fill(null),
                    xIsNext: true,
                    winner: null
                };
            } else if (gameType === 'trivia') {
                room.gameState = {
                    questionIndex: 0,
                };
            }
            io.to(roomCode).emit("room_state", room);
        }
    });

     socket.on("update_game_state", ({ roomCode, state }) => {
        const room = rooms.get(roomCode);
        if (room) {
            room.gameState = state;
            io.to(roomCode).emit("room_state", room);
        }
    });

  });


  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
