const pool = require("../lib/db"); 
const cloudinary = require("../lib/cloudinary");
const { getReceiverSocketId, io } = require("../lib/socket");

const getUsersForSidebar = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection(); 

    const loggedInUserId = req.user.id;

    const [filteredUsers] = await connection.execute(
      `SELECT id, fullname, email, profilepic, createdat, isOnline, lastSeen
       FROM users 
       WHERE id != ?`, 
      [loggedInUserId]
    );

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const [messages] = await db.execute(
      `SELECT * FROM messages 
       WHERE (senderId = ? AND receiverId = ?) 
       OR (senderId = ? AND receiverId = ?) 
       ORDER BY createdAt ASC`, 
      [myId, userToChatId, userToChatId, myId]
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
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
    const [result] = await db.execute(
      `INSERT INTO messages (senderId, receiverId, text, image, seen) 
       VALUES (?, ?, ?, ?, ?)`,
      [senderId, receiverId, text, imageUrl, false] 
    );
    const newMessage = {
      id: result.insertId,
      senderId,
      receiverId,
      text,
      image: imageUrl,
      seen: false, 
      createdAt: new Date().toISOString(),
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage); 
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUsersForSidebar,
  getMessages,
  sendMessage,
};
