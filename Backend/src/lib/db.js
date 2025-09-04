const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.INTERNAL_URL, 
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully at:", res.rows[0].now);
  } catch (err) {
    console.error("Error connecting to PostgreSQL:", err.stack);
    process.exit(1);
  }
})();

module.exports = pool;