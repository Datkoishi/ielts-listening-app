// Import các module cần thiết
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const mysql = require("mysql2/promise")
const dotenv = require("dotenv")

// Load biến môi trường
dotenv.config()

// Tạo ứng dụng Express
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))

// Tạo kết nối database
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Tạo pool connection
const pool = mysql.createPool(dbConfig)

// Kiểm tra kết nối database
app.get("/api/check-db", async (req, res) => {
  try {
    const connection = await pool.getConnection()
    connection.release()
    res.json({ success: true, message: "Kết nối database thành công!" })
  } catch (error) {
    console.error("Lỗi kết nối database:", error)
    res.status(500).json({ success: false, message: "Lỗi kết nối database", error: error.message })
  }
})

// API endpoint để lưu bài kiểm tra
app.post("/api/tests", async (req, res) => {
  let connection
  try {
    console.log("Nhận request lưu bài kiểm tra:", req.body)

    // Lấy dữ liệu từ request body
    const { title, description, vietnamese_name, content, version, parts } = req.body

    // Validate dữ liệu
    if (!title) {
      return res.status(400).json({ success: false, message: "Thiếu tiêu đề bài kiểm tra" })
    }

    // Lấy connection từ pool
    connection = await pool.getConnection()

    // Bắt đầu transaction
    await connection.beginTransaction()

    // Thêm bài kiểm tra vào bảng tests
    const [testResult] = await connection.execute(
      "INSERT INTO tests (title, description, vietnamese_name, content, version, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [title, description, vietnamese_name, content, version || 1],
    )

    // Lấy ID của bài kiểm tra vừa thêm
    const testId = testResult.insertId
    console.log("Đã tạo bài kiểm tra với ID:", testId)

    // Thêm các phần vào bảng parts
    if (Array.isArray(parts) && parts.length > 0) {
      for (const part of parts) {
        const { part_number, audio_url, questions } = part

        // Thêm phần vào bảng parts
        const [partResult] = await connection.execute(
          "INSERT INTO parts (test_id, part_number, audio_url, created_at) VALUES (?, ?, ?, NOW())",
          [testId, part_number, audio_url],
        )

        // Lấy ID của phần vừa thêm
        const partId = partResult.insertId
        console.log(`Đã tạo phần ${part_number} với ID:`, partId)

        // Thêm các câu hỏi vào bảng questions
        if (Array.isArray(questions) && questions.length > 0) {
          for (const question of questions) {
            const { question_type, type_id, content, correct_answers } = question

            // Thêm câu hỏi vào bảng questions
            await connection.execute(
              "INSERT INTO questions (part_id, question_type, type_id, content, correct_answers, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
              [partId, question_type, type_id || 1, content, correct_answers],
            )
          }

          console.log(`Đã thêm ${questions.length} câu hỏi cho phần ${part_number}`)
        }
      }
    }

    // Commit transaction
    await connection.commit()

    // Trả về kết quả
    res.json({
      success: true,
      message: "Bài kiểm tra đã được lưu thành công",
      id: testId,
    })
  } catch (error) {
    console.error("Lỗi khi lưu bài kiểm tra:", error)

    // Rollback transaction nếu có lỗi
    if (connection) {
      await connection.rollback()
    }

    // Log chi tiết lỗi SQL nếu có
    if (error.sqlMessage) {
      console.error("SQL Error:", error.sqlMessage)
      console.error("SQL State:", error.sqlState)
      console.error("SQL Code:", error.code)
    }

    // Trả về lỗi
    res.status(500).json({
      success: false,
      message: "Lỗi khi lưu bài kiểm tra",
      error: error.message,
      sqlError: error.sqlMessage,
    })
  } finally {
    // Giải phóng connection
    if (connection) {
      connection.release()
    }
  }
})

// API endpoint để lấy danh sách bài kiểm tra
app.get("/api/tests", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM tests ORDER BY created_at DESC")
    res.json({ success: true, tests: rows })
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài kiểm tra:", error)
    res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách bài kiểm tra", error: error.message })
  }
})

// API endpoint để lấy chi tiết bài kiểm tra
app.get("/api/tests/:id", async (req, res) => {
  try {
    const testId = req.params.id

    // Lấy thông tin bài kiểm tra
    const [testRows] = await pool.execute("SELECT * FROM tests WHERE id = ?", [testId])

    if (testRows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài kiểm tra" })
    }

    const test = testRows[0]

    // Lấy các phần của bài kiểm tra
    const [partRows] = await pool.execute("SELECT * FROM parts WHERE test_id = ? ORDER BY part_number", [testId])

    // Lấy các câu hỏi cho từng phần
    const parts = await Promise.all(
      partRows.map(async (part) => {
        const [questionRows] = await pool.execute("SELECT * FROM questions WHERE part_id = ?", [part.id])
        return {
          ...part,
          questions: questionRows,
        }
      }),
    )

    // Trả về kết quả
    res.json({
      success: true,
      test: {
        ...test,
        parts,
      },
    })
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài kiểm tra:", error)
    res.status(500).json({ success: false, message: "Lỗi khi lấy chi tiết bài kiểm tra", error: error.message })
  }
})

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`)
  console.log(`Database config: ${process.env.DB_HOST}/${process.env.DB_NAME}`)
})
