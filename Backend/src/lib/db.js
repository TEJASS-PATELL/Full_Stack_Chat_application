const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool(process.env.INTERNAL_URL);

(async () => {
  try {
    await pool.query("SELECT NOW()");
  } catch (err) {
    process.exit(1);
  }
})();

module.exports = pool;