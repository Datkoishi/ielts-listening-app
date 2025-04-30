const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Đăng ký người dùng mới
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body

    // Kiểm tra người dùng đã tồn tại chưa
    const existingUser = await User.findByUsername(username)
    if (existingUser) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" })
    }

    // Tạo người dùng mới
    const userId = await User.create(username, password, role)

    // Tạo token JWT
    const token = jwt.sign({ user: { id: userId, username, role } }, process.env.JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({ token })
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Kiểm tra ng��ời dùng tồn tại
    const user = await User.findByUsername(username)
    if (!user) {
      return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" })
    }

    // Xác minh mật khẩu
    const isMatch = await User.verifyPassword(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Thông tin đăng nhập không hợp lệ" })
    }

    // Tạo token JWT
    const token = jwt.sign(
      { user: { id: user.id, username: user.username, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.json({ token })
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" })
    }
    res.json(user)
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}
