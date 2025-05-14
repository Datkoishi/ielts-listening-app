const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(
  cors({
    origin: "*", // Cho phép tất cả các origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)
app.use(express.json())

// Phục vụ các file tĩnh từ thư mục frontend
app.use(express.static(path.join(__dirname, "../frontend")))

// Thêm route kiểm tra kết nối đơn giản
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Cấu hình routes API
const testRoutes = require("./routes/testRoutes")
app.use("/api/tests", testRoutes)

// Route mặc định trả về trang index.html chính
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Route cho học sinh
app.get("/student/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/student/index.html"))
})

// Route cho giáo viên
app.get("/teacher/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/teacher/index.html"))
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack)
  res.status(500).json({
    status: "error",
    message: "Lỗi máy chủ",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Xử lý các route không tồn tại
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Khởi động máy chủ
app.listen(port, () => {
  console.log(`Máy chủ đang chạy trên cổng ${port}`)
})

module.exports = app
