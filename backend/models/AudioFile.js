const { query } = require("../config/database")
const fs = require("fs").promises
const path = require("path")

class AudioFile {
  // Lưu thông tin file âm thanh vào cơ sở dữ liệu
  static async save(testId, partNumber, fileData) {
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
  static async getByTestAndPart(testId, partNumber) {
    const files = await query(
      `SELECT * FROM audio_files 
       WHERE test_id = ? AND part_number = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [testId, partNumber],
    )

    return files[0] || null
  }

  // Lấy tất cả file âm thanh của một bài kiểm tra
  static async getAllByTest(testId) {
    return await query(
      `SELECT * FROM audio_files 
       WHERE test_id = ? 
       ORDER BY part_number, created_at DESC`,
      [testId],
    )
  }

  // Xóa file âm thanh
  static async delete(id) {
    // Lấy thông tin file trước khi xóa
    const files = await query("SELECT file_path FROM audio_files WHERE id = ?", [id])

    if (files.length === 0) {
      return false
    }

    const filePath = files[0].file_path

    // Xóa file vật lý nếu tồn tại
    try {
      const fullPath = path.join(__dirname, "../..", filePath)
      await fs.access(fullPath)
      await fs.unlink(fullPath)
    } catch (error) {
      console.error("Không thể xóa file:", error)
      // Tiếp tục xóa bản ghi trong cơ sở dữ liệu ngay cả khi không thể xóa file
    }

    // Xóa bản ghi trong cơ sở dữ liệu
    await query("DELETE FROM audio_files WHERE id = ?", [id])

    return true
  }

  // Kiểm tra tính hợp lệ của file âm thanh
  static validateAudioFile(file) {
    const errors = []

    // Kiểm tra loại file
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"]
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push("Loại file không được hỗ trợ. Chỉ chấp nhận MP3, WAV và OGG.")
    }

    // Kiểm tra kích thước file (giới hạn 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      errors.push("Kích thước file quá lớn. Giới hạn là 50MB.")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

module.exports = AudioFile
