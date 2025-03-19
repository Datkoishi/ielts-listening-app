// Ensure the renderTestCreation function is called when the page loads
document.addEventListener("DOMContentLoaded", () => {
    console.log("Loading JavaScript modules...")
  
    // Define global navigation functions first to ensure they're available
    window.previousPart = () => {
      console.log("Global previousPart called")
      if (window.currentPart > 1) {
        window.currentPart--
        console.log("Moving to previous part:", window.currentPart)
        if (typeof window.renderTestCreation === "function") {
          window.renderTestCreation()
        } else {
          console.error("renderTestCreation function not found")
          // Fallback implementation
          const partHeader = document.querySelector(".part-header span:last-child")
          if (partHeader) {
            partHeader.textContent = `Phần ${window.currentPart}`
          }
  
          // Update visibility of part containers
          for (let i = 1; i <= 4; i++) {
            const partDiv = document.getElementById(`part${i}`)
            if (partDiv) {
              partDiv.style.display = i === window.currentPart ? "block" : "none"
            }
          }
        }
      } else {
        console.log("Already at first part")
        if (typeof window.showNotification === "function") {
          window.showNotification("Đây đã là phần đầu tiên", "info")
        } else {
          alert("Đây đã là phần đầu tiên")
        }
      }
    }
  
    window.nextPart = () => {
      console.log("Global nextPart called")
      if (window.currentPart < 4) {
        window.currentPart++
        console.log("Moving to next part:", window.currentPart)
        if (typeof window.renderTestCreation === "function") {
          window.renderTestCreation()
        } else {
          console.error("renderTestCreation function not found")
          // Fallback implementation
          const partHeader = document.querySelector(".part-header span:last-child")
          if (partHeader) {
            partHeader.textContent = `Phần ${window.currentPart}`
          }
  
          // Update visibility of part containers
          for (let i = 1; i <= 4; i++) {
            const partDiv = document.getElementById(`part${i}`)
            if (partDiv) {
              partDiv.style.display = i === window.currentPart ? "block" : "none"
            }
          }
        }
      } else {
        console.log("Already at last part")
        if (typeof window.showNotification === "function") {
          window.showNotification("Đây đã là phần cuối cùng", "info")
        } else {
          alert("Đây đã là phần cuối cùng")
        }
      }
    }
  
    // Make sure addQuestion is available globally
    window.addQuestion = () => {
      console.log("Global addQuestion called")
  
      // Create modal for question type selection
      const modal = document.createElement("div")
      modal.className = "question-type-modal"
      modal.style.position = "fixed"
      modal.style.top = "0"
      modal.style.left = "0"
      modal.style.width = "100%"
      modal.style.height = "100%"
      modal.style.backgroundColor = "rgba(0,0,0,0.5)"
      modal.style.display = "flex"
      modal.style.justifyContent = "center"
      modal.style.alignItems = "center"
      modal.style.zIndex = "1000"
  
      modal.innerHTML = `
        <div class="modal-content" style="background-color: white; padding: 20px; border-radius: 8px; max-width: 500px; width: 90%;">
          <span class="close-button" style="float: right; font-size: 24px; cursor: pointer;">&times;</span>
          <h2>Chọn loại câu hỏi</h2>
          <div class="question-types" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button class="question-type-btn" data-type="Một đáp án"><i class="fas fa-check-circle"></i> Một đáp án</button>
            <button class="question-type-btn" data-type="Nhiều đáp án"><i class="fas fa-check-double"></i> Nhiều đáp án</button>
            <button class="question-type-btn" data-type="Ghép nối"><i class="fas fa-link"></i> Ghép nối</button>
            <button class="question-type-btn" data-type="Ghi nhãn Bản đồ/Sơ đồ"><i class="fas fa-map-marker-alt"></i> Ghi nhãn Bản đồ/Sơ đồ</button>
            <button class="question-type-btn" data-type="Hoàn thành ghi chú"><i class="fas fa-sticky-note"></i> Hoàn thành ghi chú</button>
            <button class="question-type-btn" data-type="Hoàn thành bảng/biểu mẫu"><i class="fas fa-table"></i> Hoàn thành bảng/biểu mẫu</button>
            <button class="question-type-btn" data-type="Hoàn thành lưu đồ"><i class="fas fa-project-diagram"></i> Hoàn thành lưu đồ</button>
          </div>
        </div>
      `
  
      document.body.appendChild(modal)
  
      // Handle close button
      const closeButton = modal.querySelector(".close-button")
      closeButton.addEventListener("click", () => {
        document.body.removeChild(modal)
      })
  
      // Handle question type selection
      const typeButtons = modal.querySelectorAll(".question-type-btn")
      typeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const questionType = button.dataset.type
          console.log("Selected question type:", questionType)
  
          if (typeof window.createNewQuestion === "function") {
            window.createNewQuestion(questionType)
          } else {
            console.error("createNewQuestion function not found")
            alert(`Không thể tạo câu hỏi loại: ${questionType}. Hàm createNewQuestion không tồn tại.`)
          }
  
          document.body.removeChild(modal)
        })
      })
    }
  
    // Initialize currentPart in the global scope
    window.currentPart = 1
  
    // Define the order of script loading
    const scripts = [
      "js/client-integration.js",
      "js/main.js",
      "js/question-types.js",
      "js/form-handlers.js",
      "js/test-management.js",
    ]
  
    // Load scripts sequentially to ensure proper dependency order
    function loadScripts(index) {
      if (index >= scripts.length) {
        console.log("All scripts loaded successfully")
        initializeApp()
        return
      }
  
      const script = document.createElement("script")
      script.src = scripts[index]
      script.onload = () => {
        console.log(`Loaded: ${scripts[index]}`)
  
        // If this is the test-management.js script, save a reference to its addQuestion function
        if (scripts[index] === "js/test-management.js" && typeof window.addQuestion === "function") {
          window.test_management_addQuestion = window.addQuestion
        }
  
        loadScripts(index + 1)
      }
      script.onerror = (error) => {
        console.error(`Error loading ${scripts[index]}:`, error)
        loadScripts(index + 1)
      }
      document.body.appendChild(script)
    }
  
    // Start loading scripts
    loadScripts(0)
  
    // Initialize the application after all scripts are loaded
    function initializeApp() {
      console.log("Initializing application...")
  
      // Add event listener for the start test button
      const startTestBtn = document.getElementById("startTestBtn")
      if (startTestBtn) {
        startTestBtn.addEventListener("click", () => {
          console.log("Start test button clicked")
          // Get selected question types
          const selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(
            (cb) => cb.value,
          )
  
          if (selectedTypes.length === 0) {
            alert("Vui lòng chọn ít nhất một loại câu hỏi.")
            return
          }
  
          console.log("Selected types:", selectedTypes)
  
          // Hide selection page and show test creation page
          document.getElementById("selectionPage").classList.add("hidden")
          document.getElementById("testCreationPage").classList.remove("hidden")
  
          // Try to call startTestCreation directly from the window object
          if (typeof window.startTestCreation === "function") {
            console.log("Calling startTestCreation function")
            window.startTestCreation()
          } else {
            console.error("startTestCreation function not found in window object")
            // Fallback to renderTestCreation if startTestCreation is not available
            if (typeof window.renderTestCreation === "function") {
              console.log("Falling back to renderTestCreation function")
              window.renderTestCreation()
            } else {
              console.error("renderTestCreation function not found in window object")
              // Last resort fallback - define a simple function here
              console.log("Using emergency fallback function")
              const testContent = document.getElementById("testContent")
              if (testContent) {
                testContent.innerHTML = `
                  <div class="test-card">
                    <div class="test-header">
                      <span class="test-icon"><i class="fas fa-pencil-alt"></i></span>
                      <span>IELTS Listening Test</span>
                    </div>
                    <div class="part-header">
                      <span class="part-icon"><i class="fas fa-list"></i></span>
                      <span>Phần 1</span>
                    </div>
                    <div class="question-types-container">
                      ${selectedTypes
                        .map(
                          (type) => `
                        <div class="question-type-item">
                          <div class="question-type-label">
                            <span class="question-type-icon"><i class="fas fa-check-circle"></i></span>
                            <span>${type}</span>
                          </div>
                          <button class="add-question-btn" onclick="window.addQuestion()">
                            <i class="fas fa-plus"></i> Thêm câu hỏi
                          </button>
                        </div>
                      `,
                        )
                        .join("")}
                    </div>
                  </div>
                `
              }
            }
          }
        })
      } else {
        console.error("Start test button not found")
      }
  
      // Initialize other event listeners
      initializeEventListeners()
    }
  
    // Initialize other event listeners
    function initializeEventListeners() {
      // Make sure navigation buttons work
      const previousPartBtn = document.getElementById("previousPartBtn")
      if (previousPartBtn) {
        previousPartBtn.addEventListener("click", () => {
          console.log("Previous part button clicked")
          if (typeof window.previousPart === "function") {
            window.previousPart()
          } else {
            console.error("previousPart function not found in window object")
          }
        })
      }
  
      const nextPartBtn = document.getElementById("nextPartBtn")
      if (nextPartBtn) {
        nextPartBtn.addEventListener("click", () => {
          console.log("Next part button clicked")
          if (typeof window.nextPart === "function") {
            window.nextPart()
          } else {
            console.error("nextPart function not found in window object")
          }
        })
      }
  
      const saveTestBtn = document.getElementById("saveTestBtn")
      if (saveTestBtn) {
        saveTestBtn.addEventListener("click", () => {
          if (typeof window.saveTest === "function") {
            window.saveTest()
          } else {
            console.error("saveTest function not found in window object")
          }
        })
      }
    }
  })
  
  