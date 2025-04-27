const { query } = require("../config/database")

class Test {
  // Lấy tất cả bài kiểm tra
  static async findAll() {
    return await query(`
      SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at, t.version, t.updated_at
      FROM tests t
      ORDER BY t.created_at DESC
    `)
  }

  // Tìm bài kiểm tra theo ID
  static async findById(id) {
    const tests = await query(
      `
      SELECT t.id, t.title, t.vietnamese_name, t.description, t.created_at, t.version, t.updated_at
      FROM tests t
      WHERE t.id = ?
    `,
      [id],
    )
    return tests[0]
  }

  // Tạo bài kiểm tra mới
  static async create(testData) {
    const { title, vietnamese_name, description } = testData
    const result = await query("INSERT INTO tests (title, vietnamese_name, description) VALUES (?, ?, ?)", [
      title,
      vietnamese_name,
      description,
    ])
    return result.insertId
  }

  // Cập nhật bài kiểm tra
  static async update(id, testData) {
    const { title, vietnamese_name, description } = testData

    // Lưu phiên bản hiện tại vào bảng test_versions
    await this.saveVersion(id)

    // Cập nhật phiên bản
    await query("UPDATE tests SET version = version + 1 WHERE id = ?", [id])

    // Cập nhật dữ liệu
    return await query("UPDATE tests SET title = ?, vietnamese_name = ?, description = ? WHERE id = ?", [
      title,
      vietnamese_name,
      description,
      id,
    ])
  }

  // Lưu phiên bản hiện tại của bài kiểm tra
  static async saveVersion(testId) {
    // Lấy dữ liệu hiện tại của bài kiểm tra
    const test = await this.getFullTestData(testId)

    // Lấy phiên bản hiện tại
    const versionResult = await query("SELECT version FROM tests WHERE id = ?", [testId])
    const currentVersion = versionResult[0]?.version || 1

    // Lưu vào bảng test_versions
    await query("INSERT INTO test_versions (test_id, version, data) VALUES (?, ?, ?)", [
      testId,
      currentVersion,
      JSON.stringify(test),
    ])

    return currentVersion
  }

  // Lấy phiên bản cụ thể của bài kiểm tra
  static async getVersion(testId, version) {
    const versions = await query("SELECT data FROM test_versions WHERE test_id = ? AND version = ?", [testId, version])

    if (versions.length === 0) {
      return null
    }

    return JSON.parse(versions[0].data)
  }

  // Lấy tất cả phiên bản của bài kiểm tra
  static async getAllVersions(testId) {
    return await query(
      `SELECT version, created_at FROM test_versions 
       WHERE test_id = ? 
       ORDER BY version DESC`,
      [testId],
    )
  }

  // Lưu bản nháp tự động
  static async saveDraft(testId, userId, data) {
    // Kiểm tra xem đã có bản nháp chưa
    const existingDrafts = await query("SELECT id FROM test_drafts WHERE test_id = ? AND user_id = ?", [testId, userId])

    if (existingDrafts.length > 0) {
      // Cập nhật bản nháp hiện có
      await query("UPDATE test_drafts SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
        JSON.stringify(data),
        existingDrafts[0].id,
      ])
      return existingDrafts[0].id
    } else {
      // Tạo bản nháp mới
      const result = await query("INSERT INTO test_drafts (test_id, user_id, data) VALUES (?, ?, ?)", [
        testId,
        userId,
        JSON.stringify(data),
      ])
      return result.insertId
    }
  }

  // Lấy bản nháp mới nhất
  static async getLatestDraft(testId, userId) {
    const drafts = await query(
      `SELECT data, updated_at FROM test_drafts 
       WHERE test_id = ? AND user_id = ? 
       ORDER BY updated_at DESC LIMIT 1`,
      [testId, userId],
    )

    if (drafts.length === 0) {
      return null
    }

    return {
      data: JSON.parse(drafts[0].data),
      updated_at: drafts[0].updated_at,
    }
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

    // Kiểm tra tính hợp lệ của dữ liệu
    if (!type || !content || !correctAnswers) {
      throw new Error("Dữ liệu câu hỏi không hợp lệ")
    }

    // Kiểm tra đặc biệt cho loại câu hỏi Plan/Map/Diagram
    if (type === "Ghi nhãn Bản đồ/Sơ đồ") {
      if (!Array.isArray(content) || content.length < 3 || !content[2]) {
        throw new Error("Câu hỏi Bản đồ/Sơ đồ phải có hình ảnh")
      }
    }

    return await query("INSERT INTO questions (part_id, question_type, content, correct_answers) VALUES (?, ?, ?, ?)", [
      partId,
      type,
      JSON.stringify(content),
      JSON.stringify(correctAnswers),
    ])
  }

  // Lấy toàn bộ dữ liệu bài kiểm tra (bao gồm phần và câu hỏi)
  static async getFullTestData(testId) {
    // Lấy thông tin bài kiểm tra
    const test = await this.findById(testId)
    if (!test) {
      return null
    }

    // Lấy các phần
    const parts = await query(
      `SELECT id, part_number, audio_url FROM parts 
       WHERE test_id = ? ORDER BY part_number`,
      [testId],
    )

    // Lấy câu hỏi cho từng phần
    const testData = {
      ...test,
      parts: [],
    }

    for (const part of parts) {
      const questions = await query(
        `SELECT id, question_type, content, correct_answers 
         FROM questions WHERE part_id = ? ORDER BY id`,
        [part.id],
      )

      testData.parts.push({
        ...part,
        questions: questions.map((q) => ({
          ...q,
          content: JSON.parse(q.content),
          correct_answers: JSON.parse(q.correct_answers),
        })),
      })
    }

    return testData
  }

  // Lưu file âm thanh
  static async saveAudioFile(testId, partNumber, fileData) {
    const { fileName, filePath, fileSize, duration } = fileData

    const result = await query(
      `INSERT INTO audio_files (test_id, part_number, file_name, file_path, file_size, duration) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [testId, partNumber, fileName, filePath, fileSize, duration],
    )

    // Cập nhật URL âm thanh trong bảng parts
    await query(
      `UPDATE parts SET audio_url = ? 
       WHERE test_id = ? AND part_number = ?`,
      [filePath, testId, partNumber],
    )

    return result.insertId
  }

  // Lấy file âm thanh theo ID bài kiểm tra và số phần
  static async getAudioFile(testId, partNumber) {
    const files = await query(
      `SELECT * FROM audio_files 
       WHERE test_id = ? AND part_number = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [testId, partNumber],
    )

    return files[0] || null
  }
}

module.exports = Test
