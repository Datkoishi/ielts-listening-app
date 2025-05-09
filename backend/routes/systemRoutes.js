const express = require("express")
const router = express.Router()
const systemController = require("../controllers/systemController")
const auth = require("../middleware/auth")

// Route kiểm tra kết nối database
router.get("/db-check", systemController.checkDatabaseConnection)

// Route kiểm tra cấu trúc database (yêu cầu xác thực)
router.get("/db-structure", auth, systemController.checkDatabaseStructure)

// Route kiểm tra hiệu suất database (yêu cầu xác thực)
router.get("/db-performance", auth, systemController.checkDatabasePerformance)

// Route kiểm tra sức khỏe API
router.get("/health", systemController.checkApiHealth)

// Route kiểm tra CORS
router.get("/cors-test", systemController.checkCors)

module.exports = router
