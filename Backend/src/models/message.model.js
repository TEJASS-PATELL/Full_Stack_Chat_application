const db = require("../lib/db");

async function createMessagesTable() {
  try {
    const connection = await db.getConnection();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        senderId INT NOT NULL,
        receiverId INT NOT NULL,
        text TEXT,
        image VARCHAR(5000),
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    connection.release();
    console.log("Messages table checked/created successfully.");
  } catch (err) {
    console.error("Error creating messages table:", err.message);
  }
}

createMessagesTable();

module.exports = createMessagesTable;
