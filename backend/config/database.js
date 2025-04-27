const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

dotenv.config()

// Thêm logs để kiểm tra biến môi trường
console.log("Database configuration:")
console.log("Host:", process.env.DB_HOST)
console.log("Database:", process.env.DB_NAME)
console.log("User:", process.env.DB_USER)
// Không log mật khẩu vì lý do bảo mật

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

    // Kiểm tra database có các bảng cần thiết không
    const [tables] = await connection.query("SHOW TABLES")
    console.log(
      "Các bảng trong database:",
      tables.map((t) => Object.values(t)[0]),
    )

    connection.release()
    return true
  } catch (error) {
    console.error("Kết nối cơ sở dữ liệu thất bại:", error.message)
    process.exit(1)
  }
}

// Hàm thực hiện truy vấn với logs chi tiết
exports.query = async (sql, params) => {
  try {
    console.log("Executing SQL:", sql)
    console.log("With params:", params)

    const [results] = await pool.execute(sql, params)

    // Log kết quả nhưng giới hạn kích thước
    if (Array.isArray(results)) {
      console.log(`Query returned ${results.length} rows`)
      if (results.length > 0 && results.length <= 5) {
        console.log("Sample results:", results)
      }
    } else {
      console.log("Query result:", results)
    }

    return results
  } catch (error) {
    console.error("Lỗi truy vấn:", error.message)
    throw error
  }
}

module.exports = pool
