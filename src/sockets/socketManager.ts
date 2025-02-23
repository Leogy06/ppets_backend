import { Server } from "socket.io";

export const users = new Map();

export default function socketManager(io: Server) {
  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on("registerUser", (userId) => {
      users.set(userId, socket.id);
      console.log(`✅ User ${userId} registered with socket ID ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      for (let [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);

          console.log(`🗑 Removed user ${userId} from active sockets`);
          break;
        }
      }
    });
  });
}
