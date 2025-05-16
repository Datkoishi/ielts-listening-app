const express = require("express")
const router = express.Router()
const testController = require("../controllers/testController")

// Thêm route kiểm tra kết nối đơn giản
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Test API is running",
    timestamp: new Date().toISOString(),
  })
})

// Lấy tất cả bài kiểm tra
router.get("/", testController.getAllTests)

// Lấy bài kiểm tra theo ID
router.get("/:id", testController.getTestById)

// Tạo bài kiểm tra mới
router.post("/", testController.createTest)

// Cập nhật bài kiểm tra
router.put("/:id", testController.updateTest)

// Xóa bài kiểm tra
router.delete("/:id", testController.deleteTest)

// Nhận câu trả lời từ học sinh
router.post("/:testId/submit", testController.submitAnswers)

// Add this line after the other routes
router.get("/check-by-title", testController.checkTestByTitle)

module.exports = router
