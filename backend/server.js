const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Phục vụ các file tĩnh từ thư mục frontend
app.use(express.static(path.join(__dirname, "../frontend")))

// Phục vụ các file tĩnh cho frontend của học sinh
app.use(express.static(path.join(__dirname, "../frontend/student")))

// Cấu hình routes API
const testRoutes = require("./routes/testRoutes")
const userRoutes = require("./routes/userRoutes")

// API Routes
app.use("/tests", testRoutes)
app.use("/users", userRoutes)

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

// Khởi động máy chủ
app.listen(port, () => {
  console.log(`Máy chủ đang chạy trên cổng ${port}`)
})
