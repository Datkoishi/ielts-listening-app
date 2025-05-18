const { query, connectDB } = require("./database")

// Hàm kiểm tra và tạo các bảng cần thiết
async function setupDatabase() {
  try {
    console.log("Đang kiểm tra và thiết lập cơ sở dữ liệu...")

    // Kiểm tra kết nối
    const connected = await connectDB()
    if (!connected) {
      console.error("Không thể kết nối đến cơ sở dữ liệu để thiết lập")
      return false
    }

    // Kiểm tra bảng tests
    const testsTableExists = await checkTableExists("tests")
    if (!testsTableExists) {
      console.log("Bảng 'tests' không tồn tại. Đang tạo...")
      await createTestsTable()
    }

    // Kiểm tra bảng parts
    const partsTableExists = await checkTableExists("parts")
    if (!partsTableExists) {
      console.log("Bảng 'parts' không tồn tại. Đang tạo...")
      await createPartsTable()
    }

    // Kiểm tra bảng questions
    const questionsTableExists = await checkTableExists("questions")
    if (!questionsTableExists) {
      console.log("Bảng 'questions' không tồn tại. Đang tạo...")
      await createQuestionsTable()
    }

    console.log("Thiết lập cơ sở dữ liệu hoàn tất")
    return true
  } catch (error) {
    console.error("Lỗi khi thiết lập cơ sở dữ liệu:", error)
    return false
  }
}

// Kiểm tra xem bảng có tồn tại không
async function checkTableExists(tableName) {
  try {
    const result = await query(
      `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = ? AND table_name = ?`,
      [process.env.DB_NAME, tableName],
    )

    return result[0].count > 0
  } catch (error) {
    console.error(`Lỗi khi kiểm tra bảng ${tableName}:`, error)
    return false
  }
}

// Tạo bảng tests
async function createTestsTable() {
  try {
    await query(`
      CREATE TABLE tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        vietnamese_name VARCHAR(255),
        description TEXT,
        content TEXT,
        version VARCHAR(20) DEFAULT '1.0',
        created_by INT DEFAULT 1,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("Đã tạo bảng 'tests' thành công")
    return true
  } catch (error) {
    console.error("Lỗi khi tạo bảng 'tests':", error)
    return false
  }
}

// Tạo bảng parts
async function createPartsTable() {
  try {
    await query(`
      CREATE TABLE parts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id INT NOT NULL,
        part_number INT NOT NULL,
        instructions TEXT,
        content TEXT,
        audio_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
      )
    `)
    console.log("Đã tạo bảng 'parts' thành công")
    return true
  } catch (error) {
    console.error("Lỗi khi tạo bảng 'parts':", error)
    return false
  }
}

// Tạo bảng questions
async function createQuestionsTable() {
  try {
    await query(`
      CREATE TABLE questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        part_id INT NOT NULL,
        question_type VARCHAR(50) NOT NULL,
        type_id INT DEFAULT 1,
        content TEXT NOT NULL,
        correct_answers TEXT NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'medium',
        points INT DEFAULT 1,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
      )
    `)
    console.log("Đã tạo bảng 'questions' thành công")
    return true
  } catch (error) {
    console.error("Lỗi khi tạo bảng 'questions':", error)
    return false
  }
}

module.exports = { setupDatabase }
