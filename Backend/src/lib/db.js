const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.INTERNAL_URL, 
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const connectWithRetry = async (retries = 5, delay = 2000) => {
  while (retries > 0) {
    try {
      const res = await pool.query("SELECT NOW()");
      console.log("PostgreSQL connected successfully at:", res.rows[0].now);
      return;
    } catch (err) {
      console.error("Error connecting to PostgreSQL:", err.message);
      retries -= 1;
      if (retries === 0) {
        console.error("Exhausted retries, exiting...");
        process.exit(1);
      }
      console.log(`Retrying in ${delay / 1000}s... (${retries} retries left)`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

connectWithRetry();

module.exports = pool;
