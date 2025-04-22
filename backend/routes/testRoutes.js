const express = require("express")
const router = express.Router()
const testController = require("../controllers/testController")
const { authenticateToken } = require("../middleware/auth")

// Các route công khai (không cần xác thực)
router.get("/public", testController.getPublicTests)
router.get("/public/:id", testController.getPublicTestById)
router.post("/public/:testId/submit", testController.submitPublicAnswers)

// Các route cần xác thực
router.get("/", authenticateToken, testController.getAllTests)
router.get("/:id", authenticateToken, testController.getTestById)
router.post("/", authenticateToken, testController.createTest)
router.put("/:id", authenticateToken, testController.updateTest)
router.delete("/:id", authenticateToken, testController.deleteTest)
router.post("/:testId/submit", authenticateToken, testController.submitAnswers)

module.exports = router
