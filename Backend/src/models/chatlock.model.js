const pool = require("../lib/db");

async function ChatLock() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_locks (
        id SERIAL PRIMARY KEY,
        locked_by_user_id INT NOT NULL,
        locked_user_id INT NOT NULL,
        pin_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("ChatLock table created or already exists");
  } catch (err) {
    console.error("Error creating ChatLock table:", err.stack);
  }
}

module.exports = ChatLock;
