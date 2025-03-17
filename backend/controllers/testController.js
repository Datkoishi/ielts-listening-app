const Test = require("../models/Test")
const { query } = require("../config/database")

// Lấy tất cả bài kiểm tra
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.findAll()
    res.json(tests)
  } catch (error) {
    console.error("Lỗi lấy danh sách bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Lấy bài kiểm tra theo ID
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
    if (!test) {
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

        // Loại bỏ đáp án đúng cho học sinh
        if (req.user.role === "student") {
          questions.forEach((q) => delete q.correct_answers)
        }

        return { ...part, questions }
      }),
    )

    res.json({ ...test, parts: partsWithQuestions })
  } catch (error) {
    console.error("Lỗi lấy bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Tạo bài kiểm tra mới
exports.createTest = async (req, res) => {
  const { title, description, part1, part2, part3, part4 } = req.body

  try {
    await query("START TRANSACTION")

    // Tạo bài kiểm tra
    const testId = await Test.create({ title, description }, req.user.id)

    // Tạo các phần và câu hỏi
    for (let i = 1; i <= 4; i++) {
      const partData = req.body[`part${i}`]
      if (partData?.length > 0) {
        const partId = await Test.createPart(testId, i)

        for (const question of partData) {
          await Test.createQuestion(partId, question)
        }
      }
    }

    await query("COMMIT")
    res.status(201).json({ message: "Tạo bài kiểm tra thành công", testId })
  } catch (error) {
    await query("ROLLBACK")
    console.error("Lỗi tạo bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Cập nhật bài kiểm tra
exports.updateTest = async (req, res) => {
  const { id } = req.params
  const { title, description, part1, part2, part3, part4 } = req.body

  try {
    await query("START TRANSACTION")

    // Kiểm tra quyền sở hữu
    const test = await Test.findById(id)
    if (!test || test.created_by !== req.user.id) {
      await query("ROLLBACK")
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra hoặc không có quyền" })
    }

    // Cập nhật bài kiểm tra
    await Test.update(id, { title, description })

    // Xóa các phần và câu hỏi hiện có
    await query("DELETE FROM parts WHERE test_id = ?", [id])

    // Tạo các phần và câu hỏi mới
    for (let i = 1; i <= 4; i++) {
      const partData = req.body[`part${i}`]
      if (partData?.length > 0) {
        const partId = await Test.createPart(id, i)

        for (const question of partData) {
          await Test.createQuestion(partId, question)
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
    const test = await Test.findById(req.params.id)
    if (!test || test.created_by !== req.user.id) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra hoặc không có quyền" })
    }

    await Test.delete(req.params.id)
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
    const { answers } = req.body
    const studentId = req.user.id

    // Kiểm tra bài kiểm tra tồn tại
    const test = await Test.findById(testId)
    if (!test) {
      return res.status(404).json({ message: "Không tìm thấy bài kiểm tra" })
    }

    // Lấy tất cả câu hỏi của bài kiểm tra
    const questions = await Test.getQuestionsByTestId(testId)

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
        [studentId, testId, questionId, JSON.stringify(studentAnswer), isCorrect],
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

