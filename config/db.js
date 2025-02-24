const mysql = require("mysql2");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const db = mysql.createConnection({
  host: isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV,
  user: isProduction ? process.env.DB_USER_PROD : process.env.DB_USER_DEV,
  password: isProduction ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD_DEV,
  database: isProduction ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log(`✅ Connected to ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} database`);
  }
});

module.exports = db;
