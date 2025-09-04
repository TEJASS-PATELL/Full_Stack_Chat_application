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
      `SELECT * FROM messages
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
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl = null;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const result = await pool.query(
      `INSERT INTO messages (senderid, receiverid, text, image, seen)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, senderid, receiverid, text, image, seen, createdat`,
      [senderId, receiverId, text, imageUrl, false]
    );

    const newMessage = result.rows[0];

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUsersForSidebar,
  getMessages,
  sendMessage,
};
