const express = require("express")
const router = express.Router()
const testController = require("../controllers/testController")

// Lấy tất cả bài kiểm tra (không cần xác thực)
router.get("/public", testController.getPublicTests)

// Lấy bài kiểm tra theo ID (không cần xác thực)
router.get("/public/:id", testController.getPublicTestById)

// Nộp bài làm (không cần xác thực)
router.post("/public/:testId/submit", testController.submitPublicAnswers)

// Các route cần xác thực
router.get("/", testController.getAllTests)
router.get("/:id", testController.getTestById)
router.post("/", testController.createTest)
router.put("/:id", testController.updateTest)
router.delete("/:id", testController.deleteTest)
router.post("/:testId/submit", testController.submitAnswers)

module.exports = router
