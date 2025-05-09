/**
 * Công cụ gỡ lỗi cho ứng dụng IELTS Listening Test Creator
 */

// Kiểm tra các hàm quan trọng đã được định nghĩa chưa
function checkFunctions() {
    const functions = [
      "showTroubleshooter",
      "showServerConfigUI",
      "displayApiStatus",
      "startServerStatusCheck",
      "syncOfflineTests",
      "saveTestToServer",
      "uploadAudioFile",
    ]
  
    console.log("=== KIỂM TRA CÁC HÀM QUAN TRỌNG ===")
    functions.forEach((funcName) => {
      const exists = typeof window[funcName] === "function"
      console.log(`${funcName}: ${exists ? "✅ Đã định nghĩa" : "❌ Chưa định nghĩa"}`)
    })
  }
  
  // Kiểm tra thứ tự tải script
  function checkScriptLoading() {
    const scripts = document.querySelectorAll("script")
    console.log("=== THỨ TỰ TẢI SCRIPT ===")
    scripts.forEach((script, index) => {
      const src = script.src.split("/").pop() || "inline script"
      console.log(`${index + 1}. ${src}`)
    })
  }
  
  // Kiểm tra các biến toàn cục
  function checkGlobalVariables() {
    const variables = ["API_URL", "test", "currentPart", "selectedTypes", "audioFile"]
  
    console.log("=== KIỂM TRA CÁC BIẾN TOÀN CỤC ===")
    variables.forEach((varName) => {
      const exists = typeof window[varName] !== "undefined"
      console.log(`${varName}: ${exists ? "✅ Đã định nghĩa" : "❌ Chưa định nghĩa"}`)
    })
  }
  
  // Kiểm tra các sự kiện đã được đăng ký
  function checkEventListeners() {
    const elements = [
      { id: "serverConfigBtn", event: "click" },
      { id: "troubleshooterBtn", event: "click" },
      { id: "saveTestBtn", event: "click" },
      { id: "startTestBtn", event: "click" },
    ]
  
    console.log("=== KIỂM TRA CÁC SỰ KIỆN ===")
    elements.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        console.log(`${item.id}: ✅ Phần tử tồn tại`)
  
        // Thêm sự kiện tạm thời để kiểm tra
        const originalHandler = element[`on${item.event}`]
        element[`on${item.event}`] = function (e) {
          console.log(`Sự kiện ${item.event} trên ${item.id} đã được kích hoạt`)
          if (originalHandler) {
            return originalHandler.call(this, e)
          }
        }
      } else {
        console.log(`${item.id}: ❌ Phần tử không tồn tại`)
      }
    })
  }
  
  // Hàm chính để chạy tất cả các kiểm tra
  function runDebugChecks() {
    console.log("=== BẮT ĐẦU GỠ LỖI ===")
    checkFunctions()
    checkScriptLoading()
    checkGlobalVariables()
    checkEventListeners()
    console.log("=== KẾT THÚC GỠ LỖI ===")
  }
  
  // Thêm nút gỡ lỗi vào trang
  function addDebugButton() {
    const button = document.createElement("button")
    button.id = "debugBtn"
    button.innerHTML = '<i class="fas fa-bug"></i> Gỡ lỗi'
    button.style.position = "fixed"
    button.style.bottom = "10px"
    button.style.left = "10px"
    button.style.zIndex = "9999"
    button.style.padding = "8px 12px"
    button.style.backgroundColor = "#dc3545"
    button.style.color = "white"
    button.style.border = "none"
    button.style.borderRadius = "4px"
    button.style.cursor = "pointer"
  
    button.addEventListener("click", runDebugChecks)
    document.body.appendChild(button)
  }
  
  // Thêm hàm để sửa lỗi showTroubleshooter
  function fixShowTroubleshooter() {
    if (typeof window.showTroubleshooter !== "function") {
      console.log("Đang sửa lỗi showTroubleshooter...")
      window.showTroubleshooter = (containerId) => {
        const container = document.getElementById(containerId)
        if (container) {
          container.innerHTML = `
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; background-color: #f9f9f9;">
              <h3 style="margin-top: 0; margin-bottom: 15px;">Công cụ kiểm tra và sửa lỗi kết nối API</h3>
              <div style="margin-bottom: 15px; padding: 10px; background-color: #fff3cd; color: #856404; border-radius: 5px;">
                ⚠️ Hàm showTroubleshooter gốc không được tìm thấy. Đây là phiên bản dự phòng.
              </div>
              <div style="margin-bottom: 15px;">
                <div style="display: flex; align-items: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 5px; background-color: #f8d7da; border-color: #f5c6cb;">
                  <div style="margin-right: 10px; font-size: 18px; color: #dc3545;">❌</div>
                  <div style="flex: 1;">
                    <div style="font-weight: bold;">Lỗi tải script</div>
                    <div style="margin-top: 5px; font-size: 14px;">File troubleshooter.js có thể chưa được tải đúng cách. Vui lòng kiểm tra console để biết thêm chi tiết.</div>
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 10px;">
                <button onclick="location.reload()" style="padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; background-color: #003366; color: white;">Tải lại trang</button>
              </div>
            </div>
          `
        }
      }
      console.log("Đã sửa lỗi showTroubleshooter")
    }
  }
  
  // Thêm hàm để sửa lỗi showServerConfigUI
  function fixShowServerConfigUI() {
    if (typeof window.showServerConfigUI !== "function") {
      console.log("Đang sửa lỗi showServerConfigUI...")
      window.showServerConfigUI = (containerId) => {
        const container = document.getElementById(containerId)
        if (container) {
          container.innerHTML = `
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; background-color: #f9f9f9;">
              <h3 style="margin-top: 0; margin-bottom: 15px;">Cấu hình Server</h3>
              <div style="margin-bottom: 15px; padding: 10px; background-color: #fff3cd; color: #856404; border-radius: 5px;">
                ⚠️ Hàm showServerConfigUI gốc không được tìm thấy. Đây là phiên bản dự phòng.
              </div>
              <div style="margin-bottom: 15px;">
                <div style="margin-bottom: 10px;">
                  <label style="display: block; margin-bottom: 5px; font-weight: bold;">URL API:</label>
                  <input type="text" id="apiUrl" value="${window.API_URL || "http://localhost:3000/api"}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 10px;">
                  <label style="display: block; margin-bottom: 5px; font-weight: bold;">Thời gian chờ (ms):</label>
                  <input type="number" id="timeout" value="10000" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
              </div>
              <div style="display: flex; gap: 10px;">
                <button onclick="saveServerConfig()" style="padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; background-color: #003366; color: white;">Lưu cấu hình</button>
              </div>
            </div>
          `
        }
      }
  
      window.saveServerConfig = () => {
        const apiUrl = document.getElementById("apiUrl").value
        const timeout = document.getElementById("timeout").value
  
        window.API_URL = apiUrl
        localStorage.setItem("API_URL", apiUrl)
        localStorage.setItem("API_TIMEOUT", timeout)
  
        alert("Đã lưu cấu hình server!")
      }
  
      console.log("Đã sửa lỗi showServerConfigUI")
    }
  }
  
  // Chạy các hàm sửa lỗi khi trang tải xong
  document.addEventListener("DOMContentLoaded", () => {
    console.log("debug.js: DOMContentLoaded")
  
    // Sửa các hàm bị thiếu
    fixShowTroubleshooter()
    fixShowServerConfigUI()
  
    // Thêm nút gỡ lỗi
    addDebugButton()
  
    // Kiểm tra các hàm quan trọng
    setTimeout(() => {
      console.log("Kiểm tra lại các hàm sau 1 giây:")
      console.log(
        "showTroubleshooter:",
        typeof window.showTroubleshooter === "function" ? "Đã định nghĩa" : "Chưa định nghĩa",
      )
      console.log(
        "showServerConfigUI:",
        typeof window.showServerConfigUI === "function" ? "Đã định nghĩa" : "Chưa định nghĩa",
      )
    }, 1000)
  })
  
  // Xuất các hàm để sử dụng trong các file khác
  window.runDebugChecks = runDebugChecks
  window.fixShowTroubleshooter = fixShowTroubleshooter
  window.fixShowServerConfigUI = fixShowServerConfigUI
  