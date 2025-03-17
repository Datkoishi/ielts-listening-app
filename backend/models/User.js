const { query } = require("../config/database")
const bcrypt = require("bcryptjs")

class User {
  // Tìm người dùng theo tên đăng nhập
  static async findByUsername(username) {
    const users = await query("SELECT * FROM users WHERE username = ?", [username])
    return users[0]
  }

  // Tìm người dùng theo ID
  static async findById(id) {
    const users = await query("SELECT id, username, role, created_at FROM users WHERE id = ?", [id])
    return users[0]
  }

  // Tạo người dùng mới
  static async create(username, password, role = "student") {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const result = await query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
      username,
      hashedPassword,
      role,
    ])

    return result.insertId
  }

  // Xác minh mật khẩu
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
  }
}

module.exports = User

