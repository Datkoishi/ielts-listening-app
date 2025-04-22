const { pool } = require("../config/database")

async function checkQuestionsTable() {
  try {
    console.log("Đang kiểm tra cấu trúc bảng questions...")

    // Kiểm tra cấu trúc bảng questions
    const [columns] = await pool.execute("SHOW COLUMNS FROM questions")

    console.log("Cấu trúc bảng questions hiện tại:")
    columns.forEach((column) => {
      console.log(
        `- ${column.Field}: ${column.Type} ${column.Null === "NO" ? "NOT NULL" : ""} ${column.Key === "PRI" ? "PRIMARY KEY" : ""}`,
      )
    })

    // Kiểm tra xem có cột question_type không
    const hasQuestionType = columns.some((column) => column.Field === "question_type")

    if (!hasQuestionType) {
      console.log("Cột question_type không tồn tại. Đang thêm cột...")
      await pool.execute("ALTER TABLE questions ADD COLUMN question_type VARCHAR(50) NOT NULL")
      console.log("Đã thêm cột question_type thành công!")
    } else {
      console.log("Cột question_type đã tồn tại.")
    }

    // Kiểm tra xem có cột correct_answers không
    const hasCorrectAnswers = columns.some((column) => column.Field === "correct_answers")

    if (!hasCorrectAnswers) {
      console.log("Cột correct_answers không tồn tại. Đang thêm cột...")
      await pool.execute("ALTER TABLE questions ADD COLUMN correct_answers JSON NOT NULL")
      console.log("Đã thêm cột correct_answers thành công!")
    } else {
      console.log("Cột correct_answers đã tồn tại.")
    }

    // Kiểm tra xem có cột part_id không
    const hasPartId = columns.some((column) => column.Field === "part_id")

    if (!hasPartId) {
      console.log("Cột part_id không tồn tại. Đang thêm cột...")
      await pool.execute("ALTER TABLE questions ADD COLUMN part_id INT NOT NULL")
      console.log("Đã thêm cột part_id thành công!")
    } else {
      console.log("Cột part_id đã tồn tại.")
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra bảng questions:", error.message)
  } finally {
    pool.end()
    process.exit()
  }
}

checkQuestionsTable()
