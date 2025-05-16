const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()
const database = require("./config/database")

const app = express()
const port = process.env.PORT || 3000

// Cấu hình CORS chi tiết hơn
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
)

app.use(express.json())

// Phục vụ các file tĩnh từ thư mục frontend
app.use(express.static(path.join(__dirname, "../frontend")))

// Health check endpoint không phụ thuộc vào cơ sở dữ liệu
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// Health check endpoint có kiểm tra cơ sở dữ liệu
app.get("/api/health/db", async (req, res) => {
  try {
    const dbStatus = await database.healthCheck()
    res.status(dbStatus.status === "success" ? 200 : 500).json(dbStatus)
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
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

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    status: "error",
    message: err.message || "Lỗi máy chủ",
    timestamp: new Date().toISOString(),
  })
})

// Xử lý các route không tồn tại
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Khởi động máy chủ
app.listen(port, () => {
  console.log(`Máy chủ đang chạy trên cổng ${port}`)

  // Kiểm tra kết nối cơ sở dữ liệu khi khởi động
  database
    .connectDB()
    .then((connected) => {
      if (!connected) {
        console.warn("Cảnh báo: Máy chủ đang chạy nhưng không kết nối được đến cơ sở dữ liệu")
        console.warn("Các tính năng liên quan đến cơ sở dữ liệu sẽ không hoạt động")
        console.warn("Vui lòng kiểm tra cấu hình cơ sở dữ liệu trong file .env")
      }
    })
    .catch((err) => {
      console.error("Lỗi khi kiểm tra kết nối cơ sở dữ liệu:", err.message)
    })
})

module.exports = app
