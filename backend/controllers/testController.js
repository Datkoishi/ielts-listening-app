const Test = require("../models/Test")
const { query } = require("../config/database")

// Kiểm tra xem cột vietnamese_name có tồn tại không
async function checkVietnameseNameColumn() {
  try {
    const columns = await query('SHOW COLUMNS FROM tests LIKE "vietnamese_name"')
    return columns.length > 0
  } catch (error) {
    console.error("Lỗi khi kiểm tra cột vietnamese_name:", error.message)
    return false
  }
}

// Lấy tất cả bài kiểm tra công khai (không cần xác thực)
exports.getPublicTests = async (req, res) => {
  try {
    console.log("Đang lấy danh sách bài kiểm tra công khai...")

    // Kiểm tra xem cột vietnamese_name có tồn tại không
    const hasVietnameseName = await checkVietnameseNameColumn()

    let tests
    if (hasVietnameseName) {
      tests = await query(`
        SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at
        FROM tests t
        ORDER BY t.created_at DESC
      `)
    } else {
      tests = await query(`
        SELECT t.id, t.title, t.description, t.created_at
        FROM tests t
        ORDER BY t.created_at DESC
      `)

      // Thêm trường vietnamese_name rỗng cho mỗi bài kiểm tra
      tests = tests.map((test) => ({
        ...test,
        vietnamese_name: "",
      }))
    }

    console.log("Kết quả truy vấn:", tests)
    res.json(tests)
  } catch (error) {
    console.error("Lỗi lấy danh sách bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Lấy bài kiểm tra theo ID công khai (không cần xác thực)
exports.getPublicTestById = async (req, res) => {
  try {
    console.log(`Đang lấy bài kiểm tra ID: ${req.params.id}`)

    // Kiểm tra xem cột vietnamese_name có tồn tại không
    const hasVietnameseName = await checkVietnameseNameColumn()

    let test
    if (hasVietnameseName) {
      test = await query(
        `
        SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at
        FROM tests t
        WHERE t.id = ?
      `,
        [req.params.id],
      )
    } else {
      test = await query(
        `
        SELECT t.id, t.title, t.description, t.created_at
        FROM tests t
        WHERE t.id = ?
      `,
        [req.params.id],
      )

      // Thêm trường vietnamese_name rỗng
      if (test && test.length > 0) {
        test[0].vietnamese_name = ""
      }
    }

    if (!test || test.length === 0) {
      console.log(`Không tìm thấy bài kiểm tra ID: ${req.params.id}`)
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

    console.log(`Tìm thấy ${parts.length} phần cho bài kiểm tra ID: ${req.params.id}`)

    const partsWithQuestions = await Promise.all(
      parts.map(async (part) => {
        const questions = await query(
          `
        SELECT id, question_type, content
        FROM questions
        WHERE part_id = ?
        ORDER BY id
      `,
          [part.id],
        )

        console.log(`Tìm thấy ${questions.length} câu hỏi cho phần ID: ${part.id}`)

        // Chuyển đổi content từ JSON string sang object
        const processedQuestions = questions.map((q) => {
          try {
            return {
              ...q,
              content: JSON.parse(q.content),
            }
          } catch (error) {
            console.error(`Lỗi parse JSON cho câu hỏi ID: ${q.id}`, error)
            return {
              ...q,
              content: {},
              parseError: true,
            }
          }
        })

        return { ...part, questions: processedQuestions }
      }),
    )

    // Map vietnamese_name to vietnameseName for frontend consistency
    const testData = {
      ...test[0],
      vietnameseName: test[0].vietnamese_name || "",
      parts: partsWithQuestions,
    }
    delete testData.vietnamese_name

    res.json(testData)
  } catch (error) {
    console.error("Lỗi lấy bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Nộp bài làm công khai (không cần xác thực)
exports.submitPublicAnswers = async (req, res) => {
  try {
    const { testId } = req.params
    const { answers, studentName = "Anonymous" } = req.body

    console.log(`Đang xử lý bài nộp cho bài kiểm tra ID: ${testId}`)
    console.log(`Số câu trả lời: ${answers.length}`)

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

    console.log(`Tìm thấy ${questions.length} câu hỏi cho bài kiểm tra ID: ${testId}`)

    // Kiểm tra và lưu câu trả lời
    const results = []
    let correctCount = 0

    for (const answer of answers) {
      const { questionId, studentAnswer } = answer

      // Tìm câu hỏi tương ứng
      const question = questions.find((q) => q.id === Number.parseInt(questionId))
      if (!question) {
        console.log(`Không tìm thấy câu hỏi ID: ${questionId}`)
        continue
      }

      // Lấy đáp án đúng
      let correctAnswers
      try {
        correctAnswers = JSON.parse(question.correct_answers)
      } catch (error) {
        console.error(`Lỗi parse JSON đáp án đúng cho câu hỏi ID: ${questionId}`, error)
        continue
      }

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

      // Lưu kết quả vào mảng (không lưu vào database)
      results.push({
        questionId,
        isCorrect,
        correctAnswer: correctAnswers,
        studentAnswer,
      })

      if (isCorrect) correctCount++
    }

    // Tính điểm
    const totalQuestions = questions.length
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

    console.log(`Kết quả: ${correctCount}/${totalQuestions} câu đúng, điểm: ${score}`)

    res.json({
      message: "Nộp bài thành công",
      score,
      correctCount,
      totalQuestions,
      results,
    })
  } catch (error) {
    console.error("Lỗi khi nộp bài:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Update the getAllTests function to handle the vietnamese_name field
exports.getAllTests = async (req, res) => {
  try {
    // Kiểm tra xem cột vietnamese_name có tồn tại không
    const hasVietnameseName = await checkVietnameseNameColumn()

    let tests
    if (hasVietnameseName) {
      tests = await query(`
        SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at
        FROM tests t
        ORDER BY t.created_at DESC
      `)
    } else {
      tests = await query(`
        SELECT t.id, t.title, t.description, t.created_at
        FROM tests t
        ORDER BY t.created_at DESC
      `)

      // Thêm trường vietnamese_name rỗng cho mỗi bài kiểm tra
      tests = tests.map((test) => ({
        ...test,
        vietnamese_name: "",
      }))
    }

    res.json(tests)
  } catch (error) {
    console.error("Lỗi lấy danh sách bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Lấy bài kiểm tra theo ID
exports.getTestById = async (req, res) => {
  try {
    // Kiểm tra xem cột vietnamese_name có tồn tại không
    const hasVietnameseName = await checkVietnameseNameColumn()

    let test
    if (hasVietnameseName) {
      test = await query(
        `
        SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at
        FROM tests t
        WHERE t.id = ?
      `,
        [req.params.id],
      )
    } else {
      test = await query(
        `
        SELECT t.id, t.title, t.description, t.created_at
        FROM tests t
        WHERE t.id = ?
      `,
        [req.params.id],
      )

      // Thêm trường vietnamese_name rỗng
      if (test && test.length > 0) {
        test[0].vietnamese_name = ""
      }
    }

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
      vietnameseName: test[0].vietnamese_name || "",
      parts: partsWithQuestions,
    }
    delete testData.vietnamese_name

    res.json(testData)
  } catch (error) {
    console.error("Lỗi lấy bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Tạo bài kiểm tra mới
exports.createTest = async (req, res) => {
  const { title, vietnameseName, description, part1, part2, part3, part4 } = req.body

  try {
    console.log("Đang tạo bài kiểm tra mới...")
    console.log("Dữ liệu nhận được:", {
      title,
      vietnameseName,
      description,
      part1: part1 ? `${part1.length} câu hỏi` : "không có",
      part2: part2 ? `${part2.length} câu hỏi` : "không có",
      part3: part3 ? `${part3.length} câu hỏi` : "không có",
      part4: part4 ? `${part4.length} câu hỏi` : "không có",
    })

    await query("START TRANSACTION")

    // Kiểm tra xem cột vietnamese_name có tồn tại không
    const hasVietnameseName = await checkVietnameseNameColumn()

    let testId
    if (hasVietnameseName) {
      // Tạo bài kiểm tra với vietnamese_name
      const result = await query("INSERT INTO tests (title, vietnamese_name, description) VALUES (?, ?, ?)", [
        title,
        vietnameseName,
        description,
      ])
      testId = result.insertId
    } else {
      // Tạo bài kiểm tra không có vietnamese_name
      const result = await query("INSERT INTO tests (title, description) VALUES (?, ?)", [title, description])
      testId = result.insertId
    }

    console.log(`Đã tạo bài kiểm tra mới với ID: ${testId}`)

    // Tạo các phần và câu hỏi
    for (let i = 1; i <= 4; i++) {
      const partData = req.body[`part${i}`]
      if (partData?.length > 0) {
        const partResult = await query("INSERT INTO parts (test_id, part_number) VALUES (?, ?)", [testId, i])

        const partId = partResult.insertId
        console.log(`Đã tạo phần ${i} với ID: ${partId}`)

        for (const question of partData) {
          try {
            const contentStr = JSON.stringify(question.content)
            const correctAnswersStr = JSON.stringify(question.correctAnswers)

            console.log(`Đang thêm câu hỏi loại: ${question.type}`)
            console.log(`Content: ${contentStr.substring(0, 100)}...`)
            console.log(`Correct answers: ${correctAnswersStr}`)

            await query(
              "INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)",
              [partId, question.type, contentStr, correctAnswersStr],
            )
          } catch (error) {
            console.error("Lỗi khi thêm câu hỏi:", error)
            throw error
          }
        }
        console.log(`Đã thêm ${partData.length} câu hỏi vào phần ${i}`)
      }
    }

    await query("COMMIT")
    console.log("Đã tạo bài kiểm tra thành công!")
    res.status(201).json({ message: "Tạo bài kiểm tra thành công", testId })
  } catch (error) {
    await query("ROLLBACK")
    console.error("Lỗi tạo bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Update the updateTest function to handle the vietnameseName field
exports.updateTest = async (req, res) => {
  const { id } = req.params
  const { title, vietnameseName, description, part1, part2, part3, part4 } = req.body

  try {
    await query("START TRANSACTION")

    // Kiểm tra xem cột vietnamese_name có tồn tại không
    const hasVietnameseName = await checkVietnameseNameColumn()

    if (hasVietnameseName) {
      // Cập nhật bài kiểm tra với vietnamese_name
      await query("UPDATE tests SET title = ?, vietnamese_name = ?, description = ? WHERE id = ?", [
        title,
        vietnameseName,
        description,
        id,
      ])
    } else {
      // Cập nhật bài kiểm tra không có vietnamese_name
      await query("UPDATE tests SET title = ?, description = ? WHERE id = ?", [title, description, id])
    }

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
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Xóa bài kiểm tra
exports.deleteTest = async (req, res) => {
  try {
    await query("DELETE FROM tests WHERE id = ?", [req.params.id])
    res.json({ message: "Xóa bài kiểm tra thành công" })
  } catch (error) {
    console.error("Lỗi xóa bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
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
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}
