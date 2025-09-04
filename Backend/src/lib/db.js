const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT,
    ssl: {
    rejectUnauthorized: false, 
  },
  max: 10,                
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000, 
});

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL Pool connected successfully");
  } catch (err) {
    console.error("Error connecting to PostgreSQL:", err.stack);
    process.exit(1);
  }
})();

module.exports = pool;
