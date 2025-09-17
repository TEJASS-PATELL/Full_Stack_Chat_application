const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const pool = require("../lib/db");
const cloudinary = require("../lib/cloudinary");

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

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;

    pool.query("UPDATE users SET isonline = true WHERE id = $1", [userId])
      .catch((err) => console.error("DB error (online):", err.stack));
  }

  socket.emit("userId", userId);
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ toUserId, userId }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("showTyping", { userId });
    }
  });

  socket.on("sendMessage", async ({ fromUserId, toUserId, text, image, tempId }) => {
    try {
      let imageUrl = null;
      if (image) {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }

      const result = await pool.query(
        `INSERT INTO messages (senderid, receiverid, text, image)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [fromUserId, toUserId, text, imageUrl]
      );

      const savedMessage = result.rows[0];

      const normalizedMessage = {
        id: savedMessage.id,
        text: savedMessage.text,
        image: savedMessage.image,
        senderId: savedMessage.senderid,
        receiverId: savedMessage.receiverid,
        createdAt: savedMessage.createdat,
      };

      const receiverSocketId = getReceiverSocketId(toUserId);
      if (receiverSocketId) io.to(receiverSocketId).emit("receiveMessage", normalizedMessage);

      const senderSocketId = getReceiverSocketId(fromUserId);
      if (senderSocketId) io.to(senderSocketId).emit("messageSent", { ...normalizedMessage, tempId });
    } catch (err) {
      console.error("DB error (sendMessage):", err.stack);
      const senderSocketId = getReceiverSocketId(fromUserId);
      if (senderSocketId) io.to(senderSocketId).emit("messageFailed", { tempId });
    }
  });

  socket.on("disconnect", async () => {
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
      } catch (err) {
        console.error("DB error (lastSeen):", err.stack);
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

module.exports = { app, server, io, getReceiverSocketId };
