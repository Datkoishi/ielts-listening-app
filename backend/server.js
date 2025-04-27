const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()
const { connectDB, checkDatabaseExists } = require("./config/database")

const app = express()
const port = process.env.PORT || 3000

// Khởi động server chỉ khi đã kết nối thành công đến cơ sở dữ liệu
async function startServer() {
  // Kiểm tra cơ sở dữ liệu tồn tại
  const dbExists = await checkDatabaseExists()
  if (!dbExists) {
    console.error(`Vui lòng tạo cơ sở dữ liệu "${process.env.DB_NAME}" trước khi khởi động server`)
    console.error(`Sử dụng lệnh: CREATE DATABASE ${process.env.DB_NAME};`)
    console.error(`Sau đó: USE ${process.env.DB_NAME};`)
    process.exit(1)
  }

  // Kết nối đến cơ sở dữ liệu
  await connectDB()

  // Middleware
  app.use(cors())
  app.use(express.json())

  // Phục vụ các file tĩnh từ thư mục frontend
  app.use(express.static(path.join(__dirname, "../frontend")))

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

  // Xử lý các route không tồn tại
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "../frontend/index.html"))
  })

  // Khởi động máy chủ
  app.listen(port, () => {
    console.log(`Máy chủ đang chạy trên cổng ${port}`)
  })
}

// Gọi hàm khởi động server
startServer().catch((err) => {
  console.error("Không thể khởi động server:", err)
  process.exit(1)
})
