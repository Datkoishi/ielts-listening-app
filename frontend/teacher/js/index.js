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
                      <span>Part 1</span>
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
                          <button class="add-question-btn" onclick="addQuestion('${type}', 1)">
                            <i class="fas fa-plus"></i> Add Question
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
  
  