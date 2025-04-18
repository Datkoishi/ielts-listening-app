const express = require("express")
const router = express.Router()
const testController = require("../controllers/testController")
const auth = require("../middleware/auth")

// Public routes (không cần xác thực)
router.get("/public", testController.getPublicTests)
router.get("/public/:id", testController.getPublicTestById)
router.post("/public/:testId/submit", testController.submitPublicAnswers)

// Protected routes (cần xác thực)
router.get("/", auth, testController.getAllTests)
router.get("/:id", auth, testController.getTestById)
router.post("/", auth, testController.createTest)
router.put("/:id", auth, testController.updateTest)
router.delete("/:id", auth, testController.deleteTest)
router.post("/:testId/submit", auth, testController.submitAnswers)

module.exports = router
