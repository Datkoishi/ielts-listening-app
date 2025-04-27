// Khai báo các biến toàn cục
const selectedTypes = [] // Mảng chứa các loại câu hỏi đã chọn
const currentPart = 1 // Phần hiện tại của bài kiểm tra
let totalQuestions = 0 // Tổng số câu hỏi đã thêm
const MAX_QUESTIONS = 40 // Số lượng câu hỏi tối đa cho phép
const test = {} // Khai báo biến test

// Lấy danh sách loại câu hỏi từ server hoặc sử dụng danh sách đã định nghĩa
function fetchQuestionTypes() {
  const questionTypes = [
    "Một đáp án",
    "Nhiều đáp án",
    "Ghép nối",
    "Ghi nhãn Bản đồ/Sơ đồ",
    "Hoàn thành ghi chú",
    "Hoàn thành bảng/biểu mẫu",
    "Hoàn thành lưu đồ",
  ]
  const questionTypeContainer = document.getElementById("questionTypes")

  if (!questionTypeContainer) {
    console.error("Không tìm thấy container loại câu hỏi")
    return
  }

  questionTypeContainer.innerHTML = ""

  questionTypes.forEach((type) => {
    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.value = type
    checkbox.id = type.replace(/\s+/g, "-").toLowerCase()
    checkbox.className = "question-type-checkbox"

    const label = document.createElement("label")
    label.htmlFor = checkbox.id
    label.textContent = type
    label.className = "question-type-label"

    const typeContainer = document.createElement("div")
    typeContainer.className = "question-type-item"
    typeContainer.appendChild(checkbox)
    typeContainer.appendChild(label)

    questionTypeContainer.appendChild(typeContainer)
  })
}

// Hiển thị loại câu hỏi để lựa chọn
function renderQuestionTypes(container) {
  selectedTypes.forEach((type) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question-type-selector"
    questionDiv.innerHTML = `
      <h3>${getIconForType(type)} ${type}</h3>
      <button class="add-question-btn" onclick="addQuestion('${type}', ${currentPart})">
        <i class="fas fa-plus"></i> Thêm câu hỏi ${type}
      </button>
    `
    container.appendChild(questionDiv)
  })
}

// Lấy biểu tượng cho loại câu hỏi
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

// Thêm câu hỏi mới
function addQuestion(type, partNumber = window.currentPart) {
  if (totalQuestions >= MAX_QUESTIONS) {
    alert("Bạn đã đạt đến giới hạn tối đa 40 câu hỏi.")
    return
  }

  const part = document.getElementById(`part${partNumber}`)
  if (!part) {
    console.error(`Cannot find part${partNumber} element`)
    return
  }

  const questionNumber = totalQuestions + 1
  const questionDiv = document.createElement("div")
  questionDiv.className = "question"

  // Thêm tiêu đề loại câu hỏi
  const typeHeader = document.createElement("h3")
  typeHeader.innerHTML = `${getIconForType(type)} ${type}`
  questionDiv.appendChild(typeHeader)

  // Thêm số câu hỏi và nút xóa
  questionDiv.innerHTML += `
    <h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionNumber}</h4>
    <button class="delete-question" onclick="deleteQuestion(this)"><i class="fas fa-trash"></i></button>
  `

  // Thêm form phù hợp dựa trên loại
  switch (type) {
    case "Một đáp án":
      questionDiv.innerHTML += createOneAnswerForm()
      break
    case "Nhiều đáp án":
      questionDiv.innerHTML += createMultipleAnswerForm()
      break
    case "Ghép nối":
      questionDiv.innerHTML += createMatchingForm()
      break
    case "Ghi nhãn Bản đồ/Sơ đồ":
      questionDiv.innerHTML += createPlanMapDiagramForm()
      break
    case "Hoàn thành ghi chú":
      questionDiv.innerHTML += createNoteCompletionForm()
      break
    case "Hoàn thành bảng/biểu mẫu":
      questionDiv.innerHTML += createFormTableCompletionForm()
      break
    case "Hoàn thành lưu đồ":
      questionDiv.innerHTML += createFlowChartCompletionForm()
      break
    default:
      console.error("Loại câu hỏi không xác định:", type)
      return
  }

  part.appendChild(questionDiv)
  totalQuestions++
  updateQuestionCount()

  // Khởi tạo chức năng form dựa trên loại
  switch (type) {
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
      initializePlanMapDiagram(questionDiv)
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
  }

  // IMPORTANT: Make sure the question is added to the test object
  // Access the global window.test object instead of the local test variable
  if (!window.test) {
    window.test = {
      title: "",
      vietnameseName: "",
      description: "",
      part1: [],
      part2: [],
      part3: [],
      part4: [],
    }
    console.log("Created global test object")
  }

  if (!window.test[`part${partNumber}`]) {
    window.test[`part${partNumber}`] = []
    console.log(`Created part${partNumber} array in global test object`)
  }

  // Create a basic question object
  const newQuestion = {
    type: type,
    content: ["New question"],
    correctAnswers: [],
  }

  // Add the question to the global test object
  window.test[`part${partNumber}`].push(newQuestion)

  console.log(
    `Added question to global test object part${partNumber}. Current questions:`,
    window.test[`part${partNumber}`].length,
  )
  console.log("Global test object:", window.test)
}

// Xóa câu hỏi
function deleteQuestion(button) {
  const questionDiv = button.closest(".question")
  const partDiv = questionDiv.closest(".part")
  const partNumber = Number.parseInt(partDiv.id.replace("part", ""))

  // Tìm chỉ mục của câu hỏi này trong phần
  const questions = Array.from(partDiv.querySelectorAll(".question"))
  const index = questions.indexOf(questionDiv)

  // Xóa khỏi đối tượng bài kiểm tra nếu là câu hỏi hiện có
  if (index !== -1 && test[`part${partNumber}`] && test[`part${partNumber}`][index]) {
    test[`part${partNumber}`].splice(index, 1)
  }

  questionDiv.remove()
  totalQuestions--
  updateQuestionCount()
  renumberQuestions()
}

// Đánh số lại câu hỏi sau khi xóa
function renumberQuestions() {
  const questions = document.querySelectorAll(".question h4")
  questions.forEach((question, index) => {
    question.innerHTML = `<i class="fas fa-question-circle"></i> Câu hỏi ${index + 1}`
  })
}

// Cập nhật hiển thị số lượng câu hỏi
function updateQuestionCount() {
  const countElement = document.querySelector(".question-count")
  if (countElement) {
    countElement.innerHTML = `<i class="fas fa-question-circle"></i> Tổng số câu hỏi: ${totalQuestions}/${MAX_QUESTIONS}`
  }
}

// Hiển thị câu hỏi hiện có cho một phần
function displayExistingQuestions(partNumber) {
  const partElement = document.getElementById(`part${partNumber}`)
  if (!partElement) return

  const existingQuestions = test[`part${partNumber}`] || []

  existingQuestions.forEach((question, index) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question existing-question"

    // Thêm tiêu đề câu hỏi
    questionDiv.innerHTML = `
      <h3>${getIconForType(question.type)} ${question.type}</h3>
      <h4><i class="fas fa-question-circle"></i> Câu hỏi ${index + 1}</h4>
      <button class="delete-question" onclick="deleteQuestion(this)"><i class="fas fa-trash"></i></button>
      <div class="question-content">
        ${renderQuestionContent(question)}
      </div>
    `

    partElement.appendChild(questionDiv)
  })
}

// Hiển thị nội dung câu hỏi dựa trên loại
function renderQuestionContent(question) {
  switch (question.type) {
    case "Một đáp án":
      return `
        <p><strong>Câu hỏi:</strong> ${question.content[0]}</p>
        <p><strong>Lựa chọn:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map((option) => `<li>${option}</li>`)
            .join("")}
        </ul>
        <p><strong>Đáp án đúng:</strong> ${question.correctAnswers}</p>
      `
    case "Nhiều đáp án":
      return `
        <p><strong>Câu hỏi:</strong> ${question.content[0]}</p>
        <p><strong>Lựa chọn:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map((option) => `<li>${option}</li>`)
            .join("")}
        </ul>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Ghép nối":
      return `
        <p><strong>Tiêu đề:</strong> ${question.content[0]}</p>
        <div class="matching-preview">
          <div class="matching-column">
            <h5>Mục</h5>
            <ul>
              ${question.content
                .slice(1, Math.ceil(question.content.length / 2))
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
          <div class="matching-column">
            <h5>Ghép nối</h5>
            <ul>
              ${question.content
                .slice(Math.ceil(question.content.length / 2))
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
        </div>
        <p><strong>Ghép nối đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Ghi nhãn Bản đồ/Sơ đồ":
      return `
        <p><strong>Loại:</strong> ${question.content[0]}</p>
        <p><strong>Hướng dẫn:</strong> ${question.content[1]}</p>
        <div class="image-preview">
          <img src="${question.content[2]}" alt="Sơ đồ" style="max-width: 200px;">
        </div>
        <p><strong>Nhãn:</strong> ${question.content.slice(3).join(", ")}</p>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Hoàn thành ghi chú":
      return `
        <p><strong>Hướng dẫn:</strong> ${question.content[0]}</p>
        <p><strong>Chủ đề:</strong> ${question.content[1]}</p>
        <div class="notes-preview">
          ${question.content
            .slice(2)
            .map((note, i) => `<p>${i + 1}. ${note.replace(/\[ANSWER\]/g, "_______")}</p>`)
            .join("")}
        </div>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Hoàn thành bảng/biểu mẫu":
      return `
        <p><strong>Hướng dẫn:</strong> ${question.content[0]}</p>
        <div class="table-preview">
          <table>
            <tr>
              <th>Cột 1</th>
              <th>Cột 2</th>
              <th>Cột 3</th>
            </tr>
            ${renderTableRows(question.content.slice(1))}
          </table>
        </div>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Hoàn thành lưu đồ":
      return `
        <p><strong>Tiêu đề:</strong> ${question.content[0]}</p>
        <p><strong>Hướng dẫn:</strong> ${question.content[1]}</p>
        <div class="flowchart-preview">
          ${question.content
            .slice(2, question.content.length / 2)
            .map((item) => `<div class="flow-item">${item.replace(/___/g, "_______")}</div>`)
            .join('<div class="flow-arrow">↓</div>')}
        </div>
        <p><strong>Lựa chọn:</strong> ${question.content.slice(question.content.length / 2).join(", ")}</p>
        <p><strong>Đáp án đúng:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    default:
      return `<p>Loại câu hỏi không xác định: ${question.type}</p>`
  }
}

// Hàm trợ giúp để hiển thị hàng bảng
function renderTableRows(data) {
  let rows = ""
  for (let i = 0; i < data.length; i += 3) {
    rows += `
      <tr>
        <td>${data[i] || ""}</td>
        <td>${data[i + 1] || ""}</td>
        <td>${data[i + 2] || ""}</td>
      </tr>
    `
  }
  return rows
}

// Các hàm tạo form cho từng loại câu hỏi
function createOneAnswerForm() {
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
    </div>
  `
}

function createMultipleAnswerForm() {
  return `
    <div class="multiple-answer-form">
      <label for="question">Câu hỏi:</label>
      <input type="text" id="question" name="question" required>
      <label>Lựa chọn:</label>
      <input type="text" name="option1" required><br>
      <input type="text" name="option2" required><br>
      <input type="text" name="option3" required><br>
      <input type="text" name="option4" required><br>
      <label for="correctAnswers">Đáp án đúng (chọn nhiều):</label><br>
      <input type="checkbox" id="correctAnswer1" name="correctAnswers" value="1">
      <label for="correctAnswer1">Lựa chọn 1</label><br>
      <input type="checkbox" id="correctAnswer2" name="correctAnswers" value="2">
      <label for="correctAnswer2">Lựa chọn 2</label><br>
      <input type="checkbox" id="correctAnswer3" name="correctAnswers" value="3">
      <label for="correctAnswer3">Lựa chọn 3</label><br>
      <input type="checkbox" id="correctAnswer4" name="correctAnswers" value="4">
      <label for="correctAnswer4">Lựa chọn 4</label>
    </div>
  `
}

function createMatchingForm() {
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
    </div>
  `
}

function createPlanMapDiagramForm() {
  return `
    <div class="plan-map-diagram-form">
      <label for="type">Loại:</label>
      <select id="questionType" name="type" required>
        <option value="plan">Plan</option>
        <option value="map">Map</option>
        <option value="diagram">Diagram</option>
      </select>
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label for="image">Hình ảnh:</label>
      <input type="file" id="imageFile" name="image" accept="image/*" required>
      <div id="answerInputs"></div>
      <button type="button" onclick="addAnswerInput()">Thêm nhãn</button>
    </div>
  `
}

function createNoteCompletionForm() {
  return `
    <div class="note-completion-form">
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label for="topic">Chủ đề:</label>
      <input type="text" id="topic" name="topic" required>
      <label>Ghi chú (sử dụng [ANSWER] cho chỗ trống):</label>
      <textarea name="note1" required></textarea><br>
      <textarea name="note2" required></textarea><br>
      <textarea name="note3" required></textarea><br>
      <label for="correctAnswers">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="correctAnswers" name="correctAnswers" required>
    </div>
  `
}

function createFormTableCompletionForm() {
  return `
    <div class="form-table-completion-form">
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label>Hàng 1 (cách nhau bằng dấu phẩy):</label>
      <input type="text" name="row1" required><br>
      <label>Hàng 2 (cách nhau bằng dấu phẩy):</label>
      <input type="text" name="row2" required><br>
      <label>Hàng 3 (cách nhau bằng dấu phẩy):</label>
      <input type="text" name="row3" required><br>
      <label for="correctAnswers">Đáp án ��úng (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="correctAnswers" name="correctAnswers" required>
    </div>
  `
}

function createFlowChartCompletionForm() {
  return `
    <div class="flow-chart-completion-form">
      <label for="title">Tiêu đề:</label>
      <input type="text" id="title" name="title" required>
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <label>Mục (sử dụng ___ cho chỗ trống):</label>
      <input type="text" name="item1" required><br>
      <input type="text" name="item2" required><br>
      <input type="text" name="item3" required><br>
      <label for="options">Lựa chọn (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="options" name="options" required>
      <label for="correctAnswers">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="correctAnswers" name="correctAnswers" required>
    </div>
  `
}

// Các hàm khởi tạo form cho từng loại câu hỏi (nếu cần)
function initializeOneAnswerForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializeMultipleAnswerForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializeMatchingForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

// Add the missing function for Plan/Map/Diagram labelling
function initializePlanMapDiagram(container) {
  const questionType = container.querySelector("#questionType")
  const answerInputs = container.querySelector("#answerInputs")

  // Function to add a new answer input
  window.addAnswerInput = () => {
    const index = answerInputs.children.length
    const answerGroup = document.createElement("div")
    answerGroup.className = "t1-form-group"

    const isMapType = questionType.value === "map"

    answerGroup.innerHTML = `
      <label for="answer${index}">Nhãn ${index + 1}:</label>
      <input type="text" id="answer${index}" required>
      <label for="correctAnswer${index}">Đáp án đúng cho nhãn ${index + 1}:</label>
      ${
        isMapType
          ? `<select id="correctAnswer${index}" required>
            ${["A", "B", "C", "D", "E", "F", "G", "H"]
              .map((letter) => `<option value="${letter}">${letter}</option>`)
              .join("")}
          </select>`
          : `<input type="text" id="correctAnswer${index}" required>`
      }
      <button type="button" class="remove-answer-btn" onclick="removeAnswerInput(${index})">Xóa</button>
    `

    answerInputs.appendChild(answerGroup)
  }

  // Function to remove an answer input
  window.removeAnswerInput = (index) => {
    const answerGroups = answerInputs.querySelectorAll(".t1-form-group")
    if (index < answerGroups.length) {
      answerInputs.removeChild(answerGroups[index])

      // Update indices for remaining answer inputs
      const remainingGroups = answerInputs.querySelectorAll(".t1-form-group")
      remainingGroups.forEach((group, i) => {
        const labels = group.querySelectorAll("label")
        const inputs = group.querySelectorAll("input, select")
        const button = group.querySelector("button")

        labels[0].setAttribute("for", `answer${i}`)
        labels[0].textContent = `Nhãn ${i + 1}:`
        inputs[0].id = `answer${i}`

        labels[1].setAttribute("for", `correctAnswer${i}`)
        labels[1].textContent = `Đáp án đúng cho nhãn ${i + 1}:`
        inputs[1].id = `correctAnswer${i}`

        button.setAttribute("onclick", `removeAnswerInput(${i})`)
      })
    }
  }

  // Handle question type change
  questionType.addEventListener("change", function () {
    const isMapType = this.value === "map"
    const answerGroups = answerInputs.querySelectorAll(".t1-form-group")

    answerGroups.forEach((group, index) => {
      const correctAnswerLabel = group.querySelector(`label[for="correctAnswer${index}"]`)
      const correctAnswerContainer = correctAnswerLabel.nextElementSibling
      const currentValue = correctAnswerContainer.value || ""

      // Replace the input/select with the appropriate type
      if (isMapType && correctAnswerContainer.tagName !== "SELECT") {
        correctAnswerLabel.insertAdjacentHTML(
          "afterend",
          `
          <select id="correctAnswer${index}" required>
            ${["A", "B", "C", "D", "E", "F", "G", "H"]
              .map(
                (letter) => `<option value="${letter}" ${currentValue === letter ? "selected" : ""}>${letter}</option>`,
              )
              .join("")}
          </select>
        `,
        )
        correctAnswerContainer.remove()
      } else if (!isMapType && correctAnswerContainer.tagName !== "INPUT") {
        correctAnswerLabel.insertAdjacentHTML(
          "afterend",
          `
          <input type="text" id="correctAnswer${index}" value="${currentValue}" required>
        `,
        )
        correctAnswerContainer.remove()
      }
    })
  })

  // Handle image upload
  const imageFile = container.querySelector("#imageFile")
  if (imageFile) {
    imageFile.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          // Create or update image preview
          let imgPreview = container.querySelector(".image-preview")
          if (!imgPreview) {
            imgPreview = document.createElement("div")
            imgPreview.className = "image-preview"
            imageFile.parentNode.appendChild(imgPreview)
          }

          imgPreview.innerHTML = `
            <img src="${event.target.result}" alt="Preview" style="max-width: 200px; margin-top: 10px;">
          `
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Add initial answer input if none exist
  if (answerInputs.children.length === 0) {
    window.addAnswerInput()
  }
}

function initializeNoteCompletionForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializeFormTableCompletionForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

function initializeFlowChartCompletionForm(questionDiv) {
  // Thêm logic khởi tạo nếu cần
}

// Add the missing function for saving Plan/Map/Diagram questions
function savePlanMapDiagramQuestion(container) {
  const questionType = container.querySelector("#questionType").value
  const instructions = container.querySelector("#instructions").value
  const imageFile = container.querySelector("#imageFile")
  const answerInputs = container.querySelector("#answerInputs")
  const answerGroups = answerInputs.querySelectorAll(".t1-form-group")

  // Validate inputs
  if (!instructions) {
    showNotification("Vui lòng nhập hướng dẫn", "error")
    return null
  }

  if (!imageFile.files[0] && !container.querySelector(".image-preview img")) {
    showNotification("Vui lòng tải lên hình ảnh", "error")
    return null
  }

  if (answerGroups.length === 0) {
    showNotification("Vui lòng thêm ít nhất một nhãn", "error")
    return null
  }

  // Get image source
  let imageSource = ""
  if (container.querySelector(".image-preview img")) {
    imageSource = container.querySelector(".image-preview img").src
  } else if (imageFile.files[0]) {
    // This is a placeholder - in a real implementation, you'd upload the file to a server
    // and get back a URL, but for this example we'll use a placeholder
    imageSource = "/placeholder.svg?height=300&width=400"
  }

  // Collect labels and answers
  const labels = []
  const correctAnswers = []

  answerGroups.forEach((group, index) => {
    const label = group.querySelector(`#answer${index}`).value
    const answer = group.querySelector(`#correctAnswer${index}`).value

    if (!label || !answer) {
      showNotification(`Vui lòng điền đầy đủ thông tin cho nhãn ${index + 1}`, "error")
      return null
    }

    labels.push(label)
    correctAnswers.push(answer)
  })

  // Create question object
  const question = {
    type: "Ghi nhãn Bản đồ/Sơ đồ",
    content: [questionType, instructions, imageSource, ...labels],
    correctAnswers: correctAnswers,
  }

  return question
}

// Implement the saveOneAnswerQuestion function
function saveOneAnswerQuestion(questionDiv) {
  const question = questionDiv.querySelector("#question").value
  const option1 = questionDiv.querySelector("input[name='option1']").value
  const option2 = questionDiv.querySelector("input[name='option2']").value
  const option3 = questionDiv.querySelector("input[name='option3']").value
  const option4 = questionDiv.querySelector("input[name='option4']").value
  const correctAnswer = questionDiv.querySelector("#correctAnswer").value

  return {
    type: "Một đáp án",
    content: [question, option1, option2, option3, option4],
    correctAnswers: [correctAnswer],
  }
}

// Implement the saveMultipleAnswerQuestion function
function saveMultipleAnswerQuestion(questionDiv) {
  const question = questionDiv.querySelector("#question").value
  const option1 = questionDiv.querySelector("input[name='option1']").value
  const option2 = questionDiv.querySelector("input[name='option2']").value
  const option3 = questionDiv.querySelector("input[name='option3']").value
  const option4 = questionDiv.querySelector("input[name='option4']").value

  const correctAnswers = []
  if (questionDiv.querySelector("#correctAnswer1").checked) correctAnswers.push("1")
  if (questionDiv.querySelector("#correctAnswer2").checked) correctAnswers.push("2")
  if (questionDiv.querySelector("#correctAnswer3").checked) correctAnswers.push("3")
  if (questionDiv.querySelector("#correctAnswer4").checked) correctAnswers.push("4")

  return {
    type: "Nhiều đáp án",
    content: [question, option1, option2, option3, option4],
    correctAnswers: correctAnswers,
  }
}

// Implement the saveMatchingQuestion function
function saveMatchingQuestion(questionDiv) {
  const title = questionDiv.querySelector("#title").value
  const item1 = questionDiv.querySelector("input[name='item1']").value
  const item2 = questionDiv.querySelector("input[name='item2']").value
  const item3 = questionDiv.querySelector("input[name='item3']").value
  const match1 = questionDiv.querySelector("input[name='match1']").value
  const match2 = questionDiv.querySelector("input[name='match2']").value
  const match3 = questionDiv.querySelector("input[name='match3']").value
  const correctMatches = questionDiv.querySelector("#correctMatches").value

  return {
    type: "Ghép nối",
    content: [title, item1, item2, item3, match1, match2, match3],
    correctAnswers: [correctMatches],
  }
}

// Implement the saveNoteCompletionQuestion function
function saveNoteCompletionQuestion(questionDiv) {
  const instructions = questionDiv.querySelector("#instructions").value
  const topic = questionDiv.querySelector("#topic").value
  const note1 = questionDiv.querySelector("textarea[name='note1']").value
  const note2 = questionDiv.querySelector("textarea[name='note2']").value
  const note3 = questionDiv.querySelector("textarea[name='note3']").value
  const correctAnswers = questionDiv.querySelector("#correctAnswers").value.split(",")

  return {
    type: "Hoàn thành ghi chú",
    content: [instructions, topic, note1, note2, note3],
    correctAnswers: correctAnswers,
  }
}

// Implement the saveFormTableCompletionQuestion function
function saveFormTableCompletionQuestion(questionDiv) {
  const instructions = questionDiv.querySelector("#instructions").value
  const row1 = questionDiv.querySelector("input[name='row1']").value
  const row2 = questionDiv.querySelector("input[name='row2']").value
  const row3 = questionDiv.querySelector("input[name='row3']").value
  const correctAnswers = questionDiv.querySelector("#correctAnswers").value.split(",")

  return {
    type: "Hoàn thành bảng/biểu mẫu",
    content: [instructions, row1, row2, row3],
    correctAnswers: correctAnswers,
  }
}

// Implement the saveFlowChartCompletionQuestion function
function saveFlowChartCompletionQuestion(questionDiv) {
  const title = questionDiv.querySelector("#title").value
  const instructions = questionDiv.querySelector("#instructions").value
  const item1 = questionDiv.querySelector("input[name='item1']").value
  const item2 = questionDiv.querySelector("input[name='item2']").value
  const item3 = questionDiv.querySelector("input[name='item3']").value
  const options = questionDiv.querySelector("#options").value.split(",")
  const correctAnswers = questionDiv.querySelector("#correctAnswers").value.split(",")

  return {
    type: "Hoàn thành lưu đồ",
    content: [title, instructions, item1, item2, item3, ...options],
    correctAnswers: correctAnswers,
  }
}

// Update the saveQuestion function to properly extract and save question content
function saveQuestion(questionDiv, questionType, partNumber) {
  console.log(`Saving question of type: ${questionType} to part ${partNumber}`)

  // Get the question data based on type
  let questionData = null

  switch (questionType) {
    case "Một đáp án":
      questionData = saveOneAnswerQuestion(questionDiv)
      break
    case "Nhiều đáp án":
      questionData = saveMultipleAnswerQuestion(questionDiv)
      break
    case "Ghép nối":
      questionData = saveMatchingQuestion(questionDiv)
      break
    case "Ghi nhãn Bản đồ/Sơ đồ":
      questionData = savePlanMapDiagramQuestion(questionDiv)
      break
    case "Hoàn thành ghi chú":
      questionData = saveNoteCompletionQuestion(questionDiv)
      break
    case "Hoàn thành bảng/biểu mẫu":
      questionData = saveFormTableCompletionQuestion(questionDiv)
      break
    case "Hoàn thành lưu đồ":
      questionData = saveFlowChartCompletionQuestion(questionDiv)
      break
    default:
      console.error("Unsupported question type:", questionType)
      return false
  }

  if (!questionData) {
    console.error("Failed to extract question data")
    return false
  }

  // Make sure the part array exists in the global test object
  if (!window.test[`part${partNumber}`]) {
    window.test[`part${partNumber}`] = []
  }

  // Find the question index in the DOM
  const partElement = questionDiv.closest(".part")
  const questions = Array.from(partElement.querySelectorAll(".question"))
  const questionIndex = questions.indexOf(questionDiv)

  // Update or add the question to the test object
  if (questionIndex !== -1 && questionIndex < window.test[`part${partNumber}`].length) {
    window.test[`part${partNumber}`][questionIndex] = questionData
    console.log(`Updated question at index ${questionIndex} in part${partNumber}`)
  } else {
    window.test[`part${partNumber}`].push(questionData)
    console.log(`Added new question to part${partNumber}`)
  }

  return true
}

// Make sure these functions are exposed to the global window object
window.addQuestion = addQuestion
window.deleteQuestion = deleteQuestion
window.renderQuestionTypes = renderQuestionTypes
window.getIconForType = getIconForType
window.displayExistingQuestions = displayExistingQuestions
window.fetchQuestionTypes = fetchQuestionTypes
window.updateQuestionCount = updateQuestionCount
window.renumberQuestions = renumberQuestions

// Dummy showNotification function
function showNotification(message, type) {
  alert(message)
}
