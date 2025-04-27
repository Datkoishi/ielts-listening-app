const express = require("express")
const router = express.Router()
const testController = require("../controllers/testController")
const multer = require("multer")
const auth = require("../middleware/auth")

// Cấu hình multer để xử lý upload file
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// Lấy danh sách bài kiểm tra
router.get("/", testController.getAllTests)

// Lấy bài kiểm tra theo ID
router.get("/:id", testController.getTestById)

// Tạo bài kiểm tra mới
router.post("/", auth.optional, testController.createTest)

// Cập nhật bài kiểm tra
router.put("/:id", auth.optional, testController.updateTest)

// Xóa bài kiểm tra
router.delete("/:id", auth.optional, testController.deleteTest)

// Lấy danh sách phiên bản của bài kiểm tra
router.get("/:id/versions", auth.optional, testController.getTestVersions)

// Lấy một phiên bản cụ thể của bài kiểm tra
router.get("/:id/versions/:version", auth.optional, testController.getTestVersion)

// Lưu bản nháp tự động
router.post("/:testId/drafts", auth.optional, testController.saveDraft)

// Lấy bản nháp mới nhất
router.get("/:testId/drafts/latest", auth.optional, testController.getLatestDraft)

// Upload file âm thanh cho một phần
router.post("/:testId/parts/:partNumber/audio", auth.optional, upload.single("audio"), testController.uploadAudio)

// Nhận câu trả lời từ học sinh
router.post("/:testId/submit", testController.submitAnswers)

module.exports = router
