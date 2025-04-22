const express = require("express")
const router = express.Router()
const { authenticateToken } = require("../middleware/auth")
const testController = require("../controllers/testController")

// Routes cho giáo viên (yêu cầu xác thực)
router.get("/", authenticateToken, testController.getTests)
router.post("/", authenticateToken, testController.createTest)
router.get("/:id", authenticateToken, testController.getTestById)
router.put("/:id", authenticateToken, testController.updateTest)
router.delete("/:id", authenticateToken, testController.deleteTest)

// Routes công khai cho học sinh (không yêu cầu xác thực)
router.get("/public/tests", testController.getPublicTests)
router.get("/public/tests/:id", testController.getPublicTestById)
router.post("/public/submit", testController.submitPublicAnswers)

module.exports = router
