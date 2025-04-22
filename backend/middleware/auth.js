const jwt = require("jsonwebtoken")

// Middleware xác thực token JWT
const authenticateToken = (req, res, next) => {
  // Lấy token từ header
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Không có token xác thực" })
  }

  // Xác minh token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ" })
    }
    req.user = decoded.user
    next()
  })
}

module.exports = { authenticateToken }
