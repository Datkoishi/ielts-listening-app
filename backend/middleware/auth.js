const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Middleware xác thực người dùng
exports.auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "")

  if (!token) {
    return res.status(401).json({ message: "Không có token, từ chối truy cập" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    next()
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" })
  }
}

// Middleware phân quyền
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id)
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: "Người dùng không có quyền" })
      }
      next()
    } catch (error) {
      console.error("Lỗi phân quyền:", error.message)
      res.status(500).json({ message: "Lỗi máy chủ" })
    }
  }
}

