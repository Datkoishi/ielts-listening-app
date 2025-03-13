import { query } from "../config/database.js"

class Test {
  // Lấy tất cả bài kiểm tra
  static async findAll() {
    return await query(`
      SELECT t.id, t.title, t.description, t.created_at, u.username as created_by
      FROM tests t
      JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `)
  }

  // Tìm bài kiểm tra theo ID
  static async findById(id) {
    const tests = await query(
      `
      SELECT t.id, t.title, t.description, t.created_at, u.username as created_by
      FROM tests t
      JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `,
      [id],
    )
    return tests[0]
  }

  // Tạo bài kiểm tra mới
  static async create(testData, userId) {
    const { title, description } = testData
    const result = await query("INSERT INTO tests (title, description, created_by) VALUES (?, ?, ?)", [
      title,
      description,
      userId,
    ])
    return result.insertId
  }

  // Cập nhật bài kiểm tra
  static async update(id, testData) {
    const { title, description } = testData
    return await query("UPDATE tests SET title = ?, description = ? WHERE id = ?", [title, description, id])
  }

  // Xóa bài kiểm tra
  static async delete(id) {
    return await query("DELETE FROM tests WHERE id = ?", [id])
  }

  // Lấy câu hỏi theo ID bài kiểm tra
  static async getQuestionsByTestId(testId) {
    return await query(
      `
      SELECT q.*, p.part_number
      FROM questions q
      JOIN parts p ON q.part_id = p.id
      WHERE p.test_id = ?
      ORDER BY p.part_number, q.id
    `,
      [testId],
    )
  }

  // Tạo phần mới cho bài kiểm tra
  static async createPart(testId, partNumber, audioUrl = null) {
    const result = await query("INSERT INTO parts (test_id, part_number, audio_url) VALUES (?, ?, ?)", [
      testId,
      partNumber,
      audioUrl,
    ])
    return result.insertId
  }

  // Tạo câu hỏi mới
  static async createQuestion(partId, questionData) {
    const { type, content, correctAnswers } = questionData
    return await query("INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)", [
      partId,
      type,
      JSON.stringify(content),
      JSON.stringify(correctAnswers),
    ])
  }
}

export default Test

