const express = require("express")
const router = express.Router()
const { auth, authorize } = require("../middleware/auth")
const testController = require("../controllers/testController")

// Lấy tất cả bài kiểm tra
router.get("/", auth, testController.getAllTests)

// Lấy bài kiểm tra theo ID
router.get("/:id", auth, testController.getTestById)

// Tạo bài kiểm tra mới (chỉ giáo viên)
router.post("/", auth, authorize("teacher"), testController.createTest)

// Cập nhật bài kiểm tra (chỉ giáo viên)
router.put("/:id", auth, authorize("teacher"), testController.updateTest)

// Xóa bài kiểm tra (chỉ giáo viên)
router.delete("/:id", auth, authorize("teacher"), testController.deleteTest)

module.exports = router

