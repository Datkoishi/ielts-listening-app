const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

dotenv.config()

// Thêm logs để kiểm tra biến môi trường
console.log("Database configuration:")
console.log("Host:", process.env.DB_HOST)
console.log("Database:", process.env.DB_NAME)
console.log("User:", process.env.DB_USER)
// Không log mật khẩu vì lý do bảo mật

// Create the connection pool with more detailed error handling
let pool
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  })
  console.log("MySQL connection pool created successfully")
} catch (error) {
  console.error("Failed to create MySQL connection pool:", error)
  process.exit(1)
}

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

    // Check if required tables exist
    const tableNames = tables.map((t) => Object.values(t)[0])
    const requiredTables = ["tests", "parts", "questions", "audio_files"]
    const missingTables = requiredTables.filter((table) => !tableNames.includes(table))

    if (missingTables.length > 0) {
      console.warn(`Warning: Missing required tables: ${missingTables.join(", ")}`)
      console.log("Attempting to create missing tables...")

      // Create missing tables
      if (missingTables.includes("tests")) {
        await connection.query(`
          CREATE TABLE tests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            vietnamese_name VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `)
        console.log("Created 'tests' table")
      }

      if (missingTables.includes("parts")) {
        await connection.query(`
          CREATE TABLE parts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            test_id INT NOT NULL,
            part_number INT NOT NULL,
            audio_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
          )
        `)
        console.log("Created 'parts' table")
      }

      if (missingTables.includes("questions")) {
        await connection.query(`
          CREATE TABLE questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            part_id INT NOT NULL,
            question_type VARCHAR(100) NOT NULL,
            content TEXT NOT NULL,
            correct_answers TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
          )
        `)
        console.log("Created 'questions' table")
      }

      if (missingTables.includes("audio_files")) {
        await connection.query(`
          CREATE TABLE audio_files (
            id INT AUTO_INCREMENT PRIMARY KEY,
            test_id INT NOT NULL,
            part_number INT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            file_size INT,
            duration FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
          )
        `)
        console.log("Created 'audio_files' table")
      }
    }

    connection.release()
    return true
  } catch (error) {
    console.error("Kết nối cơ sở dữ liệu thất bại:", error.message)
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("This is likely due to incorrect username or password")
    } else if (error.code === "ECONNREFUSED") {
      console.error("Could not connect to database server. Make sure it's running and accessible")
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("Database does not exist. You may need to create it first")
    }
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
    console.error("SQL:", sql)
    console.error("Params:", params)

    // Provide more detailed error information
    if (error.code === "ER_NO_SUCH_TABLE") {
      console.error("Table does not exist. Make sure all required tables are created.")
    } else if (error.code === "ER_BAD_FIELD_ERROR") {
      console.error("Column does not exist. Check your table schema.")
    } else if (error.code === "ER_PARSE_ERROR") {
      console.error("SQL syntax error. Check your query.")
    } else if (error.code === "ER_DATA_TOO_LONG") {
      console.error("Data too long for column. Check your data length.")
    }

    throw error
  }
}

module.exports = pool
