// Khai báo biến toàn cục
let test = {
  title: "",
  description: "",
  part1: [],
  part2: [],
  part3: [],
  part4: [],
}
let totalQuestions = 0
// Use window.currentPart instead of local currentPart
// let currentPart = 1
const MAX_QUESTIONS = 50 // Giới hạn số lượng câu hỏi tối đa là 50

// Hàm hiển thị thông báo
function showNotification(message, type) {
  // Kiểm tra xem đã có thông báo nào chưa
  let notification = document.querySelector(".notification")
  if (!notification) {
    notification = document.createElement("div")
    notification.className = "notification"
    document.body.appendChild(notification)
  }

  // Thiết lập loại thông báo
  notification.className = `notification notification-${type}`
  notification.innerHTML = message
  notification.style.position = "fixed"
  notification.style.top = "20px"
  notification.style.right = "20px"
  notification.style.padding = "15px"
  notification.style.borderRadius = "5px"
  notification.style.zIndex = "1000"
  notification.style.maxWidth = "300px"
  notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"

  // Thiết lập màu sắc dựa trên loại thông báo
  if (type === "success") {
    notification.style.backgroundColor = "#d4edda"
    notification.style.color = "#155724"
    notification.style.border = "1px solid #c3e6cb"
  } else if (type === "error") {
    notification.style.backgroundColor = "#f8d7da"
    notification.style.color = "#721c24"
    notification.style.border = "1px solid #f5c6cb"
  } else if (type === "warning") {
    notification.style.backgroundColor = "#fff3cd"
    notification.style.color = "#856404"
    notification.style.border = "1px solid #ffeeba"
  } else if (type === "info") {
    notification.style.backgroundColor = "#d1ecf1"
    notification.style.color = "#0c5460"
    notification.style.border = "1px solid #bee5eb"
  }

  // Tự động ẩn thông báo sau 5 giây
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

// Cập nhật số lượng câu hỏi
function updateQuestionCount() {
  totalQuestions = 0
  for (let i = 1; i <= 4; i++) {
    totalQuestions += test[`part${i}`].length
  }

  // Cập nhật hiển thị số lượng câu hỏi
  const questionCountElements = document.querySelectorAll(".question-count")
  questionCountElements.forEach((element) => {
    element.textContent = `Tổng số câu hỏi: ${totalQuestions}`
  })
}

// Hiển thị giao diện tạo bài kiểm tra
function renderTestCreation() {
  console.log("Rendering test creation form from test-management.js for part:", window.currentPart)
  const testContent = document.getElementById("testContent")
  if (!testContent) {
    console.error("testContent element not found!")
    return
  }

  // Create part containers if they don't exist
  for (let i = 1; i <= 4; i++) {
    if (!document.getElementById(`part${i}`)) {
      const partDiv = document.createElement("div")
      partDiv.id = `part${i}`
      partDiv.className = "part"
      partDiv.style.display = i === window.currentPart ? "block" : "none"
      testContent.appendChild(partDiv)
      console.log(`Created part container for part ${i}`)
    } else {
      // Update visibility of existing part containers
      const partDiv = document.getElementById(`part${i}`)
      partDiv.style.display = i === window.currentPart ? "block" : "none"
      console.log(`Updated visibility for part ${i}: ${i === window.currentPart ? "visible" : "hidden"}`)
    }
  }

  // Cập nhật metadata bài kiểm tra
  testContent.innerHTML = `
    <div class="test-metadata-form">
      <div class="form-group">
        <label for="testTitle">Tiêu đề bài kiểm tra (Tiếng Anh):</label>
        <input type="text" id="testTitle" required 
          value="${test.title || ""}"
          placeholder="Nhập tiêu đề bài kiểm tra bằng tiếng Anh">
      </div>
      <div class="form-group">
        <label for="testVietnameseName">Tên bộ câu hỏi (Tiếng Việt):</label>
        <input type="text" id="testVietnameseName" 
          value="${test.vietnameseName || ""}"
          placeholder="Nhập tên bộ câu hỏi bằng tiếng Việt">
      </div>
      <div class="form-group">
        <label for="testDescription">Mô tả (không bắt buộc):</label>
        <textarea id="testDescription" rows="2"
          placeholder="Nhập mô tả cho bài kiểm tra">${test.description || ""}</textarea>
      </div>
    </div>
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
        <!-- One answer -->
        <div class="question-type-item">
          <div class="question-type-label">
            <span class="question-type-icon"><i class="fas fa-check-circle"></i></span>
            <span>Một đáp án</span>
          </div>
          <button class="add-question-btn" onclick="addQuestionDirectly('Một đáp án')">
            <i class="fas fa-plus"></i> Thêm câu hỏi một đáp án
          </button>
        </div>
        
        <!-- More than one answer -->
        <div class="question-type-item">
          <div class="question-type-label">
            <span class="question-type-icon"><i class="fas fa-check-double"></i></span>
            <span>Nhiều đáp án</span>
          </div>
          <button class="add-question-btn" onclick="addQuestionDirectly('Nhiều đáp án')">
            <i class="fas fa-plus"></i> Thêm câu hỏi nhiều đáp án
          </button>
        </div>
        
        <!-- Matching -->
        <div class="question-type-item">
          <div class="question-type-label">
            <span class="question-type-icon"><i class="fas fa-link"></i></span>
            <span>Ghép nối</span>
          </div>
          <button class="add-question-btn" onclick="addQuestionDirectly('Ghép nối')">
            <i class="fas fa-plus"></i> Thêm câu hỏi ghép nối
          </button>
        </div>
        
        <!-- Plan/Map/Diagram labelling -->
        <div class="question-type-item">
          <div class="question-type-label">
            <span class="question-type-icon"><i class="fas fa-map-marker-alt"></i></span>
            <span>Ghi nhãn Bản đồ/Sơ đồ</span>
          </div>
          <button class="add-question-btn" onclick="addQuestionDirectly('Ghi nhãn Bản đồ/Sơ đồ')">
            <i class="fas fa-plus"></i> Thêm câu hỏi ghi nhãn
          </button>
        </div>
        
        <!-- Note Completion -->
        <div class="question-type-item">
          <div class="question-type-label">
            <span class="question-type-icon"><i class="fas fa-sticky-note"></i></span>
            <span>Hoàn thành ghi chú</span>
          </div>
          <button class="add-question-btn" onclick="addQuestionDirectly('Hoàn thành ghi chú')">
            <i class="fas fa-plus"></i> Thêm câu hỏi hoàn thành ghi chú
          </button>
        </div>
        
        <!-- Form/Table Completion -->
        <div class="question-type-item">
          <div class="question-type-label">
            <span class="question-type-icon"><i class="fas fa-table"></i></span>
            <span>Hoàn thành bảng/biểu mẫu</span>
          </div>
          <button class="add-question-btn" onclick="addQuestionDirectly('Hoàn thành bảng/biểu mẫu')">
            <i class="fas fa-plus"></i> Thêm câu hỏi hoàn thành bảng
          </button>
        </div>
        
        <!-- Flow chart Completion -->
        <div class="question-type-item">
          <div class="question-type-label">
            <span class="question-type-icon"><i class="fas fa-project-diagram"></i></span>
            <span>Hoàn thành lưu đồ</span>
          </div>
          <button class="add-question-btn" onclick="addQuestionDirectly('Hoàn thành lưu đồ')">
            <i class="fas fa-plus"></i> Thêm câu hỏi hoàn thành lưu đồ
          </button>
        </div>
      </div>
      
      <div class="navigation-buttons">
        <button class="nav-btn prev-btn" onclick="window.previousPart()">
          <i class="fas fa-arrow-left"></i> Phần trước
        </button>
        <button class="nav-btn next-btn" onclick="window.nextPart()">
          Phần tiếp theo <i class="fas fa-arrow-right"></i>
        </button>
      </div>
      
      <div class="save-button-container">
        <button class="save-btn" onclick="window.saveTest()">
          <i class="fas fa-save"></i> Lưu bài kiểm tra
        </button>
      </div>
    </div>
  `

  // Re-add the part containers to the testContent
  for (let i = 1; i <= 4; i++) {
    const partDiv = document.getElementById(`part${i}`)
    if (partDiv) {
      testContent.appendChild(partDiv)
    }
  }

  // Hiển thị câu hỏi trong phần hiện tại nếu có
  renderQuestionsForCurrentPart()
}

// Hiển thị câu hỏi cho phần hiện tại
function renderQuestionsForCurrentPart() {
  console.log(`Rendering questions for part ${window.currentPart}`)
  const part = document.getElementById(`part${window.currentPart}`)
  if (!part) {
    console.error(`part${window.currentPart} element not found!`)
    return
  }

  // Clear the part container
  part.innerHTML = ""

  // Check if there are any questions in this part
  if (!test[`part${window.currentPart}`] || test[`part${window.currentPart}`].length === 0) {
    part.innerHTML = `<div class="no-questions">Không có câu hỏi nào trong phần này. Nhấn "Thêm câu hỏi" để bắt đầu.</div>`
    return
  }

  // Calculate the starting question index for this part
  let questionIndex = 0
  for (let i = 1; i < window.currentPart; i++) {
    questionIndex += test[`part${i}`]?.length || 0
  }

  // Render each question in this part
  test[`part${window.currentPart}`].forEach((question, index) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question view-mode" // Default to view mode
    questionDiv.innerHTML = `
      <h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionIndex + index + 1}</h4>
      <h3>${getIconForType(question.type)} ${question.type}</h3>
      <button class="delete-question" onclick="deleteQuestion(${index})"><i class="fas fa-trash"></i></button>
      ${renderQuestionContent(question)}
    `
    part.appendChild(questionDiv)

    // Disable input fields in view mode
    const inputs = questionDiv.querySelectorAll("input, textarea, select")
    inputs.forEach((input) => {
      input.disabled = true
    })

    // Add action buttons for editing
    const questionContent = questionDiv.querySelector(".question-content") || questionDiv
    const actionDiv = document.createElement("div")
    actionDiv.className = "question-actions"
    actionDiv.innerHTML = `
      <button class="edit-question-btn" onclick="toggleQuestionEdit(this)">
        <i class="fas fa-edit"></i> Chỉnh sửa
      </button>
      <button class="save-question-btn" onclick="saveQuestionChanges(this)" style="display: none;">
        <i class="fas fa-save"></i> Lưu thay đổi
      </button>
      <button class="cancel-edit-btn" onclick="cancelQuestionEdit(this)" style="display: none;">
        <i class="fas fa-times"></i> Hủy
      </button>
    `
    questionContent.appendChild(actionDiv)
  })
}

// Helper function to get icon for question type
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

// Hiển thị nội dung câu hỏi dựa trên loại
function renderQuestionContent(question) {
  let content = ""
  switch (question.type) {
    case "Một đáp án":
      content = renderOneAnswerQuestion(question)
      break
    case "Nhiều đáp án":
      content = renderMultipleAnswerQuestion(question)
      break
    case "Ghép nối":
      content = renderMatchingQuestion(question)
      break
    case "Ghi nhãn Bản đồ/Sơ đồ":
      content = renderPlanMapDiagramQuestion(question)
      break
    case "Hoàn thành ghi chú":
      content = renderNoteCompletionQuestion(question)
      break
    case "Hoàn thành bảng/biểu mẫu":
      content = renderFormTableCompletionQuestion(question)
      break
    case "Hoàn thành lưu đồ":
      content = renderFlowChartCompletionQuestion(question)
      break
    default:
      content = `<p>Không hỗ trợ loại câu hỏi này: ${question.type}</p>`
  }

  // Add edit, save, and cancel buttons for each question
  content += `
    <div class="question-actions">
      <button class="edit-question-btn" onclick="toggleQuestionEdit(this)">
        <i class="fas fa-edit"></i> Chỉnh sửa
      </button>
      <button class="save-question-btn" onclick="saveQuestionChanges(this)" style="display: none;">
        <i class="fas fa-save"></i> Lưu thay đổi
      </button>
      <button class="cancel-edit-btn" onclick="cancelQuestionEdit(this)" style="display: none;">
        <i class="fas fa-times"></i> Hủy
      </button>
    </div>
  `

  return content
}

// Hiển thị câu hỏi Một đáp án
function renderOneAnswerQuestion(question) {
  return `
    <div class="t3-question-creator">
      <form class="t3-one-answer-form">
        <div class="t3-form-group">
          <label for="t3-questionText">Nội dung câu hỏi:</label>
          <input type="text" id="t3-questionText" name="questionText" value="${question.content[0]}" required>
        </div>
        <div class="t3-form-group">
          <label for="t3-options">Lựa chọn (mỗi lựa chọn một dòng):</label>
          <textarea id="t3-options" name="options" rows="4" required>${question.content.slice(1).join("\n")}</textarea>
        </div>
        <div class="t3-form-group">
          <label for="t3-correctAnswer">Đáp án đúng:</label>
          <input type="text" id="t3-correctAnswer" name="correctAnswer" value="${question.correctAnswers}" required>
        </div>
      </form>
    </div>
  `
}

// Hiển thị câu hỏi Nhiều đáp án
function renderMultipleAnswerQuestion(question) {
  return `
    <div class="t4-container">
      <form id="t4-questionForm">
        <div class="t4-form-group">
          <label for="t4-questionText">Nội dung câu hỏi:</label>
          <input type="text" id="t4-questionText" name="questionText" value="${question.content[0]}" required>
        </div>
        <div class="t4-form-group">
          <label for="t4-options">Lựa chọn (mỗi lựa chọn một dòng):</label>
          <textarea id="t4-options" name="options" rows="4" required>${question.content.slice(1).join("\n")}</textarea>
        </div>
        <div class="t4-form-group">
          <label for="t4-correctAnswers">Đáp án đúng (các số cách nhau bằng dấu phẩy):</label>
          <input type="text" id="t4-correctAnswers" name="correctAnswers" value="${question.correctAnswers.join(", ")}" required>
        </div>
      </form>
    </div>
  `
}

// Hiển thị câu hỏi Ghép nối
function renderMatchingQuestion(question) {
  return `
    <div class="t3-question-creator">
      <form id="t3-questionForm">
        <div class="t3-form-group">
          <label for="t3-questionTitle">Tiêu đề câu hỏi:</label>
          <input type="text" id="t3-questionTitle" name="questionTitle" value="${question.content[0]}" required>
        </div>
        <div class="t3-form-group">
          <label for="t3-people">Người (mỗi người một dòng):</label>
          <textarea id="t3-people" name="people" required>${question.content.slice(1, Math.ceil(question.content.length / 2)).join("\n")}</textarea>
        </div>
        <div class="t3-form-group">
          <label for="t3-responsibilities">Trách nhiệm (mỗi trách nhiệm một dòng):</label>
          <textarea id="t3-responsibilities" name="responsibilities" required>${question.content.slice(Math.ceil(question.content.length / 2)).join("\n")}</textarea>
        </div>
        <div class="t3-form-group">
          <label for="t3-correctAnswers">Đáp án đúng (mỗi đáp án một dòng, theo thứ tự người):</label>
          <textarea id="t3-correctAnswers" name="correctAnswers" required>${question.correctAnswers.join("\n")}</textarea>
        </div>
      </form>
    </div>
  `
}

// Hiển thị câu hỏi Ghi nhãn Bản đồ/Sơ đồ
function renderPlanMapDiagramQuestion(question) {
  const type = question.content[0]
  const typeLabel = type === "map" ? "Ghi nhãn Bản đồ (Chọn từ A-H)" : "Sơ đồ Tàu (Nhập đáp án)"

  return `
    <div class="t1-ielts-creator">
      <form id="questionForm">
        <div class="t1-form-group">
          <label for="questionType">Loại câu hỏi:</label>
          <select id="questionType" required>
            <option value="map" ${type === "map" ? "selected" : ""}>Ghi nhãn Bản đồ (Chọn từ A-H)</option>
            <option value="ship" ${type === "ship" ? "selected" : ""}>Sơ đồ Tàu (Nhập đáp án)</option>
          </select>
        </div>
        <div class="t1-form-group">
          <label for="instructions">Hướng dẫn:</label>
          <textarea id="instructions" rows="3" required>${question.content[1]}</textarea>
        </div>
        <div class="t1-form-group">
          <label for="imageFile">Hình ảnh đã tải lên:</label>
          <img src="${question.content[2]}" alt="Hình ảnh đã tải lên" style="max-width: 200px;">
        </div>
        <div id="answerInputs">
          ${question.content
            .slice(3)
            .map(
              (answer, index) => `
              <div class="t1-form-group">
                <label for="answer${index}">Nhãn ${index + 1}:</label>
                <input type="text" id="answer${index}" value="${answer}" required>
                <label for="correctAnswer${index}">Đáp án đúng cho nhãn ${index + 1}:</label>
                ${
                  type === "map"
                    ? `<select id="correctAnswer${index}" required>
                      ${["A", "B", "C", "D", "E", "F", "G", "H"]
                        .map(
                          (letter) =>
                            `<option value="${letter}" ${question.correctAnswers[index] === letter ? "selected" : ""}>${letter}</option>`,
                        )
                        .join("")}
                    </select>`
                    : `<input type="text" id="correctAnswer${index}" value="${question.correctAnswers[index]}" required>`
                }
              </div>
            `,
            )
            .join("")}
        </div>
      </form>
    </div>
  `
}

// Hiển thị câu hỏi Hoàn thành ghi chú
function renderNoteCompletionQuestion(question) {
  return `
    <div class="t2-listening-exercise-app">
      <div class="t2-listening-exercise-container">
        <div class="t2-listening-exercise-form-container">
          <form id="t2ListeningExerciseForm">
            <div class="t2-listening-exercise-form-group">
              <label for="t2ListeningExerciseInstructions">Hướng dẫn:</label>
              <input type="text" id="t2ListeningExerciseInstructions" name="instructions" value="${question.content[0]}">
            </div>
            <div class="t2-listening-exercise-form-group">
              <label for="t2ListeningExerciseTopic">Chủ đề:</label>
              <input type="text" id="t2ListeningExerciseTopic" name="topic" value="${question.content[1]}">
            </div>
            <div id="t2ListeningExerciseQuestionContainer">
              ${question.content
                .slice(2)
                .map(
                  (q, index) => `
                <div class="t2-listening-exercise-form-group">
                  <label for="t2ListeningExerciseQuestion${index + 1}">Câu hỏi ${index + 1}:</label>
                  <div class="t2-listening-exercise-answer-fields">
                    <textarea id="t2ListeningExerciseQuestion${index + 1}" name="question${index + 1}">${q}</textarea>
                  </div>
                  <div class="t2-listening-exercise-correct-answers" id="t2ListeningExerciseCorrectAnswers${index + 1}">
                    <span class="t2-listening-exercise-correct-answer-label">Đáp án đúng:</span>
                    <input type="text" class="t2-listening-exercise-correct-answer-input" value="${question.correctAnswers[index]}">
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </form>
        </div>
      </div>
    </div>
  `
}

// Hiển thị câu hỏi Hoàn thành bảng/biểu mẫu
function renderFormTableCompletionQuestion(question) {
  return `
    <div class="t6-ielts-listening-creator">
      <div id="tableSection" class="t6-question-container">
        <textarea id="tableInstruction" rows="2">${question.content[0]}</textarea>
        <table id="fareTable">
          <tr>
            <th>Phương tiện</th>
            <th>Giá tiền mặt</th>
            <th>Giá thẻ</th>
            <th>Đáp án đúng</th>
            <th>Thao tác</th>
          </tr>
          ${Array.from({ length: Math.floor((question.content.length - 1) / 3) })
            .map((_, index) => {
              const startIdx = 1 + index * 3
              return `
              <tr>
                <td><input type="text" value="${question.content[startIdx] || ""}"></td>
                <td><input type="text" value="${question.content[startIdx + 1] || ""}"></td>
                <td><input type="text" value="${question.content[startIdx + 2] || ""}"></td>
                <td><input type="text" class="t6-correct-answer-input" value="${question.correctAnswers[index] || ""}"></td>
                <td><button class="t6-delete-btn">Xóa</button></td>
              </tr>
            `
            })
            .join("")}
        </table>
      </div>
    </div>
  `
}

// Hiển thị câu hỏi Hoàn thành lưu đồ
function renderFlowChartCompletionQuestion(question) {
  return `
    <div class="t7-ielts-flow-chart-creator">
      <form id="teacherForm">
        <label for="title">Tiêu đề:</label>
        <input type="text" id="title" name="title" value="${question.content[0]}" required>

        <label for="instructions">Hướng dẫn:</label>
        <textarea id="instructions" name="instructions" required>${question.content[1]}</textarea>

        <div id="questionForms">
          <div class="t7-question-form">
            <h3>Câu hỏi 1</h3>
            <label for="flowItems1">Các mục lưu đồ (mỗi mục một dòng, sử dụng ___ cho khoảng trống):</label>
            <textarea id="flowItems1" name="flowItems1" required>${question.content.slice(2, 2 + Math.floor(question.content.length / 2)).join("\n")}</textarea>
            <label for="options1">Lựa chọn (mỗi lựa chọn một dòng):</label>
            <textarea id="options1" name="options1" required>${question.content.slice(2 + Math.floor(question.content.length / 2)).join("\n")}</textarea>
            <label for="correctAnswers1">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
            <input type="text" id="correctAnswers1" name="correctAnswers1" value="${question.correctAnswers.join(", ")}" required>
          </div>
        </div>
      </form>
    </div>
  `
}

// Xóa câu hỏi
function deleteQuestion(index) {
  if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) {
    test[`part${window.currentPart}`].splice(index, 1)
    updateQuestionCount()
    renderQuestionsForCurrentPart()
    showNotification("Đã xóa câu hỏi thành công", "success")
  }
}

// Chuyển đến phần trước
function previousPart() {
  console.log("previousPart called, current part:", window.currentPart)
  if (window.currentPart > 1) {
    window.currentPart--
    console.log("Moving to previous part:", window.currentPart)
    renderTestCreation()
  } else {
    showNotification("Đây đã là phần đầu tiên", "info")
  }
}

// Chuyển đến phần tiếp theo
function nextPart() {
  console.log("nextPart called, current part:", window.currentPart)
  if (window.currentPart < 4) {
    window.currentPart++
    console.log("Moving to next part:", window.currentPart)
    renderTestCreation()
  } else {
    showNotification("Đây đã là phần cuối cùng", "info")
  }
}

// Kiểm tra tính hợp lệ của dữ liệu trước khi gửi
// function validateTestData(testData) {
//   const errors = []

//   // Kiểm tra các trường bắt buộc
//   if (!testData.title) {
//     errors.push("Tiêu đề bài kiểm tra không được để trống")
//   }

//   // Kiểm tra có ít nhất một câu hỏi
//   let hasQuestions = false
//   for (let i = 1; i <= 4; i++) {
//     if (testData[`part${i}`] && testData[`part${i}`].length > 0) {
//       hasQuestions = true
//       break
//     }
//   }

//   if (!hasQuestions) {
//     errors.push("Bài kiểm tra phải có ít nhất một câu hỏi")
//   }

//   // Kiểm tra từng câu hỏi
//   for (let i = 1; i <= 4; i++) {
//     if (testData[`part${i}`]) {
//       testData[`part${i}`].forEach((question, index) => {
//         if (!question.type) {
//           errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có loại`)
//         }
//         if (!question.content || question.content.length === 0) {
//           errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có nội dung`)
//         }
//         if (
//           !question.correctAnswers ||
//           (Array.isArray(question.correctAnswers) && question.correctAnswers.length === 0) ||
//           (typeof question.correctAnswers === "string" && question.correctAnswers.trim() === "")
//         ) {
//           errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có đáp án đúng`)
//         }

//         // Kiểm tra đặc biệt cho từng loại câu hỏi
//         if (question.type === "Ghi nhãn Bản đồ/Sơ đồ") {
//           if (!question.content[2] || question.content[2].trim() === "") {
//             errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có hình ảnh`)
//           }
//         }
//       })
//     }
//   }

//   return {
//     isValid: errors.length === 0,
//     errors,
//   }
// }

// Thêm hàm kiểm tra kết nối server trước khi lưu
async function checkServerBeforeSave() {
  try {
    // Hiển thị thông báo đang kiểm tra
    showNotification("Đang kiểm tra kết nối server...", "info")

    // Kiểm tra kết nối
    const isConnected = await window.checkServerConnection()

    if (isConnected) {
      showNotification("Kết nối server thành công, đang lưu bài kiểm tra...", "info")
      return true
    } else {
      showNotification("Không thể kết nối đến server. Bài kiểm tra sẽ được lưu cục bộ.", "warning")
      return false
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra kết nối server:", error)
    showNotification("Lỗi khi kiểm tra kết nối server. Bài kiểm tra sẽ được lưu cục bộ.", "warning")
    return false
  }
}

// Cập nhật hàm saveTest để kiểm tra kết nối trước khi lưu
function saveTest() {
  try {
    console.log("Saving test data from test-management.js...")

    // Get the global test object
    const globalTest = window.test || {
      title: "",
      vietnameseName: "",
      description: "",
      part1: [],
      part2: [],
      part3: [],
      part4: [],
    }

    // Update test metadata from form inputs
    globalTest.title = document.getElementById("testTitle").value
    globalTest.vietnameseName = document.getElementById("testVietnameseName").value
    globalTest.description = document.getElementById("testDescription").value

    // Validate test metadata
    if (!globalTest.title) {
      showNotification("Vui lòng nhập tiêu đề bài kiểm tra", "error")
      return
    }

    // Ensure all questions in the DOM are reflected in the test object
    let totalQuestions = 0
    let questionsUpdated = 0

    for (let i = 1; i <= 4; i++) {
      const partElement = document.getElementById(`part${i}`)
      if (partElement) {
        // Get all question elements in this part
        const questionElements = partElement.querySelectorAll(".question")
        console.log(`Found ${questionElements.length} questions in part${i} DOM`)
        totalQuestions += questionElements.length

        // Initialize the part array if it doesn't exist
        if (!globalTest[`part${i}`]) {
          globalTest[`part${i}`] = []
        }

        // Ensure each DOM question has a corresponding entry in the test object
        questionElements.forEach((questionElement, index) => {
          // Try to determine the question type from the element
          const typeElement = questionElement.querySelector("h3")
          const questionType = typeElement
            ? typeElement.textContent.replace(/^[\s\S]*?(\w+\s+\w+\s*\/?\s*\w*)$/, "$1").trim()
            : "Unknown Type"

          // If the question doesn't exist in the test object or is at a different index, update it
          if (index >= globalTest[`part${i}`].length || !globalTest[`part${i}`][index]) {
            // Extract question data based on type
            let questionData = null

            switch (questionType) {
              case "Một đáp án":
                questionData = extractOneAnswerData(questionElement)
                break
              case "Nhiều đáp án":
                questionData = extractMultipleAnswerData(questionElement)
                break
              case "Ghép nối":
                questionData = extractMatchingData(questionElement)
                break
              case "Ghi nhãn Bản đồ/Sơ đồ":
                questionData = extractPlanMapDiagramData(questionElement)
                break
              case "Hoàn thành ghi chú":
                questionData = extractNoteCompletionData(questionElement)
                break
              case "Hoàn thành bảng/biểu mẫu":
                questionData = extractFormTableCompletionData(questionElement)
                break
              case "Hoàn thành lưu đồ":
                questionData = extractFlowChartCompletionData(questionElement)
                break
              default:
                questionData = {
                  type: questionType,
                  content: ["Question content needs to be rebuilt"],
                  correctAnswers: ["Answer needs to be rebuilt"],
                }
            }

            // Add or update the question in the test object
            if (index < globalTest[`part${i}`].length) {
              globalTest[`part${i}`][index] = questionData
            } else {
              globalTest[`part${i}`].push(questionData)
            }

            questionsUpdated++
          }
        })

        // Remove any extra questions from the test object that aren't in the DOM
        if (globalTest[`part${i}`].length > questionElements.length) {
          globalTest[`part${i}`].splice(questionElements.length)
        }
      }
    }

    // Update the global test object
    window.test = globalTest

    // Log the test object to verify parts are included
    console.log("Test to be saved:", globalTest)
    console.log(`Total questions: ${totalQuestions}, Updated: ${questionsUpdated}`)

    // Validate test data
    const validationResult = validateTestData(globalTest)
    if (!validationResult.isValid) {
      // Show validation errors
      let errorMessage = "Vui lòng sửa các lỗi sau trước khi lưu:<ul>"
      validationResult.errors.forEach((error) => {
        errorMessage += `<li>${error}</li>`
      })
      errorMessage += "</ul>"

      showNotification(errorMessage, "error")

      // Nếu có cảnh báo, hiển thị nhưng vẫn cho phép lưu
      if (validationResult.warnings.length > 0) {
        let warningMessage = "Cảnh báo:<ul>"
        validationResult.warnings.forEach((warning) => {
          warningMessage += `<li>${warning}</li>`
        })
        warningMessage += "</ul>"

        // Hiển thị cảnh báo sau 1 giây để không bị che bởi thông báo lỗi
        setTimeout(() => {
          showNotification(warningMessage, "warning")
        }, 1000)
      }

      return
    } else if (validationResult.warnings.length > 0) {
      // Nếu chỉ có cảnh báo, hiển thị và hỏi người dùng có muốn tiếp tục không
      let warningMessage = "Cảnh báo:<ul>"
      validationResult.warnings.forEach((warning) => {
        warningMessage += `<li>${warning}</li>`
      })
      warningMessage += "</ul>Bạn có muốn tiếp tục lưu không?"

      if (!confirm(warningMessage)) {
        return
      }
    }

    // Show saving notification
    showNotification("Đang lưu bài kiểm tra...", "info")

    // Thêm progress indicator
    const progressIndicator = document.createElement("div")
    progressIndicator.className = "progress-indicator"
    progressIndicator.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div class="progress-text">Đang lưu... 0%</div>
    `
    document.body.appendChild(progressIndicator)

    // Animate progress
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += 5
      if (progress > 90) {
        clearInterval(progressInterval)
      }
      const progressFill = progressIndicator.querySelector(".progress-fill")
      const progressText = progressIndicator.querySelector(".progress-text")
      if (progressFill && progressText) {
        progressFill.style.width = `${progress}%`
        progressText.textContent = `Đang lưu... ${progress}%`
      }
    }, 200)

    // Kiểm tra kết nối server trước khi lưu
    checkServerBeforeSave().then((isConnected) => {
      // Save to server using the client-integration.js function
      if (typeof saveTestToServer === "function") {
        saveTestToServer(globalTest)
          .then((response) => {
            console.log("Test saved successfully:", response)

            // Complete progress
            clearInterval(progressInterval)
            const progressFill = progressIndicator.querySelector(".progress-fill")
            const progressText = progressIndicator.querySelector(".progress-text")
            if (progressFill && progressText) {
              progressFill.style.width = "100%"
              progressText.textContent = "Hoàn thành 100%"
            }

            // Remove progress indicator after a delay
            setTimeout(() => {
              if (progressIndicator.parentNode) {
                progressIndicator.parentNode.removeChild(progressIndicator)
              }
            }, 1000)

            showNotification(
              `Bài kiểm tra "${globalTest.vietnameseName || globalTest.title}" đã được lưu thành công!`,
              "success",
            )

            // Nếu lưu offline, hiển thị thông báo bổ sung
            if (response.offline) {
              setTimeout(() => {
                showNotification("Bài kiểm tra đã được lưu cục bộ và sẽ được đồng bộ khi có kết nối internet.", "info")
              }, 1000)
            }
          })
          .catch((error) => {
            console.error("Error saving test:", error)

            // Remove progress indicator
            if (progressIndicator.parentNode) {
              progressIndicator.parentNode.removeChild(progressIndicator)
            }

            // Hiển thị thông báo lỗi chi tiết
            let errorMessage = error.message || "Lỗi không xác định"
            if (error.response) {
              errorMessage = `Lỗi server (${error.response.status}): ${error.response.statusText}`
            } else if (error.request) {
              errorMessage = "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng."
            }

            showNotification(`Lỗi khi lưu bài kiểm tra: ${errorMessage}`, "error")

            // Hiển thị tùy chọn lưu offline nếu lỗi kết nối
            if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
              setTimeout(() => {
                if (confirm("Không thể kết nối đến máy chủ. Bạn có muốn lưu bài kiểm tra cục bộ không?")) {
                  // Lưu offline
                  const offlineId = saveTestOfflineFn(normalizeTestData(globalTest))
                  if (offlineId) {
                    showNotification(
                      "Bài kiểm tra đã được lưu cục bộ và sẽ được đồng bộ khi có kết nối internet.",
                      "success",
                    )
                  } else {
                    showNotification("Không thể lưu bài kiểm tra cục bộ.", "error")
                  }
                }
              }, 1000)
            }
          })
      } else {
        console.warn("saveTestToServer function not available")

        // Remove progress indicator
        if (progressIndicator.parentNode) {
          progressIndicator.parentNode.removeChild(progressIndicator)
        }

        showNotification("Hàm lưu bài kiểm tra không khả dụng", "warning")

        // Lưu offline nếu hàm saveTestToServer không khả dụng
        const offlineId = saveTestOfflineFn(globalTest)
        if (offlineId) {
          showNotification("Bài kiểm tra đã được lưu cục bộ.", "success")
        }
      }
    })
  } catch (error) {
    console.error("Error in saveTest function:", error)
    showNotification(`Lỗi: ${error.message || "Lỗi không xác định"}`, "error")
  }
}

// Thêm hàm lưu offline
function saveTestOfflineFn(testData) {
  try {
    // Tạo ID tạm thời
    const tempId = `offline_${Date.now()}`

    // Lưu vào localStorage
    const offlineTests = JSON.parse(localStorage.getItem("offlineTests") || "[]")
    offlineTests.push({
      id: tempId,
      data: testData,
      timestamp: Date.now(),
    })

    localStorage.setItem("offlineTests", JSON.stringify(offlineTests))
    console.log("Đã lưu bài kiểm tra offline:", tempId)

    return tempId
  } catch (error) {
    console.error("Lỗi khi lưu offline:", error)
    return null
  }
}

// Cập nhật hàm validateTestData để kiểm tra kỹ hơn
function validateTestData(testData) {
  const errors = []
  const warnings = []

  // Kiểm tra các trường bắt buộc
  if (!testData.title) {
    errors.push("Tiêu đề bài kiểm tra không được để trống")
  }

  // Kiểm tra có ít nhất một câu hỏi
  let hasQuestions = false
  let totalQuestions = 0
  for (let i = 1; i <= 4; i++) {
    if (testData[`part${i}`] && testData[`part${i}`].length > 0) {
      hasQuestions = true
      totalQuestions += testData[`part${i}`].length
    } else {
      warnings.push(`Phần ${i} không có câu hỏi nào`)
    }
  }

  if (!hasQuestions) {
    errors.push("Bài kiểm tra phải có ít nhất một câu hỏi")
  }

  // Kiểm tra từng câu hỏi
  for (let i = 1; i <= 4; i++) {
    if (testData[`part${i}`]) {
      testData[`part${i}`].forEach((question, index) => {
        if (!question.type) {
          errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có loại`)
        }
        if (!question.content || question.content.length === 0) {
          errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có nội dung`)
        }
        if (
          !question.correctAnswers ||
          (Array.isArray(question.correctAnswers) && question.correctAnswers.length === 0) ||
          (typeof question.correctAnswers === "string" && question.correctAnswers.trim() === "")
        ) {
          errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có đáp án đúng`)
        }

        // Kiểm tra đặc biệt cho từng loại câu hỏi
        if (question.type === "Ghi nhãn Bản đồ/Sơ đồ") {
          if (!question.content[2] || question.content[2].trim() === "") {
            errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có hình ảnh`)
          }
        } else if (question.type === "Một đáp án") {
          if (question.content.length < 2) {
            errors.push(`Câu hỏi ${index + 1} trong Phần ${i} phải có ít nhất một lựa chọn`)
          }
        } else if (question.type === "Nhiều đáp án") {
          if (question.content.length < 2) {
            errors.push(`Câu hỏi ${index + 1} trong Phần ${i} phải có ít nhất một lựa chọn`)
          }
          if (!Array.isArray(question.correctAnswers)) {
            errors.push(`Câu hỏi ${index + 1} trong Phần ${i} phải có đáp án dạng mảng`)
          }
        }
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// Helper functions to extract question data from DOM elements
function extractOneAnswerData(questionElement) {
  const questionText = questionElement.querySelector("#t3-questionText")?.value || "Default question"
  const optionsText = questionElement.querySelector("#t3-options")?.value || ""
  const options = optionsText.split("\n").filter((option) => option.trim() !== "")
  const correctAnswer = questionElement.querySelector("#t3-correctAnswer")?.value || options[0] || "Default answer"

  return {
    type: "Một đáp án",
    content: [questionText, ...options],
    correctAnswers: correctAnswer,
  }
}

// Add similar extraction functions for other question types
function extractMultipleAnswerData(questionElement) {
  const questionText = questionElement.querySelector("#t4-questionText")?.value || "Default question"
  const optionsText = questionElement.querySelector("#t4-options")?.value || ""
  const options = optionsText.split("\n").filter((option) => option.trim() !== "")
  const correctAnswersText = questionElement.querySelector("#t4-correctAnswers")?.value || ""
  const correctAnswers = correctAnswersText
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")

  return {
    type: "Nhiều đáp án",
    content: [questionText, ...options],
    correctAnswers: correctAnswers,
  }
}

function extractMatchingData(questionElement) {
  const questionTitle = questionElement.querySelector("#t3-questionTitle")?.value || "Default title"
  const peopleText = questionElement.querySelector("#t3-people")?.value || ""
  const responsibilitiesText = questionElement.querySelector("#t3-responsibilities")?.value || ""
  const correctAnswersText = questionElement.querySelector("#t3-correctAnswers")?.value || ""

  const people = peopleText.split("\n").filter((item) => item.trim() !== "")
  const responsibilities = responsibilitiesText.split("\n").filter((item) => item.trim() !== "")
  const correctAnswers = correctAnswersText.split("\n").filter((item) => item.trim() !== "")

  return {
    type: "Ghép nối",
    content: [questionTitle, ...people, ...responsibilities],
    correctAnswers: correctAnswers,
  }
}

function extractPlanMapDiagramData(questionElement) {
  const questionType = questionElement.querySelector("#questionType")?.value || "map"
  const instructions = questionElement.querySelector("#instructions")?.value || "Default instructions"

  // Collect labels and correct answers from the form
  const labels = []
  const correctAnswers = []
  let i = 0
  while (questionElement.querySelector(`#answer${i}`)) {
    labels.push(questionElement.querySelector(`#answer${i}`)?.value || "")
    correctAnswers.push(questionElement.querySelector(`#correctAnswer${i}`)?.value || "")
    i++
  }

  // Get the existing image URL (it's not directly editable in the form)
  const imageElement = questionElement.querySelector("img")
  const imageFile = imageElement ? imageElement.src : ""

  return {
    type: "Ghi nhãn Bản đồ/Sơ đồ",
    content: [questionType, instructions, imageFile, ...labels],
    correctAnswers: correctAnswers,
  }
}

function extractNoteCompletionData(questionElement) {
  const instructions =
    questionElement.querySelector("#t2ListeningExerciseInstructions")?.value || "Default instructions"
  const topic = questionElement.querySelector("#t2ListeningExerciseTopic")?.value || "Default topic"

  const questions = []
  const correctAnswers = []
  let i = 1
  while (questionElement.querySelector(`#t2ListeningExerciseQuestion${i}`)) {
    questions.push(questionElement.querySelector(`#t2ListeningExerciseQuestion${i}`)?.value || "")
    correctAnswers.push(questionElement.querySelector(`#t2ListeningExerciseCorrectAnswers${i} input`)?.value || "")
    i++
  }

  return {
    type: "Hoàn thành ghi chú",
    content: [instructions, topic, ...questions],
    correctAnswers: correctAnswers,
  }
}

function extractFormTableCompletionData(questionElement) {
  const tableInstruction = questionElement.querySelector("#tableInstruction")?.value || "Default instruction"
  const content = [tableInstruction]
  const correctAnswers = []

  const tableRows = questionElement.querySelectorAll("#fareTable tr")
  for (let i = 1; i < tableRows.length; i++) {
    const row = tableRows[i]
    const cells = row.querySelectorAll("td")

    content.push(cells[0].querySelector("input")?.value || "")
    content.push(cells[1].querySelector("input")?.value || "")
    content.push(cells[2].querySelector("input")?.value || "")
    correctAnswers.push(cells[3].querySelector(".t6-correct-answer-input")?.value || "")
  }

  return {
    type: "Hoàn thành bảng/biểu mẫu",
    content: content,
    correctAnswers: correctAnswers,
  }
}

function extractFlowChartCompletionData(questionElement) {
  const title = questionElement.querySelector("#title")?.value || "Default title"
  const instructions = questionElement.querySelector("#instructions")?.value || "Default instructions"
  const flowItemsText = questionElement.querySelector("#flowItems1")?.value || ""
  const optionsText = questionElement.querySelector("#options1")?.value || ""
  const correctAnswersText = questionElement.querySelector("#correctAnswers1")?.value || ""

  const flowItems = flowItemsText.split("\n").filter((item) => item.trim() !== "")
  const options = optionsText.split("\n").filter((item) => item.trim() !== "")
  const correctAnswers = correctAnswersText
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "")

  return {
    type: "Hoàn thành lưu đồ",
    content: [title, instructions, ...flowItems, ...options],
    correctAnswers: correctAnswers,
  }
}

// Xác thực metadata bài kiểm tra
function validateTestMetadata() {
  if (!test.title) {
    showNotification("Vui lòng nhập tiêu đề bài kiểm tra", "error")
    return false
  }
  return true
}

// Xác thực câu hỏi phần
function validatePartQuestions() {
  // Tối thiểu 2 câu hỏi mỗi phần được khuyến nghị nhưng không bắt buộc
  const warnings = []
  for (let i = 1; i <= 4; i++) {
    const partQuestions = test[`part${i}`]?.length || 0
    if (partQuestions === 0) {
      warnings.push(`Phần ${i} không có câu hỏi nào`)
    }
  }

  if (warnings.length > 0) {
    return confirm(`Cảnh báo:
${warnings.join("\n")}

Bạn có muốn tiếp tục lưu không?`)
  }

  return true
}

// Lấy danh sách bài kiểm tra
async function showTestList() {
  try {
    showNotification("Đang tải danh sách bài kiểm tra...", "info")

    const tests = await getTests()

    if (!tests || tests.length === 0) {
      showNotification("Không tìm thấy bài kiểm tra nào", "info")
      return
    }

    // Tạo modal để hiển thị danh sách
    const modal = document.createElement("div")
    modal.className = "test-list-modal"
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
      <div class="test-list-content" style="background-color: white; padding: 20px; border-radius: 8px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <span class="close-button" style="float: right; font-size: 24px; cursor: pointer;">&times;</span>
        <h2>Danh sách bài kiểm tra</h2>
        <div class="test-list">
          ${tests
            .map(
              (test) => `
            <div class="test-item" data-id="${test.id}" style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
              <h3 style="margin-top: 0;">${test.vietnamese_name || test.title}</h3>
              <p class="test-english-name" style="color: #666; font-style: italic;">${test.title}</p>
              <p>${test.description || "Không có mô tả"}</p>
              <div class="test-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                <button class="load-test-btn" style="background-color: #003366; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Tải</button>
                <button class="delete-test-btn" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Xóa</button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Xử lý nút đóng
    const closeButton = modal.querySelector(".close-button")
    closeButton.addEventListener("click", () => {
      document.body.removeChild(modal)
    })

    // Xử lý nút tải bài kiểm tra
    const loadButtons = modal.querySelectorAll(".load-test-btn")
    loadButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const testId = button.closest(".test-item").dataset.id
        loadTestFromServer(testId)
        document.body.removeChild(modal)
      })
    })

    // Xử lý nút xóa bài kiểm tra
    const deleteButtons = modal.querySelectorAll(".delete-test-btn")
    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const testItem = button.closest(".test-item")
        const testId = testItem.dataset.id
        const testTitle = testItem.querySelector("h3").textContent

        if (confirm(`Bạn có chắc chắn muốn xóa bài kiểm tra "${testTitle}"?`)) {
          deleteTest(testId)
            .then(() => {
              testItem.remove()
              showNotification(`Đã xóa bài kiểm tra "${testTitle}"`, "success")

              // Nếu không còn bài kiểm tra nào, đóng modal
              if (modal.querySelectorAll(".test-item").length === 0) {
                document.body.removeChild(modal)
                showNotification("Không còn bài kiểm tra nào", "info")
              }
            })
            .catch((error) => {
              console.error("Lỗi khi xóa bài kiểm tra:", error)
              showNotification(`Lỗi khi xóa bài kiểm tra: ${error.message}`, "error")
            })
        }
      })
    })
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài kiểm tra:", error)
    showNotification(`Lỗi khi lấy danh sách bài kiểm tra: ${error.message}`, "error")
  }
}

// Tải bài kiểm tra từ server
async function loadTestFromServer(testId) {
  try {
    showNotification("Đang tải bài kiểm tra...", "info")

    const testData = await getTestById(testId)

    if (!testData) {
      showNotification("Không thể tải bài kiểm tra", "error")
      return
    }

    // Chuyển đổi dữ liệu từ định dạng server sang định dạng frontend
    test = {
      title: testData.title || "",
      vietnameseName: testData.vietnamese_name || "",
      description: testData.description || "",
      part1: [],
      part2: [],
      part3: [],
      part4: [],
    }

    // Xử lý dữ liệu parts và questions
    if (testData.parts && Array.isArray(testData.parts)) {
      testData.parts.forEach((part) => {
        const partNumber = part.part_number

        if (partNumber >= 1 && partNumber <= 4) {
          // Đảm bảo questions là một mảng
          const questions = Array.isArray(part.questions) ? part.questions : []

          // Chuyển đổi mỗi câu hỏi
          questions.forEach((question) => {
            // Chuyển đổi content từ JSON string sang object nếu cần
            let content = question.content
            if (typeof content === "string") {
              try {
                content = JSON.parse(content)
              } catch (e) {
                console.error("Lỗi khi phân tích nội dung câu hỏi:", e)
                content = []
              }
            }

            // Chuyển đổi correct_answers từ JSON string sang object nếu cần
            let correctAnswers = question.correct_answers
            if (typeof correctAnswers === "string") {
              try {
                correctAnswers = JSON.parse(correctAnswers)
              } catch (e) {
                console.error("Lỗi khi phân tích đáp án đúng:", e)
                correctAnswers = []
              }
            }

            // Thêm câu hỏi vào phần tương ứng
            test[`part${partNumber}`].push({
              type: question.question_type,
              content: content,
              correctAnswers: correctAnswers,
            })
          })
        }
      })
    }

    // Cập nhật tổng số câu hỏi
    updateQuestionCount()

    // Hiển thị bài kiểm tra đã tải
    showNotification(`Đã tải bài kiểm tra "${test.vietnameseName || test.title}"`, "success")

    // Chuyển đến trang tạo bài kiểm tra nếu đang ở trang chọn
    if (!document.getElementById("selectionPage").classList.contains("hidden")) {
      document.getElementById("selectionPage").classList.add("hidden")
      document.getElementById("testCreationPage").classList.remove("hidden")
    }

    // Hiển thị phần 1 mặc định
    window.currentPart = 1
    renderTestCreation()
  } catch (error) {
    console.error("Lỗi khi tải bài kiểm tra:", error)
    showNotification(`Lỗi khi tải bài kiểm tra: ${error.message}`, "error")
  }
}

// Xuất bài kiểm tra ra tệp JSON
function exportTest() {
  // Cập nhật tiêu đề và mô tả từ form
  test.title = document.getElementById("testTitle").value
  test.vietnameseName = document.getElementById("testVietnameseName").value
  test.description = document.getElementById("testDescription").value

  const testData = JSON.stringify(test, null, 2)
  const blob = new Blob([testData], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ielts_listening_test_${test.title.replace(/\s+/g, "_")}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  showNotification("Đã xuất bài kiểm tra thành công", "success")
}

// Nhập bài kiểm tra từ tệp JSON
function importTest() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = "application/json"
  input.onchange = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedTest = JSON.parse(event.target.result)

        // Kiểm tra cấu trúc dữ liệu
        if (
          !importedTest.title ||
          !importedTest.part1 ||
          !importedTest.part2 ||
          !importedTest.part3 ||
          !importedTest.part4
        ) {
          throw new Error("Tệp JSON không đúng định dạng bài kiểm tra")
        }

        test = importedTest

        // Chuyển đến trang tạo bài kiểm tra nếu đang ở trang chọn
        if (!document.getElementById("selectionPage").classList.contains("hidden")) {
          document.getElementById("selectionPage").classList.add("hidden")
          document.getElementById("testCreationPage").classList.remove("hidden")
        }

        // Cập nhật tổng số câu hỏi
        updateQuestionCount()

        // Hiển thị phần 1 mặc định
        window.currentPart = 1
        renderTestCreation()

        showNotification(`Đã nhập bài kiểm tra "${test.title}" thành công`, "success")
      } catch (error) {
        console.error("Lỗi khi phân tích bài kiểm tra đã nhập:", error)
        showNotification(`Lỗi khi nhập bài kiểm tra: ${error.message}`, "error")
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

// Xem trước toàn bộ bài kiểm tra
function previewEntireTest() {
  // Cập nhật tiêu đề và mô tả từ form
  test.title = document.getElementById("testTitle").value
  test.vietnameseName = document.getElementById("testVietnameseName").value
  test.description = document.getElementById("testDescription").value

  const previewWindow = window.open("", "Preview", "width=800,height=600")
  let previewContent = `<h1>${test.vietnameseName || test.title}</h1>`

  if (test.title !== test.vietnameseName && test.vietnameseName) {
    previewContent += `<h2 class="english-title">${test.title}</h2>`
  }

  if (test.description) {
    previewContent += `<p>${test.description}</p>`
  }

  previewContent += "<h2>IELTS Listening Test</h2>"

  for (let i = 1; i <= 4; i++) {
    previewContent += `<h3>Phần ${i}</h3>`
    const partQuestions = test[`part${i}`] || []

    if (partQuestions.length === 0) {
      previewContent += `<p>Không có câu hỏi trong phần này</p>`
    } else {
      partQuestions.forEach((question, index) => {
        previewContent += `
          <div class="preview-question">
            <h4>Câu hỏi ${index + 1}: ${question.type}</h4>
            <div>${renderQuestionPreview(question)}</div>
          </div>
        `
      })
    }
  }

  // Thêm một số kiểu cơ bản
  previewContent = `
    <html>
      <head>
        <title>Xem trước bài kiểm tra IELTS Listening</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 20px; line-height: 1.6; color: #333; }
          h1 { color: #003366; text-align: center; }
          h2 { color: #003366; text-align: center; margin-bottom: 30px; }
          h2.english-title { color: #666; font-style: italic; font-size: 1.2em; margin-top: -10px; margin-bottom: 20px; }
          h3 { color: #003366; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          h4 { margin-bottom: 5px; color: #003366; }
          .preview-question { margin-bottom: 20px; border: 1px solid #eee; padding: 15px; border-radius: 5px; }
          .correct-answer { color: #27ae60; font-weight: bold; }
          img { max-width: 100%; height: auto; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .blank { display: inline-block; width: 100px; border-bottom: 1px solid #000; }
        </style>
      </head>
      <body>
        ${previewContent}
      </body>
    </html>
  `

  previewWindow.document.write(previewContent)
  previewWindow.document.close()
}

// Hiển thị xem trước câu hỏi cho cửa sổ xem trước
function renderQuestionPreview(question) {
  switch (question.type) {
    case "Một đáp án":
      return `
        <p><strong>Câu hỏi:</strong> ${question.content[0]}</p>
        <p><strong>Lựa chọn:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map(
              (option) =>
                `<li>${option} ${option === question.correctAnswers ? '<span class="correct-answer">(Đúng)</span>' : ""}</li>`,
            )
            .join("")}
        </ul>
      `
    case "Nhiều đáp án":
      return `
        <p><strong>Câu hỏi:</strong> ${question.content[0]}</p>
        <p><strong>Lựa chọn:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map(
              (option, index) =>
                `<li>${option} ${question.correctAnswers.includes((index + 1).toString()) ? '<span class="correct-answer">(Đúng)</span>' : ""}</li>`,
            )
            .join("")}
        </ul>
      `
    case "Ghép nối":
      const midPoint = Math.ceil(question.content.length / 2)
      return `
        <p><strong>Tiêu đề:</strong> ${question.content[0]}</p>
        <div style="display: flex; gap: 20px;">
          <div style="flex: 1;">
            <h4>Mục</h4>
            <ul>
              ${question.content
                .slice(1, midPoint)
                .map((item, idx) => `<li>${item} → ${question.correctAnswers[idx] || ""}</li>`)
                .join("")}
            </ul>
          </div>
          <div style="flex: 1;">
            <h4>Lựa chọn</h4>
            <ul>
              ${question.content
                .slice(midPoint)
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
        </div>
      `
    case "Ghi nhãn Bản đồ/Sơ đồ":
      return `
        <p><strong>Loại:</strong> ${question.content[0]}</p>
        <p><strong>Hướng dẫn:</strong> ${question.content[1]}</p>
        <div>
          <img src="${question.content[2]}" alt="Sơ đồ" style="max-width: 400px;">
        </div>
        <p><strong>Nhãn:</strong></p>
        <ul>
          ${question.content
            .slice(3)
            .map((label, idx) => `<li>${label} → ${question.correctAnswers[idx] || ""}</li>`)
            .join("")}
        </ul>
      `
    case "Hoàn thành ghi chú":
      return `
        <p><strong>Hướng dẫn:</strong> ${question.content[0]}</p>
        <p><strong>Chủ đề:</strong> ${question.content[1]}</p>
        <div>
          ${question.content
            .slice(2)
            .map((note, idx) => {
              // Thay thế [ANSWER] bằng đáp án đúng và làm nổi bật nó
              const highlightedNote = note.replace(
                /\[ANSWER\]/g,
                `<span class="correct-answer">${question.correctAnswers[idx] || "_____"}</span>`,
              )
              return `<p>${idx + 1}. ${highlightedNote}</p>`
            })
            .join("")}
        </div>
      `
    case "Hoàn thành bảng/biểu mẫu":
      const rowCount = Math.floor((question.content.length - 1) / 3)
      return `
        <p><strong>Hướng dẫn:</strong> ${question.content[0]}</p>
        <table>
          <tr>
            <th>Cột 1</th>
            <th>Cột 2</th>
            <th>Cột 3</th>
          </tr>
          ${Array(rowCount)
            .fill()
            .map((_, rowIdx) => {
              const startIdx = 1 + rowIdx * 3
              return `
            <tr>
              <td>${question.content[startIdx] || ""}</td>
              <td>${question.content[startIdx + 1] || ""}</td>
              <td>${question.content[startIdx + 2] || ""}</td>
            </tr>
          `
            })
            .join("")}
        </table>
      `
    case "Hoàn thành lưu đồ":
      const flowItemCount = Math.floor(question.content.length / 2)
      return `
        <p><strong>Tiêu đề:</strong> ${question.content[0]}</p>
        <p><strong>Hướng dẫn:</strong> ${question.content[1]}</p>
        <div style="display: flex; flex-direction: column; align-items: center;">
          ${question.content
            .slice(2, 2 + flowItemCount)
            .map((item, idx) => {
              // Thay thế ___ bằng đáp án đúng và làm nổi bật nó
              const highlightedItem = item.replace(
                /___/g,
                `<span class="correct-answer">${question.correctAnswers[idx] || "_____"}</span>`,
              )
              return `
              <div style="border: 1px solid #ddd; padding: 10px; margin: 5px; width: 80%; text-align: center;">
                ${highlightedItem}
              </div>
              ${idx < flowItemCount - 1 ? '<div style="font-size: 24px;">↓</div>' : ""}
            `
            })
            .join("")}
        </div>
        <p><strong>Lựa chọn:</strong> ${question.content.slice(2 + flowItemCount).join(", ")}</p>
      `
    default:
      return `<p>Loại câu hỏi không xác định: ${question.type}</p>`
  }
}

// Tạo bài kiểm tra mới
function createNewTest() {
  if (confirm("Bạn có chắc chắn muốn tạo bài kiểm tra mới? Dữ liệu hiện tại sẽ bị mất.")) {
    // Đặt lại đối tượng bài kiểm tra
    test = {
      title: "",
      description: "",
      part1: [],
      part2: [],
      part3: [],
      part4: [],
    }

    // Đặt lại biến toàn cục
    totalQuestions = 0
    window.currentPart = 1

    // Hiển thị trang chọn loại câu hỏi
    document.getElementById("testCreationPage").classList.add("hidden")
    document.getElementById("selectionPage").classList.remove("hidden")

    showNotification("Đã tạo bài kiểm tra mới", "success")
  }
}

// Sao chép bài kiểm tra
function duplicateTest() {
  // Cập nhật tiêu đề và mô tả từ form
  test.title = document.getElementById("testTitle").value
  test.description = document.getElementById("testDescription").value

  // Tạo bản sao của bài kiểm tra hiện tại
  const testCopy = JSON.parse(JSON.stringify(test))
  testCopy.title = `${test.title} (Bản sao)`

  // Lưu bản sao vào server
  saveTestToServer(testCopy)
    .then((response) => {
      showNotification(`Đã tạo bản sao của bài kiểm tra "${test.title}"`, "success")
      console.log("Đã tạo bản sao:", response)
    })
    .catch((error) => {
      showNotification(`Lỗi khi tạo bản sao: ${error.message}`, "error")
      console.error("Lỗi khi tạo bản sao:", error)
    })
}

// Tạo bài kiểm tra PDF
function generateTestPDF() {
  // Cập nhật tiêu đề và mô tả từ form
  test.title = document.getElementById("testTitle").value
  test.description = document.getElementById("testDescription").value

  // Kiểm tra tính hợp lệ của bài kiểm tra
  if (!showValidationResults()) {
    return
  }

  // Tạo nội dung PDF
  let content = `
    <h1>${test.title}</h1>
    <p>${test.description || ""}</p>
    <h2>IELTS Listening Test</h2>
  `

  for (let i = 1; i <= 4; i++) {
    content += `<h3>Phần ${i}</h3>`
    const partQuestions = test[`part${i}`] || []

    if (partQuestions.length === 0) {
      content += `<p>Không có câu hỏi trong phần này</p>`
    } else {
      partQuestions.forEach((question, index) => {
        content += `
          <div class="question">
            <h4>Câu hỏi ${index + 1}</h4>
            ${renderQuestionForPDF(question)}
          </div>
        `
      })
    }
  }

  // Tạo trang mới để hiển thị PDF
  const pdfWindow = window.open("", "PDF", "width=800,height=600")

  // Thêm kiểu CSS
  content = `
    <html>
      <head>
        <title>${test.title} - IELTS Listening Test</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 20px; }
          h1 { color: #003366; text-align: center; }
          h2 { color: #003366; text-align: center; margin-bottom: 30px; }
          h3 { color: #003366; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          h4 { margin-bottom: 5px; color: #003366; }
          .question { margin-bottom: 20px; page-break-inside: avoid; }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .blank { display: inline-block; width: 100px; border-bottom: 1px solid #000; }
          img { max-width: 100%; height: auto; }
          @media print {
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `

  pdfWindow.document.write(content)
  pdfWindow.document.close()

  // Tự động in sau khi tải xong
  pdfWindow.onload = () => {
    pdfWindow.print()
  }
}

// Hiển thị câu hỏi cho PDF
function renderQuestionForPDF(question) {
  // Loại bỏ đáp án đúng khi hiển thị trong PDF
  switch (question.type) {
    case "Một đáp án":
      return `
        <p>${question.content[0]}</p>
        <ul>
          ${question.content
            .slice(1)
            .map((option) => `<li>${option}</li>`)
            .join("")}
        </ul>
      `
    case "Nhiều đáp án":
      return `
        <p>${question.content[0]}</p>
        <ul>
          ${question.content
            .slice(1)
            .map((option) => `<li>${option}</li>`)
            .join("")}
        </ul>
      `
    case "Ghép nối":
      const midPoint = Math.ceil(question.content.length / 2)
      return `
        <p>${question.content[0]}</p>
        <div style="display: flex; gap: 20px;">
          <div style="flex: 1;">
            <h5>Mục</h5>
            <ul>
              ${question.content
                .slice(1, midPoint)
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
          <div style="flex: 1;">
            <h5>Lựa chọn</h5>
            <ul>
              ${question.content
                .slice(midPoint)
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
        </div>
      `
    case "Ghi nhãn Bản đồ/Sơ đồ":
      return `
        <p>${question.content[1]}</p>
        <div>
          <img src="${question.content[2]}" alt="Sơ đồ">
        </div>
        <ul>
          ${question.content
            .slice(3)
            .map((label, idx) => `<li>${label} ___</li>`)
            .join("")}
        </ul>
      `
    case "Hoàn thành ghi chú":
      return `
        <p>${question.content[0]}</p>
        <p><strong>${question.content[1]}</strong></p>
        <div>
          ${question.content
            .slice(2)
            .map((note, idx) => {
              // Thay thế [ANSWER] bằng khoảng trống
              const formattedNote = note.replace(/\[ANSWER\]/g, '<span class="blank"></span>')
              return `<p>${idx + 1}. ${formattedNote}</p>`
            })
            .join("")}
        </div>
      `
    case "Hoàn thành bảng/biểu mẫu":
      const rowCount = Math.floor((question.content.length - 1) / 3)
      return `
        <p>${question.content[0]}</p>
        <table>
          <tr>
            <th>Cột 1</th>
            <th>Cột 2</th>
            <th>Cột 3</th>
          </tr>
          ${Array(rowCount)
            .fill()
            .map((_, rowIdx) => {
              const startIdx = 1 + rowIdx * 3
              return `
            <tr>
              <td>${question.content[startIdx] || ""}</td>
              <td>${question.content[startIdx + 1] || ""}</td>
              <td>${question.content[startIdx + 2] || ""}</td>
            </tr>
          `
            })
            .join("")}
        </table>
      `
    case "Hoàn thành lưu đồ":
      const flowItemCount = Math.floor(question.content.length / 2)
      return `
        <p>${question.content[0]}</p>
        <p>${question.content[1]}</p>
        <div style="display: flex; flex-direction: column; align-items: center;">
          ${question.content
            .slice(2, 2 + flowItemCount)
            .map((item, idx) => {
              // Thay thế ___ bằng khoảng trống
              const formattedItem = item.replace(/___/g, '<span class="blank"></span>')
              return `
            <div style="border: 1px solid #ddd; padding: 10px; margin: 5px; width: 80%; text-align: center;">
              ${formattedItem}
            </div>
            ${idx < flowItemCount - 1 ? '<div style="font-size: 24px;">↓</div>' : ""}
          `
            })
            .join("")}
        </div>
        <p>Lựa chọn: ${question.content.slice(2 + flowItemCount).join(", ")}</p>
      `
    default:
      return `<p>Loại câu hỏi không được hỗ trợ: ${question.type}</p>`
  }
}

// Xác thực bài kiểm tra
function validateTest() {
  const errors = []
  const warnings = []

  // Kiểm tra metadata
  if (!test.title) {
    errors.push("Bài kiểm tra chưa có tiêu đề")
  }

  // Kiểm tra số lượng câu hỏi
  let totalQuestionCount = 0
  for (let i = 1; i <= 4; i++) {
    const partQuestions = test[`part${i}`]?.length || 0
    totalQuestionCount += partQuestions

    if (partQuestions === 0) {
      warnings.push(`Phần ${i} không có câu hỏi nào`)
    }
  }

  if (totalQuestionCount === 0) {
    errors.push("Bài kiểm tra không có câu hỏi nào")
  }

  if (totalQuestionCount > MAX_QUESTIONS) {
    errors.push(`Bài kiểm tra có quá nhiều câu hỏi (${totalQuestionCount}/${MAX_QUESTIONS})`)
  }

  // Kiểm tra từng câu hỏi
  for (let i = 1; i <= 4; i++) {
    const partQuestions = test[`part${i}`] || []

    partQuestions.forEach((question, index) => {
      // Kiểm tra loại câu hỏi
      if (!question.type) {
        errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có loại`)
      }

      // Kiểm tra nội dung
      if (!question.content || question.content.length === 0) {
        errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có nội dung`)
      }

      // Kiểm tra đáp án
      if (
        !question.correctAnswers ||
        (Array.isArray(question.correctAnswers) && question.correctAnswers.length === 0) ||
        (typeof question.correctAnswers === "string" && question.correctAnswers.trim() === "")
      ) {
        errors.push(`Câu hỏi ${index + 1} trong Phần ${i} không có đáp án đúng`)
      }
    })
  }

  return { errors, warnings, isValid: errors.length === 0 }
}

// Hiển thị kết quả xác thực
function showValidationResults() {
  const { errors, warnings, isValid } = validateTest()

  let message = ""

  if (isValid) {
    if (warnings.length > 0) {
      message += "<strong>Cảnh báo:</strong><ul>"
      warnings.forEach((warning) => {
        message += `<li>${warning}</li>`
      })
      message += "</ul>"
      showNotification(message, "warning")
    } else {
      showNotification("Bài kiểm tra hợp lệ!", "success")
    }
  } else {
    message += "<strong>Lỗi:</strong><ul>"
    errors.forEach((error) => {
      message += `<li>${error}</li>`
    })
    message += "</ul>"

    if (warnings.length > 0) {
      message += "<strong>Cảnh báo:</strong><ul>"
      warnings.forEach((warning) => {
        message += `<li>${warning}</li>`
      })
      message += "</ul>"
    }

    showNotification(message, "error")
  }

  return isValid
}

// Thêm câu hỏi trực tiếp
function addQuestionDirectly(questionType) {
  console.log("addQuestionDirectly function called with type:", questionType)

  try {
    console.log("Creating new question of type:", questionType)

    // Make sure the part container exists
    const partId = `part${window.currentPart}`
    let partElement = document.getElementById(partId)

    if (!partElement) {
      console.warn(`Part element ${partId} not found, creating it`)
      partElement = document.createElement("div")
      partElement.id = partId
      partElement.className = "part"
      partElement.style.display = "block"

      const testContent = document.getElementById("testContent")
      if (testContent) {
        testContent.appendChild(partElement)
      } else {
        throw new Error("Test content container not found")
      }
    }

    // Create a new question object
    const newQuestion = {
      type: questionType,
      content: [],
      correctAnswers: [],
    }

    // Initialize default content based on question type
    switch (questionType) {
      case "Một đáp án":
        newQuestion.content = ["Nhập câu hỏi ở đây", "Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"]
        newQuestion.correctAnswers = "Lựa chọn A"
        break
      case "Nhiều đáp án":
        newQuestion.content = ["Nhập câu hỏi ở đây", "Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"]
        newQuestion.correctAnswers = ["1", "2"]
        break
      case "Ghép nối":
        newQuestion.content = ["Tiêu đề câu hỏi", "Mục 1", "Mục 2", "Mục 3", "Lựa chọn A", "Lựa chọn B", "Lựa chọn C"]
        newQuestion.correctAnswers = ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C"]
        break
      case "Ghi nhãn Bản đồ/Sơ đồ":
        newQuestion.content = [
          "map",
          "Hướng dẫn ghi nhãn bản đồ",
          "/placeholder.svg?height=300&width=400",
          "Nhãn 1",
          "Nhãn 2",
          "Nhãn 3",
        ]
        newQuestion.correctAnswers = ["Đáp án 1", "Đáp án 2", "Đáp án 3"]
        break
      case "Hoàn thành bảng/biểu mẫu":
        newQuestion.content = [
          "Hoàn thành bảng dưới đây",
          "Hàng 1 Cột 1",
          "Hàng 1 Cột 2",
          "Hàng 1 Cột 3",
          "Hàng 2 Cột 1",
          "Hàng 2 Cột 2",
          "Hàng 2 Cột 3",
        ]
        newQuestion.correctAnswers = ["Đáp án 1", "Đáp án 2"]
        break
      case "Hoàn thành lưu đồ":
        newQuestion.content = [
          "Tiêu đề lưu đồ",
          "Hoàn thành lưu đồ dưới đây",
          "Bước 1: ___",
          "Bước 2: ___",
          "Bước 3: ___",
          "Lựa chọn A",
          "Lựa chọn B",
          "Lựa chọn C",
        ]
        newQuestion.correctAnswers = ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C"]
        break
    }

    // Make sure the part array exists
    if (!test[`part${window.currentPart}`]) {
      test[`part${window.currentPart}`] = []
    }

    // Add the new question to the current part
    test[`part${window.currentPart}`].push(newQuestion)

    // Update the total question count
    updateQuestionCount()

    // Create the question form in the DOM
    const questionDiv = document.createElement("div")
    questionDiv.className = "question edit-mode" // New questions start in edit mode

    // Add question header
    const questionNumber = test[`part${window.currentPart}`].length
    questionDiv.innerHTML = `
      <h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionNumber}</h4>
      <h3>${getIconForType(questionType)} ${questionType}</h3>
      <button class="delete-question" onclick="deleteQuestion(${questionNumber - 1})"><i class="fas fa-trash"></i></button>
    `

    // Add the appropriate form based on type
    let formHTML = ""
    switch (questionType) {
      case "Một đáp án":
        formHTML =
          typeof window.createOneAnswerForm === "function" ? window.createOneAnswerForm() : createOneAnswerForm()
        break
      case "Nhiều đáp án":
        formHTML =
          typeof window.createMultipleAnswerForm === "function"
            ? window.createMultipleAnswerForm()
            : createMultipleAnswerForm()
        break
      case "Ghép nối":
        formHTML = typeof window.createMatchingForm === "function" ? window.createMatchingForm() : createMatchingForm()
        break
      case "Ghi nhãn Bản đồ/Sơ đồ":
        formHTML =
          typeof window.createPlanMapDiagramForm === "function"
            ? window.createPlanMapDiagramForm()
            : createPlanMapDiagramForm()
        break
      case "Hoàn thành ghi chú":
        formHTML =
          typeof window.createNoteCompletionForm === "function"
            ? window.createNoteCompletionForm()
            : createNoteCompletionForm()
        break
      case "Hoàn thành bảng/biểu mẫu":
        formHTML =
          typeof window.createFormTableCompletionForm === "function"
            ? window.createFormTableCompletionForm()
            : createFormTableCompletionForm()
        break
      case "Hoàn thành lưu đồ":
        formHTML =
          typeof window.createFlowChartCompletionForm === "function"
            ? window.createFlowChartCompletionForm()
            : createFlowChartCompletionForm()
        break
      default:
        formHTML = `<p>Không hỗ trợ loại câu hỏi: ${questionType}</p>`
    }

    // Add form HTML to question div
    questionDiv.innerHTML += formHTML

    // Add save and cancel buttons (edit button is hidden in edit mode)
    questionDiv.innerHTML += `
      <div class="question-actions">
        <button class="edit-question-btn" onclick="toggleQuestionEdit(this)" style="display: none;">
          <i class="fas fa-edit"></i> Chỉnh sửa
        </button>
        <button class="save-question-btn" onclick="saveQuestionChanges(this)">
          <i class="fas fa-save"></i> Lưu thay đổi
        </button>
        <button class="cancel-edit-btn" onclick="cancelQuestionEdit(this)">
          <i class="fas fa-times"></i> Hủy
        </button>
      </div>
    `

    // Append the question div to the part element
    partElement.appendChild(questionDiv)

    // Initialize form functionality based on type
    try {
      switch (questionType) {
        case "Một đáp án":
          if (typeof window.initializeOneAnswerForm === "function") {
            window.initializeOneAnswerForm(questionDiv)
          }
          break
        case "Nhiều đáp án":
          if (typeof window.initializeMultipleAnswerForm === "function") {
            window.initializeMultipleAnswerForm(questionDiv)
          }
          break
        case "Ghép nối":
          if (typeof window.initializeMatchingForm === "function") {
            window.initializeMatchingForm(questionDiv)
          }
          break
        case "Ghi nhãn Bản đồ/Sơ đồ":
          if (typeof window.initializePlanMapDiagram === "function") {
            window.initializePlanMapDiagram(questionDiv)
          }
          break
        case "Hoàn thành ghi chú":
          if (typeof window.initializeNoteCompletionForm === "function") {
            window.initializeNoteCompletionForm(questionDiv)
          }
          break
        case "Hoàn thành bảng/biểu mẫu":
          if (typeof window.initializeFormTableCompletionForm === "function") {
            window.initializeFormTableCompletionForm(questionDiv)
          }
          break
        case "Hoàn thành lưu đồ":
          if (typeof window.initializeFlowChartCompletionForm === "function") {
            window.initializeFlowChartCompletionForm(questionDiv)
          }
          break
        default:
          console.warn("No initialization function for question type:", questionType)
      }
    } catch (error) {
      console.error("Error initializing form:", error)
    }

    // Update the display
    renderQuestionsForCurrentPart()

    showNotification(`Đã thêm câu hỏi loại "${questionType}"`, "success")
  } catch (error) {
    console.error("Error adding question:", error)
    showNotification(`Lỗi khi thêm câu hỏi: ${error.message}`, "error")
  }
}

// Toggle question edit mode
function toggleQuestionEdit(button) {
  const questionDiv = button.closest(".question")
  questionDiv.classList.toggle("view-mode")
  questionDiv.classList.toggle("edit-mode")

  // Toggle button visibility
  const editButton = questionDiv.querySelector(".edit-question-btn")
  const saveButton = questionDiv.querySelector(".save-question-btn")
  const cancelButton = questionDiv.querySelector(".cancel-edit-btn")

  editButton.style.display = questionDiv.classList.contains("edit-mode") ? "none" : "inline-block"
  saveButton.style.display = questionDiv.classList.contains("edit-mode") ? "inline-block" : "none"
  cancelButton.style.display = questionDiv.classList.contains("edit-mode") ? "inline-block" : "none"

  // Enable/disable input fields
  const inputs = questionDiv.querySelectorAll("input, textarea, select")
  inputs.forEach((input) => {
    input.disabled = questionDiv.classList.contains("view-mode")
  })
}

// Save question changes
function saveQuestionChanges(button) {
  try {
    const questionDiv = button.closest(".question")
    if (!questionDiv) {
      showNotification("Cannot find question element", "error")
      return
    }

    // Get the question index and part number
    const partElement = questionDiv.closest(".part")
    if (!partElement) {
      showNotification("Cannot find part element", "error")
      return
    }

    const partNumber = Number.parseInt(partElement.id.replace("part", ""))
    const questions = Array.from(partElement.querySelectorAll(".question"))
    const questionIndex = questions.indexOf(questionDiv)

    if (questionIndex === -1) {
      showNotification("Cannot determine question index", "error")
      return
    }

    // Get the question type
    const questionType = test[`part${partNumber}`][questionIndex].type
    console.log(`Saving changes for ${questionType} question at index ${questionIndex} in part ${partNumber}`)

    // Extract and save question data based on type
    let success = false

    switch (questionType) {
      case "Một đáp án":
        success = updateOneAnswerQuestion(questionDiv, questionIndex)
        break
      case "Nhiều đáp án":
        success = updateMultipleAnswerQuestion(questionDiv, questionIndex)
        break
      case "Ghép nối":
        success = updateMatchingQuestion(questionDiv, questionIndex)
        break
      case "Ghi nhãn Bản đồ/Sơ đồ":
        success = updatePlanMapDiagramQuestion(questionDiv, questionIndex)
        break
      case "Hoàn thành ghi chú":
        success = updateNoteCompletionQuestion(questionDiv, questionIndex)
        break
      case "Hoàn thành bảng/biểu mẫu":
        success = updateFormTableCompletionQuestion(questionDiv, questionIndex)
        break
      case "Hoàn thành lưu đồ":
        success = updateFlowChartCompletionQuestion(questionDiv, questionIndex)
        break
      default:
        showNotification(`Unsupported question type: ${questionType}`, "error")
        return
    }

    if (!success) {
      showNotification("Failed to save question changes", "error")
      return
    }

    // Toggle back to view mode
    toggleQuestionEdit(button)

    // Re-render the questions to reflect changes
    renderQuestionsForCurrentPart()

    showNotification("Question changes saved successfully", "success")

    // Log the updated test object to verify changes
    console.log("Updated test object:", window.test)
  } catch (error) {
    console.error("Error saving question changes:", error)
    showNotification(`Error: ${error.message}`, "error")
  }
}

// Cancel question edit
function cancelQuestionEdit(button) {
  const questionDiv = button.closest(".question")
  toggleQuestionEdit(button)

  // Re-render the questions to discard changes
  renderQuestionsForCurrentPart()

  showNotification("Đã hủy chỉnh sửa câu hỏi", "info")
}

// Update Một đáp án question
function updateOneAnswerQuestion(questionDiv, questionIndex) {
  try {
    const questionText = questionDiv.querySelector("#t3-questionText")?.value
    const optionsText = questionDiv.querySelector("#t3-options")?.value
    const correctAnswer = questionDiv.querySelector("#t3-correctAnswer")?.value

    if (!questionText || !optionsText || !correctAnswer) {
      console.error("Missing required fields for One Answer question")
      return false
    }

    const options = optionsText.split("\n").filter((option) => option.trim() !== "")

    if (options.length === 0) {
      console.error("No options provided for One Answer question")
      return false
    }

    // Update the question in the test object
    test[`part${window.currentPart}`][questionIndex] = {
      type: "Một đáp án",
      content: [questionText, ...options],
      correctAnswers: correctAnswer,
    }

    console.log("Updated One Answer question:", test[`part${window.currentPart}`][questionIndex])
    return true
  } catch (error) {
    console.error("Error updating One Answer question:", error)
    return false
  }
}

// Update Nhiều đáp án question
function updateMultipleAnswerQuestion(questionDiv, questionIndex) {
  const questionText = questionDiv.querySelector("#t4-questionText").value
  const options = questionDiv.querySelector("#t4-options").value.split("\n")
  const correctAnswers = questionDiv
    .querySelector("#t4-correctAnswers")
    .value.split(",")
    .map((s) => s.trim())

  test[`part${window.currentPart}`][questionIndex].content = [questionText, ...options]
  test[`part${window.currentPart}`][questionIndex].correctAnswers = correctAnswers
  return true
}

// Update Ghép nối question
function updateMatchingQuestion(questionDiv, questionIndex) {
  const questionTitle = questionDiv.querySelector("#t3-questionTitle").value
  const people = questionDiv.querySelector("#t3-people").value.split("\n")
  const responsibilities = questionDiv.querySelector("#t3-responsibilities").value.split("\n")
  const correctAnswers = questionDiv.querySelector("#t3-correctAnswers").value.split("\n")

  test[`part${window.currentPart}`][questionIndex].content = [questionTitle, ...people, ...responsibilities]
  test[`part${window.currentPart}`][questionIndex].correctAnswers = correctAnswers
  return true
}

// Update Ghi nhãn Bản đồ/Sơ đồ question
function updatePlanMapDiagramQuestion(questionDiv, questionIndex) {
  const questionType = questionDiv.querySelector("#questionType").value
  const instructions = questionDiv.querySelector("#instructions").value
  const imageFile = test[`part${window.currentPart}`][questionIndex].content[2] // Keep the existing image
  const labels = []
  const correctAnswers = []

  // Collect labels and correct answers from the form
  let i = 0
  while (questionDiv.querySelector(`#answer${i}`)) {
    labels.push(questionDiv.querySelector(`#answer${i}`).value)
    correctAnswers.push(questionDiv.querySelector(`#correctAnswer${i}`).value)
    i++
  }

  test[`part${window.currentPart}`][questionIndex].content = [questionType, instructions, imageFile, ...labels]
  test[`part${window.currentPart}`][questionIndex].correctAnswers = correctAnswers
  return true
}

// Update Hoàn thành ghi chú question
function updateNoteCompletionQuestion(questionDiv, questionIndex) {
  const instructions = questionDiv.querySelector("#t2ListeningExerciseInstructions").value
  const topic = questionDiv.querySelector("#t2ListeningExerciseTopic").value
  const questions = []
  const correctAnswers = []

  // Collect questions and correct answers from the form
  let i = 1
  while (questionDiv.querySelector(`#t2ListeningExerciseQuestion${i}`)) {
    questions.push(questionDiv.querySelector(`#t2ListeningExerciseQuestion${i}`).value)
    correctAnswers.push(questionDiv.querySelector(`#t2ListeningExerciseCorrectAnswers${i} input`).value)
    i++
  }

  test[`part${window.currentPart}`][questionIndex].content = [instructions, topic, ...questions]
  test[`part${window.currentPart}`][questionIndex].correctAnswers = correctAnswers
  return true
}

// Update Hoàn thành bảng/biểu mẫu question
function updateFormTableCompletionQuestion(questionDiv, questionIndex) {
  const tableInstruction = questionDiv.querySelector("#tableInstruction").value
  const tableRows = questionDiv.querySelectorAll("#fareTable tr")
  const content = [tableInstruction]
  const correctAnswers = []

  // Iterate over table rows (skip header row)
  for (let i = 1; i < tableRows.length; i++) {
    const row = tableRows[i]
    const cells = row.querySelectorAll("td")

    // Extract content from the cells
    content.push(cells[0].querySelector("input").value) // Phương tiện
    content.push(cells[1].querySelector("input").value) // Giá tiền mặt
    content.push(cells[2].querySelector("input").value) // Giá thẻ

    // Extract correct answer from the correct answer input
    correctAnswers.push(cells[3].querySelector(".t6-correct-answer-input").value)
  }

  test[`part${window.currentPart}`][questionIndex].content = content
  test[`part${window.currentPart}`][questionIndex].correctAnswers = correctAnswers
  return true
}

// Update Hoàn thành lưu đồ question
function updateFlowChartCompletionQuestion(questionDiv, questionIndex) {
  const title = questionDiv.querySelector("#title").value
  const instructions = questionDiv.querySelector("#instructions").value
  const flowItems = questionDiv.querySelector("#flowItems1").value.split("\n")
  const options = questionDiv.querySelector("#options1").value.split("\n")
  const correctAnswers = questionDiv.querySelector("#correctAnswers1").value.split(",")

  test[`part${window.currentPart}`][questionIndex].content = [title, instructions, ...flowItems, ...options]
  test[`part${window.currentPart}`][questionIndex].correctAnswers = correctAnswers
  return true
}

// Define functions to create question forms
function createOneAnswerForm() {
  return `
    <div class="t3-question-creator">
      <form class="t3-one-answer-form">
        <div class="t3-form-group">
          <label for="t3-questionText">Nội dung câu hỏi:</label>
          <input type="text" id="t3-questionText" name="questionText" required>
        </div>
        <div class="t3-form-group">
          <label for="t3-options">Lựa chọn (mỗi lựa chọn một dòng):</label>
          <textarea id="t3-options" name="options" rows="4" required></textarea>
        </div>
        <div class="t3-form-group">
          <label for="t3-correctAnswer">Đáp án đúng:</label>
          <input type="text" id="t3-correctAnswer" name="correctAnswer" required>
        </div>
      </form>
    </div>
  `
}

function createMultipleAnswerForm() {
  return `
    <div class="t4-container">
      <form id="t4-questionForm">
        <div class="t4-form-group">
          <label for="t4-questionText">Nội dung câu hỏi:</label>
          <input type="text" id="t4-questionText" name="questionText" required>
        </div>
        <div class="t4-form-group">
          <label for="t4-options">Lựa chọn (mỗi lựa chọn một dòng):</label>
          <textarea id="t4-options" name="options" rows="4" required></textarea>
        </div>
        <div class="t4-form-group">
          <label for="t4-correctAnswers">Đáp án đúng (các số cách nhau bằng dấu phẩy):</label>
          <input type="text" id="t4-correctAnswers" name="correctAnswers" required>
        </div>
      </form>
    </div>
  `
}

function createMatchingForm() {
  return `
    <div class="t3-question-creator">
      <form id="t3-questionForm">
        <div class="t3-form-group">
          <label for="t3-questionTitle">Tiêu đề câu hỏi:</label>
          <input type="text" id="t3-questionTitle" name="questionTitle" required>
        </div>
        <div class="t3-form-group">
          <label for="t3-people">Người (mỗi người một dòng):</label>
          <textarea id="t3-people" name="people" required></textarea>
        </div>
        <div class="t3-form-group">
          <label for="t3-responsibilities">Trách nhiệm (mỗi trách nhiệm một dòng):</label>
          <textarea id="t3-responsibilities" name="responsibilities" required></textarea>
        </div>
        <div class="t3-form-group">
          <label for="t3-correctAnswers">Đáp án đúng (mỗi đáp án một dòng, theo thứ tự người):</label>
          <textarea id="t3-correctAnswers" name="correctAnswers" required></textarea>
        </div>
      </form>
    </div>
  `
}

function createPlanMapDiagramForm() {
  return `
    <div class="t1-ielts-creator">
      <form id="questionForm">
        <div class="t1-form-group">
          <label for="questionType">Loại câu hỏi:</label>
          <select id="questionType" required>
            <option value="map">Ghi nhãn Bản đồ (Chọn từ A-H)</option>
            <option value="ship">Sơ đồ Tàu (Nhập đáp án)</option>
          </select>
        </div>
        <div class="t1-form-group">
          <label for="instructions">Hướng dẫn:</label>
          <textarea id="instructions" rows="3" required></textarea>
        </div>
        <div class="t1-form-group">
          <label for="imageFile">Hình ảnh:</label>
          <input type="file" id="imageFile" accept="image/*">
        </div>
        <div id="answerInputs">
          <div class="t1-form-group">
            <label for="answer0">Nhãn 1:</label>
            <input type="text" id="answer0" required>
            <label for="correctAnswer0">Đáp án đúng cho nhãn 1:</label>
            <input type="text" id="correctAnswer0" required>
          </div>
        </div>
        <button type="button" id="addAnswer">Thêm nhãn</button>
      </form>
    </div>
  `
}

function createNoteCompletionForm() {
  return `
    <div class="t2-listening-exercise-app">
      <div class="t2-listening-exercise-container">
        <div class="t2-listening-exercise-form-container">
          <form id="t2ListeningExerciseForm">
            <div class="t2-listening-exercise-form-group">
              <label for="t2ListeningExerciseInstructions">Hướng dẫn:</label>
              <input type="text" id="t2ListeningExerciseInstructions" name="instructions">
            </div>
            <div class="t2-listening-exercise-form-group">
              <label for="t2ListeningExerciseTopic">Chủ đề:</label>
              <input type="text" id="t2ListeningExerciseTopic" name="topic">
            </div>
            <div id="t2ListeningExerciseQuestionContainer">
              <div class="t2-listening-exercise-form-group">
                <label for="t2ListeningExerciseQuestion1">Câu hỏi 1:</label>
                <div class="t2-listening-exercise-answer-fields">
                  <textarea id="t2ListeningExerciseQuestion1" name="question1"></textarea>
                </div>
                <div class="t2-listening-exercise-correct-answers" id="t2ListeningExerciseCorrectAnswers1">
                  <span class="t2-listening-exercise-correct-answer-label">Đáp án đúng:</span>
                  <input type="text" class="t2-listening-exercise-correct-answer-input">
                </div>
              </div>
            </div>
            <button type="button" id="addQuestion">Thêm câu hỏi</button>
          </form>
        </div>
      </div>
    </div>
  `
}

function createFormTableCompletionForm() {
  return `
    <div class="t6-ielts-listening-creator">
      <div id="tableSection" class="t6-question-container">
        <textarea id="tableInstruction" rows="2"></textarea>
        <table id="fareTable">
          <tr>
            <th>Phương tiện</th>
            <th>Giá tiền mặt</th>
            <th>Giá thẻ</th>
            <th>Đáp án đúng</th>
            <th>Thao tác</th>
          </tr>
          <tr>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text" class="t6-correct-answer-input"></td>
            <td><button class="t6-delete-btn">Xóa</button></td>
          </tr>
        </table>
        <button id="addTableRow">Thêm hàng</button>
      </div>
    </div>
  `
}

function createFlowChartCompletionForm() {
  return `
    <div class="t7-ielts-flow-chart-creator">
      <form id="teacherForm">
        <label for="title">Tiêu đề:</label>
        <input type="text" id="title" name="title" required>

        <label for="instructions">Hướng dẫn:</label>
        <textarea id="instructions" name="instructions" required></textarea>

        <div id="questionForms">
          <div class="t7-question-form">
            <h3>Câu hỏi 1</h3>
            <label for="flowItems1">Các mục lưu đồ (mỗi mục một dòng, sử dụng ___ cho khoảng trống):</label>
            <textarea id="flowItems1" name="flowItems1" required></textarea>
            <label for="options1">Lựa chọn (mỗi lựa chọn một dòng):</label>
            <textarea id="options1" name="options1" required></textarea>
            <label for="correctAnswers1">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
            <input type="text" id="correctAnswers1" name="correctAnswers1" required>
          </div>
        </div>
      </form>
    </div>
  `
}

// Dummy implementations for server interaction
async function saveTestToServer(testData) {
  // Simulate saving to a server
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: "Test saved successfully", testId: "123" })
    }, 500)
  })
}

async function getTests() {
  // Simulate fetching tests from a server
  return new Promise((resolve) => {
    setTimeout(() => {
      const tests = [
        { id: "1", title: "Sample Test 1", vietnamese_name: "Bài kiểm tra mẫu 1", description: "Mô tả bài kiểm tra 1" },
        { id: "2", title: "Sample Test 2", vietnamese_name: "Bài kiểm tra mẫu 2", description: "Mô tả bài kiểm tra 2" },
      ]
      resolve(tests)
    }, 500)
  })
}

async function deleteTest(testId) {
  // Simulate deleting a test on the server
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: `Test with ID ${testId} deleted successfully` })
    }, 500)
  })
}

async function getTestById(testId) {
  // Simulate fetching a test by ID from the server
  return new Promise((resolve) => {
    setTimeout(() => {
      const testData = {
        id: testId,
        title: "Loaded Test",
        vietnamese_name: "Bài kiểm tra đã tải",
        description: "Đây là bài kiểm tra đã được tải từ server",
        parts: [
          {
            part_number: 1,
            questions: [
              {
                question_type: "Một đáp án",
                content: JSON.stringify(["Câu hỏi 1", "Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"]),
                correct_answers: JSON.stringify("Lựa chọn A"),
              },
            ],
          },
          {
            part_number: 2,
            questions: [
              {
                question_type: "Nhiều đáp án",
                content: JSON.stringify(["Câu hỏi 2", "Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"]),
                correct_answers: JSON.stringify(["1", "2"]),
              },
            ],
          },
        ],
      }
      resolve(testData)
    }, 500)
  })
}

/**
 * Normalizes test data to ensure consistency before saving offline.
 * @param {object} testData - The test data to be normalized.
 * @returns {object} - The normalized test data.
 */
function normalizeTestData(testData) {
  const normalizedData = { ...testData }

  for (let i = 1; i <= 4; i++) {
    if (normalizedData[`part${i}`]) {
      normalizedData[`part${i}`] = normalizedData[`part${i}`].map((question) => ({
        ...question,
        content: typeof question.content === "string" ? question.content : JSON.stringify(question.content),
        correctAnswers:
          typeof question.correctAnswers === "string"
            ? question.correctAnswers
            : JSON.stringify(question.correctAnswers),
      }))
    }
  }

  return normalizedData
}
