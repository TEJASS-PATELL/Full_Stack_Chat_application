const pool = require("../lib/db");
const cloudinary = require("../lib/cloudinary");
const { getReceiverSocketId, io } = require("../lib/socket");
const cache = require("../lib/cache");

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const cacheKey = `users_sidebar_${loggedInUserId}`;
    const cachedUsers = cache.get(cacheKey);

    if (cachedUsers) {
      return res.status(200).json(cachedUsers);
    }

    const { rows: filteredUsers } = await pool.query(
      `SELECT id, fullname, email, profilepic, isonline AS "isOnline", lastseen AS "lastSeen" FROM users WHERE id != $1`,
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
    const before = req.query.before;

    const cacheKey = before ? `messages_${myId}_${userToChatId}_before_${before}` : `messages_${myId}_${userToChatId}_latest`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    let query = `
      SELECT id, senderid, receiverid, text, image, createdat
      FROM messages
      WHERE
        (senderid = $1 AND receiverid = $2)
        OR
        (senderid = $2 AND receiverid = $1)
    `;

    const params = [myId, userToChatId];

    if (before) {
      query += ` AND createdat < $3 `;
      params.push(before);
    }

    query += ` ORDER BY createdat DESC LIMIT 30`;

    const { rows } = await pool.query(query, params);
    const finalMessages = rows.reverse();

    cache.set(cacheKey, finalMessages);

    res.status(200).json(finalMessages);
  } catch (error) {
    console.error(error.stack);
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

    cache.del(`messages_${senderId}_${receiverId}`);
    cache.del(`messages_${receiverId}_${senderId}`);

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
    if (senderSocketId) io.to(senderSocketId).emit("messageSent", { ...normalizedMessage, tempId });

    res.status(201).json(normalizedMessage);
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getUsersForSidebar, getMessages, sendMessage };
