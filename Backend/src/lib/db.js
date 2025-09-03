const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const aiven_config = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT, 
  ssl: {
    ca: process.env.CA_CERT.replace(/\\n/g, '\n'),
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function connectToDatabase() {
  try {
    const pool = mysql.createPool(aiven_config);
    console.log("MySQL Pool Created Successfully");
    return pool;
  } catch (error) {
    console.error("Error creating MySQL pool:", error);
    process.exit(1);
  }
}

const pool = connectToDatabase();

module.exports = pool;
