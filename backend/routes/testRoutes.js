const express = require("express")
const router = express.Router()
const testController = require("../controllers/testController")

// Add a simple health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Test routes are working" })
})

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
})

// Lấy tất cả bài kiểm tra
router.get("/", testController.getAllTests)

// Lấy bài kiểm tra theo ID
router.get("/:id", testController.getTestById)

// Tạo bài kiểm tra mới
router.post("/", (req, res, next) => {
  console.log("Received test data:", JSON.stringify(req.body, null, 2))
  testController.createTest(req, res, next)
})

// Cập nhật bài kiểm tra
router.put("/:id", testController.updateTest)

// Xóa bài kiểm tra
router.delete("/:id", testController.deleteTest)

// Nhận câu trả lời từ học sinh
router.post("/:testId/submit", testController.submitAnswers)

// Error handling middleware
router.use((err, req, res, next) => {
  console.error("Test routes error:", err)
  res.status(500).json({
    message: "Error in test routes",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  })
})

module.exports = router
