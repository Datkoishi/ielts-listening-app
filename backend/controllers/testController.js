const Test = require("../models/Test")
const db = require("../config/database")

// Lấy tất cả bài kiểm tra
const getAllTests = async (req, res) => {
  try {
    const userId = req.user.id
    const [tests] = await db.query("SELECT * FROM tests WHERE user_id = ? ORDER BY created_at DESC", [userId])
    res.json(tests)
  } catch (error) {
    console.error("Error fetching tests:", error)
    res.status(500).json({ message: "Lỗi khi lấy danh sách bài kiểm tra" })
  }
}

// Lấy tất cả bài kiểm tra công khai (không cần xác thực)
const getPublicTests = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, title, description, created_at FROM tests WHERE is_public = 1")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching public tests:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Lấy bài kiểm tra theo ID
const getTestById = async (req, res) => {
  try {
    // Get test
    const [tests] = await db.query("SELECT * FROM tests WHERE id = ? AND user_id = ?", [req.params.id, req.user.id])

    if (tests.length === 0) {
      return res.status(404).json({ message: "Test not found" })
    }

    const test = tests[0]

    // Get questions
    const [questions] = await db.query("SELECT * FROM questions WHERE test_id = ? ORDER BY section, position", [
      req.params.id,
    ])

    // Parse JSON strings
    const formattedQuestions = questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
      correct_answer: JSON.parse(q.correct_answer),
    }))

    res.json({
      ...test,
      questions: formattedQuestions,
    })
  } catch (error) {
    console.error("Error fetching test:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Lấy bài kiểm tra công khai theo ID (không cần xác thực)
const getPublicTestById = async (req, res) => {
  try {
    // Get test
    const [tests] = await db.query(
      "SELECT id, title, description, audio_url, created_at FROM tests WHERE id = ? AND is_public = 1",
      [req.params.id],
    )

    if (tests.length === 0) {
      return res.status(404).json({ message: "Test not found or not public" })
    }

    const test = tests[0]

    // Get questions (without correct answers for students)
    const [questions] = await db.query(
      "SELECT id, type, content, options, section, position FROM questions WHERE test_id = ? ORDER BY section, position",
      [req.params.id],
    )

    // Parse JSON strings for options only (not sending correct answers)
    const formattedQuestions = questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
    }))

    res.json({
      ...test,
      questions: formattedQuestions,
    })
  } catch (error) {
    console.error("Error fetching public test:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Tạo bài kiểm tra mới
const createTest = async (req, res) => {
  try {
    const { title, description, audio_url, questions } = req.body

    if (!title || !audio_url || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Insert test
    const [result] = await db.query(
      "INSERT INTO tests (user_id, title, description, audio_url, created_at) VALUES (?, ?, ?, ?, NOW())",
      [req.user.id, title, description, audio_url],
    )

    const testId = result.insertId

    // Insert questions
    for (const question of questions) {
      const { type, content, options, correct_answer, section, position } = question

      const [questionResult] = await db.query(
        "INSERT INTO questions (test_id, type, content, options, correct_answer, section, position) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [testId, type, content, JSON.stringify(options), JSON.stringify(correct_answer), section, position],
      )
    }

    res.status(201).json({
      message: "Test created successfully",
      testId,
    })
  } catch (error) {
    console.error("Error creating test:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Cập nhật bài kiểm tra
const updateTest = async (req, res) => {
  try {
    const { title, description, audio_url, questions } = req.body

    if (!title || !audio_url || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Check if test exists and belongs to user
    const [tests] = await db.query("SELECT * FROM tests WHERE id = ? AND user_id = ?", [req.params.id, req.user.id])

    if (tests.length === 0) {
      return res.status(404).json({ message: "Test not found" })
    }

    // Update test
    await db.query("UPDATE tests SET title = ?, description = ?, audio_url = ?, updated_at = NOW() WHERE id = ?", [
      title,
      description,
      audio_url,
      req.params.id,
    ])

    // Delete existing questions
    await db.query("DELETE FROM questions WHERE test_id = ?", [req.params.id])

    // Insert new questions
    for (const question of questions) {
      const { type, content, options, correct_answer, section, position } = question

      await db.query(
        "INSERT INTO questions (test_id, type, content, options, correct_answer, section, position) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [req.params.id, type, content, JSON.stringify(options), JSON.stringify(correct_answer), section, position],
      )
    }

    res.json({ message: "Test updated successfully" })
  } catch (error) {
    console.error("Error updating test:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Xóa bài kiểm tra
const deleteTest = async (req, res) => {
  try {
    // Check if test exists and belongs to user
    const [tests] = await db.query("SELECT * FROM tests WHERE id = ? AND user_id = ?", [req.params.id, req.user.id])

    if (tests.length === 0) {
      return res.status(404).json({ message: "Test not found" })
    }

    // Delete questions first (due to foreign key constraint)
    await db.query("DELETE FROM questions WHERE test_id = ?", [req.params.id])

    // Delete test
    await db.query("DELETE FROM tests WHERE id = ?", [req.params.id])

    res.json({ message: "Test deleted successfully" })
  } catch (error) {
    console.error("Error deleting test:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Nhận câu trả lời từ học sinh
const submitAnswers = async (req, res) => {
  try {
    const testId = req.params.testId
    const { answers } = req.body
    const userId = req.user.id

    // Lấy thông tin bài kiểm tra
    const [test] = await db.query("SELECT * FROM tests WHERE id = ?", [testId])

    if (test.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" })
    }

    // Lấy các câu hỏi của bài kiểm tra
    const [questions] = await db.query("SELECT * FROM questions WHERE test_id = ? ORDER BY question_order", [testId])

    // Chấm điểm
    let score = 0
    const totalQuestions = questions.length
    const results = []

    questions.forEach((question, index) => {
      const questionId = question.id
      const userAnswer = answers[questionId]
      const correctAnswer = JSON.parse(question.answers)
      let isCorrect = false

      // Kiểm tra đáp án
      if (userAnswer && correctAnswer) {
        // Logic chấm điểm tùy theo loại câu hỏi
        switch (question.type) {
          case "multiple_choice":
            isCorrect = userAnswer === correctAnswer
            break
          case "multiple_answers":
            // So sánh mảng đáp án
            isCorrect =
              Array.isArray(userAnswer) &&
              Array.isArray(correctAnswer) &&
              userAnswer.length === correctAnswer.length &&
              userAnswer.every((ans) => correctAnswer.includes(ans))
            break
          case "matching":
          case "map_labeling":
          case "note_completion":
          case "form_completion":
          case "flow_chart":
            // So sánh object đáp án
            isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)
            break
          default:
            isCorrect = false
        }
      }

      if (isCorrect) {
        score++
      }

      results.push({
        questionId,
        userAnswer,
        correctAnswer,
        isCorrect,
      })
    })

    // Lưu kết quả vào database
    await db.query(
      "INSERT INTO submissions (test_id, user_id, score, total_questions, answers) VALUES (?, ?, ?, ?, ?)",
      [testId, userId, score, totalQuestions, JSON.stringify(answers)],
    )

    res.json({
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      results,
    })
  } catch (error) {
    console.error("Error submitting answers:", error)
    res.status(500).json({ message: "Lỗi khi nộp bài" })
  }
}

// Nhận câu trả lời từ học sinh (không cần xác thực)
const submitPublicAnswers = async (req, res) => {
  try {
    const { answers } = req.body
    const testId = req.params.id

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers format" })
    }

    // Get test to verify it exists and is public
    const [tests] = await db.query("SELECT * FROM tests WHERE id = ? AND is_public = 1", [testId])

    if (tests.length === 0) {
      return res.status(404).json({ message: "Test not found or not public" })
    }

    // Get questions with correct answers
    const [questions] = await db.query("SELECT id, correct_answer FROM questions WHERE test_id = ?", [testId])

    // Create a map of question IDs to correct answers
    const correctAnswersMap = {}
    questions.forEach((q) => {
      correctAnswersMap[q.id] = JSON.parse(q.correct_answer)
    })

    // Calculate score
    let score = 0
    const totalQuestions = questions.length

    answers.forEach((answer) => {
      const correctAnswer = correctAnswersMap[answer.questionId]

      if (correctAnswer) {
        // Handle different question types
        if (Array.isArray(correctAnswer) && Array.isArray(answer.value)) {
          // For multiple choice or matching questions
          const isCorrect =
            correctAnswer.length === answer.value.length && correctAnswer.every((val, idx) => val === answer.value[idx])
          if (isCorrect) score++
        } else if (typeof correctAnswer === "string" && typeof answer.value === "string") {
          // For text input questions (case insensitive)
          if (correctAnswer.toLowerCase() === answer.value.toLowerCase()) score++
        } else if (typeof correctAnswer === "object" && typeof answer.value === "object") {
          // For diagram/map questions
          const isCorrect = Object.keys(correctAnswer).every(
            (key) => correctAnswer[key].toLowerCase() === (answer.value[key] || "").toLowerCase(),
          )
          if (isCorrect) score++
        }
      }
    })

    const percentage = (score / totalQuestions) * 100

    res.json({
      score,
      totalQuestions,
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
      message: `You scored ${score} out of ${totalQuestions} (${Math.round(percentage)}%)`,
    })
  } catch (error) {
    console.error("Error submitting answers:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get all tests for authenticated user
const getTests = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tests WHERE user_id = ?", [req.user.id])
    res.json(rows)
  } catch (error) {
    console.error("Error fetching tests:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getAllTests,
  getPublicTests,
  getTestById,
  getPublicTestById,
  createTest,
  updateTest,
  deleteTest,
  submitAnswers,
  submitPublicAnswers,
  getTests,
}
