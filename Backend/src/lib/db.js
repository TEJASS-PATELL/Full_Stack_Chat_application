const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false 
  }
});

(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query("SELECT NOW()");
    connection.release();
    console.log("Database connected successfully!");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
})();

module.exports = pool;