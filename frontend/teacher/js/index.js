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
    if (selectedTypes.length > 0 && typeof window.addQuestionDirectly === "function") {
      console.log("Creating first question of type:", selectedTypes[0])
      window.addQuestionDirectly(selectedTypes[0])
    }
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
  if (typeof window.addQuestionDirectly !== "function") {
    // Declare form creation functions
    const createOneAnswerForm = () => {
      // Không gọi window.createOneAnswerForm để tránh đệ quy
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

    const createMultipleAnswerForm = () => {
      if (typeof window.createMultipleAnswerForm === "function") {
        return window.createMultipleAnswerForm()
      }
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

    const createMatchingForm = () => {
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

    const createPlanMapDiagramForm = () => {
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

    const createNoteCompletionForm = () => {
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
          <textarea name="note3" required></textarea><br>
          <label for="correctAnswers">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
          <input type="text" id="correctAnswers" name="correctAnswers" required>
          <button type="button" onclick="saveNoteCompletionQuestion(this)">Lưu câu hỏi</button>
        </div>
      `
    }

    const createFormTableCompletionForm = () => {
      if (typeof window.createFormTableCompletionForm === "function") {
        return window.createFormTableCompletionForm()
      }
      return `
        <div class="form-table-completion-form">
          <label for="instructions">Hướng dẫn:</label>
          <input type="text" id="instructions" name="instructions" required>
          <table id="formTable">
            <tr>
              <th>Cột 1</th>
              <th>Cột 2</th>
              <th>Cột 3</th>
              <th>Đáp án</th>
            </tr>
            <tr>
              <td><input type="text" name="cell1_1" required></td>
              <td><input type="text" name="cell1_2" required></td>
              <td><input type="text" name="cell1_3" required></td>
              <td><input type="text" name="answer1" required></td>
            </tr>
          </table>
          <button type="button" onclick="addTableRow()">Thêm hàng</button>
          <button type="button" onclick="saveFormTableCompletionQuestion(this)">Lưu câu hỏi</button>
        </div>
      `
    }

    const createFlowChartCompletionForm = () => {
      if (typeof window.createFlowChartCompletionForm === "function") {
        return window.createFlowChartCompletionForm()
      }
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
          <button type="button" onclick="saveFlowChartCompletionQuestion(this)">Lưu câu hỏi</button>
        </div>
      `
    }

    // Declare initialize form functions
    const initializeOneAnswerForm = (questionDiv) => {
      if (typeof window.initializeOneAnswerForm === "function") {
        window.initializeOneAnswerForm(questionDiv)
      }
    }

    const initializeMultipleAnswerForm = (questionDiv) => {
      if (typeof window.initializeMultipleAnswerForm === "function") {
        window.initializeMultipleAnswerForm(questionDiv)
      }
    }

    const initializeMatchingForm = (questionDiv) => {
      if (typeof window.initializeMatchingForm === "function") {
        window.initializeMatchingForm(questionDiv)
      }
    }

    const initializePlanMapDiagram = (questionDiv) => {
      if (typeof window.initializePlanMapDiagram === "function") {
        window.initializePlanMapDiagram(questionDiv)
      }
    }

    const initializeNoteCompletionForm = (questionDiv) => {
      if (typeof window.initializeNoteCompletionForm === "function") {
        window.initializeNoteCompletionForm(questionDiv)
      }
    }

    const initializeFormTableCompletionForm = (questionDiv) => {
      if (typeof window.initializeFormTableCompletionForm === "function") {
        window.initializeFormTableCompletionForm(questionDiv)
      }
    }

    const initializeFlowChartCompletionForm = (questionDiv) => {
      if (typeof window.initializeFlowChartCompletionForm === "function") {
        window.initializeFlowChartCompletionForm(questionDiv)
      }
    }

    // Sửa hàm addQuestionDirectly để kiểm tra kỹ hơn về sự tồn tại của phần tử part
    window.addQuestionDirectly = (questionType) => {
      console.log("Adding question of type:", questionType);
  
  // Đảm bảo currentPart đã được định nghĩa
  if (typeof window.currentPart === "undefined") {
    window.currentPart = 1;
    console.log("Setting default currentPart to 1");
  }
  
  // Lấy phần tử part hiện tại
  const partId = `part${window.currentPart}`;
  let partElement = document.getElementById(partId);
  
  // Nếu không tìm thấy, tạo mới
  if (!partElement) {
    console.warn(`Element for ${partId} not found, creating it`);
    partElement = document.createElement("div");
    partElement.id = partId;
    partElement.className = "part";
    partElement.style.display = "block";
    
    // Thêm vào testContent
    const testContent = document.getElementById("testContent");
    if (testContent) {
      testContent.appendChild(partElement);
    } else {
      console.error("testContent element not found, cannot add part container");
      return;
    }
  }
  
  // Tạo một div mới cho câu hỏi
  const questionDiv = document.createElement("div");
  questionDiv.className = "question";
  
  // Thêm số câu hỏi và nút xóa
  const questionNumber = (window.test[`part${window.currentPart}`] || []).length + 1;
  questionDiv.innerHTML = `
    <h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionNumber}</h4>
    <h3>${getIconForType(questionType)} ${questionType}</h3>
    <button class="delete-question" onclick="deleteQuestion(${questionNumber - 1})"><i class="fas fa-trash"></i></button>
  `;
  
  // Thêm form phù hợp dựa trên loại câu hỏi
  // Sử dụng trực tiếp HTML thay vì gọi các hàm tạo form
  let formHTML = "";
  switch (questionType) {
    case "Một đáp án":
      formHTML = `
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
      `;
      break;
    case "Nhiều đáp án":
      formHTML = `
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
      `;
      break;
    case "Ghép nối":
      formHTML = `
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
      `;
      break;
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
            <label for="label1">Nhãn 1:</label>
            <input type="text" id="label1" name="label1" required>
            <label for="answer1">Đáp án 1:</label>
            <input type="text" id="answer1" name="answer1" required>
          </div>
          <button type="button" onclick="addLabel()">Thêm nhãn</button>
          <button type="button" onclick="savePlanMapDiagramQuestion(this)">Lưu câu hỏi</button>
        </div>
      `;
      break;
    case "Hoàn thành ghi chú":
      formHTML = `
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
          <button type="button" onclick="saveNoteCompletionQuestion(this)">Lưu câu hỏi</button>
        </div>
      `;
      break;
    case "Hoàn thành bảng/biểu mẫu":
      formHTML = `
        <div class="form-table-completion-form">
          <label for="instructions">Hướng dẫn:</label>
          <input type="text" id="instructions" name="instructions" required>
          <table id="formTable">
            <tr>
              <th>Cột 1</th>
              <th>Cột 2</th>
              <th>Cột 3</th>
              <th>Đáp án</th>
            </tr>
            <tr>
              <td><input type="text" name="cell1_1" required></td>
              <td><input type="text" name="cell1_2" required></td>
              <td><input type="text" name="cell1_3" required></td>
              <td><input type="text" name="answer1" required></td>
            </tr>
          </table>
          <button type="button" onclick="addTableRow()">Thêm hàng</button>
          <button type="button" onclick="saveFormTableCompletionQuestion(this)">Lưu câu hỏi</button>
        </div>
      `;
      break;
    case "Hoàn thành lưu đồ":
      formHTML = `
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
          <button type="button" onclick="saveFlowChartCompletionQuestion(this)">Lưu câu hỏi</button>
        </div>
      `;
      break;
    default:
      formHTML = `<p>Không hỗ trợ loại câu hỏi: ${questionType}</p>`;
  }
  
  questionDiv.innerHTML += formHTML;
  partElement.appendChild(questionDiv);
  
  // Tạo một đối tượng câu hỏi cơ bản và thêm vào bài kiểm tra
  const newQuestion = {
    type: questionType,
    content: ["Câu hỏi mẫu"],
    correctAnswers: ["Đáp án mẫu"],
  };
  
  // Thêm vào phần hiện tại
  if (!window.test[`part${window.currentPart}`]) {
    window.test[`part${window.currentPart}`] = [];
  }
  
  window.test[`part${window.currentPart}`].push(newQuestion);
  
  // Xóa thông báo "không có câu hỏi" nếu có
  const noQuestionsMsg = partElement.querySelector(".no-questions");
  if (noQuestionsMsg) {
    noQuestionsMsg.remove();
  }
};
    }
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
      console.error(\"saveTest function not found in window object")
      alert("Chức năng lưu bài kiểm tra chưa được cài đặt")
    }
  })
}
})

// Global function to handle question creation
window.addQuestion = (questionType) =>
{
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
    questionDiv.innerHTML = `
      <h4><i class="fas fa-question-circle"></i> Câu hỏi ${index + 1}</h4>
      <h3><i class="fas fa-check-circle"></i> ${question.type}</h3>
      <button class="delete-question" onclick="deleteQuestion(${index})"><i class="fas fa-trash"></i></button>
      <div class="question-content">
        <p><strong>Nội dung:</strong> ${question.content[0]}</p>
        <p><strong>Đáp án:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      </div>
    `
    partElement.appendChild(questionDiv)
  })
}

// Simple implementation of deleteQuestion
window.deleteQuestion = (index) => {
  console.log("Deleting question at index:", index)

  if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) {
    window.test[`part${window.currentPart}`].splice(index, 1)
    window.renderQuestionsForCurrentPart()

    if (typeof window.showNotification === "function") {
      window.showNotification("Đã xóa câu hỏi thành công", "success")
    } else {
      alert("Đã xóa câu hỏi thành công")
    }
  }
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

// Form creation functions
function createOneAnswerForm() {
  // Không gọi window.createOneAnswerForm để tránh đệ quy
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
  if (typeof window.createMultipleAnswerForm === "function") {
    return window.createMultipleAnswerForm()
  }
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
      <textarea name="note3" required></textarea><br>
      <label for="correctAnswers">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
      <input type="text" id="correctAnswers" name="correctAnswers" required>
      <button type="button" onclick="saveNoteCompletionQuestion(this)">Lưu câu hỏi</button>
    </div>
  `
}

function createFormTableCompletionForm() {
  if (typeof window.createFormTableCompletionForm === "function") {
    return window.createFormTableCompletionForm()
  }
  return `
    <div class="form-table-completion-form">
      <label for="instructions">Hướng dẫn:</label>
      <input type="text" id="instructions" name="instructions" required>
      <table id="formTable">
        <tr>
          <th>Cột 1</th>
          <th>Cột 2</th>
          <th>Cột 3</th>
          <th>Đáp án</th>
        </tr>
        <tr>
          <td><input type="text" name="cell1_1" required></td>
          <td><input type="text" name="cell1_2" required></td>
          <td><input type="text" name="cell1_3" required></td>
          <td><input type="text" name="answer1" required></td>
        </tr>
      </table>
      <button type="button" onclick="addTableRow()">Thêm hàng</button>
      <button type="button" onclick="saveFormTableCompletionQuestion(this)">Lưu câu hỏi</button>
    </div>
  `
}

function createFlowChartCompletionForm() {
  if (typeof window.createFlowChartCompletionForm === "function") {
    return window.createFlowChartCompletionForm()
  }
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
      <button type="button" onclick="saveFlowChartCompletionQuestion(this)">Lưu câu hỏi</button>
    </div>
  `
}

// Form initialization functions
function initializeOneAnswerForm(questionDiv) {
  if (typeof window.initializeOneAnswerForm === "function") {
    window.initializeOneAnswerForm(questionDiv)
  }
}

function initializeMultipleAnswerForm(questionDiv) {
  if (typeof window.initializeMultipleAnswerForm === "function") {
    window.initializeMultipleAnswerForm(questionDiv)
  }
}

function initializeMatchingForm(questionDiv) {
  if (typeof window.initializeMatchingForm === "function") {
    window.initializeMatchingForm(questionDiv)
  }
}

function initializePlanMapDiagram(questionDiv) {
  if (typeof window.initializePlanMapDiagram === "function") {
    window.initializePlanMapDiagram(questionDiv)
  }
}

function initializeNoteCompletionForm(questionDiv) {
  if (typeof window.initializeNoteCompletionForm === "function") {
    window.initializeNoteCompletionForm(questionDiv)
  }
}

function initializeFormTableCompletionForm(questionDiv) {
  if (typeof window.initializeFormTableCompletionForm === "function") {
    window.initializeFormTableCompletionForm(questionDiv)
  }
}

function initializeFlowChartCompletionForm(questionDiv) {
  if (typeof window.initializeFlowChartCompletionForm === "function") {
    window.initializeFlowChartCompletionForm(questionDiv)
  }
}

// Save question functions
window.saveOneAnswerQuestion = (button) => {
  const form = button.closest(".one-answer-form")
  const questionText = form.querySelector('[name="question"]').value
  const options = [
    form.querySelector('[name="option1"]').value,
    form.querySelector('[name="option2"]').value,
    form.querySelector('[name="option3"]').value,
    form.querySelector('[name="option4"]').value,
  ]
  const correctAnswer = form.querySelector('[name="correctAnswer"]').value

  // Create question object
  const questionData = {
    type: "Một đáp án",
    content: [questionText, ...options],
    correctAnswers: options[Number.parseInt(correctAnswer) - 1],
  }

  // Update the test object
  const questionIndex = Number.parseInt(button.closest(".question").querySelector("h4").textContent.match(/\d+/)[0]) - 1
  window.test[`part${window.currentPart}`][questionIndex] = questionData

  // Show success message
  window.showNotification("Câu hỏi đã được lưu thành công!", "success")
}

window.saveMultipleAnswerQuestion = (button) => {
  const form = button.closest(".multiple-answer-form")
  const questionText = form.querySelector('[name="question"]').value
  const options = [
    form.querySelector('[name="option1"]').value,
    form.querySelector('[name="option2"]').value,
    form.querySelector('[name="option3"]').value,
    form.querySelector('[name="option4"]').value,
  ]
  const correctAnswers = Array.from(form.querySelectorAll('[name="correctAnswers"]:checked')).map(
    (cb) => options[Number.parseInt(cb.value) - 1],
  )

  // Create question object
  const questionData = {
    type: "Nhiều đáp án",
    content: [questionText, ...options],
    correctAnswers: correctAnswers,
  }

  // Update the test object
  const questionIndex = Number.parseInt(button.closest(".question").querySelector("h4").textContent.match(/\d+/)[0]) - 1
  window.test[`part${window.currentPart}`][questionIndex] = questionData

  // Show success message
  window.showNotification("Câu hỏi đã được lưu thành công!", "success")
}

