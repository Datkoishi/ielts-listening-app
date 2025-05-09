const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Kiểm tra trạng thái hoạt động của API
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      message: 'API đang hoạt động bình thường',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Lỗi health check:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Lỗi server',
      error: error.message
    });
  }
});

module.exports = router;
