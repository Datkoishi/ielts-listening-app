/**
 * Công cụ kiểm tra và sửa lỗi kết nối API
 */

// Khai báo biến API_URL (hoặc import nếu cần)
const API_URL = window.API_URL || "http://localhost:3000/api" // Thay đổi URL này nếu cần

// Khai báo biến showServerConfigUI nếu chưa tồn tại
if (typeof window.showServerConfigUI !== "function") {
  window.showServerConfigUI = (containerId) => {
    alert("Chức năng cấu hình server chưa được tải. Vui lòng tải lại trang.")
  }
}

// Danh sách các bước kiểm tra
const TROUBLESHOOTING_STEPS = [
  {
    id: "internet",
    title: "Kiểm tra kết nối internet",
    check: async () => navigator.onLine,
    fix: "Vui lòng kiểm tra kết nối internet của bạn và thử lại.",
  },
  {
    id: "server",
    title: "Kiểm tra kết nối đến server",
    check: async () => {
      try {
        const response = await fetch(`${API_URL}/health`, {
          method: "GET",
          timeout: 5000,
        })
        return response.ok
      } catch (error) {
        return false
      }
    },
    fix: "Server có thể không hoạt động hoặc không thể truy cập. Kiểm tra cấu hình URL API trong phần cài đặt.",
  },
  {
    id: "auth",
    title: "Kiểm tra xác thực",
    check: async () => {
      const token = localStorage.getItem("token")
      if (!token) return false

      try {
        const response = await fetch(`${API_URL}/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        return response.ok
      } catch (error) {
        return false
      }
    },
    fix: "Token xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
  },
  {
    id: "cors",
    title: "Kiểm tra CORS",
    check: async () => {
      try {
        const response = await fetch(`${API_URL}/cors-test`, {
          method: "OPTIONS",
          headers: {
            Origin: window.location.origin,
          },
        })
        return response.ok
      } catch (error) {
        return error.name !== "TypeError"
      }
    },
    fix: "Có vấn đề với cấu hình CORS trên server. Liên hệ với quản trị viên để cấu hình CORS cho domain của bạn.",
  },
  {
    id: "cookies",
    title: "Kiểm tra cookies",
    check: async () => {
      try {
        document.cookie = "test_cookie=1; SameSite=None; Secure"
        return document.cookie.indexOf("test_cookie") !== -1
      } catch (error) {
        return false
      } finally {
        document.cookie = "test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure"
      }
    },
    fix: "Cookies bị chặn trong trình duyệt của bạn. Vui lòng cho phép cookies trong cài đặt trình duyệt hoặc sử dụng localStorage thay thế.",
  },
]

/**
 * Chạy tất cả các bước kiểm tra
 * @returns {Promise<Array>} Kết quả kiểm tra
 */
async function runAllChecks() {
  const results = []

  for (const step of TROUBLESHOOTING_STEPS) {
    try {
      const passed = await step.check()
      results.push({
        id: step.id,
        title: step.title,
        passed,
        fix: passed ? null : step.fix,
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
 * Hiển thị giao diện kiểm tra và sửa lỗi
 * @param {string} containerId - ID của phần tử HTML để hiển thị giao diện
 */
async function showTroubleshooter(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  // Hiển thị giao diện ban đầu
  container.innerHTML = `
    <div class="troubleshooter">
      <h3>Công cụ kiểm tra và sửa lỗi kết nối API</h3>
      <div class="troubleshooter-status">Đang kiểm tra...</div>
      <div class="troubleshooter-steps"></div>
      <div class="troubleshooter-actions">
        <button id="runChecksBtn" disabled>Chạy lại kiểm tra</button>
        <button id="fixAllBtn" disabled>Sửa tất cả vấn đề</button>
      </div>
    </div>
  `

  // Thêm CSS
  const style = document.createElement("style")
  style.textContent = `
    .troubleshooter {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
      background-color: #f9f9f9;
    }
    .troubleshooter h3 {
      margin-top: 0;
      margin-bottom: 15px;
    }
    .troubleshooter-status {
      margin-bottom: 15px;
      padding: 10px;
      background-color: #e2e3e5;
      color: #383d41;
      border-radius: 5px;
    }
    .troubleshooter-steps {
      margin-bottom: 15px;
    }
    .troubleshooter-step {
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
    .troubleshooter-actions {
      display: flex;
      gap: 10px;
    }
    .troubleshooter-actions button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background-color: #003366;
      color: white;
    }
    .troubleshooter-actions button:hover {
      background-color: #004080;
    }
    .troubleshooter-actions button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  `
  document.head.appendChild(style)

  // Chạy kiểm tra
  const results = await runAllChecks()

  // Cập nhật trạng thái
  const statusElement = container.querySelector(".troubleshooter-status")
  const stepsElement = container.querySelector(".troubleshooter-steps")
  const runChecksBtn = document.getElementById("runChecksBtn")
  const fixAllBtn = document.getElementById("fixAllBtn")

  // Đếm số lượng kiểm tra đã qua
  const passedCount = results.filter((result) => result.passed).length

  // Cập nhật trạng thái tổng quan
  if (passedCount === results.length) {
    statusElement.textContent = "✅ Tất cả kiểm tra đã thành công! Kết nối API hoạt động bình thường."
    statusElement.style.backgroundColor = "#d4edda"
    statusElement.style.color = "#155724"
  } else {
    statusElement.textContent = `❌ Đã phát hiện ${results.length - passedCount} vấn đề. Vui lòng xem chi tiết bên dưới.`
    statusElement.style.backgroundColor = "#f8d7da"
    statusElement.style.color = "#721c24"
  }

  // Hiển thị kết quả từng bước
  stepsElement.innerHTML = results
    .map(
      (result) => `
    <div class="troubleshooter-step ${result.passed ? "step-passed" : "step-failed"}">
      <div class="step-icon">${result.passed ? "✅" : "❌"}</div>
      <div class="step-content">
        <div class="step-title">${result.title}</div>
        ${result.passed ? "" : `<div class="step-fix">${result.fix}</div>`}
      </div>
    </div>
  `,
    )
    .join("")

  // Kích hoạt các nút
  runChecksBtn.disabled = false
  fixAllBtn.disabled = passedCount === results.length

  // Xử lý sự kiện nút
  runChecksBtn.addEventListener("click", () => {
    showTroubleshooter(containerId)
  })

  fixAllBtn.addEventListener("click", async () => {
    // Thực hiện các hành động sửa lỗi
    const failedSteps = results.filter((result) => !result.passed)

    for (const step of failedSteps) {
      if (step.id === "internet") {
        alert("Vui lòng kiểm tra kết nối internet của bạn và thử lại.")
      } else if (step.id === "server") {
        // Khai báo hoặc import hàm showServerConfigUI
        if (typeof window.showServerConfigUI === "function") {
          window.showServerConfigUI("serverConfigContainer")
        } else {
          alert("Hàm showServerConfigUI không được định nghĩa.")
        }
      } else if (step.id === "auth") {
        if (confirm("Token xác thực không hợp lệ hoặc đã hết hạn. Bạn có muốn đăng nhập lại không?")) {
          // Xóa token hiện tại
          localStorage.removeItem("token")
          // Chuyển hướng đến trang đăng nhập
          // window.location.href = "login.html";
          alert("Vui lòng đăng nhập lại để tiếp tục.")
        }
      } else if (step.id === "cookies") {
        if (confirm("Cookies bị chặn trong trình duyệt của bạn. Bạn có muốn sử dụng localStorage thay thế không?")) {
          localStorage.setItem("use_local_storage", "true")
          alert("Đã chuyển sang sử dụng localStorage thay thế cho cookies.")
        }
      }
    }

    // Chạy lại kiểm tra
    setTimeout(() => {
      showTroubleshooter(containerId)
    }, 1000)
  })
}

// Xuất các hàm để sử dụng trong các file khác
window.runAllChecks = runAllChecks
window.showTroubleshooter = showTroubleshooter

// Đảm bảo hàm được xuất đúng cách
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    runAllChecks,
    showTroubleshooter,
  }
}

// Thông báo khi file được tải thành công
console.log("troubleshooter.js đã được tải thành công")
