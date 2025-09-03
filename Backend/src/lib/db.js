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

const pool = mysql.createPool(aiven_config);

pool.getConnection()
  .then(connection => {
    console.log("MySQL Pool created and connected successfully");
    connection.release(); 
  })
  .catch(error => {
    console.error("Error creating MySQL pool:", error);
    process.exit(1);
  });

module.exports = pool;