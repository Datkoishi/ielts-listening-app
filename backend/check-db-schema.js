// Script kiểm tra kết nối database và cấu trúc bảng
const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

// Load biến môi trường
dotenv.config()

// Cấu hình kết nối database
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

// Hàm kiểm tra kết nối và cấu trúc bảng
async function checkDatabaseSchema() {
  let connection

  try {
    console.log("Đang kết nối đến database...")
    connection = await mysql.createConnection(dbConfig)
    console.log("Kết nối thành công!")

    // Kiểm tra bảng tests
    console.log("\nKiểm tra bảng tests:")
    const [testsColumns] = await connection.execute("DESCRIBE tests")
    console.table(testsColumns)

    // Kiểm tra bảng parts
    console.log("\nKiểm tra bảng parts:")
    const [partsColumns] = await connection.execute("DESCRIBE parts")
    console.table(partsColumns)

    // Kiểm tra bảng questions
    console.log("\nKiểm tra bảng questions:")
    const [questionsColumns] = await connection.execute("DESCRIBE questions")
    console.table(questionsColumns)

    // Kiểm tra dữ liệu trong bảng tests
    console.log("\nDữ liệu trong bảng tests:")
    const [tests] = await connection.execute("SELECT * FROM tests LIMIT 5")
    console.table(tests)

    // Kiểm tra dữ liệu trong bảng parts
    console.log("\nDữ liệu trong bảng parts:")
    const [parts] = await connection.execute("SELECT * FROM parts LIMIT 5")
    console.table(parts)

    // Kiểm tra dữ liệu trong bảng questions
    console.log("\nDữ liệu trong bảng questions:")
    const [questions] = await connection.execute("SELECT * FROM questions LIMIT 5")
    console.table(questions)

    console.log("\nKiểm tra hoàn tất!")
  } catch (error) {
    console.error("Lỗi khi kiểm tra database:", error)

    // Kiểm tra lỗi kết nối
    if (error.code === "ECONNREFUSED") {
      console.error("\nKhông thể kết nối đến database. Vui lòng kiểm tra:")
      console.error("1. Database server đã được khởi động chưa?")
      console.error("2. Thông tin kết nối trong file .env có chính xác không?")
      console.error(`   - DB_HOST: ${process.env.DB_HOST}`)
      console.error(`   - DB_USER: ${process.env.DB_USER}`)
      console.error(`   - DB_NAME: ${process.env.DB_NAME}`)
    }

    // Kiểm tra lỗi bảng không tồn tại
    if (error.code === "ER_NO_SUCH_TABLE") {
      console.error("\nBảng không tồn tại. Vui lòng chạy script tạo bảng:")
      console.error("node create-tables.js")
    }
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Chạy hàm kiểm tra
checkDatabaseSchema()
