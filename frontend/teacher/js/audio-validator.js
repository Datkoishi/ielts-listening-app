/**
 * Công cụ kiểm tra tính hợp lệ của file âm thanh
 */

// Các định dạng âm thanh được hỗ trợ
const SUPPORTED_AUDIO_FORMATS = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/m4a",
    "audio/flac",
  ]
  
  // Kích thước tối đa (50MB)
  const MAX_AUDIO_SIZE = 50 * 1024 * 1024
  
  /**
   * Kiểm tra tính hợp lệ của file âm thanh
   * @param {File} file - File âm thanh cần kiểm tra
   * @returns {Object} Kết quả kiểm tra {isValid, errors}
   */
  function validateAudioFile(file) {
    const errors = []
  
    // Kiểm tra xem file có tồn tại không
    if (!file) {
      errors.push("Không có file được chọn")
      return { isValid: false, errors }
    }
  
    // Kiểm tra loại file
    if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
      errors.push(
        `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${SUPPORTED_AUDIO_FORMATS.map((format) => format.replace("audio/", "")).join(", ")}`,
      )
    }
  
    // Kiểm tra kích thước file
    if (file.size > MAX_AUDIO_SIZE) {
      const maxSizeMB = MAX_AUDIO_SIZE / (1024 * 1024)
      const fileSizeMB = Math.round((file.size / (1024 * 1024)) * 100) / 100
      errors.push(`Kích thước file (${fileSizeMB}MB) vượt quá giới hạn cho phép (${maxSizeMB}MB)`)
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    }
  }
  
  /**
   * Lấy thông tin chi tiết về file âm thanh
   * @param {File} file - File âm thanh
   * @returns {Promise<Object>} Thông tin file
   */
  function getAudioFileInfo(file) {
    return new Promise((resolve, reject) => {
      try {
        // Tạo URL tạm thời cho file
        const objectUrl = URL.createObjectURL(file)
  
        // Tạo phần tử audio
        const audio = new Audio()
  
        // Xử lý khi metadata được tải
        audio.addEventListener("loadedmetadata", () => {
          // Lấy thông tin
          const info = {
            duration: audio.duration,
            durationFormatted: formatDuration(audio.duration),
            fileSize: file.size,
            fileSizeFormatted: formatFileSize(file.size),
            fileType: file.type,
            fileName: file.name,
          }
  
          // Giải phóng URL
          URL.revokeObjectURL(objectUrl)
  
          resolve(info)
        })
  
        // Xử lý lỗi
        audio.addEventListener("error", (e) => {
          URL.revokeObjectURL(objectUrl)
          reject(new Error(`Không thể đọc thông tin file âm thanh: ${e.message}`))
        })
  
        // Gán nguồn
        audio.src = objectUrl
      } catch (error) {
        reject(error)
      }
    })
  }
  
  /**
   * Định dạng thời lượng thành chuỗi mm:ss
   * @param {number} seconds - Thời lượng tính bằng giây
   * @returns {string} Chuỗi định dạng mm:ss
   */
  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }
  
  /**
   * Định dạng kích thước file
   * @param {number} bytes - Kích thước tính bằng bytes
   * @returns {string} Chuỗi định dạng kích thước
   */
  function formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + " bytes"
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB"
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB"
    }
  }
  
  /**
   * Hiển thị thông tin file âm thanh
   * @param {File} file - File âm thanh
   * @param {string} containerId - ID của phần tử HTML để hiển thị thông tin
   */
  async function displayAudioInfo(file, containerId) {
    const container = document.getElementById(containerId)
    if (!container) return
  
    try {
      // Kiểm tra tính hợp lệ
      const validation = validateAudioFile(file)
  
      if (!validation.isValid) {
        container.innerHTML = `
          <div class="audio-info audio-info-error">
            <div class="audio-info-title">File không hợp l���</div>
            <ul class="audio-info-errors">
              ${validation.errors.map((error) => `<li>${error}</li>`).join("")}
            </ul>
          </div>
        `
        return
      }
  
      // Hiển thị thông báo đang tải
      container.innerHTML = `
        <div class="audio-info audio-info-loading">
          <div class="audio-info-title">Đang đọc thông tin file...</div>
        </div>
      `
  
      // Lấy thông tin file
      const info = await getAudioFileInfo(file)
  
      // Hiển thị thông tin
      container.innerHTML = `
        <div class="audio-info">
          <div class="audio-info-title">${info.fileName}</div>
          <div class="audio-info-details">
            <div class="audio-info-item">
              <span class="audio-info-label">Thời lượng:</span>
              <span class="audio-info-value">${info.durationFormatted}</span>
            </div>
            <div class="audio-info-item">
              <span class="audio-info-label">Kích thước:</span>
              <span class="audio-info-value">${info.fileSizeFormatted}</span>
            </div>
            <div class="audio-info-item">
              <span class="audio-info-label">Định dạng:</span>
              <span class="audio-info-value">${info.fileType.replace("audio/", "")}</span>
            </div>
          </div>
        </div>
      `
    } catch (error) {
      console.error("Lỗi khi hiển thị thông tin file âm thanh:", error)
      container.innerHTML = `
        <div class="audio-info audio-info-error">
          <div class="audio-info-title">Lỗi khi đọc thông tin file</div>
          <div class="audio-info-message">${error.message}</div>
        </div>
      `
    }
  }
  
  // Thêm CSS cho các thành phần hiển thị thông tin âm thanh
  const style = document.createElement("style")
  style.textContent = `
    .audio-info {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 10px;
      margin: 10px 0;
      background-color: #f9f9f9;
    }
    
    .audio-info-title {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 14px;
    }
    
    .audio-info-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      font-size: 12px;
    }
    
    .audio-info-item {
      display: flex;
      flex-direction: column;
    }
    
    .audio-info-label {
      color: #666;
    }
    
    .audio-info-value {
      font-weight: bold;
    }
    
    .audio-info-loading {
      background-color: #e2e3e5;
      color: #383d41;
    }
    
    .audio-info-error {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .audio-info-errors {
      margin: 5px 0;
      padding-left: 20px;
      font-size: 12px;
    }
    
    .audio-info-message {
      font-style: italic;
      margin-top: 5px;
      font-size: 12px;
    }
  `
  document.head.appendChild(style)
  
  // Xuất các hàm để sử dụng trong các file khác
  window.validateAudioFile = validateAudioFile
  window.getAudioFileInfo = getAudioFileInfo
  window.displayAudioInfo = displayAudioInfo
  