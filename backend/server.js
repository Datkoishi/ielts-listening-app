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

// Cấu hình routes API
const testRoutes = require("./routes/testRoutes")
// Thêm dòng import route health check sau các import routes khác
const healthRoutes = require("./routes/healthRoutes")

app.use("/api/tests", testRoutes)
// Thêm dòng sau trong phần app.use routes
app.use("/api/health", healthRoutes)

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
