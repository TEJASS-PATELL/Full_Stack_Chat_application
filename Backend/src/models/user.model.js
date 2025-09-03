const db = require("../lib/db");  

async function ConnectUser() {
  try {
    const connection = await db.getConnection(); 

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        password VARCHAR(200) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        profilepic VARCHAR(500),
        lastSeen DATETIME DEFAULT NULL,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        isOnline TINYINT(1) DEFAULT 0
      );
    `);

    connection.release();
    console.log("Users table checked/created successfully.");
  } catch (err) {
    console.error("Error creating users table:", err.message);
  }
}

ConnectUser();

module.exports = ConnectUser;
