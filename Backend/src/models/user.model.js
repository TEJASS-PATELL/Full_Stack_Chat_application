const pool = require("../lib/db");

async function ConnectUser() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        password VARCHAR(200) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        profilepic VARCHAR(500),
        lastseen TIMESTAMP NULL DEFAULT NULL,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        isonline BOOLEAN DEFAULT FALSE
      );
    `);

    console.log("Users table checked/created successfully.");
  } catch (err) {
    console.error("Error creating users table:", err.stack);
    throw err;
  }
}

module.exports = ConnectUser;