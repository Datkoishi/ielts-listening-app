const { pool } = require("../config/database")

async function createMissingTables() {
  try {
    console.log("Đang kiểm tra và tạo các bảng còn thiếu...")

    // Kiểm tra và tạo bảng parts nếu chưa tồn tại
    console.log("Đang kiểm tra bảng parts...")
    try {
      await pool.execute("SELECT 1 FROM parts LIMIT 1")
      console.log("Bảng parts đã tồn tại.")
    } catch (error) {
      if (error.message.includes("doesn't exist")) {
        console.log("Bảng parts chưa tồn tại. Đang tạo bảng...")
        await pool.execute(`
          CREATE TABLE parts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            test_id INT NOT NULL,
            part_number INT NOT NULL,
            audio_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
          )
        `)
        console.log("Đã tạo bảng parts thành công!")
      } else {
        throw error
      }
    }

    // Kiểm tra và tạo bảng questions nếu chưa tồn tại
    console.log("Đang kiểm tra bảng questions...")
    try {
      await pool.execute("SELECT 1 FROM questions LIMIT 1")
      console.log("Bảng questions đã tồn tại.")
    } catch (error) {
      if (error.message.includes("doesn't exist")) {
        console.log("Bảng questions chưa tồn tại. Đang tạo bảng...")
        await pool.execute(`
          CREATE TABLE questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            part_id INT NOT NULL,
            question_type VARCHAR(50) NOT NULL,
            content JSON NOT NULL,
            correct_answers JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
          )
        `)
        console.log("Đã tạo bảng questions thành công!")
      } else {
        throw error
      }
    }

    // Kiểm tra và tạo bảng student_answers nếu chưa tồn tại
    console.log("Đang kiểm tra bảng student_answers...")
    try {
      await pool.execute("SELECT 1 FROM student_answers LIMIT 1")
      console.log("Bảng student_answers đã tồn tại.")
    } catch (error) {
      if (error.message.includes("doesn't exist")) {
        console.log("Bảng student_answers chưa tồn tại. Đang tạo bảng...")
        await pool.execute(`
          CREATE TABLE student_answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT DEFAULT 0,
            test_id INT NOT NULL,
            question_id INT NOT NULL,
            answer JSON NOT NULL,
            is_correct BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
          )
        `)
        console.log("Đã tạo bảng student_answers thành công!")
      } else {
        throw error
      }
    }

    console.log("Hoàn tất kiểm tra và tạo các bảng còn thiếu!")
  } catch (error) {
    console.error("Lỗi khi tạo bảng:", error.message)
  } finally {
    pool.end()
    process.exit()
  }
}

createMissingTables()
