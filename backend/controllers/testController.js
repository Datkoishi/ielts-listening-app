const Test = require("../models/Test")
const { query } = require("../config/database")

// Update the getAllTests function to include the vietnameseName field
exports.getAllTests = async (req, res) => {
  try {
    const tests = await query(`
      SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at
      FROM tests t
      ORDER BY t.created_at DESC
    `)
    res.json(tests)
  } catch (error) {
    console.error("Lỗi lấy danh sách bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Lấy bài kiểm tra theo ID
// Update the getTestById function to include the vietnameseName field
exports.getTestById = async (req, res) => {
  try {
    const test = await query(
      `
      SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at
      FROM tests t
      WHERE t.id = ?
    `,
      [req.params.id],
    )

    if (!test || test.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" })
    }

    // Lấy các phần và câu hỏi
    const parts = await query(
      `
      SELECT id, part_number, audio_url
      FROM parts
      WHERE test_id = ?
      ORDER BY part_number
    `,
      [req.params.id],
    )

    const partsWithQuestions = await Promise.all(
      parts.map(async (part) => {
        const questions = await query(
          `
        SELECT id, question_type, content, correct_answers
        FROM questions
        WHERE part_id = ?
        ORDER BY id
      `,
          [part.id],
        )

        return { ...part, questions }
      }),
    )

    // Map vietnamese_name to vietnameseName for frontend consistency
    const testData = {
      ...test[0],
      vietnameseName: test[0].vietnamese_name,
      parts: partsWithQuestions,
    }
    delete testData.vietnamese_name

    res.json(testData)
  } catch (error) {
    console.error("Lỗi lấy bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Tạo bài kiểm tra mới
exports.createTest = async (req, res) => {
  const { title, vietnameseName, description, part1, part2, part3, part4 } = req.body

  console.log("Received test data:", {
    title,
    vietnameseName,
    description,
    part1: part1?.length || 0,
    part2: part2?.length || 0,
    part3: part3?.length || 0,
    part4: part4?.length || 0,
  })

  try {
    await query("START TRANSACTION")
    console.log("Transaction started")

    // Tạo bài kiểm tra
    console.log("Inserting test with title:", title, "vietnameseName:", vietnameseName)
    const result = await query("INSERT INTO tests (title, vietnamese_name, description) VALUES (?, ?, ?)", [
      title,
      vietnameseName,
      description,
    ])

    const testId = result.insertId
    console.log("Created test with ID:", testId)

    // Tạo các phần và câu hỏi
    for (let i = 1; i <= 4; i++) {
      const partData = req.body[`part${i}`]
      if (partData?.length > 0) {
        console.log(`Processing part ${i} with ${partData.length} questions`)

        const partResult = await query("INSERT INTO parts (test_id, part_number) VALUES (?, ?)", [testId, i])

        const partId = partResult.insertId
        console.log(`Created part ${i} with ID:`, partId)

        for (const question of partData) {
          console.log(`Inserting question of type: ${question.type}`)
          console.log("Question content:", JSON.stringify(question.content))
          console.log("Question correctAnswers:", JSON.stringify(question.correctAnswers))

          await query("INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)", [
            partId,
            question.type,
            JSON.stringify(question.content),
            JSON.stringify(question.correctAnswers),
          ])
        }
      }
    }

    await query("COMMIT")
    console.log("Transaction committed successfully")

    res.status(201).json({ message: "Tạo bài kiểm tra thành công", testId })
  } catch (error) {
    console.error("Error in createTest:", error)
    await query("ROLLBACK")
    console.error("Transaction rolled back due to error:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message })
  }
}

// Update the updateTest function to handle the vietnameseName field
exports.updateTest = async (req, res) => {
  const { id } = req.params
  const { title, vietnameseName, description, part1, part2, part3, part4 } = req.body

  try {
    await query("START TRANSACTION")

    // Cập nhật bài kiểm tra
    await query("UPDATE tests SET title = ?, vietnamese_name = ?, description = ? WHERE id = ?", [
      title,
      vietnameseName,
      description,
      id,
    ])

    // Xóa các phần và câu hỏi hiện có
    await query("DELETE FROM parts WHERE test_id = ?", [id])

    // Tạo các phần và câu hỏi mới
    for (let i = 1; i <= 4; i++) {
      const partData = req.body[`part${i}`]
      if (partData?.length > 0) {
        const partResult = await query("INSERT INTO parts (test_id, part_number) VALUES (?, ?)", [id, i])

        const partId = partResult.insertId

        for (const question of partData) {
          await query("INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)", [
            partId,
            question.type,
            JSON.stringify(question.content),
            JSON.stringify(question.correctAnswers),
          ])
        }
      }
    }

    await query("COMMIT")
    res.json({ message: "Cập nhật bài kiểm tra thành công" })
  } catch (error) {
    await query("ROLLBACK")
    console.error("Lỗi cập nhật bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Xóa bài kiểm tra
exports.deleteTest = async (req, res) => {
  try {
    await query("DELETE FROM tests WHERE id = ?", [req.params.id])
    res.json({ message: "Xóa bài kiểm tra thành công" })
  } catch (error) {
    console.error("Lỗi xóa bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Nhận câu trả lời từ học sinh
exports.submitAnswers = async (req, res) => {
  try {
    const { testId } = req.params
    const { answers, studentId } = req.body

    // Kiểm tra bài kiểm tra tồn tại
    const test = await query("SELECT id FROM tests WHERE id = ?", [testId])
    if (!test || test.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" })
    }

    // Lấy tất cả câu hỏi của bài kiểm tra
    const questions = await query(
      `
      SELECT q.*, p.part_number
      FROM questions q
      JOIN parts p ON q.part_id = p.id
      WHERE p.test_id = ?
      ORDER BY p.part_number, q.id
    `,
      [testId],
    )

    // Kiểm tra và lưu câu trả lời
    const results = []
    let correctCount = 0

    for (const answer of answers) {
      const { questionId, studentAnswer } = answer

      // Tìm câu hỏi tương ứng
      const question = questions.find((q) => q.id === Number.parseInt(questionId))
      if (!question) continue

      // Lấy đáp án đúng
      const correctAnswers = JSON.parse(question.correct_answers)

      // Kiểm tra câu trả lời
      let isCorrect = false
      if (Array.isArray(correctAnswers)) {
        // Nếu có nhiều đáp án đúng
        if (Array.isArray(studentAnswer)) {
          isCorrect =
            studentAnswer.length === correctAnswers.length && studentAnswer.every((a) => correctAnswers.includes(a))
        } else {
          isCorrect = correctAnswers.includes(studentAnswer)
        }
      } else {
        // Nếu chỉ có một đáp án đúng
        isCorrect = studentAnswer === correctAnswers
      }

      // Lưu kết quả
      await query(
        "INSERT INTO student_answers (student_id, test_id, question_id, answer, is_correct) VALUES (?, ?, ?, ?, ?)",
        [studentId || 0, testId, questionId, JSON.stringify(studentAnswer), isCorrect],
      )

      results.push({
        questionId,
        isCorrect,
      })

      if (isCorrect) correctCount++
    }

    // Tính điểm
    const totalQuestions = questions.length
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

    res.json({
      message: "Nộp bài thành công",
      score,
      correctCount,
      totalQuestions,
      results,
    })
  } catch (error) {
    console.error("Lỗi khi nộp bài:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}
