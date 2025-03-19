// Tệp chính để nhập tất cả các tệp JavaScript khác

// Nhập các tệp JavaScript
document.addEventListener("DOMContentLoaded", () => {
    // Tạo các thẻ script để tải các tệp JavaScript
    const scripts = ["js/main.js", "js/question-types.js", "js/form-handlers.js", "js/test-management.js"]
  
    // Tải các tệp script theo thứ tự
    function loadScript(index) {
      if (index >= scripts.length) return
  
      const script = document.createElement("script")
      script.src = scripts[index]
      script.onload = () => {
        loadScript(index + 1)
      }
      document.body.appendChild(script)
    }
  
    // Bắt đầu tải script
    loadScript(0)
  })
  
  