import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // join a room
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      socket.roomId = roomId;

      console.log(`Socket ${socket.id} joined room: ${roomId}`);

      socket.to(roomId).emit('user-joined', { userId: socket.id });
    });

    // Disconnect event
    socket.on("disconnect", () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit('user-left', socket.id);
      }
      console.log(`player disconnected: ${socket.id}`);
    });
  });

  return io;
};


export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};
