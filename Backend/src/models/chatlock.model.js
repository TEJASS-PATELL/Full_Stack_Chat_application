const db = require("../lib/db"); 

async function ChatLock() {
  try {
    const connection = await db.getConnection(); 

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_locks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        locked_by_user_id INT NOT NULL,
        locked_user_id INT NOT NULL,
        pin_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    connection.release(); 

    console.log("ChatLock table created or already exists");
  } catch (err) {
    console.error("Error creating ChatLock table:", err.message);
  }
}

module.exports = ChatLock;
