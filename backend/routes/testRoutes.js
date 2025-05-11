const express = require("express")
const router = express.Router()
const testController = require("../controllers/testController")

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

// Thêm route kiểm tra kết nối
router.get("/health", testController.healthCheck)

module.exports = router
