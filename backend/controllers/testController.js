const Test = require("../models/Test")
const db = require("../config/database")
const { query } = require("../config/database")

// Get all tests
exports.getAllTests = async (req, res) => {
  try {
    const [tests] = await db.query("SELECT * FROM tests ORDER BY created_at DESC")
    res.status(200).json(tests)
  } catch (error) {
    console.error("Error getting tests:", error)
    res.status(500).json({ message: "Error getting tests", error: error.message })
  }
}

// Get a specific test by ID
exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params

    // Get test
    const [tests] = await db.query("SELECT * FROM tests WHERE id = ?", [id])

    if (tests.length === 0) {
      return res.status(404).json({ message: "Test not found" })
    }

    const test = tests[0]

    // Get parts for this test
    const [parts] = await db.query("SELECT * FROM parts WHERE test_id = ? ORDER BY part_number", [id])

    // Get questions for each part
    const testWithParts = { ...test, parts: [] }

    for (const part of parts) {
      const [questions] = await db.query("SELECT * FROM questions WHERE part_id = ?", [part.id])

      // Parse JSON content and correct_answers
      const parsedQuestions = questions.map((q) => ({
        ...q,
        content: JSON.parse(q.content || "[]"),
        correct_answers: JSON.parse(q.correct_answers || "[]"),
      }))

      testWithParts.parts.push({
        ...part,
        questions: parsedQuestions,
      })
    }

    res.status(200).json(testWithParts)
  } catch (error) {
    console.error("Error getting test:", error)
    res.status(500).json({ message: "Error getting test", error: error.message })
  }
}

// Create a new test
exports.createTest = async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    console.log("Creating new test with data:", JSON.stringify(req.body, null, 2))

    const { title, description, vietnamese_name, parts } = req.body

    if (!title) {
      return res.status(400).json({ message: "Title is required" })
    }

    // Insert test
    const [result] = await connection.query(
      "INSERT INTO tests (title, description, vietnamese_name) VALUES (?, ?, ?)",
      [title, description || "", vietnamese_name || ""],
    )

    const testId = result.insertId
    console.log(`Created test with ID: ${testId}`)

    // Insert parts and questions
    if (Array.isArray(parts)) {
      for (const part of parts) {
        const { part_number, questions } = part

        // Insert part
        const [partResult] = await connection.query("INSERT INTO parts (test_id, part_number) VALUES (?, ?)", [
          testId,
          part_number,
        ])

        const partId = partResult.insertId
        console.log(`Created part ${part_number} with ID: ${partId}`)

        // Insert questions
        if (Array.isArray(questions)) {
          for (const question of questions) {
            const { question_type, content, correct_answers } = question

            await connection.query(
              "INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)",
              [partId, question_type, content, correct_answers],
            )
          }
          console.log(`Added ${questions.length} questions to part ${part_number}`)
        }
      }
    }

    await connection.commit()

    res.status(201).json({
      message: "Test created successfully",
      testId: testId,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Error creating test:", error)
    res.status(500).json({ message: "Error creating test", error: error.message })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

// Update a test
exports.updateTest = async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const { id } = req.params
    const { title, description, vietnamese_name, parts } = req.body

    // Update test
    await connection.query(
      "UPDATE tests SET title = ?, description = ?, vietnamese_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [title, description || "", vietnamese_name || "", id],
    )

    // Delete existing parts and questions
    const [existingParts] = await connection.query("SELECT id FROM parts WHERE test_id = ?", [id])
    for (const part of existingParts) {
      await connection.query("DELETE FROM questions WHERE part_id = ?", [part.id])
    }
    await connection.query("DELETE FROM parts WHERE test_id = ?", [id])

    // Insert new parts and questions
    if (Array.isArray(parts)) {
      for (const part of parts) {
        const { part_number, questions } = part

        // Insert part
        const [partResult] = await connection.query("INSERT INTO parts (test_id, part_number) VALUES (?, ?)", [
          id,
          part_number,
        ])

        const partId = partResult.insertId

        // Insert questions
        if (Array.isArray(questions)) {
          for (const question of questions) {
            const { question_type, content, correct_answers } = question

            await connection.query(
              "INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)",
              [partId, question_type, content, correct_answers],
            )
          }
        }
      }
    }

    await connection.commit()

    res.status(200).json({
      message: "Test updated successfully",
      testId: id,
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Error updating test:", error)
    res.status(500).json({ message: "Error updating test", error: error.message })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

// Delete a test
exports.deleteTest = async (req, res) => {
  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const { id } = req.params

    // Delete parts and questions
    const [parts] = await connection.query("SELECT id FROM parts WHERE test_id = ?", [id])
    for (const part of parts) {
      await connection.query("DELETE FROM questions WHERE part_id = ?", [part.id])
    }
    await connection.query("DELETE FROM parts WHERE test_id = ?", [id])

    // Delete test
    await connection.query("DELETE FROM tests WHERE id = ?", [id])

    await connection.commit()

    res.status(200).json({ message: "Test deleted successfully" })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }
    console.error("Error deleting test:", error)
    res.status(500).json({ message: "Error deleting test", error: error.message })
  } finally {
    if (connection) {
      connection.release()
    }
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
