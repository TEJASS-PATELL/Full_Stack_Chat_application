const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const pool = require("../lib/db");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: { 
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {};

const getReceiverSocketId = (userId) => userSocketMap[userId] || null;

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;

    try {
      await pool.query( "UPDATE users SET isonline = true WHERE id = $1",[userId]);
    } catch (err) {
      console.error("DB error (online):", err.stack);
    }
  }

  socket.emit("userId", userId);
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ toUserId, userId }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("showTyping", { userId });
    }
  });

  socket.on("sendMessage", ({ fromUserId, toUserId, tempId }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingMessage", { fromUserId, toUserId, tempId});
    }
  });

  socket.on("disconnect", async () => {
    const disconnectedUserId = Object.keys(userSocketMap).find(
      (id) => userSocketMap[id] === socket.id
    );

    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];

      try {
        await pool.query(
          "UPDATE users SET isonline = false, lastseen = NOW() WHERE id = $1",
          [disconnectedUserId]
        );
      } catch (err) {
        console.error("DB error (lastSeen):", err.stack);
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { app, server, io, getReceiverSocketId };
