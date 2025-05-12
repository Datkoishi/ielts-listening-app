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
// Cập nhật hàm createTest để xử lý các trường mới
exports.createTest = async (req, res) => {
  try {
    // Log dữ liệu đầu vào để debug
    console.log("Dữ liệu nhận được từ client:", JSON.stringify(req.body, null, 2))

    const { title, vietnamese_name, description, content, version, parts } = req.body

    // Kiểm tra dữ liệu đầu vào
    if (!title) {
      return res.status(400).json({ message: "Thiếu tiêu đề bài kiểm tra" })
    }

    await query("START TRANSACTION")

    // Tạo bài kiểm tra với các trường mới
    const result = await query(
      "INSERT INTO tests (title, vietnamese_name, description, content, version, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        vietnamese_name || "",
        description || "",
        content || JSON.stringify({ type: "listening", difficulty: "medium" }),
        version || "1.0",
        req.user?.id || 1, // Sử dụng ID người dùng từ middleware xác thực hoặc giá trị mặc định
        "active", // Trạng thái mặc định
      ],
    )

    const testId = result.insertId
    console.log(`Đã tạo bài kiểm tra với ID: ${testId}`)

    // Xử lý parts nếu được gửi theo định dạng mới
    if (Array.isArray(parts) && parts.length > 0) {
      for (const part of parts) {
        const { part_number, instructions, content: partContent, questions } = part

        // Tạo phần
        const partResult = await query(
          "INSERT INTO parts (test_id, part_number, instructions, content) VALUES (?, ?, ?, ?)",
          [
            testId,
            part_number,
            instructions || `Instructions for Part ${part_number}`,
            partContent || JSON.stringify({ title: `Part ${part_number}`, question_count: questions?.length || 0 }),
          ],
        )

        const partId = partResult.insertId
        console.log(`Đã tạo phần ${part_number} với ID: ${partId}`)

        // Tạo câu hỏi cho phần này
        if (Array.isArray(questions) && questions.length > 0) {
          for (const question of questions) {
            await query(
              "INSERT INTO questions (part_id, question_type, type_id, content, correct_answers, difficulty, points, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                partId,
                question.question_type,
                question.type_id || 1,
                question.content,
                question.correct_answers,
                question.difficulty || "medium",
                question.points || 1,
                question.position || 0,
              ],
            )
          }
          console.log(`Đã tạo ${questions.length} câu hỏi cho phần ${part_number}`)
        }
      }
    } else {
      // Xử lý theo định dạng cũ (part1, part2, part3, part4)
      for (let i = 1; i <= 4; i++) {
        const partData = req.body[`part${i}`]
        if (partData?.length > 0) {
          // Tạo phần với các trường mới
          const partResult = await query(
            "INSERT INTO parts (test_id, part_number, instructions, content) VALUES (?, ?, ?, ?)",
            [
              testId,
              i,
              `Instructions for Part ${i}`, // Mặc định
              JSON.stringify({ title: `Part ${i}`, question_count: partData.length }),
            ],
          )

          const partId = partResult.insertId
          console.log(`Đã tạo phần ${i} với ID: ${partId}`)

          for (const [index, question] of partData.entries()) {
            // Map loại câu hỏi sang type_id
            const typeIdMap = {
              "Một đáp án": 1,
              "Nhiều đáp án": 2,
              "Ghép nối": 3,
              "Ghi nhãn Bản đồ/Sơ đồ": 4,
              "Hoàn thành ghi chú": 5,
              "Hoàn thành bảng/biểu mẫu": 6,
              "Hoàn thành lưu đồ": 7,
            }

            const typeId = typeIdMap[question.type] || 1

            // Đảm bảo content và correctAnswers là chuỗi JSON
            let contentStr = question.content
            if (typeof contentStr !== "string") {
              contentStr = JSON.stringify(contentStr)
            }

            let correctAnswersStr = question.correctAnswers
            if (typeof correctAnswersStr !== "string") {
              correctAnswersStr = JSON.stringify(correctAnswersStr)
            }

            // Tạo câu hỏi với các trường mới
            await query(
              "INSERT INTO questions (part_id, question_type, type_id, content, correct_answers, difficulty, points, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                partId,
                question.type,
                typeId,
                contentStr,
                correctAnswersStr,
                "medium", // Mặc định
                1, // Mặc định
                index + 1, // Vị trí
              ],
            )
          }
          console.log(`Đã tạo ${partData.length} câu hỏi cho phần ${i}`)
        }
      }
    }

    await query("COMMIT")
    res.status(201).json({ message: "Tạo bài kiểm tra thành công", testId })
  } catch (error) {
    await query("ROLLBACK")
    console.error("Lỗi tạo bài kiểm tra:", error.message, error.stack)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message, stack: error.stack })
  }
}

// Update the updateTest function to handle the vietnameseName field
// Cập nhật hàm updateTest để xử lý các trường mới
exports.updateTest = async (req, res) => {
  const { id } = req.params
  const { title, vietnameseName, description, content, version, part1, part2, part3, part4 } = req.body

  try {
    await query("START TRANSACTION")

    // Cập nhật bài kiểm tra với các trường mới
    await query(
      "UPDATE tests SET title = ?, vietnamese_name = ?, description = ?, content = ?, version = ? WHERE id = ?",
      [
        title,
        vietnameseName,
        description,
        content || JSON.stringify({ type: "listening", difficulty: "medium" }),
        version || "1.0",
        id,
      ],
    )

    // Xóa các phần và câu hỏi hiện có
    await query("DELETE FROM parts WHERE test_id = ?", [id])

    // Tạo các phần và câu hỏi mới
    for (let i = 1; i <= 4; i++) {
      const partData = req.body[`part${i}`]
      if (partData?.length > 0) {
        // Tạo phần với các trường mới
        const partResult = await query(
          "INSERT INTO parts (test_id, part_number, instructions, content) VALUES (?, ?, ?, ?)",
          [
            id,
            i,
            `Instructions for Part ${i}`, // Mặc định
            JSON.stringify({ title: `Part ${i}`, question_count: partData.length }),
          ],
        )

        const partId = partResult.insertId

        for (const question of partData) {
          // Map loại câu hỏi sang type_id
          const typeIdMap = {
            "Một đáp án": 1,
            "Nhiều đáp án": 2,
            "Ghép nối": 3,
            "Ghi nhãn Bản đồ/Sơ đồ": 4,
            "Hoàn thành ghi chú": 5,
            "Hoàn thành bảng/biểu mẫu": 6,
            "Hoàn thành lưu đồ": 7,
          }

          const typeId = typeIdMap[question.type] || 1

          // Tạo câu hỏi với các trường mới
          await query(
            "INSERT INTO questions (part_id, question_type, type_id, content, correct_answers, difficulty, points) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              partId,
              question.type,
              typeId,
              JSON.stringify(question.content),
              JSON.stringify(question.correctAnswers),
              "medium", // Mặc định
              1, // Mặc định
            ],
          )
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

// Thêm endpoint kiểm tra kết nối
exports.healthCheck = (req, res) => {
  try {
    // Trả về response đơn giản không cần truy vấn database
    res.status(200).json({
      status: "success",
      message: "Server is running",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    res.status(500).json({
      status: "error",
      message: "Server error during health check",
      error: error.message,
    })
  }
}
