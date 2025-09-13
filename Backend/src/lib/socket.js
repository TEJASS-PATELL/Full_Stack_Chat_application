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

const getReceiverSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;

    pool.query("UPDATE users SET isonline = true WHERE id = $1", [userId])
      .then(() => console.log(`User ${userId} marked online`))
      .catch((err) => console.error("DB error (online):", err.stack));
  }

  socket.emit("userId", userId);
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("sendMessage", (message) => {
    const receiverSocketId = userSocketMap[message.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }
    io.to(socket.id).emit("newMessage", message);
  });

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
        await pool.query(
          "UPDATE users SET isonline = false, lastseen = NOW() WHERE id = $1",
          [disconnectedUserId]
        );
        console.log(`Last seen updated for user ${disconnectedUserId}`);
      } catch (err) {
        console.error("DB error (lastSeen):", err.stack);
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


module.exports = { app, server, io, getReceiverSocketId };
