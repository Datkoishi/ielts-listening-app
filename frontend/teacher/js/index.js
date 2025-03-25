// Add this at the beginning of the file to ensure it's executed early
// Make sure form-handlers.js is loaded before other scripts
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded, checking if form-handlers.js is loaded")

  // Check if form creation functions are available
  if (typeof window.createOneAnswerForm !== "function") {
    console.warn("Form creation functions not found. Loading form-handlers.js dynamically")

    // Create a script element to load form-handlers.js
    const script = document.createElement("script")
    script.src = "js/form-handlers.js"
    script.onload = () => {
      console.log("form-handlers.js loaded dynamically")
      // Re-initialize any necessary components
      if (typeof window.renderTestCreation === "function") {
        window.renderTestCreation()
      }
    }
    script.onerror = () => {
      console.error("Failed to load form-handlers.js")
    }

    document.head.appendChild(script)
  }

  // Add global event listener for delete buttons using event delegation
  document.body.addEventListener("click", (event) => {
    const target = event.target

    // Check if the clicked element is a delete button or its icon
    if (
      target.classList.contains("delete-question") ||
      (target.tagName === "I" && target.parentElement.classList.contains("delete-question"))
    ) {
      // Get the actual button (might be the icon's parent)
      const deleteButton = target.classList.contains("delete-question") ? target : target.parentElement

      // Find the question container
      const questionDiv = deleteButton.closest(".question")
      if (!questionDiv) {
        console.error("Could not find parent question div")
        return
      }

      // Find the part container
      const partDiv = questionDiv.closest(".part")
      if (!partDiv) {
        console.error("Could not find parent part div")
        return
      }

      // Get the part number from the part div's id
      const partId = partDiv.id
      const partNumber = Number.parseInt(partId.replace("part", ""))

      // Get the index of the question within its part
      const questions = Array.from(partDiv.querySelectorAll(".question"))
      const questionIndex = questions.indexOf(questionDiv)

      console.log(`Deleting question at index ${questionIndex} in part ${partNumber}`)

      // Confirm deletion
      if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) {
        try {
          // Remove the question from the test object
          if (
            window.test &&
            window.test[`part${partNumber}`] &&
            questionIndex >= 0 &&
            questionIndex < window.test[`part${partNumber}`].length
          ) {
            window.test[`part${partNumber}`].splice(questionIndex, 1)

            // Remove the question from the DOM
            questionDiv.remove()

            // Update the UI
            if (typeof window.updateQuestionCount === "function") {
              window.updateQuestionCount()
            }

            // Re-render the questions if needed
            if (typeof window.renderQuestionsForCurrentPart === "function") {
              window.renderQuestionsForCurrentPart()
            }

            alert("Đã xóa câu hỏi thành công")
          } else {
            console.error("Invalid question index or test structure", {
              test: window.test,
              partKey: `part${partNumber}`,
              questionIndex: questionIndex,
            })
            alert("Không thể xóa câu hỏi. Dữ liệu không hợp lệ.")
          }
        } catch (error) {
          console.error("Error deleting question:", error)
          alert("Lỗi khi xóa câu hỏi: " + error.message)
        }
      }
    }
  })
})

// Ensure all necessary functions are defined in the global scope
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM content loaded")

  // Define global functions first
  // renderTestCreation function
  // Sửa hàm renderTestCreation để đảm bảo các phần tử part được tạo ra đúng cách
  window.renderTestCreation = () => {
    console.log("Rendering test creation form from index.js")
    const testContent = document.getElementById("testContent")
    if (!testContent) {
      console.error("testContent element not found!")
      return
    }

    // Tạo HTML cho phần metadata và các nút điều hướng
    testContent.innerHTML = `
  <div class="test-card">
    <div class="test-header">
      <span class="test-icon"><i class="fas fa-pencil-alt"></i></span>
      <span>IELTS Listening Test</span>
    </div>
    
    <div class="part-header">
      <span class="part-icon"><i class="fas fa-list"></i></span>
      <span>Phần ${window.currentPart}</span>
    </div>
    
    <div class="question-types-container">
      ${(window.selectedTypes || [])
        .map((type) => {
          let icon = ""
          switch (type) {
            case "Một đáp án":
              icon = "fa-check-circle"
              break
            case "Nhiều đáp án":
              icon = "fa-check-double"
              break
            case "Ghép nối":
              icon = "fa-link"
              break
            case "Ghi nhãn Bản đồ/Sơ đồ":
              icon = "fa-map-marker-alt"
              break
            case "Hoàn thành ghi chú":
              icon = "fa-sticky-note"
              break
            case "Hoàn thành bảng/biểu mẫu":
              icon = "fa-table"
              break
            case "Hoàn thành lưu đồ":
              icon = "fa-project-diagram"
              break
            default:
              icon = "fa-question"
              break
          }

          return `
          <div class="question-type-item">
            <div class="question-type-label">
              <span class="question-type-icon"><i class="fas ${icon}"></i></span>
              <span>${type}</span>
            </div>
            <button class="add-question-btn" onclick="addQuestion('${type}')">
              <i class="fas fa-plus"></i> Thêm câu hỏi ${type.toLowerCase()}
            </button>
          </div>
        `
        })
        .join("")}
    </div>
    
    <div class="navigation-buttons">
      <button class="nav-btn prev-btn" onclick="previousPart()">
        <i class="fas fa-arrow-left"></i> Phần trước
      </button>
      <button class="nav-btn next-btn" onclick="nextPart()">
        Phần tiếp theo <i class="fas fa-arrow-right"></i>
      </button>
    </div>
    
    <div class="save-button-container">
      <button class="save-btn" onclick="saveTest()">
        <i class="fas fa-save"></i> Lưu bài kiểm tra
      </button>
    </div>
  </div>
  
  <!-- Tạo các container cho từng phần -->
  <div id="part1" class="part" style="display: ${window.currentPart === 1 ? "block" : "none"}"></div>
  <div id="part2" class="part" style="display: ${window.currentPart === 2 ? "block" : "none"}"></div>
  <div id="part3" class="part" style="display: ${window.currentPart === 3 ? "block" : "none"}"></div>
  <div id="part4" class="part" style="display: ${window.currentPart === 4 ? "block" : "none"}"></div>
  `

    // Display questions in the current part if any
    if (typeof window.renderQuestionsForCurrentPart === "function") {
      window.renderQuestionsForCurrentPart()
    } else {
      console.warn("renderQuestionsForCurrentPart function not found")
    }
  }

  // Define startTestCreation function in global scope
  window.startTestCreation = () => {
    console.log("Start test creation function called")

    // Get selected question types
    const selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value)

    if (selectedTypes.length === 0) {
      alert("Vui lòng chọn ít nhất một loại câu hỏi.")
      return
    }

    console.log("Selected types:", selectedTypes)

    // Store selected types in window object for later use
    window.selectedTypes = selectedTypes

    // Hide selection page and show test creation page
    document.getElementById("selectionPage").classList.add("hidden")
    document.getElementById("testCreationPage").classList.remove("hidden")

    // Initialize test object
    window.test = {
      title: "Bài kiểm tra IELTS Listening mới",
      description: "Mô tả bài kiểm tra",
      part1: [],
      part2: [],
      part3: [],
      part4: [],
    }

    // Set current part to 1
    window.currentPart = 1

    // Call renderTestCreation
    window.renderTestCreation()

    // Automatically create first question of selected type
    // if (selectedTypes.length > 0 && typeof window.addQuestionDirectly === "function") {
    //   console.log("Creating first question of type:", selectedTypes[0])
    //   window.addQuestionDirectly(selectedTypes[0])
    // }
    console.log("Test creation started. Click 'Add Question' to create your first question.")
  }

  // Define other necessary functions
  window.previousPart = () => {
    console.log("previousPart called, current part:", window.currentPart)
    if (window.currentPart > 1) {
      window.currentPart--
      console.log("Moving to previous part:", window.currentPart)
      window.renderTestCreation()
    } else {
      if (typeof window.showNotification === "function") {
        window.showNotification("Đây đã là phần đầu tiên", "info")
      } else {
        alert("Đây đã là phần đầu tiên")
      }
    }
  }

  window.nextPart = () => {
    console.log("nextPart called, current part:", window.currentPart)
    if (window.currentPart < 4) {
      window.currentPart++
      console.log("Moving to next part:", window.currentPart)
      window.renderTestCreation()
    } else {
      if (typeof window.showNotification === "function") {
        window.showNotification("Đây đã là phần cuối cùng", "info")
      } else {
        alert("Đây đã là phần cuối cùng")
      }
    }
  }

  // Replace the simple implementation of addQuestionDirectly with this improved version
  window.addQuestionDirectly = (questionType) => {
    console.log("Adding question of type:", questionType)

    // Ensure currentPart is defined
    if (typeof window.currentPart === "undefined") {
      window.currentPart = 1
      console.log("Setting default currentPart to 1")
    }

    // Get the part element
    const partId = `part${window.currentPart}`
    let partElement = document.getElementById(partId)

    // If part element doesn't exist, create it
    if (!partElement) {
      console.warn(`Element for ${partId} not found, creating it`)
      partElement = document.createElement("div")
      partElement.id = partId
      partElement.className = "part"
      partElement.style.display = "block"

      // Add to testContent
      const testContent = document.getElementById("testContent")
      if (testContent) {
        testContent.appendChild(partElement)
      } else {
        console.error("testContent element not found, cannot add part container")
        return
      }
    }

    // Create a new question div
    const questionDiv = document.createElement("div")
    questionDiv.className = "question"

    // Add question number and delete button
    const questionNumber = (window.test[`part${window.currentPart}`] || []).length + 1

    // Create the question content
    questionDiv.innerHTML = `
  <h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionNumber}</h4>
  <h3>${getIconForType(questionType)} ${questionType}</h3>
  <button class="delete-question" type="button"><i class="fas fa-trash"></i></button>
`

    // Add the appropriate form based on type
    let formHTML = ""

    // Use a more direct approach to create forms with dynamic options
    switch (questionType) {
      case "Một đáp án":
        formHTML = `
      <div class="one-answer-form">
        <label for="question">Câu hỏi:</label>
        <input type="text" id="question" name="question" required>
        <div class="options-container">
          <label>Lựa chọn:</label>
          <div id="options-list">
            <div class="option-item">
              <input type="text" name="option" required placeholder="Lựa chọn 1">
              <input type="radio" name="correctAnswer" value="0" checked>
              <button type="button" class="remove-option-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="option-item">
              <input type="text" name="option" required placeholder="Lựa chọn 2">
              <input type="radio" name="correctAnswer" value="1">
              <button type="button" class="remove-option-btn"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <button type="button" class="add-option-btn">Thêm lựa chọn</button>
        </div>
        <button type="button" class="save-question-btn">Lưu câu h��i</button>
      </div>
    `
        break
      case "Nhiều đáp án":
        formHTML = `
      <div class="multiple-answer-form">
        <label for="question">Câu hỏi:</label>
        <input type="text" id="question" name="question" required>
        <div class="options-container">
          <label>Lựa chọn:</label>
          <div id="options-list">
            <div class="option-item">
              <input type="text" name="option" required placeholder="Lựa chọn 1">
              <input type="checkbox" name="correctAnswer" value="0">
              <button type="button" class="remove-option-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="option-item">
              <input type="text" name="option" required placeholder="Lựa chọn 2">
              <input type="checkbox" name="correctAnswer" value="1">
              <button type="button" class="remove-option-btn"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <button type="button" class="add-option-btn">Thêm lựa chọn</button>
        </div>
        <button type="button" class="save-question-btn">Lưu câu hỏi</button>
      </div>
    `
        break
      case "Ghép nối":
        formHTML = `
      <div class="matching-form">
        <label for="title">Tiêu đề:</label>
        <input type="text" id="title" name="title" required>
        <div class="matching-container">
          <div class="matching-items">
            <label>Mục:</label>
            <div id="items-list">
              <div class="item-row">
                <input type="text" name="item" required placeholder="Mục 1">
                <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
              </div>
            </div>
            <button type="button" class="add-item-btn">Thêm mục</button>
          </div>
          <div class="matching-matches">
            <label>Ghép nối:</label>
            <div id="matches-list">
              <div class="match-row">
                <input type="text" name="match" required placeholder="Ghép nối 1">
                <button type="button" class="remove-match-btn"><i class="fas fa-times"></i></button>
              </div>
            </div>
            <button type="button" class="add-match-btn">Thêm ghép nối</button>
          </div>
        </div>
        <div class="matching-answers">
          <label>Đáp án đúng (theo thứ tự mục):</label>
          <div id="matching-answers-list">
            <div class="answer-row">
              <span class="item-label">Mục 1:</span>
              <input type="text" name="matchingAnswer" required>
            </div>
          </div>
        </div>
        <button type="button" class="save-question-btn">Lưu câu hỏi</button>
      </div>
    `
        break
      case "Ghi nhãn Bản đồ/Sơ đồ":
        formHTML = `
      <div class="plan-map-diagram-form">
        <label for="type">Loại:</label>
        <select id="type" name="type" required>
          <option value="map">Ghi nhãn Bản đồ</option>
          <option value="ship">Sơ đồ Tàu</option>
          <option value="technical">Sơ đồ Kỹ thuật</option>
        </select>
        <label for="instructions">Hướng dẫn:</label>
        <input type="text" id="instructions" name="instructions" required>
        <label for="image">Hình ảnh:</label>
        <input type="file" id="image" name="image" accept="image/*" required>
        <div id="labels-container">
          <div class="label-row">
            <label for="label1">Nhãn 1:</label>
            <input type="text" id="label1" name="label" required>
            <label for="answer1">Đáp án 1:</label>
            <input type="text" id="answer1" name="answer" required>
            <button type="button" class="remove-label-btn"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <button type="button" class="add-label-btn">Thêm nhãn</button>
        <button type="button" class="save-question-btn">Lưu câu hỏi</button>
      </div>
    `
        break
      case "Hoàn thành ghi chú":
        formHTML = `
      <div class="note-completion-form">
        <label for="instructions">Hướng dẫn:</label>
        <input type="text" id="instructions" name="instructions" value="Hoàn thành ghi chú. Viết MỘT TỪ VÀ/HOẶC MỘT SỐ vào mỗi khoảng trống." required>
        <label for="topic">Chủ đề:</label>
        <input type="text" id="topic" name="topic" required>
        <div id="notes-container">
          <div class="note-row">
            <label>Ghi chú (sử dụng [ANSWER] cho chỗ trống):</label>
            <textarea name="note" required></textarea>
            <button type="button" class="remove-note-btn"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <button type="button" class="add-note-btn">Thêm ghi chú</button>
        <div id="answers-container">
          <label>Đáp án đúng (theo thứ tự [ANSWER]):</label>
          <div id="note-answers-list">
            <div class="answer-row">
              <span class="answer-label">Đáp án 1:</span>
              <input type="text" name="noteAnswer" required>
              <button type="button" class="remove-answer-btn"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <button type="button" class="add-answer-btn">Thêm đáp án</button>
        </div>
        <button type="button" class="save-question-btn">Lưu câu hỏi</button>
      </div>
    `
        break
      case "Hoàn thành bảng/biểu mẫu":
        formHTML = `
      <div class="form-table-completion-form">
        <label for="instructions">Hướng dẫn:</label>
        <input type="text" id="instructions" name="instructions" value="Hoàn thành bảng. Viết KHÔNG QUÁ MỘT TỪ VÀ/HOẶC MỘT SỐ cho mỗi khoảng trống." required>
        <table id="formTable">
          <thead>
            <tr>
              <th>Cột 1</th>
              <th>Cột 2</th>
              <th>Cột 3</th>
              <th>Đáp án</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="text" name="cell" required></td>
              <td><input type="text" name="cell" required></td>
              <td><input type="text" name="cell" required></td>
              <td><input type="text" name="tableAnswer" required></td>
              <td><button type="button" class="remove-row-btn"><i class="fas fa-times"></i></button></td>
            </tr>
          </tbody>
        </table>
        <button type="button" class="add-row-btn">Thêm hàng</button>
        <button type="button" class="save-question-btn">Lưu câu hỏi</button>
      </div>
    `
        break
      case "Hoàn thành lưu đồ":
        formHTML = `
      <div class="flow-chart-completion-form">
        <label for="title">Tiêu đề:</label>
        <input type="text" id="title" name="title" required>
        <label for="instructions">Hướng dẫn:</label>
        <input type="text" id="instructions" name="instructions" required>
        <div id="flow-items-container">
          <label>Mục (sử dụng ___ cho chỗ trống):</label>
          <div id="flow-items-list">
            <div class="flow-item-row">
              <input type="text" name="flowItem" required>
              <button type="button" class="remove-flow-item-btn"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <button type="button" class="add-flow-item-btn">Thêm mục</button>
        </div>
        <div id="flow-options-container">
          <label>Lựa chọn:</label>
          <div id="flow-options-list">
            <div class="flow-option-row">
              <input type="text" name="flowOption" required>
              <button type="button" class="remove-flow-option-btn"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <button type="button" class="add-flow-option-btn">Thêm lựa chọn</button>
        </div>
        <div id="flow-answers-container">
          <label>Đáp án đúng (theo thứ tự khoảng trống):</label>
          <div id="flow-answers-list">
            <div class="flow-answer-row">
              <span class="answer-label">Đáp án 1:</span>
              <input type="text" name="flowAnswer" required>
              <button type="button" class="remove-flow-answer-btn"><i class="fas fa-times"></i></button>
            </div>
          </div>
          <button type="button" class="add-flow-answer-btn">Thêm đáp án</button>
        </div>
        <button type="button" class="save-question-btn">Lưu câu hỏi</button>
      </div>
    `
        break
      default:
        formHTML = `<p>Không hỗ trợ loại câu hỏi: ${questionType}</p>`
    }

    // Create form container and add form HTML
    const formContainer = document.createElement("div")
    formContainer.className = "question-form-container"
    formContainer.innerHTML = formHTML
    questionDiv.appendChild(formContainer)

    // Make sure the part element is visible
    partElement.style.display = "block"

    // Append the question div to the part element
    partElement.appendChild(questionDiv)

    // Make sure the question div is visible
    questionDiv.style.display = "block"

    // Create a basic question object and add it to the test
    const newQuestion = {
      type: questionType,
      content: ["Câu hỏi mẫu"],
      correctAnswers: ["Đáp án mẫu"],
    }

    // Add to the current part
    if (!window.test[`part${window.currentPart}`]) {
      window.test[`part${window.currentPart}`] = []
    }

    window.test[`part${window.currentPart}`].push(newQuestion)

    // Remove "no questions" message if it exists
    const noQuestionsMsg = partElement.querySelector(".no-questions")
    if (noQuestionsMsg) {
      noQuestionsMsg.remove()
    }

    // Initialize event listeners for dynamic form elements
    initializeDynamicFormElements(questionDiv, questionType)

    console.log("Question added successfully:", questionType)
  }

  // Add event listener for the start test button
  const startTestBtn = document.getElementById("startTestBtn")
  if (startTestBtn) {
    startTestBtn.addEventListener("click", window.startTestCreation)
  } else {
    console.error("Start test button not found")
  }

  // Initialize other event listeners
  const previousPartBtn = document.getElementById("previousPartBtn")
  if (previousPartBtn) {
    previousPartBtn.addEventListener("click", window.previousPart)
  }

  const nextPartBtn = document.getElementById("nextPartBtn")
  if (nextPartBtn) {
    nextPartBtn.addEventListener("click", window.nextPart)
  }

  const saveTestBtn = document.getElementById("saveTestBtn")
  if (saveTestBtn) {
    saveTestBtn.addEventListener("click", () => {
      if (typeof window.saveTest === "function") {
        window.saveTest()
      } else {
        console.error("saveTest function not found in window object")
        alert("Chức năng lưu bài kiểm tra chưa được cài đặt")
      }
    })
  }
})

// Global function to handle question creation
window.addQuestion = (questionType) => {
  console.log("Global addQuestion called with type:", questionType)

  if (typeof window.addQuestionDirectly === "function") {
    window.addQuestionDirectly(questionType)
  } else {
    console.error("addQuestionDirectly function not found")
    alert("Error: Cannot create question. Please refresh the page and try again.")
  }
}

// Simple implementation of renderQuestionsForCurrentPart
window.renderQuestionsForCurrentPart = () => {
  console.log("Rendering questions for current part:", window.currentPart)

  const partElement = document.getElementById(`part${window.currentPart}`)
  if (!partElement) {
    console.error(`Element for part${window.currentPart} not found`)
    return
  }

  // Clear the part container
  partElement.innerHTML = ""

  // Get questions for current part
  const questions = window.test[`part${window.currentPart}`] || []

  if (questions.length === 0) {
    partElement.innerHTML = `<div class="no-questions">Không có câu hỏi nào trong phần này. Nhấn "Thêm câu hỏi" để bắt đầu.</div>`
    return
  }

  // Render each question
  questions.forEach((question, index) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question"

    // Create question content
    questionDiv.innerHTML = `
      <h4><i class="fas fa-question-circle"></i> Câu hỏi ${index + 1}</h4>
      <h3><i class="fas fa-check-circle"></i> ${question.type}</h3>
      <button class="delete-question" type="button"><i class="fas fa-trash"></i></button>
      <div class="question-content">
        <p><strong>Nội dung:</strong> ${question.content[0]}</p>
        <p><strong>Đáp án:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      </div>
    `

    partElement.appendChild(questionDiv)
  })
}

// Simple implementation of deleteQuestion - this is now handled by the event delegation approach
window.deleteQuestion = (index) => {
  console.log("Legacy deleteQuestion called with index:", index)
  // This function is kept for backward compatibility but the actual deletion
  // is now handled by the event delegation approach
}

// Simple implementation of showNotification
window.showNotification = (message, type) => {
  console.log(`${type}: ${message}`)
  alert(message)
}

// Simple implementation of saveTest
window.saveTest = () => {
  console.log("Saving test:", window.test)
  alert("Đã lưu bài kiểm tra thành công!")
}

console.log("index.js loaded successfully")

// Add helper function to get icon for question type
function getIconForType(type) {
  const icons = {
    "Một đáp án": '<i class="fas fa-check-circle"></i>',
    "Nhiều đáp án": '<i class="fas fa-check-double"></i>',
    "Ghép nối": '<i class="fas fa-link"></i>',
    "Ghi nhãn Bản đồ/Sơ đồ": '<i class="fas fa-map-marker-alt"></i>',
    "Hoàn thành ghi chú": '<i class="fas fa-sticky-note"></i>',
    "Hoàn thành bảng/biểu mẫu": '<i class="fas fa-table"></i>',
    "Hoàn thành lưu đồ": '<i class="fas fa-project-diagram"></i>',
  }
  return icons[type] || '<i class="fas fa-question"></i>'
}

// Add these functions at the end of the file to ensure they're available
// These are placeholder functions that will call the actual implementations from form-handlers.js

// Replace the form creation functions with these versions that don't cause recursion
// Form creation functions
function createOneAnswerForm() {
  // Don't call window.createOneAnswerForm here to avoid recursion
  return `
    <div class="one-answer-form">
      <label for="question">Câu hỏi:</label>
      <input type="text" id="question" name="question" required>
      <label>Lựa chọn:</label>
      <input type="text" name="option1" required><br>
      <input type="text" name="option2" required><br>
      <input type="text" name="option3" required><br>
      <input type="text" name="option4" required><br>
      <label for="correctAnswer">Đáp án đúng:</label>
      <select id="correctAnswer" name="correctAnswer" required>
        <option value="1">Lựa chọn 1</option>
        <option value="2">Lựa chọn 2</option>
        <option value="3">Lựa chọn 3</option>
        <option value="4">Lựa chọn 4</option>
      </select>
      <button type="button" onclick="saveOneAnswerQuestion(this)">Lưu câu hỏi</button>
    </div>
  `
}

function createMultipleAnswerForm() {
  // Don't call window.createMultipleAnswerForm here to avoid recursion
  return `
    <div class="multiple-answer-form">
      <label for="question">Câu hỏi:</label>
      <input type="text" id="question" name="question" required>
      <label>Lựa chọn:</label>
      <input type="text" name="option1" required><br>
      <input type="text" name="option2" required><br>
      <input type="text" name="option3" required><br>
      <input type="text" name="option4" required><br>
      <label>Đáp án đúng (chọn nhiều):</label><br>
      <input type="checkbox" id="correctAnswer1" name="correctAnswers" value="1">
      <label for="correctAnswer1">Lựa chọn 1</label><br>
      <input type="checkbox" id="correctAnswer2" name="correctAnswers" value="2">
      <label for="correctAnswer2">Lựa chọn 2</label><br>
      <input type="checkbox" id="correctAnswer3" name="correctAnswers" value="3">
      <label for="correctAnswer3">Lựa chọn 3</label><br>
      <input type="checkbox" id="correctAnswer4" name="correctAnswers" value="4">
      <label for="correctAnswer4">Lựa chọn 4</label>
      <button type="button" onclick="saveMultipleAnswerQuestion(this)">Lưu câu hỏi</button>
    </div>
  `
}

function createMatchingForm() {
  if (typeof window.createMatchingForm === "function") {
    return window.createMatchingForm()
  }
  return `
    <div class="matching-form">
      <label for="title">Tiêu đề:</label>
      <input type="text" id="title" name="title" required>
      <label>Mục:</label>
      <input type="text" name="item1" required><br>
      <input type="text" name="item2" required><br>
      <input type="text" name="item3" required><br>
      <label>Ghép nối:</label>
      <input type="text" name="match1" required><br>
      <input type="text" name="match2" required><br>
      <input type="text" name="match3" required><br>
      <label for="correctMatches">Ghép nối đúng (ví dụ: 1-A, 2-B, 3-C):</label>
      <input type="text" id="correctMatches" name="correctMatches" required>
      <button type="button" onclick="saveMatchingQuestion(this)">Lưu câu hỏi</button>
    </div>
  `
}

function createPlanMapDiagramForm() {
  if (typeof window.createPlanMapDiagramForm === "function") {
    return window.createPlanMapDiagramForm()
  }
  return `
    <div class="plan-map-diagram-form">
      <label for="type">Loại:</label>
      <select id="type" name="type" required>
        <option value="map">Ghi nhãn Bản đồ</option>
        <option value="ship">Sơ đồ Tàu</option>
        <option value="technical">Sơ đồ Kỹ thuật</option>
      </select>
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label for="image">Hình ảnh:</label>
      <input type="file" id="image" name="image" accept="image/*" required>
      <div id="labels-container">
        <label for="label1">Nhãn 1:</label>
        <input type="text" id="label1" name="label1" required>
        <label for="answer1">Đáp án 1:</label>
        <input type="text" id="answer1" name="answer1" required>
      </div>
      <button type="button" onclick="addLabel()">Thêm nhãn</button>
      <button type="button" onclick="savePlanMapDiagramQuestion(this)">Lưu câu hỏi</button>
    </div>
  `
}

function createNoteCompletionForm() {
  if (typeof window.createNoteCompletionForm === "function") {
    return window.createNoteCompletionForm()
  }
  return `
    <div class="note-completion-form">
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label for="topic">Chủ đề:</label>
      <input type="text" id="topic" name="topic" required>
      <label>Ghi chú (sử dụng [ANSWER] cho chỗ trống):</label>
      <textarea name="note1" required></textarea><br>
      <textarea name="note2" required></textarea><br>
      <textarea name="note3" required></textarea>
    </div>
  `
}

// Initialize dynamic form elements
function initializeDynamicFormElements(questionDiv, questionType) {
  switch (questionType) {
    case "Một đáp án":
      initializeOneAnswerForm(questionDiv)
      break
    case "Nhiều đáp án":
      initializeMultipleAnswerForm(questionDiv)
      break
    case "Ghép nối":
      initializeMatchingForm(questionDiv)
      break
    case "Ghi nhãn Bản đồ/Sơ đồ":
      initializePlanMapDiagramForm(questionDiv)
      break
    case "Hoàn thành ghi chú":
      initializeNoteCompletionForm(questionDiv)
      break
    case "Hoàn thành bảng/biểu mẫu":
      initializeFormTableCompletionForm(questionDiv)
      break
    case "Hoàn thành lưu đồ":
      initializeFlowChartCompletionForm(questionDiv)
      break
    default:
      console.warn("Không hỗ trợ loại câu hỏi:", questionType)
  }
}

function initializeOneAnswerForm(questionDiv) {
  const addOptionBtn = questionDiv.querySelector(".add-option-btn")
  const optionsList = questionDiv.querySelector("#options-list")

  if (addOptionBtn && optionsList) {
    addOptionBtn.addEventListener("click", () => {
      const optionCount = optionsList.children.length
      const newOptionItem = document.createElement("div")
      newOptionItem.className = "option-item"
      newOptionItem.innerHTML = `
        <input type="text" name="option" required>
        <input type="radio" name="correctAnswer" value="${optionCount}">
        <button type="button" class="remove-option-btn"><i class="fas fa-times"></i></button>
      `
      optionsList.appendChild(newOptionItem)

      // Initialize remove button for the new option
      const removeButton = newOptionItem.querySelector(".remove-option-btn")
      removeButton.addEventListener("click", () => {
        newOptionItem.remove()
      })
    })
  }

  // Initialize existing remove buttons
  const removeOptionBtns = questionDiv.querySelectorAll(".remove-option-btn")
  removeOptionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".option-item").remove()
    })
  })

  // Save question button
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Implement save logic here
      alert("Lưu câu hỏi Một đáp án")
    })
  }
}

function initializeMultipleAnswerForm(questionDiv) {
  const addOptionBtn = questionDiv.querySelector(".add-option-btn")
  const optionsList = questionDiv.querySelector("#options-list")

  if (addOptionBtn && optionsList) {
    addOptionBtn.addEventListener("click", () => {
      const optionCount = optionsList.children.length
      const newOptionItem = document.createElement("div")
      newOptionItem.className = "option-item"
      newOptionItem.innerHTML = `
        <input type="text" name="option" required>
        <input type="checkbox" name="correctAnswer" value="${optionCount}">
        <button type="button" class="remove-option-btn"><i class="fas fa-times"></i></button>
      `
      optionsList.appendChild(newOptionItem)

      // Initialize remove button for the new option
      const removeButton = newOptionItem.querySelector(".remove-option-btn")
      removeButton.addEventListener("click", () => {
        newOptionItem.remove()
      })
    })
  }

  // Initialize existing remove buttons
  const removeOptionBtns = questionDiv.querySelectorAll(".remove-option-btn")
  removeOptionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".option-item").remove()
    })
  })

  // Save question button
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Implement save logic here
      alert("Lưu câu hỏi Nhiều đáp án")
    })
  }
}

function initializeMatchingForm(questionDiv) {
  const addItemBtn = questionDiv.querySelector(".add-item-btn")
  const addMatchBtn = questionDiv.querySelector(".add-match-btn")
  const itemsList = questionDiv.querySelector("#items-list")
  const matchesList = questionDiv.querySelector("#matches-list")
  const matchingAnswersList = questionDiv.querySelector("#matching-answers-list")

  if (addItemBtn && itemsList && matchesList && matchingAnswersList) {
    addItemBtn.addEventListener("click", () => {
      const itemCount = itemsList.children.length
      const newItemRow = document.createElement("div")
      newItemRow.className = "item-row"
      newItemRow.innerHTML = `
        <input type="text" name="item" required>
        <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
      `
      itemsList.appendChild(newItemRow)

      // Initialize remove button for the new item
      const removeButton = newItemRow.querySelector(".remove-item-btn")
      removeButton.addEventListener("click", () => {
        newItemRow.remove()
        updateMatchingAnswers()
      })

      updateMatchingAnswers()
    })

    addMatchBtn.addEventListener("click", () => {
      const newMatchRow = document.createElement("div")
      newMatchRow.className = "match-row"
      newMatchRow.innerHTML = `
        <input type="text" name="match" required>
        <button type="button" class="remove-match-btn"><i class="fas fa-times"></i></button>
      `
      matchesList.appendChild(newMatchRow)

      // Initialize remove button for the new match
      const removeButton = newMatchRow.querySelector(".remove-match-btn")
      removeButton.addEventListener("click", () => {
        newMatchRow.remove()
      })
    })

    // Function to update matching answers
    function updateMatchingAnswers() {
      matchingAnswersList.innerHTML = ""
      const itemCount = itemsList.children.length

      for (let i = 0; i < itemCount; i++) {
        const answerRow = document.createElement("div")
        answerRow.className = "answer-row"
        answerRow.innerHTML = `
          <span class="item-label">Mục ${i + 1}:</span>
          <input type="text" name="matchingAnswer" required>
        `
        matchingAnswersList.appendChild(answerRow)
      }
    }

    // Initialize existing remove buttons for items
    const removeItemBtns = questionDiv.querySelectorAll(".remove-item-btn")
    removeItemBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".item-row").remove()
        updateMatchingAnswers()
      })
    })

    // Initialize existing remove buttons for matches
    const removeMatchBtns = questionDiv.querySelectorAll(".remove-match-btn")
    removeMatchBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".match-row").remove()
      })
    })

    // Initial update of matching answers
    updateMatchingAnswers()
  }

  // Save question button
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Implement save logic here
      alert("Lưu câu hỏi Ghép nối")
    })
  }
}

function initializePlanMapDiagramForm(questionDiv) {
  const addLabelBtn = questionDiv.querySelector(".add-label-btn")
  const labelsContainer = questionDiv.querySelector("#labels-container")

  if (addLabelBtn && labelsContainer) {
    addLabelBtn.addEventListener("click", () => {
      const labelCount = labelsContainer.children.length
      const newLabelRow = document.createElement("div")
      newLabelRow.className = "label-row"
      newLabelRow.innerHTML = `
        <label for="label${labelCount + 1}">Nhãn ${labelCount + 1}:</label>
        <input type="text" id="label${labelCount + 1}" name="label" required>
        <label for="answer${labelCount + 1}">Đáp án ${labelCount + 1}:</label>
        <input type="text" id="answer${labelCount + 1}" name="answer" required>
        <button type="button" class="remove-label-btn"><i class="fas fa-times"></i></button>
      `
      labelsContainer.appendChild(newLabelRow)

      // Initialize remove button for the new label
      const removeButton = newLabelRow.querySelector(".remove-label-btn")
      removeButton.addEventListener("click", () => {
        newLabelRow.remove()
      })
    })
  }

  // Initialize existing remove buttons
  const removeLabelBtns = questionDiv.querySelectorAll(".remove-label-btn")
  removeLabelBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".label-row").remove()
    })
  })

  // Save question button
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Implement save logic here
      alert("Lưu câu hỏi Ghi nhãn Bản đồ/Sơ đồ")
    })
  }
}

function initializeNoteCompletionForm(questionDiv) {
  const addNoteBtn = questionDiv.querySelector(".add-note-btn")
  const addAnswerBtn = questionDiv.querySelector(".add-answer-btn")
  const notesContainer = questionDiv.querySelector("#notes-container")
  const noteAnswersList = questionDiv.querySelector("#note-answers-list")

  if (addNoteBtn && notesContainer && addAnswerBtn && noteAnswersList) {
    addNoteBtn.addEventListener("click", () => {
      const noteCount = notesContainer.children.length
      const newNoteRow = document.createElement("div")
      newNoteRow.className = "note-row"
      newNoteRow.innerHTML = `
        <label>Ghi chú (sử dụng [ANSWER] cho chỗ trống):</label>
        <textarea name="note" required></textarea>
        <button type="button" class="remove-note-btn"><i class="fas fa-times"></i></button>
      `
      notesContainer.appendChild(newNoteRow)

      // Initialize remove button for the new note
      const removeButton = newNoteRow.querySelector(".remove-note-btn")
      removeButton.addEventListener("click", () => {
        newNoteRow.remove()
        updateNoteAnswers()
      })

      updateNoteAnswers()
    })

    addAnswerBtn.addEventListener("click", () => {
      const answerCount = noteAnswersList.children.length
      const newAnswerRow = document.createElement("div")
      newAnswerRow.className = "answer-row"
      newAnswerRow.innerHTML = `
        <span class="answer-label">Đáp án ${answerCount + 1}:</span>
        <input type="text" name="noteAnswer" required>
        <button type="button" class="remove-answer-btn"><i class="fas fa-times"></i></button>
      `
      noteAnswersList.appendChild(newAnswerRow)

      // Initialize remove button for the new answer
      const removeButton = newAnswerRow.querySelector(".remove-answer-btn")
      removeButton.addEventListener("click", () => {
        newAnswerRow.remove()
      })
    })

    // Function to update note answers
    function updateNoteAnswers() {
      noteAnswersList.innerHTML = ""
      const noteCount = notesContainer.children.length

      for (let i = 0; i < noteCount; i++) {
        const answerRow = document.createElement("div")
        answerRow.className = "answer-row"
        answerRow.innerHTML = `
          <span class="answer-label">Đáp án ${i + 1}:</span>
          <input type="text" name="noteAnswer" required>
        `
        noteAnswersList.appendChild(answerRow)
      }
    }

    // Initialize existing remove buttons for notes
    const removeNoteBtns = questionDiv.querySelectorAll(".remove-note-btn")
    removeNoteBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".note-row").remove()
        updateNoteAnswers()
      })
    })

    // Initialize existing remove buttons for answers
    const removeAnswerBtns = questionDiv.querySelectorAll(".remove-answer-btn")
    removeAnswerBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".answer-row").remove()
      })
    })

    // Initial update of note answers
    updateNoteAnswers()
  }

  // Save question button
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Implement save logic here
      alert("Lưu câu hỏi Hoàn thành ghi chú")
    })
  }
}

function initializeFormTableCompletionForm(questionDiv) {
  const addRowBtn = questionDiv.querySelector(".add-row-btn")
  const formTable = questionDiv.querySelector("#formTable tbody")

  if (addRowBtn && formTable) {
    addRowBtn.addEventListener("click", () => {
      const newRow = document.createElement("tr")
      newRow.innerHTML = `
        <td><input type="text" name="cell" required></td>
        <td><input type="text" name="cell" required></td>
        <td><input type="text" name="cell" required></td>
        <td><input type="text" name="tableAnswer" required></td>
        <td><button type="button" class="remove-row-btn"><i class="fas fa-times"></i></button></td>
      `
      formTable.appendChild(newRow)

      // Initialize remove button for the new row
      const removeButton = newRow.querySelector(".remove-row-btn")
      removeButton.addEventListener("click", () => {
        newRow.remove()
      })
    })
  }

  // Initialize existing remove buttons
  const removeRowBtns = questionDiv.querySelectorAll(".remove-row-btn")
  removeRowBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest("tr").remove()
    })
  })

  // Save question button
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Implement save logic here
      alert("Lưu câu hỏi Hoàn thành bảng/biểu mẫu")
    })
  }
}

function initializeFlowChartCompletionForm(questionDiv) {
  const addFlowItemBtn = questionDiv.querySelector(".add-flow-item-btn")
  const addFlowOptionBtn = questionDiv.querySelector(".add-flow-option-btn")
  const addFlowAnswerBtn = questionDiv.querySelector(".add-flow-answer-btn")
  const flowItemsList = questionDiv.querySelector("#flow-items-list")
  const flowOptionsList = questionDiv.querySelector("#flow-options-list")
  const flowAnswersList = questionDiv.querySelector("#flow-answers-list")

  if (addFlowItemBtn && flowItemsList && addFlowOptionBtn && flowOptionsList && addFlowAnswerBtn && flowAnswersList) {
    addFlowItemBtn.addEventListener("click", () => {
      const newItemRow = document.createElement("div")
      newItemRow.className = "flow-item-row"
      newItemRow.innerHTML = `
        <input type="text" name="flowItem" required>
        <button type="button" class="remove-flow-item-btn"><i class="fas fa-times"></i></button>
      `
      flowItemsList.appendChild(newItemRow)

      // Initialize remove button for the new item
      const removeButton = newItemRow.querySelector(".remove-flow-item-btn")
      removeButton.addEventListener("click", () => {
        newItemRow.remove()
        updateFlowAnswers()
      })

      updateFlowAnswers()
    })

    addFlowOptionBtn.addEventListener("click", () => {
      const newOptionRow = document.createElement("div")
      newOptionRow.className = "flow-option-row"
      newOptionRow.innerHTML = `
        <input type="text" name="flowOption" required>
        <button type="button" class="remove-flow-option-btn"><i class="fas fa-times"></i></button>
      `
      flowOptionsList.appendChild(newOptionRow)

      // Initialize remove button for the new option
      const removeButton = newOptionRow.querySelector(".remove-flow-option-btn")
      removeButton.addEventListener("click", () => {
        newOptionRow.remove()
      })
    })

    addFlowAnswerBtn.addEventListener("click", () => {
      const answerCount = flowAnswersList.children.length
      const newAnswerRow = document.createElement("div")
      newAnswerRow.className = "flow-answer-row"
      newAnswerRow.innerHTML = `
        <span class="answer-label">Đáp án ${answerCount + 1}:</span>
        <input type="text" name="flowAnswer" required>
        <button type="button" class="remove-flow-answer-btn"><i class="fas fa-times"></i></button>
      `
      flowAnswersList.appendChild(newAnswerRow)

      // Initialize remove button for the new answer
      const removeButton = newAnswerRow.querySelector(".remove-flow-answer-btn")
      removeButton.addEventListener("click", () => {
        newAnswerRow.remove()
      })
    })

    // Function to update flow answers
    function updateFlowAnswers() {
      flowAnswersList.innerHTML = ""
      const itemCount = flowItemsList.children.length

      for (let i = 0; i < itemCount; i++) {
        const answerRow = document.createElement("div")
        answerRow.className = "flow-answer-row"
        answerRow.innerHTML = `
          <span class="answer-label">Đáp án ${i + 1}:</span>
          <input type="text" name="flowAnswer" required>
        `
        flowAnswersList.appendChild(answerRow)
      }
    }

    // Initialize existing remove buttons for items
    const removeItemBtns = questionDiv.querySelectorAll(".remove-flow-item-btn")
    removeItemBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".flow-item-row").remove()
        updateFlowAnswers()
      })
    })

    // Initialize existing remove buttons for options
    const removeOptionBtns = questionDiv.querySelectorAll(".remove-flow-option-btn")
    removeOptionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".flow-option-row").remove()
      })
    })

    // Initialize existing remove buttons for answers
    const removeAnswerBtns = questionDiv.querySelectorAll(".remove-flow-answer-btn")
    removeAnswerBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".flow-answer-row").remove()
      })
    })

    // Initial update of flow answers
    updateFlowAnswers()
  }

  // Save question button
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Implement save logic here
      alert("Lưu câu hỏi Hoàn thành lưu đồ")
    })
  }
}

