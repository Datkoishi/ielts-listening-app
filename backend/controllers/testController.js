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
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message })
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
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message })
  }
}

// Tạo bài kiểm tra mới
exports.createTest = async (req, res) => {
  const { title, vietnamese_name, description, parts } = req.body

  console.log("Received test data:", {
    title,
    vietnamese_name,
    description,
    parts: parts?.length || 0,
  })

  if (!title) {
    return res.status(400).json({ message: "Title is required" })
  }

  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    return res.status(400).json({ message: "At least one part with questions is required" })
  }

  try {
    await query("START TRANSACTION")
    console.log("Transaction started")

    // Tạo bài kiểm tra
    console.log("Inserting test with title:", title, "vietnameseName:", vietnamese_name)
    const result = await query("INSERT INTO tests (title, vietnamese_name, description) VALUES (?, ?, ?)", [
      title,
      vietnamese_name || null,
      description || null,
    ])

    const testId = result.insertId
    console.log("Created test with ID:", testId)

    // Tạo các phần và câu hỏi
    for (const part of parts) {
      const { part_number, questions } = part

      if (!part_number || !questions || !Array.isArray(questions)) {
        console.warn(`Skipping invalid part: ${JSON.stringify(part)}`)
        continue
      }

      console.log(`Processing part ${part_number} with ${questions.length} questions`)

      const partResult = await query("INSERT INTO parts (test_id, part_number) VALUES (?, ?)", [testId, part_number])

      const partId = partResult.insertId
      console.log(`Created part ${part_number} with ID:`, partId)

      for (const question of questions) {
        const { question_type, content, correct_answers } = question

        if (!question_type || !content || !correct_answers) {
          console.warn(`Skipping invalid question: ${JSON.stringify(question)}`)
          continue
        }

        console.log(`Inserting question of type: ${question_type}`)
        console.log("Question content:", content)
        console.log("Question correctAnswers:", correct_answers)

        await query("INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)", [
          partId,
          question_type,
          content,
          correct_answers,
        ])
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
  const { title, vietnamese_name, description, parts } = req.body

  try {
    await query("START TRANSACTION")

    // Cập nhật bài kiểm tra
    await query("UPDATE tests SET title = ?, vietnamese_name = ?, description = ? WHERE id = ?", [
      title,
      vietnamese_name || null,
      description || null,
      id,
    ])

    // Xóa các phần và câu hỏi hiện có
    await query("DELETE FROM parts WHERE test_id = ?", [id])

    // Tạo các phần và câu hỏi mới
    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        const { part_number, questions } = part

        if (!part_number || !questions || !Array.isArray(questions)) {
          continue
        }

        const partResult = await query("INSERT INTO parts (test_id, part_number) VALUES (?, ?)", [id, part_number])
        const partId = partResult.insertId

        for (const question of questions) {
          const { question_type, content, correct_answers } = question

          if (!question_type || !content || !correct_answers) {
            continue
          }

          await query("INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)", [
            partId,
            question_type,
            content,
            correct_answers,
          ])
        }
      }
    }

    await query("COMMIT")
    res.json({ message: "Cập nhật bài kiểm tra thành công" })
  } catch (error) {
    await query("ROLLBACK")
    console.error("Lỗi cập nhật bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message })
  }
}

// Xóa bài kiểm tra
exports.deleteTest = async (req, res) => {
  try {
    await query("DELETE FROM tests WHERE id = ?", [req.params.id])
    res.json({ message: "Xóa bài kiểm tra thành công" })
  } catch (error) {
    console.error("Lỗi xóa bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message })
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
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message })
  }
}
