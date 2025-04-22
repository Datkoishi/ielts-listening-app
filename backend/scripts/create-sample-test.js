const { pool } = require("../config/database")

async function createSampleTest() {
  try {
    console.log("Đang tạo bài kiểm tra mẫu...")

    // Tạo bài kiểm tra
    const [testResult] = await pool.execute(
      "INSERT INTO tests (title, vietnamese_name, description) VALUES (?, ?, ?)",
      ["IELTS Listening Sample Test", "Bài kiểm tra IELTS Listening mẫu", "Bài kiểm tra mẫu để kiểm tra hệ thống"],
    )

    const testId = testResult.insertId
    console.log(`Đã tạo bài kiểm tra với ID: ${testId}`)

    // Tạo phần 1
    const [part1Result] = await pool.execute("INSERT INTO parts (test_id, part_number, audio_url) VALUES (?, ?, ?)", [
      testId,
      1,
      "https://example.com/audio1.mp3",
    ])

    const part1Id = part1Result.insertId
    console.log(`Đã tạo phần 1 với ID: ${part1Id}`)

    // Tạo câu hỏi mẫu cho phần 1
    const questionContent = JSON.stringify({
      question: "What is the woman's name?",
      options: ["Mary", "Sarah", "Emma", "Lisa"],
    })

    const correctAnswers = JSON.stringify(["Sarah"])

    await pool.execute("INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)", [
      part1Id,
      "multiple-choice",
      questionContent,
      correctAnswers,
    ])

    console.log("Đã tạo câu hỏi mẫu thành công!")
    console.log("Đã tạo bài kiểm tra mẫu thành công!")
  } catch (error) {
    console.error("Lỗi khi tạo bài kiểm tra mẫu:", error.message)
  } finally {
    pool.end()
    process.exit()
  }
}

createSampleTest()
