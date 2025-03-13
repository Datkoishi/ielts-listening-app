import Test from "../models/Test.js"
import { query } from "../config/database.js"

// Lấy tất cả bài kiểm tra
export const getAllTests = async (req, res) => {
  try {
    const tests = await Test.findAll()
    res.json(tests)
  } catch (error) {
    console.error("Lỗi lấy danh sách bài kiểm tra:", error.message)
    res.status(500).json({ message: "Lỗi máy chủ" })
  }
}

// Lấy bài kiểm tra theo ID
export const getTestById = async (req, res) => {
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
export const createTest = async (req, res) => {
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
export const updateTest = async (req, res) => {
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
export const deleteTest = async (req, res) => {
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

