const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

dotenv.config()

// Kiểm tra và log các biến môi trường cần thiết (không hiển thị mật khẩu)
console.log("Kiểm tra biến môi trường DB_HOST:", process.env.DB_HOST ? "Đã cấu hình" : "Chưa cấu hình")
console.log("Kiểm tra biến môi trường DB_USER:", process.env.DB_USER ? "Đã cấu hình" : "Chưa cấu hình")
console.log("Kiểm tra biến môi trường DB_NAME:", process.env.DB_NAME ? "Đã cấu hình" : "Chưa cấu hình")

// Tạo pool connection với xử lý lỗi
let pool = null

try {
  // Kiểm tra các biến môi trường bắt buộc
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error("Thiếu biến môi trường cần thiết cho kết nối cơ sở dữ liệu")
    console.error("Vui lòng kiểm tra file .env và đảm bảo có đầy đủ: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME")

    // Tạo pool giả để tránh lỗi undefined
    pool = {
      getConnection: async () => {
        throw new Error("Không thể kết nối đến cơ sở dữ liệu: Thiếu thông tin cấu hình")
      },
      execute: async () => {
        throw new Error("Không thể thực thi truy vấn: Thiếu thông tin cấu hình")
      },
    }
  } else {
    // Tạo pool connection thực tế
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    console.log("Đã khởi tạo pool connection")
  }
} catch (error) {
  console.error("Lỗi khi khởi tạo pool connection:", error.message)

  // Tạo pool giả để tránh lỗi undefined
  pool = {
    getConnection: async () => {
      throw new Error("Không thể kết nối đến cơ sở dữ liệu: " + error.message)
    },
    execute: async () => {
      throw new Error("Không thể thực thi truy vấn: " + error.message)
    },
  }
}

// Kết nối đến cơ sở dữ liệu
const connectDB = async () => {
  try {
    if (!pool.getConnection) {
      console.error("Pool connection không hợp lệ")
      return false
    }

    const connection = await pool.getConnection()
    console.log("Đã kết nối thành công đến cơ sở dữ liệu MySQL")
    connection.release()
    return true
  } catch (error) {
    console.error("Kết nối cơ sở dữ liệu thất bại:", error.message)
    return false
  }
}

// Hàm thực hiện truy vấn với xử lý lỗi
const query = async (sql, params) => {
  try {
    if (!pool.execute) {
      throw new Error("Pool connection không hợp lệ")
    }

    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Lỗi truy vấn:", error.message)
    console.error("SQL:", sql)
    console.error("Params:", JSON.stringify(params))
    throw error
  }
}

// Thêm hàm kiểm tra kết nối
const healthCheck = async () => {
  try {
    if (!pool.getConnection) {
      return {
        status: "error",
        message: "Pool connection không hợp lệ",
        timestamp: new Date().toISOString(),
      }
    }

    const connection = await pool.getConnection()
    connection.release()

    return {
      status: "success",
      message: "Kết nối cơ sở dữ liệu thành công",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}

// Export tất cả các hàm và pool
module.exports = {
  pool,
  connectDB,
  query,
  healthCheck,
}
