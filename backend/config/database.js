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

    // Kiểm tra xem có thể truy cập được cơ sở dữ liệu không
    const [result] = await connection.query("SELECT DATABASE() as db")
    const currentDB = result[0].db

    if (currentDB !== process.env.DB_NAME) {
      console.error(`Lỗi: Đang kết nối đến cơ sở dữ liệu "${currentDB}" thay vì "${process.env.DB_NAME}"`)
      process.exit(1)
    }

    console.log(`Đã kết nối thành công đến cơ sở dữ liệu MySQL: ${currentDB}`)
    connection.release()
    return true
  } catch (error) {
    console.error("Kết nối cơ sở dữ liệu thất bại:", error.message)
    process.exit(1)
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

// Thêm hàm kiểm tra cơ sở dữ liệu tồn tại
exports.checkDatabaseExists = async () => {
  try {
    // Tạo kết nối không chọn cơ sở dữ liệu
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 2,
      queueLimit: 0,
    })

    const connection = await tempPool.getConnection()

    // Kiểm tra cơ sở dữ liệu có tồn tại không
    const [rows] = await connection.query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?", [
      process.env.DB_NAME,
    ])

    connection.release()
    await tempPool.end()

    if (rows.length === 0) {
      console.error(`Lỗi: Cơ sở dữ liệu "${process.env.DB_NAME}" không tồn tại`)
      return false
    }

    return true
  } catch (error) {
    console.error("Kiểm tra cơ sở dữ liệu thất bại:", error.message)
    return false
  }
}

module.exports = pool
