const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");
const db = require("../lib/db");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; 

const getReceiverSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    db.execute("UPDATE users SET isOnline = 1 WHERE id = ?", [userId])
      .then(() => console.log(` User ${userId} marked online`))
      .catch((err) => console.error("DB error (online):", err.message));
  }

  socket.emit("userId", userId);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ toUserId, userId }) => {
    const receiverSocketId = userSocketMap[toUserId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("showTyping", { userId });
    }
  });
  
  socket.on("disconnect", async () => {
    console.log("Disconnected:", socket.id);

    const disconnectedUserId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );

    if (disconnectedUserId) {
      delete userSocketMap[disconnectedUserId];

      try {
        await db.execute(
          "UPDATE users SET isOnline = 0, lastSeen = NOW() WHERE id = ?",
          [disconnectedUserId]
        );
        console.log(`Last seen updated for user ${disconnectedUserId}`);
      } catch (err) {
        console.error("DB error (lastSeen):", err.message);
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { app, server, io, getReceiverSocketId };
