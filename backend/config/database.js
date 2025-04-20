const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Kết nối đến cơ sở dữ liệu
exports.connectDB = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("Đã kết nối thành công đến cơ sở dữ liệu MySQL")
    connection.release()
    return true
  } catch (error) {
    console.error("Kết nối cơ sở dữ liệu thất bại:", error.message)
    throw error
  }
}

// Hàm thực hiện truy vấn
exports.query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Lỗi truy vấn:", error.message)
    throw error
  }
}

module.exports = {
  connectDB: exports.connectDB,
  query: exports.query,
  pool,
}
