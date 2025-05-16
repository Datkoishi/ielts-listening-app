// Cập nhật hàm kiểm tra và hiển thị trạng thái lưu
function checkAndDisplaySaveStatus() {
  try {
    // Lấy tiêu đề từ input
    const testTitle = document.getElementById("testTitle")?.value

    if (!testTitle) {
      alert("Vui lòng nhập tiêu đề bài kiểm tra trước khi kiểm tra trạng thái lưu")
      return
    }

    // Hiển thị thông báo đang kiểm tra
    console.log("Đang kiểm tra trạng thái lưu cho:", testTitle)

    // Gọi hàm kiểm tra từ client-integration.js
    window
      .checkTestSaveStatus(testTitle)
      .then((status) => {
        console.log("Kết quả kiểm tra:", status)

        if (status.saved) {
          showNotification(
            `Bài kiểm tra "${testTitle}" đã được lưu tại: ${status.location === "database" ? "máy chủ" : "cục bộ"}\nThời gian: ${status.timestamp}`,
            "success",
          )

          // Hiển thị biểu tượng đã lưu bên cạnh tiêu đề
          updateSaveStatusIcon(true)
        } else {
          showNotification(`Bài kiểm tra "${testTitle}" chưa được lưu: ${status.reason}`, "warning")

          // Hiển thị biểu tượng chưa lưu
          updateSaveStatusIcon(false)
        }
      })
      .catch((error) => {
        console.error("Lỗi khi kiểm tra trạng thái lưu:", error)
        showNotification(`Lỗi khi kiểm tra: ${error.message}`, "error")
        updateSaveStatusIcon(false)
      })
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái lưu:", error)
    showNotification(`Lỗi: ${error.message}`, "error")
  }
}

// Cập nhật biểu tượng trạng thái lưu
function updateSaveStatusIcon(isSaved) {
  // Tìm hoặc tạo phần tử hiển thị trạng thái
  let statusIcon = document.getElementById("saveStatusIcon")

  if (!statusIcon) {
    // Tạo phần tử mới nếu chưa tồn tại
    statusIcon = document.createElement("span")
    statusIcon.id = "saveStatusIcon"
    statusIcon.style.marginLeft = "10px"

    // Thêm vào sau input tiêu đề
    const titleInput = document.getElementById("testTitle")
    if (titleInput && titleInput.parentNode) {
      titleInput.parentNode.appendChild(statusIcon)
    }
  }

  // Cập nhật biểu tượng và màu sắc
  if (isSaved) {
    statusIcon.innerHTML = '<i class="fas fa-check-circle" style="color: green;"></i>'
    statusIcon.title = "Bài kiểm tra đã được lưu"
  } else {
    statusIcon.innerHTML = '<i class="fas fa-exclamation-circle" style="color: orange;"></i>'
    statusIcon.title = "Bài kiểm tra chưa được lưu hoặc có thay đổi chưa lưu"
  }
}

// Thêm nút kiểm tra trạng thái lưu vào giao diện
function addCheckSaveStatusButton() {
  // Tìm container chứa các nút
  const testActions = document.querySelector(".save-button-container")

  if (testActions) {
    // Tạo nút mới
    const checkButton = document.createElement("button")
    checkButton.className = "check-status-btn"
    checkButton.innerHTML = '<i class="fas fa-question-circle"></i> Kiểm tra trạng thái lưu'
    checkButton.onclick = checkAndDisplaySaveStatus

    // Thêm style cho nút
    checkButton.style.marginLeft = "10px"
    checkButton.style.backgroundColor = "#4a6fa5"
    checkButton.style.color = "white"
    checkButton.style.border = "none"
    checkButton.style.padding = "8px 15px"
    checkButton.style.borderRadius = "4px"
    checkButton.style.cursor = "pointer"

    // Thêm vào container
    testActions.appendChild(checkButton)
  }
}

// Add this function to create a debug button

// Thêm nút debug để kiểm tra lỗi
function addDebugButton() {
  // Tìm container chứa các nút
  const testActions = document.querySelector(".save-button-container")

  if (testActions) {
    // Tạo nút mới
    const debugButton = document.createElement("button")
    debugButton.className = "debug-btn"
    debugButton.innerHTML = '<i class="fas fa-bug"></i> Debug'
    debugButton.onclick = debugTestSaving

    // Thêm style cho nút
    debugButton.style.marginLeft = "10px"
    debugButton.style.backgroundColor = "#ff9800"
    debugButton.style.color = "white"
    debugButton.style.border = "none"
    debugButton.style.padding = "8px 15px"
    debugButton.style.borderRadius = "4px"
    debugButton.style.cursor = "pointer"

    // Thêm vào container
    testActions.appendChild(debugButton)
  }
}

// Hàm debug để kiểm tra lỗi lưu bài kiểm tra
async function debugTestSaving() {
  try {
    const testTitle = document.getElementById("testTitle")?.value

    if (!testTitle) {
      alert("Vui lòng nhập tiêu đề bài kiểm tra trước khi debug")
      return
    }

    // Hiển thị thông báo đang kiểm tra
    showNotification(`Đang debug bài kiểm tra: "${testTitle}"\nKết quả sẽ hiển thị trong console.`, "info")

    // Kiểm tra kết nối server
    const serverConnected = await window.checkServerConnection()
    console.log("Server connection:", serverConnected)

    // Kiểm tra kết nối database
    const dbConnected = await window.checkDatabaseConnection()
    console.log("Database connection:", dbConnected)

    // Kiểm tra bài kiểm tra theo tiêu đề
    const checkResult = await window.checkTestByTitle(testTitle)
    console.log("Check test by title result:", checkResult)

    // Lấy danh sách bài kiểm tra
    const tests = await window.getTests()
    console.log("All tests:", tests)

    // Kiểm tra localStorage
    const offlineTests = JSON.parse(localStorage.getItem("offlineTests") || "[]")
    console.log("Offline tests:", offlineTests)

    // Hiển thị kết quả
    let resultMessage = `Debug Results for "${testTitle}":\n\n`
    resultMessage += `Server Connection: ${serverConnected ? "OK" : "Failed"}\n`
    resultMessage += `Database Connection: ${dbConnected ? "OK" : "Failed"}\n`
    resultMessage += `Test Found: ${checkResult.exists ? "Yes" : "No"}\n`
    resultMessage += `Total Tests on Server: ${tests.length}\n`
    resultMessage += `Offline Tests: ${offlineTests.length}\n\n`
    resultMessage += "See console for more details."

    showNotification(resultMessage, "info")
  } catch (error) {
    console.error("Error in debug function:", error)
    showNotification(`Debug error: ${error.message}`, "error")
  }
}

// Khởi tạo khi trang đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  addCheckSaveStatusButton()
  addDebugButton() // Add the debug button

  // Kiểm tra trạng thái lưu ban đầu sau 2 giây
  setTimeout(() => {
    const testTitle = document.getElementById("testTitle")?.value
    if (testTitle) {
      window
        .checkTestSaveStatus(testTitle)
        .then((status) => {
          updateSaveStatusIcon(status.saved)
        })
        .catch(() => {
          updateSaveStatusIcon(false)
        })
    }
  }, 2000)
})

// Thêm vào window object để có thể gọi từ HTML
window.checkAndDisplaySaveStatus = checkAndDisplaySaveStatus

// Thêm hàm hiển thị thông báo
function showNotification(message, type) {
  // Tìm hoặc tạo container thông báo
  let notificationContainer = document.getElementById("notificationContainer")

  if (!notificationContainer) {
    notificationContainer = document.createElement("div")
    notificationContainer.id = "notificationContainer"
    notificationContainer.style.position = "fixed"
    notificationContainer.style.top = "20px"
    notificationContainer.style.right = "20px"
    notificationContainer.style.zIndex = "9999"
    document.body.appendChild(notificationContainer)
  }

  // Tạo thông báo mới
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = message

  // Thêm style cho thông báo
  notification.style.padding = "10px 15px"
  notification.style.marginBottom = "10px"
  notification.style.borderRadius = "4px"
  notification.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)"
  notification.style.minWidth = "250px"
  notification.style.maxWidth = "400px"

  // Màu sắc dựa trên loại thông báo
  switch (type) {
    case "success":
      notification.style.backgroundColor = "#4CAF50"
      notification.style.color = "white"
      break
    case "error":
      notification.style.backgroundColor = "#F44336"
      notification.style.color = "white"
      break
    case "warning":
      notification.style.backgroundColor = "#FF9800"
      notification.style.color = "white"
      break
    case "info":
    default:
      notification.style.backgroundColor = "#2196F3"
      notification.style.color = "white"
  }

  // Thêm vào container
  notificationContainer.appendChild(notification)

  // Tự động xóa sau 5 giây
  setTimeout(() => {
    notification.style.opacity = "0"
    notification.style.transition = "opacity 0.5s"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 500)
  }, 5000)
}

// Thêm vào window object để có thể gọi từ các file khác
window.showNotification = showNotification
