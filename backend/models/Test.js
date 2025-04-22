const { pool } = require("../config/database")

class Test {
  // Lấy tất cả bài kiểm tra
  static async findAll() {
    const [rows] = await pool.execute(`
      SELECT t.id, t.title, t.description, t.created_at
      FROM tests t
      ORDER BY t.created_at DESC
    `)
    return rows
  }

  // Tìm bài kiểm tra theo ID
  static async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT t.id, t.title, t.description, t.created_at
      FROM tests t
      WHERE t.id = ?
    `,
      [id],
    )
    return rows[0]
  }

  // Tạo bài kiểm tra mới
  static async create(testData) {
    const { title, description } = testData
    const [result] = await pool.execute("INSERT INTO tests (title, description) VALUES (?, ?)", [title, description])
    return result.insertId
  }

  // Cập nhật bài kiểm tra
  static async update(id, testData) {
    const { title, description } = testData
    const [result] = await pool.execute("UPDATE tests SET title = ?, description = ? WHERE id = ?", [
      title,
      description,
      id,
    ])
    return result
  }

  // Xóa bài kiểm tra
  static async delete(id) {
    const [result] = await pool.execute("DELETE FROM tests WHERE id = ?", [id])
    return result
  }

  // Lấy câu hỏi theo ID bài kiểm tra
  static async getQuestionsByTestId(testId) {
    const [rows] = await pool.execute(
      `
      SELECT q.*, p.part_number
      FROM questions q
      JOIN parts p ON q.part_id = p.id
      WHERE p.test_id = ?
      ORDER BY p.part_number, q.id
    `,
      [testId],
    )
    return rows
  }

  // Tạo phần mới cho bài kiểm tra
  static async createPart(testId, partNumber, audioUrl = null) {
    const [result] = await pool.execute("INSERT INTO parts (test_id, part_number, audio_url) VALUES (?, ?, ?)", [
      testId,
      partNumber,
      audioUrl,
    ])
    return result.insertId
  }

  // Tạo câu hỏi mới
  static async createQuestion(partId, questionData) {
    const { type, content, correctAnswers } = questionData
    const [result] = await pool.execute(
      "INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)",
      [partId, type, JSON.stringify(content), JSON.stringify(correctAnswers)],
    )
    return result
  }
}

module.exports = Test
