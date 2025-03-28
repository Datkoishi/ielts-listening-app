// Assume these variables are declared or imported elsewhere in the project
// For demonstration purposes, we'll declare them here
const showNotification = (message, type) => {
    console.log(`${type}: ${message}`)
  }
  const currentPart = 1
  const test = {}
  
  // Tạo form cho câu hỏi Một đáp án
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
              <button type="submit">Tạo câu hỏi</button>
          </form>
          <div class="t3-preview">
              <h2>Xem trước câu hỏi</h2>
              <div id="t3-questionPreview"></div>
          </div>
      </div>
    `
  }
  
  // Tạo form cho câu hỏi Nhiều đáp án
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
              <button type="submit">Tạo câu hỏi</button>
          </form>
          <div id="t4-previewArea"></div>
      </div>
    `
  }
  
  // Tạo form cho câu hỏi Ghép nối
  function createMatchingForm() {
    return `
      <div class="t3-question-creator">
          <form id="t3-questionForm">
              <div class="t3-form-group">
                  <label for="t3-numberOfQuestions">Số lượng câu hỏi:</label>
                  <input type="number" id="t3-numberOfQuestions" name="numberOfQuestions" min="1" max="10" value="1" required>
              </div>
              <div id="t3-questionsContainer"></div>
              <button type="submit">Tạo câu hỏi</button>
              <button type="button" id="t3-saveButton" class="t3-save-button">Lưu câu hỏi</button>
          </form>
          <div id="t3-message" class="t3-message" style="display: none;"></div>
          <div class="t3-preview">
              <h2>Xem trước câu hỏi</h2>
              <div id="t3-questionsPreview"></div>
          </div>
      </div>
    `
  }
  
  // Tạo form cho câu hỏi Ghi nhãn Bản đồ/Sơ đồ
  function createPlanMapDiagramForm() {
    return `
    <div class="t1-ielts-creator">
        <h1>Công cụ tạo câu hỏi IELTS Listening</h1>
  
        <div class="t1-instructions-section">
            <h2>Hướng dẫn tạo câu hỏi</h2>
            <ol class="t1-instructions-list">
                <li><strong>Chọn loại câu hỏi:</strong> Lựa chọn giữa Ghi nhãn Bản đồ, Sơ đồ Tàu, hoặc Sơ đồ Kỹ thuật.</li>
                <li><strong>Đặt số lượng câu hỏi:</strong> Quyết định số lượng câu hỏi bạn muốn tạo (1-10).</li>
                <li><strong>Viết hướng dẫn:</strong> Cung cấp hướng dẫn rõ ràng cho học viên làm theo.</li>
                <li><strong>Tải lên hình ảnh:</strong> Chọn hình ảnh phù hợp cho câu hỏi (bản đồ, sơ đồ tàu, hoặc sơ đồ kỹ thuật).</li>
                <li><strong>Thêm câu trả lời:</strong>
                    <ul>
                        <li>Đối với Ghi nhãn Bản đồ: Nhập tên địa điểm và chữ cái đúng (A-H).</li>
                        <li>Đối với Sơ đồ Tàu: Nhập tên khu vực và chữ cái hoặc số đúng.</li>
                        <li>Đối với Sơ đồ Kỹ thuật: Chỉ nhập câu trả lời đúng.</li>
                    </ul>
                </li>
                <li><strong>Xem lại và Gửi:</strong> Kiểm tra tất cả các mục nhập và nhấp vào "Thêm câu hỏi" để tạo câu hỏi.</li>
                <li><strong>Lưu câu hỏi:</strong> Sau khi tạo tất cả câu hỏi, nhấp vào "Lưu câu hỏi" để gửi về hệ thống.</li>
            </ol>
        </div>
  
        <div class="t1-form-section">
            <h2>Tạo câu hỏi mới</h2>
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
                    <label for="numQuestions">Số lượng câu hỏi:</label>
                    <input type="number" id="numQuestions" min="1" max="10" value="3" required>
                </div>
                <div class="t1-form-group">
                    <label for="instructions">Hướng dẫn:</label>
                    <textarea id="instructions" rows="3" required></textarea>
                </div>
                <div class="t1-form-group">
                    <label for="imageFile">Tải lên hình ảnh:</label>
                    <input type="file" id="imageFile" accept="image/*" required>
                </div>
                <div id="answerInputs">
                    <!-- Answer inputs will be dynamically added here -->
                </div>
                <button type="submit">Thêm câu hỏi</button>
            </form>
        </div>
  
        <div id="questionDisplay" class="t1-question-display">
            <h2>Câu hỏi đã tạo</h2>
            <!-- Questions will be dynamically added here -->
        </div>
  
        <div class="t1-save-button">
            <button id="saveQuestionsBtn">Lưu câu hỏi</button>
        </div>
  
        <div id="notification" class="t1-notification" style="display: none;"></div>
    </div>
    `
  }
  
  // Tạo form cho câu hỏi Hoàn thành ghi chú
  function createNoteCompletionForm() {
    return `
    <div class="t2-listening-exercise-app">
        <div class="t2-listening-exercise-container">
            <div class="t2-listening-exercise-form-container">
                <h2>Tạo bài tập Nghe</h2>
                <div class="t2-listening-exercise-instructions-box">
                    <h3>Hướng dẫn đặt câu hỏi:</h3>
                    <ul>
                        <li>Sử dụng [ANSWER] để đánh dấu vị trí cần điền đáp án.</li>
                        <li>Bạn có thể đặt nhiều [ANSWER] trong một câu hỏi.</li>
                        <li>Ví dụ: "Chiếc bàn ăn có hình [ANSWER] và [ANSWER] tuổi."</li>
                        <li>Mỗi [ANSWER] sẽ được chuyển thành một ô trống trong bài tập.</li>
                        <li>Nhập đáp án đúng cho mỗi [ANSWER] trong các ô bên dưới câu hỏi.</li>
                    </ul>
                </div>
                <form id="t2ListeningExerciseForm">
                    <div class="t2-listening-exercise-form-group">
                        <label for="t2ListeningExerciseInstructions">Hướng dẫn:</label>
                        <input type="text" id="t2ListeningExerciseInstructions" name="instructions" value="Hoàn thành ghi chú. Viết MỘT TỪ VÀ/HOẶC MỘT SỐ vào mỗi khoảng trống.">
                    </div>
                    <div class="t2-listening-exercise-form-group">
                        <label for="t2ListeningExerciseTopic">Chủ đề:</label>
                        <input type="text" id="t2ListeningExerciseTopic" name="topic" value="Cuộc gọi điện thoại về đồ nội thất cũ">
                    </div>
                    <div class="t2-listening-exercise-form-group">
                        <label for="t2ListeningExerciseQuestionCount">Số lượng câu hỏi:</label>
                        <input type="number" id="t2ListeningExerciseQuestionCount" name="questionCount" min="1" max="20" value="3">
                    </div>
                    <div id="t2ListeningExerciseQuestionContainer"></div>
                    <div class="t2-listening-exercise-button-group">
                        <button type="button" onclick="updateT2ListeningExercisePreview()">Cập nhật xem trước</button>
                        <button type="button" class="t2-listening-exercise-save-button" onclick="saveT2ListeningExercise()">Lưu bài tập</button>
                    </div>
                    <div id="t2ListeningExerciseStatusMessage" class="t2-listening-exercise-status-message"></div>
                </form>
            </div>
            <div class="t2-listening-exercise-preview-container">
                <h2>Xem trước</h2>
                <div id="t2ListeningExercisePreviewContent">
                    <!-- Preview content will be inserted here -->
                </div>
            </div>
        </div>
    `
  }
  
  // Tạo form cho câu hỏi Hoàn thành bảng/biểu mẫu
  function createFormTableCompletionForm() {
    return `
    <div class="t6-ielts-listening-creator">
      <div id="tableSection" class="t6-question-container">
        <textarea id="tableInstruction" rows="2">Hoàn thành bảng. Viết KHÔNG QUÁ MỘT TỪ VÀ/HOẶC MỘT SỐ cho mỗi khoảng trống.</textarea>
        <div class="t6-button-group">
          <button type="button" class="t6-add-row-btn">Thêm hàng</button>
          <button type="button" class="t6-save-btn">Lưu bảng</button>
        </div>
        <table id="fareTable">
          <tr>
            <th>Phương tiện</th>
            <th>Giá tiền mặt</th>
            <th>Giá thẻ</th>
            <th>Đáp án đúng</th>
            <th>Thao tác</th>
          </tr>
        </table>
      </div>
    </div>
    `
  }
  
  // Tạo form cho câu hỏi Hoàn thành lưu đồ
  function createFlowChartCompletionForm() {
    return `
    <div class="t7-ielts-flow-chart-creator">
      <form id="flowChartForm" class="flow-chart-form">
        <div class="form-group">
          <label for="flowChartTitle">Tiêu đề:</label>
          <input type="text" id="flowChartTitle" name="title" required>
        </div>
        
        <div class="form-group">
          <label for="flowChartInstructions">Hướng dẫn:</label>
          <textarea id="flowChartInstructions" name="instructions" required></textarea>
        </div>
  
        <div class="form-group">
          <label for="flowChartItems">Các mục lưu đồ (mỗi mục một dòng, sử dụng ___ cho khoảng trống):</label>
          <textarea id="flowChartItems" name="flowItems" required></textarea>
        </div>
  
        <div class="form-group">
          <label for="flowChartOptions">Lựa chọn (mỗi lựa chọn một dòng):</label>
          <textarea id="flowChartOptions" name="options" required></textarea>
        </div>
  
        <div class="form-group">
          <label for="flowChartAnswers">Đáp án đúng (cách nhau bằng dấu phẩy):</label>
          <input type="text" id="flowChartAnswers" name="correctAnswers" required>
        </div>
  
        <div class="button-group">
          <button type="submit" class="save-btn">Lưu câu hỏi</button>
          <button type="button" class="preview-btn">Xem trước</button>
        </div>
      </form>
      <div id="flowChartPreview" class="preview-section"></div>
    </div>
    `
  }
  
  // Khởi tạo form Một đáp án
  function initializeOneAnswerForm(container) {
    const form = container.querySelector(".t3-one-answer-form")
    const preview = container.querySelector("#t3-questionPreview")
  
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      const questionText = form.querySelector("#t3-questionText").value
      const options = form
        .querySelector("#t3-options")
        .value.split("\n")
        .filter((option) => option.trim() !== "")
      const correctAnswer = form.querySelector("#t3-correctAnswer").value
  
      // Xác thực đầu vào
      if (!questionText || options.length === 0 || !correctAnswer) {
        showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
        return
      }
  
      // Tạo đối tượng câu hỏi
      const questionData = {
        type: "Một đáp án",
        content: [questionText, ...options],
        correctAnswers: correctAnswer,
      }
  
      // Thêm vào đối tượng bài kiểm tra
      const part = currentPart
      if (part >= 1 && part <= 4) {
        if (!test[`part${part}`]) {
          test[`part${part}`] = []
        }
        test[`part${part}`].push(questionData)
      }
  
      preview.innerHTML = `
        <h3>${questionText}</h3>
        ${options
          .map(
            (option, index) => `
          <div>
            <input type="radio" id="option${index}" name="answer" value="${option}">
            <label for="option${index}">${option}</label>
            ${option === correctAnswer ? ' <span class="t3-correct-answer">(Đúng)</span>' : ""}
          </div>
        `,
          )
          .join("")}
      `
  
      showNotification("Câu hỏi đã được lưu thành công!", "success")
  
      // Đặt lại form cho câu hỏi tiếp theo
      form.reset()
    })
  }
  
  // Khởi tạo form Nhiều đáp án
  function initializeMultipleAnswerForm(container) {
    const form = container.querySelector("#t4-questionForm")
    const previewArea = container.querySelector("#t4-previewArea")
  
    form.addEventListener("submit", (e) => {
      e.preventDefault()
  
      const questionText = form.querySelector("#t4-questionText").value
      const options = form
        .querySelector("#t4-options")
        .value.split("\n")
        .filter((option) => option.trim() !== "")
      const correctAnswersInput = form.querySelector("#t4-correctAnswers").value
      const correctAnswers = correctAnswersInput
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num)
  
      // Xác thực đầu vào
      if (!questionText || options.length === 0 || correctAnswers.length === 0) {
        showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
        return
      }
  
      // Tạo đối tượng câu hỏi
      const questionData = {
        type: "Nhiều đáp án",
        content: [questionText, ...options],
        correctAnswers: correctAnswers,
      }
  
      // Thêm vào đối tượng bài kiểm tra
      const part = currentPart
      if (part >= 1 && part <= 4) {
        if (!test[`part${part}`]) {
          test[`part${part}`] = []
        }
        test[`part${part}`].push(questionData)
      }
  
      previewArea.innerHTML = `
        <div class="t4-preview">
          <h2>${questionText}</h2>
          ${options
            .map(
              (option, index) => `
              <label>
                <input type="checkbox">
                ${option}
                ${correctAnswers.includes((index + 1).toString()) ? '<span class="t4-correct-answer"> (Đúng)</span>' : ""}
              </label>
            `,
            )
            .join("")}
        </div>
      `
  
      showNotification("Câu hỏi đã được lưu thành công!", "success")
  
      // Đặt lại form cho câu hỏi tiếp theo
      form.reset()
    })
  }
  
  // Lưu câu hỏi Ghép nối
  function saveMatchingQuestions(container) {
    const count = Number.parseInt(container.querySelector("#t3-numberOfQuestions").value)
  
    // Xác thực rằng chúng ta có ít nhất một câu hỏi
    if (count <= 0) {
      showNotification("Vui lòng thêm ít nhất một câu hỏi", "error")
      return
    }
  
    for (let i = 0; i < count; i++) {
      const title = container.querySelector(`#t3-questionTitle${i}`).value
      const people = container
        .querySelector(`#t3-people${i}`)
        .value.split("\n")
        .filter((p) => p.trim() !== "")
      const responsibilities = container
        .querySelector(`#t3-responsibilities${i}`)
        .value.split("\n")
        .filter((r) => r.trim() !== "")
      const correctAnswers = container
        .querySelector(`#t3-correctAnswers${i}`)
        .value.split("\n")
        .filter((a) => a.trim() !== "")
  
      // Xác thực đầu vào
      if (!title || people.length === 0 || responsibilities.length === 0 || correctAnswers.length === 0) {
        showNotification(`Vui lòng điền đầy đủ thông tin cho câu hỏi ${i + 1}`, "error")
        return
      }
  
      // Tạo đối tượng câu hỏi
      const questionData = {
        type: "Ghép nối",
        content: [title, ...people, ...responsibilities],
        correctAnswers: correctAnswers,
      }
  
      // Thêm vào đối tượng bài kiểm tra
      const part = currentPart
      if (part >= 1 && part <= 4) {
        if (!test[`part${part}`]) {
          test[`part${part}`] = []
        }
        test[`part${part}`].push(questionData)
      }
    }
  
    showNotification("Câu hỏi đã được lưu thành công!", "success")
  
    // Đặt lại form cho câu hỏi tiếp theo
    container.querySelector("#t3-numberOfQuestions").value = "1"
    container.querySelector("#t3-questionsContainer").innerHTML = createQuestionFields(0)
  }
  
  // Khởi tạo form Ghép nối
  function initializeMatchingForm(container) {
    const form = container.querySelector("#t3-questionForm")
    const questionsContainer = container.querySelector("#t3-questionsContainer")
    const numberOfQuestionsInput = container.querySelector("#t3-numberOfQuestions")
    const saveButton = container.querySelector("#t3-saveButton")
    const questionsPreview = container.querySelector("#t3-questionsPreview")
  
    // Khởi tạo với một trường câu hỏi
    questionsContainer.innerHTML = createQuestionFields(0)
  
    // Cập nhật trường câu hỏi khi số lượng câu hỏi thay đổi
    numberOfQuestionsInput.addEventListener("change", () => {
      const count = Number.parseInt(numberOfQuestionsInput.value)
      let fieldsHTML = ""
      for (let i = 0; i < count; i++) {
        fieldsHTML += createQuestionFields(i)
      }
      questionsContainer.innerHTML = fieldsHTML
    })
  
    // Lưu câu hỏi
    saveButton.addEventListener("click", () => {
      saveMatchingQuestions(container)
    })
  
    // Cập nhật xem trước
    form.addEventListener("input", () => {
      updateMatchingPreview(container)
    })
  }
  
  // Tạo trường câu hỏi cho câu hỏi Ghép nối
  function createQuestionFields(index) {
    return `
      <div class="t3-question-fields" data-question="${index}">
          <h3>Câu hỏi ${index + 1}</h3>
          <div class="t3-form-group">
              <label for="t3-questionTitle${index}">Tiêu đề câu hỏi:</label>
              <input type="text" id="t3-questionTitle${index}" name="questionTitle${index}" required>
          </div>
          <div class="t3-form-group">
              <label for="t3-people${index}">Người (mỗi người một dòng):</label>
              <textarea id="t3-people${index}" name="people${index}" required></textarea>
          </div>
          <div class="t3-form-group">
              <label for="t3-responsibilities${index}">Trách nhiệm (mỗi trách nhiệm một dòng):</label>
              <textarea id="t3-responsibilities${index}" name="responsibilities${index}" required></textarea>
          </div>
          <div class="t3-form-group">
              <label for="t3-correctAnswers${index}">Đáp án đúng (mỗi đáp án một dòng, theo thứ tự người):</label>
              <textarea id="t3-correctAnswers${index}" name="correctAnswers${index}" required></textarea>
          </div>
      </div>
    `
  }
  
  // Cập nhật xem trước Ghép nối
  function updateMatchingPreview(container) {
    const count = Number.parseInt(container.querySelector("#t3-numberOfQuestions").value)
    let previewHTML = ""
  
    for (let i = 0; i < count; i++) {
      const title = container.querySelector(`#t3-questionTitle${i}`).value
      const people = container
        .querySelector(`#t3-people${i}`)
        .value.split("\n")
        .filter((p) => p.trim() !== "")
      const responsibilities = container
        .querySelector(`#t3-responsibilities${i}`)
        .value.split("\n")
        .filter((r) => r.trim() !== "")
      const correctAnswers = container
        .querySelector(`#t3-correctAnswers${i}`)
        .value.split("\n")
        .filter((a) => a.trim() !== "")
  
      previewHTML += `
        <div class="t3-question-preview">
            <h3>Câu hỏi ${i + 1}</h3>
            <div class="t3-question-title">${title}</div>
            <div class="t3-matching-section">
                <div>
                    <div class="t3-column-header">Người</div>
                    <div class="t3-matching-content">
                        ${people
                          .map(
                            (person, index) => `
                            <div class="t3-person-row">
                                <div class="t3-person-name">${person}</div>
                                <div class="t3-answer-box" ondrop="t3Drop(event)" ondragover="t3AllowDrop(event)"></div>
                                <div class="t3-correct-answer">(${correctAnswers[index] || ""})</div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                <div>
                    <div class="t3-column-header">Trách nhiệm nhân viên</div>
                    <div class="t3-responsibilities-content">
                        ${responsibilities
                          .map(
                            (resp) => `
                            <div class="t3-responsibility" draggable="true" ondragstart="t3Drag(event)">${resp}</div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        </div>
      `
    }
  
    container.querySelector("#t3-questionsPreview").innerHTML = previewHTML
  }
  
  // Dummy implementations to satisfy the calls
  function initializePlanMapDiagram(container) {
    console.log("initializePlanMapDiagram called")
  }
  
  function initializeNoteCompletionForm(container) {
    console.log("initializeNoteCompletionForm called")
  }
  
  function initializeFormTableCompletionForm(container) {
    console.log("initializeFormTableCompletionForm called")
  }
  
  function initializeFlowChartCompletionForm(container) {
    console.log("initializeFlowChartCompletionForm called")
  }
  
  // Make sure these functions are properly exported to the window object
  // Add this at the end of the file
  
  // Modify the window exports to avoid circular references
  // Export form creation functions to window object
  window.createOneAnswerFormOriginal = createOneAnswerForm
  window.createMultipleAnswerFormOriginal = createMultipleAnswerForm
  window.createMatchingFormOriginal = createMatchingForm
  window.createPlanMapDiagramFormOriginal = createPlanMapDiagramForm
  window.createNoteCompletionFormOriginal = createNoteCompletionForm
  window.createFormTableCompletionFormOriginal = createFormTableCompletionForm
  window.createFlowChartCompletionFormOriginal = createFlowChartCompletionForm
  
  // Export form initialization functions to window object
  window.initializeOneAnswerForm = initializeOneAnswerForm
  window.initializeMultipleAnswerForm = initializeMultipleAnswerForm
  window.initializeMatchingForm = initializeMatchingForm
  window.initializePlanMapDiagram = initializePlanMapDiagram
  window.initializeNoteCompletionForm = initializeNoteCompletionForm
  window.initializeFormTableCompletionForm = initializeFormTableCompletionForm
  window.initializeFlowChartCompletionForm = initializeFlowChartCompletionForm
  
  console.log("Form handlers loaded and exported to window object")
  
  