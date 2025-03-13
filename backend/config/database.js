import mysql from "mysql2/promise"
import dotenv from "dotenv"

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

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("Đã kết nối thành công đến cơ sở dữ liệu MySQL")
    connection.release()
  } catch (error) {
    console.error("Kết nối cơ sở dữ liệu thất bại:", error.message)
    process.exit(1)
  }
}

export const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Lỗi truy vấn:", error.message)
    throw error
  }
}

export default pool
