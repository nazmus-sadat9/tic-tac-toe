import { Server } from "socket.io";

let io;
const rooms = new Map();

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

function broadcastPlayerCount(roomId) {
  const count = rooms.get(roomId)?.size || 0;
  io.to(roomId).emit("player-count", count);
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // connect to the websocket
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // create a room
    socket.on("create-room", () => {
      const roomId = generateRoomId();

      socket.join(roomId);
      socket.roomId = roomId;
      rooms.set(roomId, new Set([socket.id]));

      socket.emit("room-created", roomId);
      broadcastPlayerCount(roomId);
    });

    // join a room
    socket.on("join-room", (roomId) => {
      if (!roomId || !rooms.has(roomId)) {
        socket.emit("room-error", "Room not found");
        return;
      }

      socket.join(roomId);
      socket.roomId = roomId;
      rooms.get(roomId).add(socket.id);

      socket.emit("room-joined", roomId);
      socket.to(roomId).emit("user-joined", socket.id);
      broadcastPlayerCount(roomId);
    });

    // disconnect a player 
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      const roomId = socket.roomId;
      if (roomId && rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        socket.to(roomId).emit("user-left", socket.id);
        broadcastPlayerCount(roomId);

        if (rooms.get(roomId).size === 0) {
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
