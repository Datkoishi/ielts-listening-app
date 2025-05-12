const express = require("express")
const router = express.Router()
const testController = require("../controllers/testController")

// Thêm route kiểm tra kết nối
// Đặt route này ở đầu file để đảm bảo nó được xử lý trước các route khác
router.get("/health", testController.healthCheck)

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

module.exports = router
