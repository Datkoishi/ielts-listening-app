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
  let currentPart = 1
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
    console.log("Rendering test creation form from test-management.js")
    const testContent = document.getElementById("testContent")
    if (!testContent) {
      console.error("testContent element not found!")
      return
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
          <span>Part ${currentPart}</span>
        </div>
        
        <div class="question-types-container">
          <!-- One answer -->
          <div class="question-type-item">
            <div class="question-type-label">
              <span class="question-type-icon"><i class="fas fa-check-circle"></i></span>
              <span>One answer</span>
            </div>
            <button class="add-question-btn" onclick="createNewQuestion('Một đáp án')">
              <i class="fas fa-plus"></i> Add One answer Question
            </button>
          </div>
          
          <!-- More than one answer -->
          <div class="question-type-item">
            <div class="question-type-label">
              <span class="question-type-icon"><i class="fas fa-check-double"></i></span>
              <span>More than one answer</span>
            </div>
            <button class="add-question-btn" onclick="createNewQuestion('Nhiều đáp án')">
              <i class="fas fa-plus"></i> Add More than one answer Question
            </button>
          </div>
          
          <!-- Matching -->
          <div class="question-type-item">
            <div class="question-type-label">
              <span class="question-type-icon"><i class="fas fa-link"></i></span>
              <span>Matching</span>
            </div>
            <button class="add-question-btn" onclick="createNewQuestion('Ghép nối')">
              <i class="fas fa-plus"></i> Add Matching Question
            </button>
          </div>
          
          <!-- Plan/Map/Diagram labelling -->
          <div class="question-type-item">
            <div class="question-type-label">
              <span class="question-type-icon"><i class="fas fa-map-marker-alt"></i></span>
              <span>Plan/Map/Diagram labelling</span>
            </div>
            <button class="add-question-btn" onclick="createNewQuestion('Ghi nhãn Bản đồ/Sơ đồ')">
              <i class="fas fa-plus"></i> Add Plan/Map/Diagram labelling Question
            </button>
          </div>
          
          <!-- Note Completion -->
          <div class="question-type-item">
            <div class="question-type-label">
              <span class="question-type-icon"><i class="fas fa-sticky-note"></i></span>
              <span>Note Completion</span>
            </div>
            <button class="add-question-btn" onclick="createNewQuestion('Hoàn thành ghi chú')">
              <i class="fas fa-plus"></i> Add Note Completion Question
            </button>
          </div>
          
          <!-- Form/Table Completion -->
          <div class="question-type-item">
            <div class="question-type-label">
              <span class="question-type-icon"><i class="fas fa-table"></i></span>
              <span>Form/Table Completion</span>
            </div>
            <button class="add-question-btn" onclick="createNewQuestion('Hoàn thành bảng/biểu mẫu')">
              <i class="fas fa-plus"></i> Add Form/Table Completion Question
            </button>
          </div>
          
          <!-- Flow chart Completion -->
          <div class="question-type-item">
            <div class="question-type-label">
              <span class="question-type-icon"><i class="fas fa-project-diagram"></i></span>
              <span>Flow chart Completion</span>
            </div>
            <button class="add-question-btn" onclick="createNewQuestion('Hoàn thành lưu đồ')">
              <i class="fas fa-plus"></i> Add Flow chart Completion Question
            </button>
          </div>
        </div>
        
        <div class="navigation-buttons">
          <button class="nav-btn prev-btn" onclick="previousPart()">
            <i class="fas fa-arrow-left"></i> Previous Part
          </button>
          <button class="nav-btn next-btn" onclick="nextPart()">
            Next Part <i class="fas fa-arrow-right"></i>
          </button>
        </div>
        
        <div class="save-button-container">
          <button class="save-btn" onclick="saveTest()">
            <i class="fas fa-save"></i> Save Test
          </button>
        </div>
      </div>
    `
  
    // Hiển thị câu hỏi trong phần hiện tại nếu có
    renderQuestionsForCurrentPart()
  }
  
  // Hiển thị câu hỏi cho phần hiện tại
  function renderQuestionsForCurrentPart() {
    console.log(`Rendering questions for part ${currentPart}`)
    const part = document.getElementById(`part${currentPart}`)
    if (!part) {
      console.error(`part${currentPart} element not found!`)
      return
    }
  
    part.innerHTML = ""
  
    if (!test[`part${currentPart}`] || test[`part${currentPart}`].length === 0) {
      part.innerHTML = `<div class="no-questions">Không có câu hỏi nào trong phần này. Nhấn "Thêm câu hỏi" để bắt đầu.</div>`
      return
    }
  
    let questionIndex = 0
    for (let i = 1; i < currentPart; i++) {
      questionIndex += test[`part${i}`].length
    }
  
    test[`part${currentPart}`].forEach((question, index) => {
      const questionDiv = document.createElement("div")
      questionDiv.className = "question"
      questionDiv.innerHTML = `
        <h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionIndex + index + 1}</h4>
        <h3>${question.type}</h3>
        <button class="delete-question" onclick="deleteQuestion(${index})"><i class="fas fa-trash"></i></button>
        ${renderQuestionContent(question)}
      `
      part.appendChild(questionDiv)
    })
  }
  
  // Hiển thị nội dung câu hỏi dựa trên loại
  function renderQuestionContent(question) {
    switch (question.type) {
      case "Một đáp án":
        return renderOneAnswerQuestion(question)
      case "Nhiều đáp án":
        return renderMultipleAnswerQuestion(question)
      case "Ghép nối":
        return renderMatchingQuestion(question)
      case "Ghi nhãn Bản đồ/Sơ đồ":
        return renderPlanMapDiagramQuestion(question)
      case "Hoàn thành ghi chú":
        return renderNoteCompletionQuestion(question)
      case "Hoàn thành bảng/biểu mẫu":
        return renderFormTableCompletionQuestion(question)
      case "Hoàn thành lưu đồ":
        return renderFlowChartCompletionQuestion(question)
      default:
        return `<p>Không hỗ trợ loại câu hỏi này: ${question.type}</p>`
    }
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
    return `
      <div class="t1-ielts-creator">
        <form id="questionForm">
          <div class="t1-form-group">
            <label for="questionType">Loại câu hỏi:</label>
            <select id="questionType" required>
              <option value="map" ${question.content[0] === "map" ? "selected" : ""}>Ghi nhãn Bản đồ</option>
              <option value="ship" ${question.content[0] === "ship" ? "selected" : ""}>Sơ đồ Tàu</option>
              <option value="technical" ${question.content[0] === "technical" ? "selected" : ""}>Sơ đồ Kỹ thuật</option>
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
                <label for="answer${index}">Câu trả lời ${index + 1}:</label>
                <input type="text" id="answer${index}" value="${answer}" required>
                <label for="correctAnswer${index}">Đáp án đúng cho câu ${index + 1}:</label>
                <input type="text" id="correctAnswer${index}" value="${question.correctAnswers[index]}" required>
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
      test[`part${currentPart}`].splice(index, 1)
      updateQuestionCount()
      renderQuestionsForCurrentPart()
      showNotification("Đã xóa câu hỏi thành công", "success")
    }
  }
  
  // Chuyển đến phần trước
  function previousPart() {
    if (currentPart > 1) {
      currentPart--
      renderTestCreation()
    } else {
      showNotification("Đây đã là phần đầu tiên", "info")
    }
  }
  
  // Chuyển đến phần tiếp theo
  function nextPart() {
    if (currentPart < 4) {
      currentPart++
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
                  showNotification(`Lỗi khi xóa bài kiểm tra: ${error.message}`, "error")
                })
            }
          })
        })
      })
      .catch((error) => {
        console.error("Lỗi khi lấy danh sách bài kiểm tra:", error)
        showNotification(`Lỗi khi lấy danh sách bài kiểm tra: ${error.message}`, "error")
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
          test[`part${i}`] = []
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
        showNotification(`Đã tải bài kiểm tra "${test.title}"`, "success")
  
        // Chuyển đến trang tạo bài kiểm tra nếu đang ở trang chọn
        if (!document.getElementById("selectionPage").classList.contains("hidden")) {
          document.getElementById("selectionPage").classList.add("hidden")
          document.getElementById("testCreationPage").classList.remove("hidden")
        }
  
        // Hiển thị phần 1 mặc định
        currentPart = 1
        renderTestCreation()
      })
      .catch((error) => {
        console.error("Lỗi khi tải bài kiểm tra:", error)
        showNotification(`Lỗi khi tải bài kiểm tra: ${error.message}`, "error")
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
          currentPart = 1
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
      currentPart = 1
  
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
  
  // Thêm câu hỏi mới
  function addQuestion() {
    console.log("addQuestion function called")
    // Hiển thị modal chọn loại câu hỏi
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
  
    // Xử lý nút đóng
    const closeButton = modal.querySelector(".close-button")
    closeButton.addEventListener("click", () => {
      document.body.removeChild(modal)
    })
  
    // Xử lý nút chọn loại câu hỏi
    const typeButtons = modal.querySelectorAll(".question-type-btn")
    typeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const questionType = button.dataset.type
        createNewQuestion(questionType)
        document.body.removeChild(modal)
      })
    })
  }
  
  // Tạo câu hỏi mới dựa trên loại
  function createNewQuestion(questionType) {
    const newQuestion = {
      type: questionType,
      content: [],
      correctAnswers: [],
    }
  
    // Khởi tạo nội dung mặc định dựa trên loại câu hỏi
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
  
    // Thêm câu hỏi mới vào phần hiện tại
    test[`part${currentPart}`].push(newQuestion)
  
    // Cập nhật tổng số câu hỏi
    updateQuestionCount()
  
    // Hiển thị lại câu hỏi
    renderQuestionsForCurrentPart()
  
    showNotification(`Đã thêm câu hỏi loại "${questionType}" vào Phần ${currentPart}`, "success")
  }
  
  // Xóa các hàm liên quan đến đăng nhập/đăng ký
  // Tìm và xóa hàm showLoginForm
  // function showLoginForm() {
  // const loginModal = document.createElement("div")
  // loginModal.className = "login-modal"
  // loginModal.innerHTML = `
  //   <div class="login-content">
  //     <h2>Login</h2>
  //     <form id="loginForm">
  //       <div class="form-group">
  //         <label for="username">Username:</label>
  //         <input type="text" id="username" required>
  //       </div>
  //       <div class="form-group">
  //         <label for="password">Password:</label>
  //         <input type="password" id="password" required>
  //       </div>
  //       <button type="submit">Login</button>
  //     </form>
  //     <p>Don't have an account? <a href="#" id="showRegisterForm">Register</a></p>
  //     <div id="loginMessage" class="message"></div>
  //   </div>
  // `
  
  // document.body.appendChild(loginModal)
  
  // // Handle login form submission
  // document.getElementById("loginForm").addEventListener("submit", (e) => {
  //   e.preventDefault()
  //   const username = document.getElementById("username").value
  //   const password = document.getElementById("password").value
  
  //   login(username, password)
  //     .then(() => {
  //       document.body.removeChild(loginModal)
  //       showNotification("Login successful", "success")
  //     })
  //     .catch((error) => {
  //       document.getElementById("loginMessage").textContent = error.message
  //       document.getElementById("loginMessage").className = "message error"
  //     })
  // })
  
  // // Handle switch to register form
  // document.getElementById("showRegisterForm").addEventListener("click", (e) => {
  //   e.preventDefault()
  //   document.body.removeChild(loginModal)
  //   showRegisterForm()
  // })
  // }
  
  // // Xóa hàm showRegisterForm
  // function showRegisterForm() {
  // const registerModal = document.createElement("div")
  // registerModal.className = "register-modal"
  // registerModal.innerHTML = `
  //   <div class="register-content">
  //     <h2>Register</h2>
  //     <form id="registerForm">
  //       <div class="form-group">
  //         <label for="regUsername">Username:</label>
  //         <input type="text" id="regUsername" required>
  //       </div>
  //       <div class="form-group">
  //         <label for="regPassword">Password:</label>
  //         <input type="password" id="regPassword" required>
  //       </div>
  //       <div class="form-group">
  //         <label for="regConfirmPassword">Confirm Password:</label>
  //         <input type="password" id="regConfirmPassword" required>
  //       </div>
  //       <button type="submit">Register</button>
  //     </form>
  //     <p>Already have an account? <a href="#" id="showLoginForm">Login</a></p>
  //     <div id="registerMessage" class="message"></div>
  //   </div>
  // `
  
  // document.body.appendChild(registerModal)
  
  // // Handle register form submission
  // document.getElementById("registerForm").addEventListener("submit", (e) => {
  //   e.preventDefault()
  //   const username = document.getElementById("regUsername").value
  //   const password = document.getElementById("regPassword").value
  //   const confirmPassword = document.getElementById("regConfirmPassword").value
  
  //   if (password !== confirmPassword) {
  //     document.getElementById("registerMessage").textContent = "Passwords do not match"
  //     document.getElementById("registerMessage").className = "message error"
  //     return
  //   }
  
  //   register(username, password, "teacher")
  //     .then(() => {
  //       document.body.removeChild(registerModal)
  //       showNotification("Registration successful", "success")
  //     })
  //     .catch((error) => {
  //       document.getElementById("registerMessage").textContent = error.message
  //       document.getElementById("registerMessage").className = "message error"
  //     })
  // })
  
  // // Handle switch to login form
  // document.getElementById("showLoginForm").addEventListener("click", (e) => {
  //   e.preventDefault()
  //   document.body.removeChild(registerModal)
  //   showLoginForm()
  // })
  // }
  
  // Sửa đổi hàm document.addEventListener("DOMContentLoaded", ...) để loại bỏ kiểm tra đăng nhập
  document.addEventListener("DOMContentLoaded", () => {
    // Xóa kiểm tra đăng nhập
    // if (!isLoggedIn()) {
    //   showLoginForm()
    //   return
    // }
  
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
    currentPart = 1
    renderTestCreation()
  
    // Automatically show question creation form for the first selected type
    if (selectedTypes.length > 0) {
      console.log("Automatically creating question form for: " + selectedTypes[0])
      createNewQuestion(selectedTypes[0])
    }
  }
  
  // Make functions available globally
  window.previewEntireTest = previewEntireTest
  window.exportTest = exportTest
  window.importTest = importTest
  window.showTestList = showTestList
  window.createNewTest = createNewTest
  window.duplicateTest = duplicateTest
  window.generateTestPDF = generateTestPDF
  window.addQuestion = addQuestion
  window.deleteQuestion = deleteQuestion
  window.renderTestCreation = renderTestCreation
  window.startTestCreation = startTestCreation
  window.createNewQuestion = createNewQuestion
  
  // Make sure the startTestCreation and renderTestCreation functions are properly exposed to the global window object
  window.startTestCreation = startTestCreation
  window.renderTestCreation = renderTestCreation
  
  // Add this at the end of the file to ensure all functions are properly exposed
  window.previousPart = previousPart
  window.nextPart = nextPart
  window.saveTest = saveTest
  window.createNewQuestion = createNewQuestion
  window.deleteQuestion = deleteQuestion
  window.addQuestion = addQuestion
  
  