const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()
const port = process.env.PORT || 3000

// Improved CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true)

      // Allow all localhost origins
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true)
      }

      callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Increase JSON payload size limit
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Phục vụ các file tĩnh từ thư mục frontend
app.use(express.static(path.join(__dirname, "../frontend")))

// Cấu hình routes API
const testRoutes = require("./routes/testRoutes")

// Add a simple health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API server is running" })
})

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

// Xử lý các route không tồn tại
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../frontend/index.html"))
})

// Improved error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  })
})

// Khởi động máy chủ
app.listen(port, () => {
  console.log(`Máy chủ đang chạy trên cổng ${port}`)
  console.log(`API URL: http://localhost:${port}/api`)
  console.log(`Health check: http://localhost:${port}/api/health`)
})
