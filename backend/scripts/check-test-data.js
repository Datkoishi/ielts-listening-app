const { pool } = require("../config/database")

async function checkTestData() {
  try {
    console.log("Đang kiểm tra dữ liệu bài kiểm tra trong database...")

    // Kiểm tra bảng tests
    const [tests] = await pool.execute("SELECT * FROM tests")
    console.log(`Tìm thấy ${tests.length} bài kiểm tra trong database`)

    if (tests.length > 0) {
      console.log("\nThông tin bài kiểm tra đầu tiên:")
      console.log(tests[0])

      // Kiểm tra các phần của bài kiểm tra đầu tiên
      const [parts] = await pool.execute("SELECT * FROM parts WHERE test_id = ?", [tests[0].id])
      console.log(`\nTìm thấy ${parts.length} phần trong bài kiểm tra ID: ${tests[0].id}`)

      if (parts.length > 0) {
        console.log("\nThông tin phần đầu tiên:")
        console.log(parts[0])

        // Kiểm tra các câu hỏi của phần đầu tiên
        const [questions] = await pool.execute("SELECT * FROM questions WHERE part_id = ?", [parts[0].id])
        console.log(`\nTìm thấy ${questions.length} câu hỏi trong phần ID: ${parts[0].id}`)

        if (questions.length > 0) {
          console.log("\nThông tin câu hỏi đầu tiên:")
          console.log(questions[0])

          // Kiểm tra nội dung và đáp án của câu hỏi
          try {
            const content = JSON.parse(questions[0].content)
            console.log("\nNội dung câu hỏi (đã parse):")
            console.log(content)

            const correctAnswers = JSON.parse(questions[0].correct_answers)
            console.log("\nĐáp án đúng (đã parse):")
            console.log(correctAnswers)
          } catch (error) {
            console.error("Lỗi khi parse JSON:", error.message)
          }
        }
      }
    }

    // Kiểm tra số lượng câu hỏi theo loại
    const [questionTypes] = await pool.execute(`
      SELECT question_type, COUNT(*) as count
      FROM questions
      GROUP BY question_type
    `)

    console.log("\nSố lượng câu hỏi theo loại:")
    questionTypes.forEach((type) => {
      console.log(`- ${type.question_type}: ${type.count} câu hỏi`)
    })
  } catch (error) {
    console.error("Lỗi khi kiểm tra dữ liệu:", error.message)
  } finally {
    pool.end()
    process.exit()
  }
}

checkTestData()
