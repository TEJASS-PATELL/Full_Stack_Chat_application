const bcrypt = require("bcrypt");
const pool = require("../lib/db");

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

    const { rows: existing } = await pool.query(
      "SELECT * FROM chat_locks WHERE locked_by_user_id = $1 AND locked_user_id = $2",
      [lockedByUserId, lockedUserId]
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE chat_locks SET pin_hash = $1 WHERE locked_by_user_id = $2 AND locked_user_id = $3",
        [hashedPin, lockedByUserId, lockedUserId]
      );
      res.status(200).json({ message: "Chat lock updated successfully." });
    } else {
      await pool.query(
        "INSERT INTO chat_locks (locked_by_user_id, locked_user_id, pin_hash) VALUES ($1, $2, $3)",
        [lockedByUserId, lockedUserId, hashedPin]
      );
      res.status(201).json({ message: "Chat locked successfully." });
    }
  } catch (err) {
    console.error("Lock Error:", err.stack);
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
    const { rows } = await pool.query(
      "SELECT pin_hash FROM chat_locks WHERE locked_by_user_id = $1 AND locked_user_id = $2",
      [lockedByUserId, lockedUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No lock found for this chat by current user" });
    }

    const isMatch = await bcrypt.compare(pin, rows[0].pin_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect PIN" });
    }

    await pool.query(
      "DELETE FROM chat_locks WHERE locked_by_user_id = $1 AND locked_user_id = $2",
      [lockedByUserId, lockedUserId]
    );

    res.status(200).json({ message: "Chat unlocked successfully", success: true });
  } catch (err) {
    console.error("Unlock Error:", err.stack);
    res.status(500).json({ message: "Server error during chat unlock operation" });
  }
};

const targetUser = async (req, res) => {
  const { targetUserId } = req.params;
  const userIdWhoIsQuerying = req.user.id;

  try {
    const { rows } = await pool.query(
      "SELECT 1 FROM chat_locks WHERE locked_by_user_id = $1 AND locked_user_id = $2",
      [userIdWhoIsQuerying, targetUserId]
    );

    const isLocked = rows.length > 0;
    res.status(200).json({ isLocked });
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({ message: "Server error fetching lock status" });
  }
};

module.exports = { lockchat, unlockchat, targetUser };
