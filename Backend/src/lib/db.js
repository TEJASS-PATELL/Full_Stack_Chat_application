const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.INTERNAL_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected at:", res.rows[0].now);
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
    process.exit(1);
  }
})();

module.exports = pool;
