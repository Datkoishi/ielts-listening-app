const Test = require("../models/Test")
const AudioFile = require("../models/AudioFile")
const { query } = require("../config/database")
const fs = require("fs").promises
const path = require("path")
const { promisify } = require("util")
const { v4: uuidv4 } = require("uuid")

// Lấy danh sách bài kiểm tra
exports.getAllTests = async (req, res) => {
  try {
    const tests = await query(`
      SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at, t.version, t.updated_at
      FROM tests t
      ORDER BY t.created_at DESC
    `)
    res.json(tests)
  } catch (error) {
    console.error("Lỗi lấy danh sách bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Lấy bài kiểm tra theo ID
exports.getTestById = async (req, res) => {
  try {
    const test = await query(
      `
      SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at, t.version, t.updated_at
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

        // Parse JSON content và correct_answers
        const parsedQuestions = questions.map((q) => ({
          ...q,
          content: JSON.parse(q.content),
          correct_answers: JSON.parse(q.correct_answers),
        }))

        // Lấy thông tin file âm thanh
        const audioFile = await AudioFile.getByTestAndPart(req.params.id, part.part_number)

        return {
          ...part,
          questions: parsedQuestions,
          audioFile,
        }
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
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Tạo bài kiểm tra mới
exports.createTest = async (req, res) => {
  const { title, vietnameseName, description, part1, part2, part3, part4 } = req.body

  try {
    // Validate input
    if (!title) {
      return res.status(400).json({ message: "Tiêu đề bài kiểm tra là bắt buộc" })
    }

    await query("START TRANSACTION")

    // Tạo bài kiểm tra
    const result = await query("INSERT INTO tests (title, vietnamese_name, description) VALUES (?, ?, ?)", [
      title,
      vietnameseName,
      description,
    ])

    const testId = result.insertId

    // Tạo các phần và câu hỏi
    for (let i = 1; i <= 4; i++) {
      const partData = req.body[`part${i}`]
      if (partData?.length > 0) {
        const partResult = await query("INSERT INTO parts (test_id, part_number) VALUES (?, ?)", [testId, i])

        const partId = partResult.insertId

        for (const question of partData) {
          try {
            // Validate question data
            if (!question.type || !question.content || !question.correctAnswers) {
              console.warn(`Skipping invalid question in part ${i}:`, question)
              continue
            }

            // Special validation for Plan/Map/Diagram questions
            if (
              question.type === "Ghi nhãn Bản đồ/Sơ đồ" &&
              (!Array.isArray(question.content) || question.content.length < 3 || !question.content[2])
            ) {
              console.warn(`Skipping invalid Plan/Map/Diagram question in part ${i}:`, question)
              continue
            }

            await query(
              "INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)",
              [partId, question.type, JSON.stringify(question.content), JSON.stringify(question.correctAnswers)],
            )
          } catch (questionError) {
            console.error(`Error adding question in part ${i}:`, questionError)
            // Continue with other questions even if one fails
          }
        }
      }
    }

    await query("COMMIT")
    res.status(201).json({ message: "Tạo bài kiểm tra thành công", testId })
  } catch (error) {
    await query("ROLLBACK")
    console.error("Lỗi tạo bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Cập nhật bài kiểm tra
exports.updateTest = async (req, res) => {
  const { id } = req.params
  const { title, vietnameseName, description, part1, part2, part3, part4 } = req.body

  try {
    // Validate input
    if (!title) {
      return res.status(400).json({ message: "Tiêu đề bài kiểm tra là bắt buộc" })
    }

    await query("START TRANSACTION")

    // Lưu phiên bản hiện tại
    await Test.saveVersion(id)

    // Cập nhật bài kiểm tra và tăng phiên bản
    await query(
      "UPDATE tests SET title = ?, vietnamese_name = ?, description = ?, version = version + 1 WHERE id = ?",
      [title, vietnameseName, description, id],
    )

    // Xóa các phần và câu hỏi hiện có
    await query("DELETE FROM parts WHERE test_id = ?", [id])

    // Tạo các phần và câu hỏi mới
    for (let i = 1; i <= 4; i++) {
      const partData = req.body[`part${i}`]
      if (partData?.length > 0) {
        const partResult = await query("INSERT INTO parts (test_id, part_number) VALUES (?, ?)", [id, i])

        const partId = partResult.insertId

        for (const question of partData) {
          try {
            // Validate question data
            if (!question.type || !question.content || !question.correctAnswers) {
              console.warn(`Skipping invalid question in part ${i}:`, question)
              continue
            }

            await query(
              "INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)",
              [partId, question.type, JSON.stringify(question.content), JSON.stringify(question.correctAnswers)],
            )
          } catch (questionError) {
            console.error(`Error adding question in part ${i}:`, questionError)
            // Continue with other questions even if one fails
          }
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

// Lấy các phiên bản của bài kiểm tra
exports.getTestVersions = async (req, res) => {
  try {
    const { id } = req.params
    const versions = await Test.getAllVersions(id)

    res.json(versions)
  } catch (error) {
    console.error("Lỗi lấy phiên bản bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Lấy một phiên bản cụ thể của bài kiểm tra
exports.getTestVersion = async (req, res) => {
  try {
    const { id, version } = req.params
    const testVersion = await Test.getVersion(id, version)

    if (!testVersion) {
      return res.status(404).json({ message: "Không tìm thấy phiên bản bài kiểm tra" })
    }

    res.json(testVersion)
  } catch (error) {
    console.error("Lỗi lấy phiên bản bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Lưu bản nháp tự động
exports.saveDraft = async (req, res) => {
  try {
    const { testId } = req.params
    const userId = req.user?.id || 1 // Sử dụng ID người dùng từ xác thực hoặc mặc định
    const draftData = req.body

    const draftId = await Test.saveDraft(testId, userId, draftData)

    res.json({
      message: "Đã lưu bản nháp thành công",
      draftId,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Lỗi lưu bản nháp:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Lấy bản nháp mới nhất
exports.getLatestDraft = async (req, res) => {
  try {
    const { testId } = req.params
    const userId = req.user?.id || 1 // Sử dụng ID người dùng từ xác thực hoặc mặc định

    const draft = await Test.getLatestDraft(testId, userId)

    if (!draft) {
      return res.status(404).json({ message: "Không tìm thấy bản nháp" })
    }

    res.json(draft)
  } catch (error) {
    console.error("Lỗi lấy bản nháp:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message })
  }
}

// Upload file âm thanh
exports.uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được tải lên" })
    }

    const { testId, partNumber } = req.params

    // Validate file
    const validation = AudioFile.validateAudioFile(req.file)
    if (!validation.isValid) {
      return res.status(400).json({
        message: "File âm thanh không hợp lệ",
        errors: validation.errors,
      })
    }

    // Tạo đường dẫn lưu trữ
    const uploadDir = path.join(__dirname, "../../uploads/audio")

    // Đảm bảo thư mục tồn tại
    try {
      await fs.mkdir(uploadDir, { recursive: true })
    } catch (err) {
      console.error("Không thể tạo thư mục uploads:", err)
    }

    // Tạo tên file duy nhất
    const fileExt = path.extname(req.file.originalname)
    const fileName = `${uuidv4()}${fileExt}`
    const filePath = path.join("uploads/audio", fileName)
    const fullPath = path.join(uploadDir, fileName)

    // Lưu file
    await fs.writeFile(fullPath, req.file.buffer)

    // Lưu thông tin file vào cơ sở dữ liệu
    const fileData = {
      fileName: req.file.originalname,
      filePath: `/uploads/audio/${fileName}`,
      fileSize: req.file.size,
      duration: 0, // Cần thư viện phân tích âm thanh để lấy thời lượng chính xác
    }

    const audioFileId = await AudioFile.save(testId, partNumber, fileData)

    res.json({
      message: "Tải lên file âm thanh thành công",
      audioFile: {
        id: audioFileId,
        ...fileData,
      },
    })
  } catch (error) {
    console.error("Lỗi tải lên file âm thanh:", error.message)
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
