const mysql = require("mysql2/promise")
require("dotenv").config()

// Tạo pool kết nối
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "demodb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Hàm truy vấn tiện ích
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params || [])
    return rows
  } catch (error) {
    console.error("Database query error:", error.message)
    throw error
  }
}

module.exports = { pool, query }
