const db = require("../lib/db");
const cloudinary = require("../lib/cloudinary");
const { getReceiverSocketId, io } = require("../lib/socket");

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const [filteredUsers] = await db.execute(
      `SELECT id, fullname, email, profilepic, createdat, isOnline, lastSeen
       FROM users 
       WHERE id != ?`, 
      [loggedInUserId]
    );

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
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

    // ✅ Upload image to Cloudinary if provided
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // ✅ Insert new message into MySQL with seen = false
    const [result] = await db.execute(
      `INSERT INTO messages (senderId, receiverId, text, image, seen) 
       VALUES (?, ?, ?, ?, ?)`,
      [senderId, receiverId, text, imageUrl, false] // 👈 Add seen = false
    );

    // ✅ Create newMessage object
    const newMessage = {
      id: result.insertId,
      senderId,
      receiverId,
      text,
      image: imageUrl,
      seen: false, // 👈 Add seen in response
      createdAt: new Date().toISOString(),
    };

    // ✅ Real-time emit to receiver if online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage); // 👈 Return with seen: false
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
