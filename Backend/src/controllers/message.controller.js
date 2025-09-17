const pool = require("../lib/db"); 
const cloudinary = require("../lib/cloudinary");
const { getReceiverSocketId, io } = require("../lib/socket");

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const { rows: filteredUsers } = await pool.query(
      `SELECT id, fullname, email, profilepic, createdat, isonline AS "isOnline", lastseen AS "lastSeen"
       FROM users 
       WHERE id != $1`,
      [loggedInUserId]
    );

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const { rows: messages } = await pool.query(
      `SELECT id, senderid, receiverid, text, image, createdat
       FROM messages
       WHERE (senderid = $1 AND receiverid = $2) 
          OR (senderid = $2 AND receiverid = $1)
       ORDER BY createdat ASC`,
      [myId, userToChatId]
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const senderId = req.user.id;
    const { id: receiverId } = req.params;
    const { text, image, tempId } = req.body;

    if (!text && !image) {
      return res.status(400).json({ error: "Message text or image required" });
    }

    let imageUrl = null;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ error: "Image upload failed" });
      }
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
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", normalizedMessage);
    }

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSent", { ...normalizedMessage, tempId });
    }

    return res.status(201).json(normalizedMessage);
  } catch (error) {
    console.error("sendMessage error:", error.stack);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUsersForSidebar,
  getMessages,
  sendMessage,
};
