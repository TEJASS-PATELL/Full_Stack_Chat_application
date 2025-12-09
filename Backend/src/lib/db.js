const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.INTERNAL_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await pool.query("SELECT NOW()");
  } catch (err) {
    process.exit(1);
  }
})();

module.exports = pool;
