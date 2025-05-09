/**
 * Công cụ kiểm tra kết nối và cấu trúc database
 */

// Khai báo biến API_URL (hoặc import nếu cần)
const API_URL = window.API_URL || "http://localhost:3000/api" // Thay đổi URL này nếu cần

// Danh sách các bước kiểm tra database
const DB_CHECK_STEPS = [
  {
    id: "connection",
    title: "Kiểm tra kết nối đến database",
    check: async () => {
      try {
        const response = await fetch(`${API_URL}/tests/system/db-check`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          timeout: 5000,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return {
          passed: data.success,
          details: data.details,
        }
      } catch (error) {
        return {
          passed: false,
          error: error.message,
        }
      }
    },
    fix: "Kiểm tra cấu hình kết nối database trong file .env. Đảm bảo rằng thông tin kết nối (host, user, password, database) là chính xác.",
  },
  {
    id: "structure",
    title: "Kiểm tra cấu trúc database",
    check: async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          return {
            passed: false,
            error: "Không có token xác thực",
          }
        }

        const response = await fetch(`${API_URL}/tests/system/db-structure`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Kiểm tra xem có các bảng cần thiết không
        const requiredTables = ["tests", "users", "audio_files"]
        const missingTables = requiredTables.filter((table) => !data.tables.includes(table))

        if (missingTables.length > 0) {
          return {
            passed: false,
            error: `Thiếu các bảng: ${missingTables.join(", ")}`,
            details: data,
          }
        }

        return {
          passed: true,
          details: data,
        }
      } catch (error) {
        return {
          passed: false,
          error: error.message,
        }
      }
    },
    fix: "Cấu trúc database không đúng. Hãy chạy script tạo database hoặc kiểm tra xem các bảng cần thiết đã được tạo chưa.",
  },
  {
    id: "permissions",
    title: "Kiểm tra quyền truy cập database",
    check: async () => {
      try {
        // Thử thực hiện một truy vấn đơn giản để kiểm tra quyền truy cập
        const token = localStorage.getItem("token")
        if (!token) {
          return {
            passed: false,
            error: "Không có token xác thực",
          }
        }

        const response = await fetch(`${API_URL}/tests?limit=1`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        return {
          passed: true,
        }
      } catch (error) {
        return {
          passed: false,
          error: error.message,
        }
      }
    },
    fix: "Người dùng database có thể không có đủ quyền. Kiểm tra quyền của người dùng database trong cấu hình MySQL.",
  },
  {
    id: "performance",
    title: "Kiểm tra hiệu suất database",
    check: async () => {
      try {
        const startTime = Date.now()

        const response = await fetch(`${API_URL}/tests/system/db-check`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        })

        const endTime = Date.now()
        const responseTime = endTime - startTime

        // Nếu thời gian phản hồi > 1000ms, coi là hiệu suất kém
        const passed = responseTime < 1000

        return {
          passed,
          details: {
            responseTime: `${responseTime}ms`,
          },
        }
      } catch (error) {
        return {
          passed: false,
          error: error.message,
        }
      }
    },
    fix: "Hiệu suất database kém. Hãy kiểm tra kết nối mạng, cấu hình server, hoặc tối ưu hóa truy vấn database.",
  },
]

/**
 * Chạy tất cả các bước kiểm tra database
 * @returns {Promise<Array>} Kết quả kiểm tra
 */
async function runAllDbChecks() {
  const results = []

  for (const step of DB_CHECK_STEPS) {
    try {
      const result = await step.check()
      results.push({
        id: step.id,
        title: step.title,
        passed: result.passed,
        details: result.details,
        error: result.error,
        fix: result.passed ? null : step.fix,
      })
    } catch (error) {
      results.push({
        id: step.id,
        title: step.title,
        passed: false,
        error: error.message,
        fix: step.fix,
      })
    }
  }

  return results
}

/**
 * Hiển thị giao diện kiểm tra kết nối database
 * @param {string} containerId - ID của phần tử HTML để hiển thị giao diện
 */
async function showDbChecker(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  // Hiển thị giao diện ban đầu
  container.innerHTML = `
    <div class="db-checker">
      <h3>Công cụ kiểm tra kết nối database</h3>
      <div class="db-checker-status">Đang kiểm tra kết nối database...</div>
      <div class="db-checker-steps"></div>
      <div class="db-checker-actions">
        <button id="runDbChecksBtn" disabled>Chạy lại kiểm tra</button>
        <button id="fixDbBtn" disabled>Sửa cấu hình database</button>
      </div>
    </div>
  `

  // Thêm CSS
  const style = document.createElement("style")
  style.textContent = `
    .db-checker {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
      background-color: #f9f9f9;
    }
    .db-checker h3 {
      margin-top: 0;
      margin-bottom: 15px;
    }
    .db-checker-status {
      margin-bottom: 15px;
      padding: 10px;
      background-color: #e2e3e5;
      color: #383d41;
      border-radius: 5px;
    }
    .db-checker-steps {
      margin-bottom: 15px;
    }
    .db-checker-step {
      display: flex;
      align-items: center;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      margin-bottom: 5px;
    }
    .step-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .step-passed {
      background-color: #d4edda;
      border-color: #c3e6cb;
    }
    .step-passed .step-icon {
      color: #28a745;
    }
    .step-failed {
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
    .step-failed .step-icon {
      color: #dc3545;
    }
    .step-content {
      flex: 1;
    }
    .step-title {
      font-weight: bold;
    }
    .step-fix {
      margin-top: 5px;
      font-size: 14px;
    }
    .step-details {
      margin-top: 5px;
      font-size: 14px;
      background-color: #f8f9fa;
      padding: 5px;
      border-radius: 3px;
      white-space: pre-wrap;
    }
    .db-checker-actions {
      display: flex;
      gap: 10px;
    }
    .db-checker-actions button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #003366;
      color: white;
    }
    .db-checker-actions button:hover {
      background-color: #004080;
    }
    .db-checker-actions button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    .db-config-form {
      margin-top: 15px;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 5px;
    }
    .db-config-form .form-group {
      margin-bottom: 10px;
    }
    .db-config-form label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .db-config-form input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .db-config-form button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #003366;
      color: white;
      margin-top: 10px;
    }
  `
  document.head.appendChild(style)

  // Chạy kiểm tra
  const results = await runAllDbChecks()

  // Cập nhật trạng thái
  const statusElement = container.querySelector(".db-checker-status")
  const stepsElement = container.querySelector(".db-checker-steps")
  const runChecksBtn = document.getElementById("runDbChecksBtn")
  const fixDbBtn = document.getElementById("fixDbBtn")

  // Đếm số lượng kiểm tra đã qua
  const passedCount = results.filter((result) => result.passed).length

  // Cập nhật trạng thái tổng quan
  if (passedCount === results.length) {
    statusElement.textContent = "✅ Tất cả kiểm tra database đã thành công! Kết nối database hoạt động bình thường."
    statusElement.style.backgroundColor = "#d4edda"
    statusElement.style.color = "#155724"
  } else {
    statusElement.textContent = `❌ Đã phát hiện ${results.length - passedCount} vấn đề với database. Vui lòng xem chi tiết bên dưới.`
    statusElement.style.backgroundColor = "#f8d7da"
    statusElement.style.color = "#721c24"
  }

  // Hiển thị kết quả từng bước
  stepsElement.innerHTML = results
    .map(
      (result) => `
    <div class="db-checker-step ${result.passed ? "step-passed" : "step-failed"}">
      <div class="step-icon">${result.passed ? "✅" : "❌"}</div>
      <div class="step-content">
        <div class="step-title">${result.title}</div>
        ${result.passed ? "" : `<div class="step-fix">${result.fix}</div>`}
        ${result.error ? `<div class="step-details">Lỗi: ${result.error}</div>` : ""}
        ${result.details ? `<div class="step-details">Chi tiết: ${JSON.stringify(result.details, null, 2)}</div>` : ""}
      </div>
    </div>
  `,
    )
    .join("")

  // Kích hoạt các nút
  runChecksBtn.disabled = false
  fixDbBtn.disabled = passedCount === results.length

  // Xử lý sự kiện nút
  runChecksBtn.addEventListener("click", () => {
    showDbChecker(containerId)
  })

  fixDbBtn.addEventListener("click", () => {
    // Hiển thị form cấu hình database
    const dbConfigForm = document.createElement("div")
    dbConfigForm.className = "db-config-form"
    dbConfigForm.innerHTML = `
      <h4>Cấu hình kết nối database</h4>
      <div class="form-group">
        <label for="dbHost">Host:</label>
        <input type="text" id="dbHost" placeholder="localhost" value="${localStorage.getItem("dbHost") || ""}">
      </div>
      <div class="form-group">
        <label for="dbUser">User:</label>
        <input type="text" id="dbUser" placeholder="root" value="${localStorage.getItem("dbUser") || ""}">
      </div>
      <div class="form-group">
        <label for="dbPassword">Password:</label>
        <input type="password" id="dbPassword" placeholder="password">
      </div>
      <div class="form-group">
        <label for="dbName">Database:</label>
        <input type="text" id="dbName" placeholder="ielts_db" value="${localStorage.getItem("dbName") || ""}">
      </div>
      <button id="saveDbConfigBtn">Lưu cấu hình</button>
      <p><small>Lưu ý: Cấu hình này chỉ được lưu trong trình duyệt của bạn. Bạn cần cập nhật file .env trên server để áp dụng thay đổi.</small></p>
    `

    // Thêm form vào container
    container.appendChild(dbConfigForm)

    // Xử lý sự kiện lưu cấu hình
    document.getElementById("saveDbConfigBtn").addEventListener("click", () => {
      const dbHost = document.getElementById("dbHost").value
      const dbUser = document.getElementById("dbUser").value
      const dbPassword = document.getElementById("dbPassword").value
      const dbName = document.getElementById("dbName").value

      // Lưu cấu hình vào localStorage
      localStorage.setItem("dbHost", dbHost)
      localStorage.setItem("dbUser", dbUser)
      localStorage.setItem("dbName", dbName)

      // Hiển thị thông báo
      alert("Đã lưu cấu hình database. Vui lòng cập nhật file .env trên server để áp dụng thay đổi.")

      // Chạy lại kiểm tra
      setTimeout(() => {
        showDbChecker(containerId)
      }, 1000)
    })
  })
}

// Xuất các hàm để sử dụng trong các file khác
window.runAllDbChecks = runAllDbChecks
window.showDbChecker = showDbChecker
