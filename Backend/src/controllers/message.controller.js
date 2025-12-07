const pool = require("../lib/db");
const cloudinary = require("../lib/cloudinary");
const { getReceiverSocketId, io } = require("../lib/socket");
const cache = require("../lib/cache");

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const cacheKey = `users_sidebar_${loggedInUserId}`;
    const cachedUsers = cache.get(cacheKey);

    if (cachedUsers) return res.status(200).json(cachedUsers);

    const { rows: filteredUsers } = await pool.query(
      `SELECT id, fullname, email, profilepic, isonline AS "isOnline", lastseen AS "lastSeen"
       FROM users WHERE id != $1`,
      [loggedInUserId]
    );

    cache.set(cacheKey, filteredUsers);
    res.status(200).json(filteredUsers);

  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const cacheKey = `messages_${myId}_${userToChatId}_all`;
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const { rows } = await pool.query(
      `SELECT id, senderid, receiverid, text, image, createdat
       FROM messages
       WHERE 
         (senderid = $1 AND receiverid = $2)
         OR
         (senderid = $2 AND receiverid = $1)
       ORDER BY createdat ASC`,
      [myId, userToChatId]
    );

    cache.set(cacheKey, rows);
    res.status(200).json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const senderId = req.user.id;
    const { id: receiverId } = req.params;
    const { text, image, tempId } = req.body;

    if (!text && !image) return res.status(400).json({ error: "Message text or image required" });

    let imageUrl = null;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const result = await pool.query(
      `INSERT INTO messages (senderid, receiverid, text, image)
       VALUES ($1, $2, $3, $4)
       RETURNING id, senderid, receiverid, text, image, createdat`,
      [senderId, receiverId, text, imageUrl]
    );

    const newMessage = result.rows[0];

    const normalizedMessage = {
      id: newMessage.id,
      text: newMessage.text,
      senderId: newMessage.senderid,
      receiverId: newMessage.receiverid,
      image: newMessage.image,
      createdAt: newMessage.createdat,
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("receiveMessage", normalizedMessage);

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId)
      io.to(senderSocketId).emit("messageSent", { ...normalizedMessage, tempId });

    res.status(201).json(normalizedMessage);

  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteMessageImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    const { rows } = await pool.query(
      `SELECT senderid, receiverid, image 
       FROM messages 
       WHERE id = $1`,
      [messageId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const message = rows[0];

    if (message.senderid !== userId) {
      return res.status(403).json({ error: "You cannot delete this image" });
    }

    if (!message.image) {
      return res.status(400).json({ error: "No image exists for this message" });
    }

    const publicId = imageUrl.split("/").pop().split(".")[0];

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn("Cloudinary delete failed:", err.message);
    }

    await pool.query(
      `UPDATE messages SET image = NULL WHERE id = $1`,
      [messageId]
    );

    cache.clear();

    const senderId = message.senderid;
    const receiverId = message.receiverid;

    const senderSocketId = getReceiverSocketId(senderId);
    const receiverSocketId = getReceiverSocketId(receiverId);

    const payload = { messageId, image: null };

    if (senderSocketId) io.to(senderSocketId).emit("imageDeleted", payload);
    if (receiverSocketId) io.to(receiverSocketId).emit("imageDeleted", payload);

    res.json({ success: true, messageId });

  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getUsersForSidebar, getMessages, sendMessage, deleteMessageImage };
