const express = require("express")
const cors = require("cors")
const path = require("path")
const testRoutes = require("./routes/testRoutes")
const userRoutes = require("./routes/userRoutes")
const { pool } = require("./config/database")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Phục vụ các file tĩnh
app.use(express.static(path.join(__dirname, "../frontend")))

// API Routes
app.use("/api/tests", testRoutes)
app.use("/api/users", userRoutes)

// Route cho trang chủ giáo viên
app.get("/teacher", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/teacher/index.html"))
})

// Route cho trang chủ học sinh
app.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/student/index.html"))
})

// Route mặc định
app.get("/", (req, res) => {
  res.redirect("/student")
})

// Thêm route để debug API
app.get("/api/debug", (req, res) => {
  res.json({ message: "API đang hoạt động" })
})

// Kết nối database và khởi động server
async function connectAndStartServer() {
  try {
    // Kiểm tra kết nối database
    const connection = await pool.getConnection()
    console.log("Đã kết nối thành công đến cơ sở dữ liệu MySQL")
    connection.release()

    // Khởi động server
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error("Không thể kết nối đến database:", err)
    process.exit(1)
  }
}

// Khởi động server
connectAndStartServer()

// Xử lý lỗi không bắt được
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
})
