import { config } from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import sequilize from "./db/config.js";
import app from "./app.js";
import socketManager from "./sockets/socketManager.js";
import { NextFunction, Request, Response } from "express";

config();

const port = process.env.PORT || 8080;

// Create HTTP server
const server = createServer(app);

// console.log("process.env.CLIENT_ORIGIN", process.enksv.CLIENT_ORIGIN);

// WebSocket setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Attach `io` to requests so controllers can access it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// WebSocket logic
socketManager(io);
//adts-frontend-next-app.vercel.app/
const startServer = async () => {
  try {
    await sequilize.sync();
    console.log(
      "\x1b[32m\x1b[1m✔ All models were synchronized successfully.\x1b[0m"
    );

    server.listen(port, () => {
      console.log(`\x1b[32m\x1b[1m✔ Server running on port ${port}\x1b[0m`);
    });
  } catch (error) {
    console.error("\x1b[31m❌ Error starting the server:\x1b[0m", error);
  }
};

startServer();
