const bcrypt = require("bcrypt");
const db = require("../lib/db");

const lockchat = async (req, res) => {
  const { lockedUserId, pin } = req.body;
  const lockedByUserId = req.user.id;

  if (!pin || !lockedUserId) {
    return res.status(400).json({ message: "Missing PIN or user ID" });
  }

  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ message: "PIN must be a 6-digit number" });
  }

  try {
    const hashedPin = await bcrypt.hash(pin, 10);

    const [existing] = await db.execute(
      "SELECT * FROM chat_locks WHERE locked_by_user_id = ? AND locked_user_id = ?",
      [lockedByUserId, lockedUserId]
    );

    if (existing.length > 0) {
      await db.execute(
        "UPDATE chat_locks SET pin_hash = ? WHERE locked_by_user_id = ? AND locked_user_id = ?",
        [hashedPin, lockedByUserId, lockedUserId]
      );
      res.status(200).json({ message: "Chat lock updated successfully." });
    } else {
      await db.execute(
        "INSERT INTO chat_locks (locked_by_user_id, locked_user_id, pin_hash) VALUES (?, ?, ?)",
        [lockedByUserId, lockedUserId, hashedPin]
      );
      res.status(201).json({ message: "Chat locked successfully." });
    }
  } catch (err) {
    console.error("Lock Error:", err);
    res.status(500).json({ message: "Server error during chat lock operation" });
  }
};

const unlockchat = async (req, res) => {
  const { lockedUserId, pin } = req.body;
  const lockedByUserId = req.user.id;

  if (!pin || !lockedUserId) {
    return res.status(400).json({ message: "Missing PIN or user ID" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT pin_hash FROM chat_locks WHERE locked_by_user_id = ? AND locked_user_id = ?",
      [lockedByUserId, lockedUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No lock found for this chat by current user" });
    }

    const isMatch = await bcrypt.compare(pin, rows[0].pin_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect PIN" });
    }

    await db.execute(
      "DELETE FROM chat_locks WHERE locked_by_user_id = ? AND locked_user_id = ?",
      [lockedByUserId, lockedUserId]
    );

    res.status(200).json({ message: "Chat unlocked successfully", success: true });
  } catch (err) {
    console.error("Unlock Error:", err);
    res.status(500).json({ message: "Server error during chat unlock operation" });
  }
};

const targetUser = async (req, res) => {
  const { targetUserId } = req.params;
  const userIdWhoIsQuerying = req.user.id;

  try {
    const [rows] = await db.execute(
      "SELECT 1 FROM chat_locks WHERE locked_by_user_id = ? AND locked_user_id = ?",
      [userIdWhoIsQuerying, targetUserId]
    );

    const isLocked = rows.length > 0;
    res.status(200).json({ isLocked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching lock status" });
  }
};

module.exports = { lockchat, unlockchat , targetUser }