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
    questionDiv.className = "question"
    questionDiv.innerHTML = `
      <h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionIndex + index + 1}</h4>
      <h3>${getIconForType(question.type)} ${question.type}</h3>
      <button class="delete-question" onclick="deleteQuestion(${index})"><i class="fas fa-trash"></i></button>
      ${renderQuestionContent(question)}
    `
    part.appendChild(questionDiv)

    // Đặt chế độ xem mặc định (vô hiệu hóa các trường nhập liệu)
    setTimeout(() => {
      const inputs = questionDiv.querySelectorAll("input, textarea, select")
      inputs.forEach((input) => {
        input.setAttribute("disabled", "disabled")
      })
    }, 100)
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

  // Thêm nút lưu và chỉnh sửa
  content += `
    <div class="question-actions">
      <button class="save-question-btn" onclick="saveIndividualQuestion(window.currentPart, Array.from(this.closest('.part').querySelectorAll('.question')).indexOf(this.closest('.question')))">
        <i class="fas fa-save"></i> Lưu câu hỏi
      </button>
      <button class="edit-question-btn" onclick="toggleQuestionEditMode(this.closest('.question'))">
        <i class="fas fa-edit"></i> Chỉnh sửa
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

// Lưu bài kiểm tra
function saveTest() {
  try {
    console.log("Bắt đầu lưu bài kiểm tra...")

    // Cập nhật tiêu đề và mô tả từ form
    test.title = document.getElementById("testTitle").value
    test.description = document.getElementById("testDescription").value

    // Xác thực metadata bài kiểm tra trước
    if (!validateTestMetadata()) {
      return
    }

    // Kiểm tra xem chúng ta có câu hỏi nào trong bất kỳ phần nào không
    let hasQuestions = false
    for (let i = 1; i <= 4; i++) {
      if (test[`part${i}`] && test[`part${i}`].length > 0) {
        hasQuestions = true
        break
      }
    }

    if (!hasQuestions) {
      showNotification("Không tìm thấy câu hỏi để lưu. Vui lòng thêm ít nhất một câu hỏi.", "error")
      return
    }

    // Xác thực câu hỏi phần
    if (!validatePartQuestions()) {
      return
    }

    // Lưu vào server
    saveTestToServer(test)
      .then((response) => {
        console.log("Bài kiểm tra đã lưu vào server:", response)
        showNotification(`Bài kiểm tra "${test.title}" đã lưu thành công!`, "success")
      })
      .catch((error) => {
        console.error("Lỗi khi lưu bài kiểm tra vào server:", error)
        showNotification(`Lỗi khi lưu bài kiểm tra: ${error.message}`, "error")
      })

    console.log("Bài kiểm tra đã lưu:", test)
  } catch (error) {
    console.error("Lỗi khi lưu bài kiểm tra:", error)
    showNotification(`Lỗi khi lưu bài kiểm tra: ${error.message}`, "error")
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

// Lưu bài kiểm tra vào server
async function saveTestToServer(testData) {
  try {
    const response = await fetch("/api/tests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Lưu bài kiểm tra thất bại")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi lưu bài kiểm tra:", error)
    throw error
  }
}

// Lấy danh sách bài kiểm tra
async function getTests() {
  try {
    const response = await fetch("/api/tests")

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách bài kiểm tra")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài kiểm tra:", error)
    return []
  }
}

// Lấy chi tiết bài kiểm tra theo ID
async function getTestById(testId) {
  try {
    const response = await fetch(`/api/tests/${testId}`)

    if (!response.ok) {
      throw new Error("Không thể lấy thông tin bài kiểm tra")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi lấy thông tin bài kiểm tra:", error)
    return null
  }
}

// Cập nhật bài kiểm tra
async function updateTest(testId, testData) {
  try {
    const response = await fetch(`/api/tests/${testId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Cập nhật bài kiểm tra thất bại")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi cập nhật bài kiểm tra:", error)
    throw error
  }
}

// Xóa bài kiểm tra
async function deleteTest(testId) {
  try {
    const response = await fetch(`/api/tests/${testId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Xóa bài kiểm tra thất bại")
    }

    return await response.json()
  } catch (error) {
    console.error("Lỗi khi xóa bài kiểm tra:", error)
    throw error
  }
}

// Hiển thị danh sách bài kiểm tra
function showTestList() {
  getTests()
    .then((tests) => {
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
                <h3 style="margin-top: 0;">${test.title}</h3>
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
                showNotification(`Lỗi khi xóa bài kiểm tra: $error.message`, "error")
              })
          }
        })
      })
    })
    .catch((error) => {
      console.error("Lỗi khi lấy danh sách bài kiểm tra:", error)
      showNotification(`Lỗi khi lấy danh sách bài kiểm tra: $error.message`, "error")
    })
}

// Tải bài kiểm tra từ server
function loadTestFromServer(testId) {
  getTestById(testId)
    .then((testData) => {
      if (!testData) {
        showNotification("Không thể tải bài kiểm tra", "error")
        return
      }

      // Cập nhật đối tượng bài kiểm tra với dữ liệu từ server
      test.title = testData.title
      test.description = testData.description

      // Khởi tạo các phần
      for (let i = 1; i <= 4; i++) {
        test[`part$i`] = []
      }

      // Thêm câu hỏi vào các phần tương ứng
      if (testData.parts && testData.parts.length > 0) {
        testData.parts.forEach((part) => {
          const partNumber = part.part_number
          if (partNumber >= 1 && partNumber <= 4) {
            part.questions.forEach((question) => {
              // Chuyển đổi dữ liệu từ định dạng JSON nếu cần
              const content = typeof question.content === "string" ? JSON.parse(question.content) : question.content

              const correctAnswers =
                typeof question.correct_answers === "string"
                  ? JSON.parse(question.correct_answers)
                  : question.correct_answers

              test[`part$partNumber`].push({
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
      showNotification(`Đã tải bài kiểm tra "${test.title}"`, "success")

      // Chuyển đến trang tạo bài kiểm tra nếu đang ở trang chọn
      if (!document.getElementById("selectionPage").classList.contains("hidden")) {
        document.getElementById("selectionPage").classList.add("hidden")
        document.getElementById("testCreationPage").classList.remove("hidden")
      }

      // Hiển thị phần 1 mặc định
      window.currentPart = 1
      renderTestCreation()
    })
    .catch((error) => {
      console.error("Lỗi khi tải bài kiểm tra:", error)
      showNotification(`Lỗi khi tải bài kiểm tra: $error.message`, "error")
    })
}

// Xuất bài kiểm tra ra tệp JSON
function exportTest() {
  // Cập nhật tiêu đề và mô tả từ form
  test.title = document.getElementById("testTitle").value
  test.description = document.getElementById("testDescription").value

  const testData = JSON.stringify(test, null, 2)
  const blob = new Blob([testData], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ielts_listening_test_$test.title.replace(/\s+/g, "_").json`
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
  test.description = document.getElementById("testDescription").value

  const previewWindow = window.open("", "Preview", "width=800,height=600")
  let previewContent = `<h1>${test.title}</h1>`

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
        <p><strong>Đáp án đúng:</strong> ${question.correctAnswers.join(", ")}</p>
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
      case "Hoàn thành ghi chú":
        newQuestion.content = [
          "Hoàn thành ghi chú dưới đây",
          "Chủ đề ghi chú",
          "Ghi chú 1 với [ANSWER]",
          "Ghi chú 2 với [ANSWER]",
          "Ghi chú 3 với [ANSWER]",
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
    questionDiv.className = "question editing" // Thêm class editing để bật chế độ chỉnh sửa mặc định

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

    // Thêm nút lưu và chỉnh sửa
    const actionsDiv = document.createElement("div")
    actionsDiv.className = "question-actions"
    actionsDiv.innerHTML = `
      <button class="save-question-btn" onclick="saveIndividualQuestion(window.currentPart, ${questionNumber - 1})">
        <i class="fas fa-save"></i> Lưu câu hỏi
      </button>
      <button class="edit-question-btn" onclick="toggleQuestionEditMode(this.closest('.question'))">
        <i class="fas fa-eye"></i> Xem
      </button>
    `
    questionDiv.appendChild(actionsDiv)

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
      }
    } catch (error) {
      console.error("Error initializing form:", error)
    }

    console.log(`Added new ${questionType} question to part ${window.currentPart}`)
    showNotification(`Đã thêm câu hỏi loại "${questionType}" vào Phần ${window.currentPart}`, "success")
  } catch (error) {
    console.error("Error creating question:", error)
    showNotification(`Lỗi khi tạo câu hỏi: ${error.message}`, "error")
  }
}

// Sửa đổi hàm document.addEventListener("DOMContentLoaded", ...) để loại bỏ kiểm tra đăng nhập
document.addEventListener("DOMContentLoaded", () => {
  // Thêm sự kiện cho nút bắt đầu tạo bài kiểm tra
  const startButton = document.querySelector(".selection-page button")
  if (startButton) {
    startButton.addEventListener("click", startTestCreation)
  }
})

// Bắt đầu tạo bài kiểm tra
function startTestCreation() {
  // Lấy các loại câu hỏi đã chọn
  const selectedTypes = []
  document.querySelectorAll('.question-type input[type="checkbox"]:checked').forEach((checkbox) => {
    selectedTypes.push(checkbox.value)
  })

  if (selectedTypes.length === 0) {
    showNotification("Vui lòng chọn ít nhất một loại câu hỏi", "error")
    return
  }

  // Chuyển đến trang tạo bài kiểm tra
  document.getElementById("selectionPage").classList.add("hidden")
  document.getElementById("testCreationPage").classList.remove("hidden")

  // Khởi tạo bài kiểm tra mới
  test = {
    title: "Bài kiểm tra IELTS Listening mới",
    description: "Mô tả bài kiểm tra",
    part1: [],
    part2: [],
    part3: [],
    part4: [],
  }

  // Hiển thị giao diện tạo bài kiểm tra
  window.currentPart = 1
  renderTestCreation()

  // Automatically show question creation form for the first selected type
  if (selectedTypes.length > 0) {
    console.log("Automatically creating question form for: " + selectedTypes[0])
    addQuestionDirectly(selectedTypes[0])
  }
}

// Thêm hàm saveIndividualQuestion sau hàm saveTest
// Lưu một câu hỏi cụ thể
function saveIndividualQuestion(partNumber, questionIndex) {
  try {
    console.log(`Saving question ${questionIndex + 1} in part ${partNumber}`)

    // Get the question element from DOM
    const partElement = document.getElementById(`part${partNumber}`)
    if (!partElement) {
      showNotification("Could not find the part containing the question", "error")
      return false
    }

    const questionElements = partElement.querySelectorAll(".question")
    if (questionIndex >= questionElements.length) {
      showNotification("Could not find the question to save", "error")
      return false
    }

    const questionElement = questionElements[questionIndex]
    const questionType = questionElement
      .querySelector("h3")
      .textContent.trim()
      .replace(/^[\s\S]*\s/, "")

    // Get question data based on type
    let updatedQuestion = null

    switch (questionType) {
      case "Một đáp án":
        updatedQuestion = getOneAnswerQuestionData(questionElement)
        break
      case "Nhiều đáp án":
        updatedQuestion = getMultipleAnswerQuestionData(questionElement)
        break
      case "Ghép nối":
        updatedQuestion = getMatchingQuestionData(questionElement)
        break
      case "Ghi nhãn Bản đồ/Sơ đồ":
        updatedQuestion = getPlanMapDiagramQuestionData(questionElement)
        break
      case "Hoàn thành ghi chú":
        updatedQuestion = getNoteCompletionQuestionData(questionElement)
        break
      case "Hoàn thành bảng/biểu mẫu":
        updatedQuestion = getFormTableCompletionQuestionData(questionElement)
        break
      case "Hoàn thành lưu đồ":
        updatedQuestion = getFlowChartCompletionQuestionData(questionElement)
        break
      default:
        showNotification(`Unsupported question type: ${questionType}`, "error")
        return false
    }

    if (!updatedQuestion) {
      showNotification("Could not get question data", "error")
      return false
    }

    // Update ONLY this specific question in the test object
    test[`part${partNumber}`][questionIndex] = updatedQuestion

    // Show success notification
    showNotification(`Saved question ${questionIndex + 1} in part ${partNumber}`, "success")

    // Mark the question as saved
    questionElement.classList.add("saved-question")

    // Add a green border to indicate the question is saved
    questionElement.style.borderLeft = "4px solid #28a745"

    return true
  } catch (error) {
    console.error("Error saving question:", error)
    showNotification(`Error saving question: ${error.message}`, "error")
    return false
  }
}

// Hàm lấy dữ liệu câu hỏi Một đáp án
function getOneAnswerQuestionData(questionElement) {
  const questionText = questionElement.querySelector("#t3-questionText").value
  const options = questionElement
    .querySelector("#t3-options")
    .value.split("\n")
    .filter((option) => option.trim() !== "")
  const correctAnswer = questionElement.querySelector("#t3-correctAnswer").value

  if (!questionText || options.length === 0 || !correctAnswer) {
    showNotification("Vui lòng điền đầy đủ thông tin câu hỏi Một đáp án", "error")
    return null
  }

  return {
    type: "Một đáp án",
    content: [questionText, ...options],
    correctAnswers: correctAnswer,
  }
}

// Hàm lấy dữ liệu câu hỏi Nhiều đáp án
function getMultipleAnswerQuestionData(questionElement) {
  const questionText = questionElement.querySelector("#t4-questionText").value
  const options = questionElement
    .querySelector("#t4-options")
    .value.split("\n")
    .filter((option) => option.trim() !== "")
  const correctAnswersInput = questionElement.querySelector("#t4-correctAnswers").value
  const correctAnswers = correctAnswersInput
    .split(",")
    .map((num) => num.trim())
    .filter((num) => num)

  if (!questionText || options.length === 0 || correctAnswers.length === 0) {
    showNotification("Vui lòng điền đầy đủ thông tin câu hỏi Nhiều đáp án", "error")
    return null
  }

  return {
    type: "Nhiều đáp án",
    content: [questionText, ...options],
    correctAnswers: correctAnswers,
  }
}

// Hàm lấy dữ liệu câu hỏi Ghép nối
function getMatchingQuestionData(questionElement) {
  const title = questionElement.querySelector("#t3-questionTitle").value
  const people = questionElement
    .querySelector("#t3-people")
    .value.split("\n")
    .filter((p) => p.trim() !== "")
  const responsibilities = questionElement
    .querySelector("#t3-responsibilities")
    .value.split("\n")
    .filter((r) => r.trim() !== "")
  const correctAnswers = questionElement
    .querySelector("#t3-correctAnswers")
    .value.split("\n")
    .filter((a) => a.trim() !== "")

  if (!title || people.length === 0 || responsibilities.length === 0 || correctAnswers.length === 0) {
    showNotification("Vui lòng điền đầy đủ thông tin câu hỏi Ghép nối", "error")
    return null
  }

  return {
    type: "Ghép nối",
    content: [title, ...people, ...responsibilities],
    correctAnswers: correctAnswers,
  }
}

// Hàm lấy dữ liệu câu hỏi Ghi nhãn Bản đồ/Sơ đồ
function getPlanMapDiagramQuestionData(questionElement) {
  const questionType = questionElement.querySelector("#questionType").value
  const instructions = questionElement.querySelector("#instructions").value

  // Lấy hình ảnh
  let imageSource = ""
  const imgElement = questionElement.querySelector(".t1-form-group img")
  if (imgElement) {
    imageSource = imgElement.src
  } else {
    showNotification("Vui lòng tải lên hình ảnh cho câu hỏi Ghi nhãn Bản đồ/Sơ đồ", "error")
    return null
  }

  // Lấy nhãn và đáp án
  const answerGroups = questionElement.querySelectorAll("#answerInputs .t1-form-group")
  const labels = []
  const correctAnswers = []

  answerGroups.forEach((group, index) => {
    const label = group.querySelector(`#answer${index}`)?.value
    const answer = group.querySelector(`#correctAnswer${index}`)?.value

    if (label && answer) {
      labels.push(label)
      correctAnswers.push(answer)
    }
  })

  if (!instructions || labels.length === 0 || correctAnswers.length === 0) {
    showNotification("Vui lòng điền đầy đủ thông tin câu hỏi Ghi nhãn Bản đồ/Sơ đồ", "error")
    return null
  }

  return {
    type: "Ghi nhãn Bản đồ/Sơ đồ",
    content: [questionType, instructions, imageSource, ...labels],
    correctAnswers: correctAnswers,
  }
}

// Hàm lấy dữ liệu câu hỏi Hoàn thành ghi chú
function getNoteCompletionQuestionData(questionElement) {
  const instructions = questionElement.querySelector("#t2ListeningExerciseInstructions")?.value
  const topic = questionElement.querySelector("#t2ListeningExerciseTopic")?.value

  // Lấy các câu hỏi và đáp án
  const questionContainers = questionElement.querySelectorAll(".t2-listening-exercise-form-group")
  const notes = []
  const correctAnswers = []

  questionContainers.forEach((container, index) => {
    if (index < 2) return // Bỏ qua 2 container đầu (instructions và topic)

    const noteTextarea = container.querySelector("textarea")
    const answerInput = container.querySelector(".t2-listening-exercise-correct-answer-input")

    if (noteTextarea && answerInput) {
      notes.push(noteTextarea.value)
      correctAnswers.push(answerInput.value)
    }
  })

  if (!instructions || !topic || notes.length === 0 || correctAnswers.length === 0) {
    showNotification("Vui lòng điền đầy đủ thông tin câu hỏi Hoàn thành ghi chú", "error")
    return null
  }

  return {
    type: "Hoàn thành ghi chú",
    content: [instructions, topic, ...notes],
    correctAnswers: correctAnswers,
  }
}

// Hàm lấy dữ liệu câu hỏi Hoàn thành bảng/biểu mẫu
function getFormTableCompletionQuestionData(questionElement) {
  const instruction = questionElement.querySelector("#tableInstruction")?.value

  // Lấy dữ liệu bảng
  const rows = questionElement.querySelectorAll("#fareTable tr")
  const tableData = []
  const correctAnswers = []

  // Bỏ qua hàng tiêu đề
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll("td input")

    if (cells.length >= 4) {
      tableData.push(cells[0].value)
      tableData.push(cells[1].value)
      tableData.push(cells[2].value)
      correctAnswers.push(cells[3].value)
    }
  }

  if (!instruction || tableData.length === 0 || correctAnswers.length === 0) {
    showNotification("Vui lòng điền đầy đủ thông tin câu hỏi Hoàn thành bảng/biểu mẫu", "error")
    return null
  }

  return {
    type: "Hoàn thành bảng/biểu mẫu",
    content: [instruction, ...tableData],
    correctAnswers: correctAnswers,
  }
}

// Hàm lấy dữ liệu câu hỏi Hoàn thành lưu đồ
function getFlowChartCompletionQuestionData(questionElement) {
  const title = questionElement.querySelector("#title")?.value
  const instructions = questionElement.querySelector("#instructions")?.value
  const flowItems = questionElement
    .querySelector("#flowItems1")
    ?.value.split("\n")
    .filter((item) => item.trim() !== "")
  const options = questionElement
    .querySelector("#options1")
    ?.value.split("\n")
    .filter((option) => option.trim() !== "")
  const correctAnswersInput = questionElement.querySelector("#correctAnswers1")?.value
  const correctAnswers = correctAnswersInput
    .split(",")
    .map((answer) => answer.trim())
    .filter((answer) => answer)

  if (!title || !instructions || flowItems.length === 0 || options.length === 0 || correctAnswers.length === 0) {
    showNotification("Vui lòng điền đầy đủ thông tin câu hỏi Hoàn thành lưu đồ", "error")
    return null
  }

  return {
    type: "Hoàn thành lưu đồ",
    content: [title, instructions, ...flowItems, ...options],
    correctAnswers: correctAnswers,
  }
}

// Thêm hàm để bật/tắt chế độ chỉnh sửa câu hỏi
function toggleQuestionEditMode(questionElement) {
  if (questionElement.classList.contains("editing")) {
    // Currently in edit mode, switch to view mode
    questionElement.classList.remove("editing")

    // Disable input fields
    const inputs = questionElement.querySelectorAll("input, textarea, select")
    inputs.forEach((input) => {
      input.setAttribute("disabled", "disabled")
    })

    // Update button text
    const editButton = questionElement.querySelector(".edit-question-btn")
    if (editButton) {
      editButton.innerHTML = '<i class="fas fa-edit"></i> Chỉnh sửa'
    }
  } else {
    // Currently in view mode, switch to edit mode
    questionElement.classList.add("editing")

    // Enable input fields
    const inputs = questionElement.querySelectorAll("input, textarea, select")
    inputs.forEach((input) => {
      input.removeAttribute("disabled")
    })

    // Update button text
    const editButton = questionElement.querySelector(".edit-question-btn")
    if (editButton) {
      editButton.innerHTML = '<i class="fas fa-eye"></i> Xem'
    }
  }
}

// Thêm CSS cho chế độ chỉnh sửa và xem
document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style")
  style.textContent = `
    .question:not(.editing) input:not([type="file"]), 
    .question:not(.editing) textarea, 
    .question:not(.editing) select {
      background-color: #f8f9fa;
      border-color: transparent;
      pointer-events: none;
    }
    
    .question.saved-question {
      border-left: 4px solid #28a745;
    }
    
    .question-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .save-question-btn {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .edit-question-btn {
      background-color: #17a2b8;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
  `
  document.head.appendChild(style)
})

// Đảm bảo các hàm mới được xuất ra window
window.saveIndividualQuestion = saveIndividualQuestion
window.toggleQuestionEditMode = toggleQuestionEditMode

// Expose functions to window object
window.renderTestCreation = renderTestCreation
window.showNotification = showNotification
window.updateQuestionCount = updateQuestionCount
window.renderQuestionsForCurrentPart = renderQuestionsForCurrentPart

// Make functions available globally
window.previewEntireTest = previewEntireTest
window.exportTest = exportTest
window.importTest = importTest
window.showTestList = showTestList
window.createNewTest = createNewTest
window.duplicateTest = duplicateTest
window.generateTestPDF = generateTestPDF
window.addQuestionDirectly = addQuestionDirectly
window.deleteQuestion = deleteQuestion
window.renderTestCreation = renderTestCreation
window.startTestCreation = startTestCreation

//
window.startTestCreation = startTestCreation
window.renderTestCreation = renderTestCreation

// Add this at the end of the file to ensure all functions are properly exposed to the global window object:

// Make sure all functions are available globally
window.addQuestionDirectly = addQuestionDirectly
window.renderTestCreation = renderTestCreation
window.startTestCreation = startTestCreation
window.previousPart = previousPart
window.nextPart = nextPart
window.saveTest = saveTest
window.deleteQuestion = deleteQuestion
window.showNotification = showNotification
window.updateQuestionCount = updateQuestionCount
window.renderQuestionsForCurrentPart = renderQuestionsForCurrentPart
window.previewEntireTest = previewEntireTest
window.exportTest = exportTest
window.importTest = importTest
window.showTestList = showTestList
window.createNewTest = createNewTest
window.duplicateTest = duplicateTest
window.generateTestPDF = generateTestPDF

// Initialize currentPart in the global scope if it doesn't exist
if (typeof window.currentPart === "undefined") {
  window.currentPart = 1
}

console.log("test-management.js loaded successfully")
console.log("Functions exposed to window:", {
  addQuestionDirectly: typeof window.addQuestionDirectly,
  renderTestCreation: typeof window.renderTestCreation,
  startTestCreation: typeof window.startTestCreation,
})

// Declare the missing form creation functions
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
            <option value="map">Ghi nhãn Bản đồ</option>
            <option value="ship">Sơ đồ Tàu</option>
            <option value="technical">Sơ đồ Kỹ thuật</option>
          </select>
        </div>
        <div class="t1-form-group">
          <label for="instructions">Hướng dẫn:</label>
          <textarea id="instructions" rows="3" required></textarea>
        </div>
        <div class="t1-form-group">
          <label for="imageFile">Hình ảnh:</label>
          <input type="file" id="imageFile" name="imageFile" accept="image/*" required>
        </div>
        <div id="answerInputs">
          </div>
          <button type="button" onclick="addAnswerInput()">Thêm câu trả lời</button>
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
              </div>
              <button type="button" onclick="addListeningExerciseQuestion()">Thêm câu hỏi</button>
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
            <th>Thao tác</th>
          </tr>
        </table>
        <button id="addRowBtn">Thêm hàng</button>
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

