import { Server } from "socket.io";

let io;
const rooms = new Map();

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board) {
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

function broadcastPlayerCount(roomId) {
  const count = rooms.get(roomId)?.players.size || 0;
  io.to(roomId).emit("player-count", count);
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // create a room
    socket.on("create-room", () => {
      const roomId = generateRoomId();

      socket.join(roomId);
      socket.roomId = roomId;

      rooms.set(roomId, {
        players: new Map([[socket.id, "X"]]),
        board: Array(9).fill(null),
        turn: "X",
      });

      socket.emit("room-created", roomId);
      socket.emit("player-symbol", "X");
      broadcastPlayerCount(roomId);
    });

    // join a room
    socket.on("join-room", (roomId) => {
      if (!roomId || !rooms.has(roomId)) {
        socket.emit("room-error", "Room not found");
        return;
      }

      const room = rooms.get(roomId);

      if (room.players.size >= 2) {
        socket.emit("room-error", "Room full");
        return;
      }

      socket.join(roomId);
      socket.roomId = roomId;

      const symbol = "O"; 
      room.players.set(socket.id, symbol);

      socket.emit("room-joined", roomId);
      socket.emit("player-symbol", symbol);
      socket.emit("sync-board", room.board);

      socket.to(roomId).emit("user-joined", socket.id);
      broadcastPlayerCount(roomId);
    });

    // make a move
    socket.on("make-move", ({ roomId, index, symbol }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      if (room.board[index] || room.turn !== symbol) return;
      if (room.players.get(socket.id) !== symbol) return;

      room.board[index] = symbol;
      room.turn = symbol === "X" ? "O" : "X";

      io.to(roomId).emit("move-made", { index, symbol });

      const winner = checkWinner(room.board);
      if (winner) {
        io.to(roomId).emit("game-over", { winner });
      } else if (room.board.every((cell) => cell !== null)) {
        io.to(roomId).emit("game-over", { winner: null }); // draw
      }
    });

    // reset game
    socket.on("reset-game", (roomId) => {
      const room = rooms.get(roomId);
      if (!room) return;

      room.board = Array(9).fill(null);
      room.turn = "X";

      io.to(roomId).emit("game-reset");
    });

    // disconnect a player
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      const roomId = socket.roomId;
      if (roomId && rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.players.delete(socket.id);
        socket.to(roomId).emit("user-left", socket.id);
        broadcastPlayerCount(roomId);

        if (room.players.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket(server) first.");
  }
  return io;
}
