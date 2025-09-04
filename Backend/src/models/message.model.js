const pool = require("../lib/db");

async function createMessagesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        senderid INT NOT NULL,
        receiverid INT NOT NULL,
        text TEXT,
        image VARCHAR(5000),
        seen BOOLEAN DEFAULT false,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_sender FOREIGN KEY (senderid) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_receiver FOREIGN KEY (receiverid) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log("Messages table checked/created successfully.");
  } catch (err) {
    console.error("Error creating messages table:", err.stack);
    throw err;
  }
}

module.exports = createMessagesTable;
