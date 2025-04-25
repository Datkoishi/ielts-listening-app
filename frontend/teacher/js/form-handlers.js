/**
 * Form Handlers - Xử lý các sự kiện form và tương tác người dùng
 */

// Biến lưu trữ dữ liệu bài kiểm tra hiện tại
const currentTest = {
  id: null,
  title: "",
  description: "",
  vietnameseName: "",
  audioUrl: "",
  sections: [],
  part1: [],
  part2: [],
  part3: [],
  part4: [],
}

/**
 * Hiển thị thông báo
 * @param {string} message - Thông báo hiển thị
 * @param {string} type - Loại thông báo (success, error, info, warning)
 */
function showNotification(message, type) {
  // Tạo hoặc cập nhật phần tử thông báo
  let notificationElement = document.getElementById("notification-container")
  if (!notificationElement) {
    notificationElement = document.createElement("div")
    notificationElement.id = "notification-container"
    document.body.appendChild(notificationElement)
  }

  // Tạo phần tử thông báo mới
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = message

  // Thêm thông báo vào container
  notificationElement.appendChild(notification)

  // Tự động ẩn thông báo sau một khoảng thời gian
  setTimeout(() => {
    notification.remove()
  }, 5000)
}

/**
 * Hiển thị thông báo lỗi
 * @param {Array|string} errors - Danh sách lỗi hoặc một chuỗi lỗi
 */
function showErrors(errors) {
  const errorMessages = Array.isArray(errors) ? errors : [errors]
  const errorMessage = errorMessages.join("<br>")
  showNotification(errorMessage, "error")
}

/**
 * Hiển thị thông báo đang tải
 * @param {string} message - Thông báo hiển thị
 */
function showLoading(message) {
  // Tạo hoặc cập nhật phần tử loading
  let loadingElement = document.getElementById("loading-indicator")
  if (!loadingElement) {
    loadingElement = document.createElement("div")
    loadingElement.id = "loading-indicator"
    loadingElement.className = "loading-indicator"
    document.body.appendChild(loadingElement)
  }

  loadingElement.innerHTML = `
    <div class="loading-spinner"></div>
    <div class="loading-message">${message}</div>
  `
  loadingElement.style.display = "flex"
}

/**
 * Hiển thị thông báo thành công
 * @param {string} message - Thông báo hiển thị
 */
function showSuccess(message) {
  showNotification(message, "success")
}

/**
 * Ẩn thông báo đang tải
 */
function hideLoading() {
  const loadingElement = document.getElementById("loading-indicator")
  if (loadingElement) {
    loadingElement.style.display = "none"
  }
}

/**
 * Cập nhật giao diện người dùng
 */
function updateUI() {
  // Cập nhật tiêu đề và mô tả
  document.getElementById("testTitle").value = currentTest.title || ""
  document.getElementById("testVietnameseName").value = currentTest.vietnameseName || ""
  document.getElementById("testDescription").value = currentTest.description || ""

  // Cập nhật danh sách phần
  updateSectionsList()

  // Cập nhật số lượng câu hỏi
  updateQuestionCount()

  // Hiển thị câu hỏi của phần hiện tại
  renderQuestionsForCurrentPart()
}

/**
 * Cập nhật xem trước âm thanh
 * @param {string} url - URL của file âm thanh
 */
function updateAudioPreview(url) {
  let audioContainer = document.getElementById("audioContainer")
  if (!audioContainer) {
    audioContainer = document.createElement("div")
    audioContainer.id = "audioContainer"
    audioContainer.className = "audio-container"
    audioContainer.innerHTML = `<h3>Âm thanh bài kiểm tra</h3>`

    const testContent = document.getElementById("testContent")
    if (testContent) {
      testContent.insertBefore(audioContainer, testContent.firstChild)
    }
  }

  let audioPlayer = document.getElementById("audioPlayer")
  if (!audioPlayer) {
    audioPlayer = document.createElement("audio")
    audioPlayer.id = "audioPlayer"
    audioPlayer.controls = true
    audioContainer.appendChild(audioPlayer)
  }

  audioPlayer.src = url

  // Hiển thị thời lượng khi metadata được tải
  audioPlayer.onloadedmetadata = () => {
    const audioDuration = audioPlayer.duration
    let durationDisplay = document.getElementById("audioDuration")
    if (!durationDisplay) {
      durationDisplay = document.createElement("div")
      durationDisplay.id = "audioDuration"
      audioContainer.appendChild(durationDisplay)
    }
    durationDisplay.textContent = `Thời lượng: ${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60)
      .toString()
      .padStart(2, "0")}`
  }
}

/**
 * Cập nhật xem trước hình ảnh
 * @param {string} url - URL của hình ảnh
 */
function updateImagePreview(url) {
  const imagePreview = document.getElementById("imagePreview")
  if (imagePreview) {
    imagePreview.innerHTML = `<img src="${url}" alt="Preview" style="max-width: 200px; max-height: 200px;">`
  }
}

/**
 * Tạo ID duy nhất
 * @returns {string} ID duy nhất
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

/**
 * Cập nhật danh sách phần
 */
function updateSectionsList() {
  // Đảm bảo các phần tử part tồn tại
  for (let i = 1; i <= 4; i++) {
    if (!document.getElementById(`part${i}`)) {
      const partDiv = document.createElement("div")
      partDiv.id = `part${i}`
      partDiv.className = "part"
      partDiv.style.display = i === window.currentPart ? "block" : "none"

      const testContent = document.getElementById("testContent")
      if (testContent) {
        testContent.appendChild(partDiv)
      }
    }
  }

  // Cập nhật hiển thị phần hiện tại
  for (let i = 1; i <= 4; i++) {
    const partDiv = document.getElementById(`part${i}`)
    if (partDiv) {
      partDiv.style.display = i === window.currentPart ? "block" : "none"
    }
  }
}

/**
 * Cập nhật số lượng câu hỏi
 */
function updateQuestionCount() {
  // Logic để cập nhật số lượng câu hỏi, ví dụ:
  // document.getElementById("questionCount").textContent = currentTest.questions.length;
}

/**
 * Hiển thị câu hỏi của phần hiện tại
 */
function renderQuestionsForCurrentPart() {
  // Logic để hiển thị câu hỏi của phần hiện tại, ví dụ:
  // const currentQuestions = currentTest.parts[window.currentPart];
  // ...
}

/**
 * Đặt lại form phần
 */
function resetSectionForm() {
  const sectionTitleInput = document.getElementById("section-title")
  const sectionDescriptionInput = document.getElementById("section-description")
  const sectionIdInput = document.getElementById("section-id")

  if (sectionTitleInput) sectionTitleInput.value = ""
  if (sectionDescriptionInput) sectionDescriptionInput.value = ""
  if (sectionIdInput) sectionIdInput.value = ""
}

/**
 * Lấy các lựa chọn cho câu hỏi trắc nghiệm
 * @returns {Array} Danh sách các lựa chọn
 */
function getMultipleChoiceOptions() {
  const options = []
  const optionInputs = document.querySelectorAll('input[name="option"]')
  optionInputs.forEach((input) => {
    if (input.value.trim()) {
      options.push(input.value.trim())
    }
  })
  return options
}

/**
 * Lấy các câu trả lời cho câu hỏi điền vào chỗ trống
 * @returns {Array} Danh sách các câu trả lời
 */
function getFillInTheBlankAnswers() {
  const answers = []
  const answerInputs = document.querySelectorAll('input[name="noteAnswer"]')
  answerInputs.forEach((input) => {
    if (input.value.trim()) {
      answers.push(input.value.trim())
    }
  })
  return answers
}

/**
 * Lấy các cặp ghép nối
 * @returns {Array} Danh sách các cặp ghép nối
 */
function getMatchingPairs() {
  const pairs = []
  const itemInputs = document.querySelectorAll('input[name="item"]')
  const matchInputs = document.querySelectorAll('input[name="match"]')
  const matchingSelects = document.querySelectorAll('select[name="matchingAnswer"]')

  for (let i = 0; i < itemInputs.length; i++) {
    if (i < matchingSelects.length && itemInputs[i].value.trim() && matchingSelects[i].value) {
      pairs.push({
        item: itemInputs[i].value.trim(),
        match: matchingSelects[i].value,
      })
    }
  }

  return pairs
}

/**
 * Lấy các vị trí trên bản đồ/sơ đồ
 * @returns {Array} Danh sách các vị trí
 */
function getMapLocations() {
  const locations = []
  const labelInputs = document.querySelectorAll('input[name="label"]')
  const answerInputs = document.querySelectorAll('select[name="answer"], input[name="shipAnswer"]')

  for (let i = 0; i < labelInputs.length; i++) {
    if (i < answerInputs.length && labelInputs[i].value.trim() && answerInputs[i].value) {
      locations.push({
        id: generateUniqueId(),
        label: labelInputs[i].value.trim(),
        answer: answerInputs[i].value,
        x: 0, // Giá trị mặc định, sẽ được cập nhật khi người dùng chọn vị trí trên hình ảnh
        y: 0,
      })
    }
  }

  return locations
}

/**
 * Cập nhật danh sách câu hỏi
 * @param {string} sectionId - ID của phần
 */
function updateQuestionsList(sectionId) {
  // Trong trường hợp này, sectionId tương ứng với số phần (1-4)
  const partNumber = Number.parseInt(sectionId)
  if (isNaN(partNumber) || partNumber < 1 || partNumber > 4) return

  // Cập nhật hiển thị câu hỏi cho phần hiện tại
  if (partNumber === window.currentPart) {
    renderQuestionsForCurrentPart()
  }
}

/**
 * Đặt lại form câu hỏi
 */
function resetQuestionForm() {
  // Đặt lại các trường form câu hỏi
  const questionTextInput = document.getElementById("question-text")
  const questionTypeSelect = document.getElementById("question-type")
  const questionIdInput = document.getElementById("question-id")

  if (questionTextInput) questionTextInput.value = ""
  if (questionTypeSelect) questionTypeSelect.selectedIndex = 0
  if (questionIdInput) questionIdInput.value = ""

  // Đặt lại các trường đặc biệt theo loại câu hỏi
  document.querySelectorAll(".question-type-specific").forEach((el) => {
    el.style.display = "none"
  })

  // Hiển thị trường đặc biệt cho loại câu hỏi mặc định
  if (questionTypeSelect) {
    const defaultType = questionTypeSelect.value
    const specificElement = document.getElementById(`${defaultType}-options`)
    if (specificElement) {
      specificElement.style.display = "block"
    }
  }
}

/**
 * Xử lý thay đổi loại câu hỏi
 * @param {Event} event - Sự kiện change
 */
function handleQuestionTypeChange(event) {
  const questionType = event.target.value

  // Ẩn tất cả các phần tử đặc biệt
  document.querySelectorAll(".question-type-specific").forEach((el) => {
    el.style.display = "none"
  })

  // Hiển thị phần tử tương ứng với loại câu hỏi
  const specificElement = document.getElementById(`${questionType}-options`)
  if (specificElement) {
    specificElement.style.display = "block"
  }
}

/**
 * Lưu bài kiểm tra lên server
 * @param {Object} testData - Dữ liệu bài kiểm tra
 */
async function saveTestToServer(testData) {
  // Logic để lưu bài kiểm tra lên server, ví dụ:
  // const response = await fetch("/api/saveTest", {
  //   method: "POST",
  //   body: JSON.stringify(testData),
  //   headers: {
  //     "Content-Type": "application/json"
  //   }
  // });
  // if (!response.ok) {
  //   throw new Error("Lỗi khi lưu bài kiểm tra");
  // }
  // return response.json();
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
  console.log("Test saved:", testData)
}

/**
 * Xử lý gửi form bài kiểm tra
 * @param {Event} event - Sự kiện submit
 */
async function handleTestFormSubmit(event) {
  event.preventDefault()

  try {
    // Lấy dữ liệu từ form
    const title = document.getElementById("testTitle").value
    const vietnameseName = document.getElementById("testVietnameseName").value
    const description = document.getElementById("testDescription").value

    // Cập nhật dữ liệu bài kiểm tra
    currentTest.title = title
    currentTest.vietnameseName = vietnameseName
    currentTest.description = description

    // Kiểm tra tính hợp lệ cơ bản
    if (!title) {
      showErrors("Tiêu đề bài kiểm tra không được để trống")
      return
    }

    // Hiển thị thông báo đang xử lý
    showLoading("Đang lưu bài kiểm tra...")

    // Lưu bài kiểm tra
    await saveTestToServer(currentTest)

    // Hiển thị thông báo thành công
    showSuccess("Bài kiểm tra đã được lưu thành công")
  } catch (error) {
    // Hiển thị thông báo lỗi
    showErrors(error.message || "Đã xảy ra lỗi khi lưu bài kiểm tra")
  } finally {
    // Ẩn thông báo đang xử lý
    hideLoading()
  }
}

/**
 * Xử lý tải lên file âm thanh
 * @param {Event} event - Sự kiện change
 */
function handleAudioUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Kiểm tra loại file
  if (!file.type.startsWith("audio/")) {
    showErrors("File không hợp lệ. Vui lòng chọn file âm thanh")
    return
  }

  // Tạo URL cho file
  const audioUrl = URL.createObjectURL(file)

  // Cập nhật dữ liệu bài kiểm tra
  currentTest.audioUrl = audioUrl

  // Cập nhật giao diện
  updateAudioPreview(audioUrl)

  // Hiển thị thông báo thành công
  showSuccess("File âm thanh đã được tải lên thành công")
}

/**
 * Xử lý tải lên hình ảnh
 * @param {Event} event - Sự kiện change
 */
function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Kiểm tra loại file
  if (!file.type.startsWith("image/")) {
    showErrors("File không hợp lệ. Vui lòng chọn file hình ảnh")
    return
  }

  // Tạo URL cho file
  const imageUrl = URL.createObjectURL(file)

  // Cập nhật URL hình ảnh trong form
  const imageUrlInput = document.getElementById("diagram-image-url")
  if (imageUrlInput) {
    imageUrlInput.value = imageUrl
  }

  // Cập nhật giao diện
  updateImagePreview(imageUrl)

  // Hiển thị thông báo thành công
  showSuccess("Hình ảnh đã được tải lên thành công")
}

/**
 * Lưu câu hỏi một đáp án
 * @param {HTMLElement} questionDiv - Phần tử chứa câu hỏi
 * @returns {Object} Dữ liệu câu hỏi
 */
function saveOneAnswerQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const questionText = questionDiv.querySelector("#question").value
    const options = Array.from(questionDiv.querySelectorAll('input[name="option"]')).map((input) => input.value)
    const selectedRadio = questionDiv.querySelector('input[name="correctAnswer"]:checked')

    if (!questionText || options.length === 0 || !selectedRadio) {
      showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return null
    }

    const correctAnswerIndex = Number.parseInt(selectedRadio.value)
    const correctAnswer = options[correctAnswerIndex]

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Một đáp án",
      content: [questionText, ...options],
      correctAnswers: correctAnswer,
    }

    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi một đáp án:", error)
    showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
    return null
  }
}

/**
 * Lưu câu hỏi nhiều đáp án
 * @param {HTMLElement} questionDiv - Phần tử chứa câu hỏi
 * @returns {Object} Dữ liệu câu hỏi
 */
function saveMultipleAnswerQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const questionText = questionDiv.querySelector("#question").value
    const options = Array.from(questionDiv.querySelectorAll('input[name="option"]')).map((input) => input.value)
    const selectedCheckboxes = Array.from(questionDiv.querySelectorAll('input[name="correctAnswer"]:checked'))

    if (!questionText || options.length === 0 || selectedCheckboxes.length === 0) {
      showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return null
    }

    const correctAnswerIndices = selectedCheckboxes.map((checkbox) => Number.parseInt(checkbox.value))
    const correctAnswers = correctAnswerIndices.map((index) => options[index])

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Nhiều đáp án",
      content: [questionText, ...options],
      correctAnswers: correctAnswers,
    }

    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi nhiều đáp án:", error)
    showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
    return null
  }
}

/**
 * Lưu câu hỏi ghép nối
 * @param {HTMLElement} questionDiv - Phần tử chứa câu hỏi
 * @returns {Object} Dữ liệu câu hỏi
 */
function saveMatchingQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const title = questionDiv.querySelector("#title").value
    const items = Array.from(questionDiv.querySelectorAll('input[name="item"]')).map((input) => input.value)
    const matches = Array.from(questionDiv.querySelectorAll('input[name="match"]')).map((input) => input.value)
    const answers = Array.from(questionDiv.querySelectorAll('select[name="matchingAnswer"]')).map(
      (select) => select.value,
    )

    if (!title || items.length === 0 || matches.length === 0 || answers.some((a) => !a)) {
      showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return null
    }

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Ghép nối",
      content: [title, ...items, ...matches],
      correctAnswers: answers,
    }

    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi ghép nối:", error)
    showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
    return null
  }
}

/**
 * Lưu câu hỏi ghi nhãn bản đồ/sơ đồ
 * @param {HTMLElement} questionDiv - Phần tử chứa câu hỏi
 * @returns {Object} Dữ liệu câu hỏi
 */
function savePlanMapDiagramQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const type = questionDiv.querySelector("#type").value
    const instructions = questionDiv.querySelector("#instructions").value.trim()
    const imagePreview = questionDiv.querySelector("#imagePreview img")
    const imageUrl = imagePreview ? imagePreview.src : ""

    // Lấy nhãn và đáp án
    const labels = Array.from(questionDiv.querySelectorAll('input[name="label"]')).map((input) => input.value.trim())
    let answers = []

    if (type === "map") {
      answers = Array.from(questionDiv.querySelectorAll('select[name="answer"]')).map((select) => select.value)
    } else {
      answers = Array.from(questionDiv.querySelectorAll('input[name="shipAnswer"]')).map((input) => input.value.trim())
    }

    // Kiểm tra dữ liệu
    if (!instructions || !imageUrl || labels.length === 0 || answers.length === 0 || labels.length !== answers.length) {
      showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return null
    }

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Ghi nhãn Bản đồ/Sơ đồ",
      content: [type, instructions, imageUrl, ...labels],
      correctAnswers: answers,
    }

    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi ghi nhãn bản đồ/sơ đồ:", error)
    showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
    return null
  }
}

/**
 * Lưu câu hỏi hoàn thành ghi chú
 * @param {HTMLElement} questionDiv - Phần tử chứa câu hỏi
 * @returns {Object} Dữ liệu câu hỏi
 */
function saveNoteCompletionQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const instructions = questionDiv.querySelector("#instructions").value
    const topic = questionDiv.querySelector("#topic").value
    const notes = Array.from(questionDiv.querySelectorAll('textarea[name="note"]')).map((textarea) => textarea.value)
    const answers = Array.from(questionDiv.querySelectorAll('input[name="noteAnswer"]')).map((input) => input.value)

    // Kiểm tra dữ liệu
    if (!instructions || !topic || notes.length === 0 || answers.length === 0 || notes.length !== answers.length) {
      showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return null
    }

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Hoàn thành ghi chú",
      content: [instructions, topic, ...notes],
      correctAnswers: answers,
    }

    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi hoàn thành ghi chú:", error)
    showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
    return null
  }
}

/**
 * Lưu câu hỏi hoàn thành bảng/biểu mẫu
 * @param {HTMLElement} questionDiv - Phần tử chứa câu hỏi
 * @returns {Object} Dữ liệu câu hỏi
 */
function saveFormTableCompletionQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const instructions = questionDiv.querySelector("#instructions").value
    const rows = Array.from(questionDiv.querySelectorAll("#formTable tbody tr"))
    const content = [instructions]
    const answers = []

    // Lấy dữ liệu từ các hàng
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td input")
      if (cells.length >= 4) {
        content.push(cells[0].value) // Cột 1
        content.push(cells[1].value) // Cột 2
        content.push(cells[2].value) // Cột 3
        answers.push(cells[3].value) // Đáp án
      }
    })

    // Kiểm tra dữ liệu
    if (!instructions || content.length <= 1 || answers.length === 0) {
      showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return null
    }

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Hoàn thành bảng/biểu mẫu",
      content: content,
      correctAnswers: answers,
    }

    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi hoàn thành bảng/biểu mẫu:", error)
    showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
    return null
  }
}

/**
 * Lưu câu hỏi hoàn thành lưu đồ
 * @param {HTMLElement} questionDiv - Phần tử chứa câu hỏi
 * @returns {Object} Dữ liệu câu hỏi
 */
function saveFlowChartCompletionQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const title = questionDiv.querySelector("#title").value
    const instructions = questionDiv.querySelector("#instructions").value
    const flowItems = Array.from(questionDiv.querySelectorAll('input[name="flowItem"]')).map((input) => input.value)
    const flowOptions = Array.from(questionDiv.querySelectorAll('input[name="flowOption"]')).map((input) => input.value)
    const flowAnswers = Array.from(questionDiv.querySelectorAll('input[name="flowAnswer"]')).map((input) => input.value)

    // Kiểm tra dữ liệu
    if (!title || !instructions || flowItems.length === 0 || flowOptions.length === 0 || flowAnswers.length === 0) {
      showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return null
    }

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Hoàn thành lưu đồ",
      content: [title, instructions, ...flowItems, ...flowOptions],
      correctAnswers: flowAnswers,
    }

    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi hoàn thành lưu đồ:", error)
    showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
    return null
  }
}

/**
 * Kiểm tra tính hợp lệ của câu hỏi
 * @param {Object} question - Dữ liệu câu hỏi
 * @returns {Object} Kết quả kiểm tra {isValid, errors}
 */
function validateQuestion(question) {
  const errors = []

  // Kiểm tra loại câu hỏi
  if (!question.type) {
    errors.push("Loại câu hỏi không được để trống")
    return { isValid: false, errors }
  }

  // Kiểm tra nội dung
  if (!question.content || !Array.isArray(question.content) || question.content.length === 0) {
    errors.push("Nội dung câu hỏi không được để trống")
    return { isValid: false, errors }
  }

  // Kiểm tra đáp án
  if (
    !question.correctAnswers ||
    (Array.isArray(question.correctAnswers) && question.correctAnswers.length === 0) ||
    (typeof question.correctAnswers === "string" && question.correctAnswers.trim() === "")
  ) {
    errors.push("Đáp án đúng không được để trống")
    return { isValid: false, errors }
  }

  // Kiểm tra chi tiết theo loại câu hỏi
  switch (question.type) {
    case "Một đáp án":
      if (question.content.length < 2) {
        errors.push("Câu hỏi một đáp án phải có ít nhất một câu hỏi và một lựa chọn")
      }
      break

    case "Nhiều đáp án":
      if (question.content.length < 2) {
        errors.push("Câu hỏi nhiều đáp án phải có ít nhất một câu hỏi và một lựa chọn")
      }
      if (!Array.isArray(question.correctAnswers)) {
        errors.push("Đáp án đúng phải là một mảng")
      }
      break

    case "Ghép nối":
      if (question.content.length < 3) {
        errors.push("Câu hỏi ghép nối phải có tiêu đề và ít nhất một cặp ghép nối")
      }
      break

    case "Ghi nhãn Bản đồ/Sơ đồ":
      if (question.content.length < 4) {
        errors.push("Câu hỏi ghi nhãn phải có loại, hướng dẫn, hình ảnh và ít nhất một nhãn")
      }
      if (!question.content[2] || question.content[2].trim() === "") {
        errors.push("Hình ảnh không được để trống")
      }
      break

    case "Hoàn thành ghi chú":
      if (question.content.length < 3) {
        errors.push("Câu hỏi hoàn thành ghi chú phải có hướng dẫn, chủ đề và ít nhất một ghi chú")
      }
      break

    case "Hoàn thành bảng/biểu mẫu":
      if (question.content.length < 4) {
        errors.push("Câu hỏi hoàn thành bảng/biểu mẫu phải có hướng dẫn và ít nhất một hàng")
      }
      break

    case "Hoàn thành lưu đồ":
      if (question.content.length < 4) {
        errors.push("Câu hỏi hoàn thành lưu đồ phải có tiêu đề, hướng dẫn và ít nhất một mục")
      }
      break

    default:
      errors.push(`Loại câu hỏi không được hỗ trợ: ${question.type}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Thêm hàm validateQuestion vào window
window.validateQuestion = validateQuestion

/**
 * Khởi tạo form handlers
 */
function initFormHandlers() {
  // Xử lý form tạo bài kiểm tra
  const testForm = document.getElementById("test-form")
  if (testForm) {
    testForm.addEventListener("submit", handleTestFormSubmit)
  }

  // Xử lý form tải lên file âm thanh
  const audioFileInput = document.getElementById("audio-file")
  if (audioFileInput) {
    audioFileInput.addEventListener("change", handleAudioUpload)
  }

  // Xử lý form tạo câu hỏi
  const questionForm = document.getElementById("question-form")
  if (questionForm) {
    questionForm.addEventListener("submit", (event) => {
      event.preventDefault()
      // Xử lý gửi form câu hỏi
    })

    // Xử lý thay đổi loại câu hỏi
    const questionTypeSelect = document.getElementById("question-type")
    if (questionTypeSelect) {
      questionTypeSelect.addEventListener("change", handleQuestionTypeChange)
    }
  }

  // Xử lý form tải lên hình ảnh cho câu hỏi bản đồ/sơ đồ
  const imageFileInput = document.getElementById("image-file")
  if (imageFileInput) {
    imageFileInput.addEventListener("change", handleImageUpload)
  }

  // Khởi tạo các nút thêm và xóa động
  initDynamicButtons()
}

/**
 * Khởi tạo các nút thêm và xóa động
 */
function initDynamicButtons() {
  // Thêm lựa chọn cho câu hỏi trắc nghiệm
  const addOptionBtn = document.querySelector(".add-option-btn")
  if (addOptionBtn) {
    addOptionBtn.addEventListener("click", addOptionItem)
  }

  // Thêm mục cho câu hỏi ghép nối
  const addItemBtn = document.querySelector(".add-item-btn")
  if (addItemBtn) {
    addItemBtn.addEventListener("click", addItemRow)
  }

  // Thêm ghép nối cho câu hỏi ghép nối
  const addMatchBtn = document.querySelector(".add-match-btn")
  if (addMatchBtn) {
    addMatchBtn.addEventListener("click", addMatchRow)
  }

  // Thêm nhãn cho câu hỏi bản đồ/sơ đồ
  const addLabelBtn = document.querySelector(".add-label-btn")
  if (addLabelBtn) {
    addLabelBtn.addEventListener("click", addLabelRow)
  }

  // Thêm ghi chú cho câu hỏi hoàn thành ghi chú
  const addNoteBtn = document.querySelector(".add-note-btn")
  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", addNoteRow)
  }

  // Thêm hàng cho câu hỏi hoàn thành bảng/biểu mẫu
  const addRowBtn = document.querySelector(".add-row-btn")
  if (addRowBtn) {
    addRowBtn.addEventListener("click", addTableRow)
  }

  // Thêm mục cho câu hỏi hoàn thành lưu đồ
  const addFlowItemBtn = document.querySelector(".add-flow-item-btn")
  if (addFlowItemBtn) {
    addFlowItemBtn.addEventListener("click", addFlowItemRow)
  }

  // Thêm lựa chọn cho câu hỏi hoàn thành lưu đồ
  const addFlowOptionBtn = document.querySelector(".add-flow-option-btn")
  if (addFlowOptionBtn) {
    addFlowOptionBtn.addEventListener("click", addFlowOptionRow)
  }
}

/**
 * Thêm lựa chọn cho câu hỏi trắc nghiệm
 */
function addOptionItem() {
  const optionsList = document.getElementById("options-list")
  if (!optionsList) return

  const optionCount = optionsList.children.length
  const newOptionItem = document.createElement("div")
  newOptionItem.className = "option-item"
  newOptionItem.innerHTML = `
    <input type="text" name="option" required placeholder="Lựa chọn ${optionCount + 1}">
    <input type="radio" name="correctAnswer" value="${optionCount}">
    <button type="button" class="remove-option-btn"><i class="fas fa-times"></i></button>
  `

  optionsList.appendChild(newOptionItem)

  // Khởi tạo nút xóa
  const removeButton = newOptionItem.querySelector(".remove-option-btn")
  removeButton.addEventListener("click", () => {
    newOptionItem.remove()
  })
}

/**
 * Thêm mục cho câu hỏi ghép nối
 */
function addItemRow() {
  const itemsList = document.getElementById("items-list")
  if (!itemsList) return

  const itemCount = itemsList.children.length
  const newItemRow = document.createElement("div")
  newItemRow.className = "item-row"
  newItemRow.innerHTML = `
    <input type="text" name="item" required placeholder="Câu hỏi ${itemCount + 1}">
    <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
  `

  itemsList.appendChild(newItemRow)

  // Khởi tạo nút xóa
  const removeButton = newItemRow.querySelector(".remove-item-btn")
  removeButton.addEventListener("click", () => {
    newItemRow.remove()
    updateMatchingAnswers()
  })

  // Cập nhật danh sách đáp án
  updateMatchingAnswers()
}

/**
 * Thêm ghép nối cho câu hỏi ghép nối
 */
function addMatchRow() {
  const matchesList = document.getElementById("matches-list")
  if (!matchesList) return

  const matchCount = matchesList.children.length
  const newMatchRow = document.createElement("div")
  newMatchRow.className = "match-row"
  newMatchRow.innerHTML = `
    <input type="text" name="match" required placeholder="Từ khóa nối ${matchCount + 1}">
    <button type="button" class="remove-match-btn"><i class="fas fa-times"></i></button>
  `

  matchesList.appendChild(newMatchRow)

  // Khởi tạo nút xóa
  const removeButton = newMatchRow.querySelector(".remove-match-btn")
  removeButton.addEventListener("click", () => {
    newMatchRow.remove()
    updateMatchingAnswers()
  })

  // Cập nhật danh sách đáp án
  updateMatchingAnswers()
}

/**
 * Cập nhật danh sách đáp án ghép nối
 */
function updateMatchingAnswers() {
  const matchingAnswersList = document.getElementById("matching-answers-list")
  const itemsList = document.getElementById("items-list")
  const matchesList = document.getElementById("matches-list")

  if (!matchingAnswersList || !itemsList || !matchesList) return

  matchingAnswersList.innerHTML = ""

  const items = Array.from(itemsList.querySelectorAll('input[name="item"]'))
  const matches = Array.from(matchesList.querySelectorAll('input[name="match"]')).map((input) => input.value)

  items.forEach((itemInput, index) => {
    const answerRow = document.createElement("div")
    answerRow.className = "answer-row"

    const itemText = itemInput.value || `Câu hỏi ${index + 1}`

    answerRow.innerHTML = `
      <span class="item-label">${itemText}:</span>
      <select name="matchingAnswer" required>
        <option value="">-- Chọn từ khóa nối --</option>
        ${matches.map((match, idx) => `<option value="${match}">${match}</option>`).join("")}
      </select>
      <button type="button" class="preview-match-btn" title="Xem trước"><i class="fas fa-eye"></i></button>
    `

    matchingAnswersList.appendChild(answerRow)

    // Khởi tạo nút xem trước
    const previewBtn = answerRow.querySelector(".preview-match-btn")
    previewBtn.addEventListener("click", () => {
      const selectedMatch = answerRow.querySelector("select").value
      if (selectedMatch) {
        showNotification(`Ghép nối: "${itemText}" → "${selectedMatch}"`, "info")
      } else {
        showNotification("Vui lòng chọn từ khóa nối trước", "warning")
      }
    })
  })
}

/**
 * Thêm nhãn cho câu hỏi bản đồ/sơ đồ
 */
function addLabelRow() {
  const labelsContainer = document.getElementById("labels-container")
  if (!labelsContainer) return

  const labelRows = labelsContainer.querySelectorAll(".label-row")
  const newIndex = labelRows.length
  const questionType = document.getElementById("type").value

  const newLabelRow = document.createElement("div")
  newLabelRow.className = "label-row"
  newLabelRow.innerHTML = `
    <div class="label-input-group">
      <label for="label${newIndex}">Nhãn ${newIndex + 1}:</label>
      <input type="text" id="label${newIndex}" name="label" required placeholder="Nhập nhãn">
    </div>
    <div class="answer-input-group map-answer-group" ${questionType !== "map" ? 'style="display: none;"' : ""}>
      <label for="answer${newIndex}">Đáp án:</label>
      <select id="answer${newIndex}" name="answer" required>
        <option value="">-- Chọn --</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
        <option value="F">F</option>
        <option value="G">G</option>
        <option value="H">H</option>
      </select>
    </div>
    <div class="answer-input-group ship-answer-group" ${questionType !== "ship" ? 'style="display: none;"' : ""}>
      <label for="shipAnswer${newIndex}">Đáp án:</label>
      <input type="text" id="shipAnswer${newIndex}" name="shipAnswer" required placeholder="Nhập đáp án">
    </div>
    <button type="button" class="remove-label-btn"><i class="fas fa-times"></i></button>
  `

  labelsContainer.appendChild(newLabelRow)

  // Khởi tạo nút xóa
  const removeButton = newLabelRow.querySelector(".remove-label-btn")
  removeButton.addEventListener("click", () => {
    newLabelRow.remove()
  })
}

/**
 * Thêm ghi chú cho câu hỏi hoàn thành ghi chú
 */
function addNoteRow() {
  const notesContainer = document.getElementById("notes-container")
  if (!notesContainer) return

  const noteCount = notesContainer.children.length
  const newNoteRow = document.createElement("div")
  newNoteRow.className = "note-row"
  newNoteRow.innerHTML = `
    <label>Ghi chú ${noteCount + 1} (sử dụng [ANSWER] cho chỗ trống):</label>
    <textarea name="note" required></textarea>
    <button type="button" class="remove-note-btn"><i class="fas fa-times"></i></button>
  `

  notesContainer.appendChild(newNoteRow)

  // Khởi tạo nút xóa
  const removeButton = newNoteRow.querySelector(".remove-note-btn")
  removeButton.addEventListener("click", () => {
    newNoteRow.remove()
    updateNoteAnswers()
  })

  // Cập nhật danh sách đáp án
  updateNoteAnswers()
}

/**
 * Cập nhật danh sách đáp án ghi chú
 */
function updateNoteAnswers() {
  const noteAnswersList = document.getElementById("note-answers-list")
  const notesContainer = document.getElementById("notes-container")

  if (!noteAnswersList || !notesContainer) return

  noteAnswersList.innerHTML = ""
  const noteCount = notesContainer.querySelectorAll(".note-row").length

  for (let i = 0; i < noteCount; i++) {
    const answerRow = document.createElement("div")
    answerRow.className = "answer-row"
    answerRow.innerHTML = `
      <span class="answer-label">Đáp án ${i + 1}:</span>
      <input type="text" name="noteAnswer" required>
      <button type="button" class="remove-answer-btn"><i class="fas fa-times"></i></button>
    `

    noteAnswersList.appendChild(answerRow)

    // Khởi tạo nút xóa
    const removeButton = answerRow.querySelector(".remove-answer-btn")
    removeButton.addEventListener("click", () => {
      answerRow.remove()
    })
  }
}

/**
 * Thêm hàng cho câu hỏi hoàn thành bảng/biểu mẫu
 */
function addTableRow() {
  const formTable = document.querySelector("#formTable tbody")
  if (!formTable) return

  const newRow = document.createElement("tr")
  newRow.innerHTML = `
    <td><input type="text" name="cell" required></td>
    <td><input type="text" name="cell" required></td>
    <td><input type="text" name="cell" required></td>
    <td><input type="text" name="tableAnswer" required></td>
    <td><button type="button" class="remove-row-btn"><i class="fas fa-times"></i></button></td>
  `

  formTable.appendChild(newRow)

  // Khởi tạo nút xóa
  const removeButton = newRow.querySelector(".remove-row-btn")
  removeButton.addEventListener("click", () => {
    newRow.remove()
  })
}

/**
 * Thêm mục cho câu hỏi hoàn thành lưu đồ
 */
function addFlowItemRow() {
  const flowItemsList = document.getElementById("flow-items-list")
  if (!flowItemsList) return

  const itemCount = flowItemsList.children.length
  const newItemRow = document.createElement("div")
  newItemRow.className = "flow-item-row"
  newItemRow.innerHTML = `
    <input type="text" name="flowItem" required placeholder="Mục ${itemCount + 1}">
    <button type="button" class="remove-flow-item-btn"><i class="fas fa-times"></i></button>
  `

  flowItemsList.appendChild(newItemRow)

  // Khởi tạo nút xóa
  const removeButton = newItemRow.querySelector(".remove-flow-item-btn")
  removeButton.addEventListener("click", () => {
    newItemRow.remove()
    updateFlowAnswers()
  })

  // Cập nhật danh sách đáp án
  updateFlowAnswers()
}

/**
 * Thêm lựa chọn cho câu hỏi hoàn thành lưu đồ
 */
function addFlowOptionRow() {
  const flowOptionsList = document.getElementById("flow-options-list")
  if (!flowOptionsList) return

  const optionCount = flowOptionsList.children.length
  const newOptionRow = document.createElement("div")
  newOptionRow.className = "flow-option-row"
  newOptionRow.innerHTML = `
    <input type="text" name="flowOption" required placeholder="Lựa chọn ${optionCount + 1}">
    <button type="button" class="remove-flow-option-btn"><i class="fas fa-times"></i></button>
  `

  flowOptionsList.appendChild(newOptionRow)

  // Khởi tạo nút xóa
  const removeButton = newOptionRow.querySelector(".remove-flow-option-btn")
  removeButton.addEventListener("click", () => {
    newOptionRow.remove()
  })
}

/**
 * Cập nhật danh sách đáp án lưu đồ
 */
function updateFlowAnswers() {
  const flowAnswersList = document.getElementById("flow-answers-list")
  const flowItemsList = document.getElementById("flow-items-list")

  if (!flowAnswersList || !flowItemsList) return

  flowAnswersList.innerHTML = ""
  const itemCount = flowItemsList.querySelectorAll(".flow-item-row").length

  for (let i = 0; i < itemCount; i++) {
    const answerRow = document.createElement("div")
    answerRow.className = "flow-answer-row"
    answerRow.innerHTML = `
      <span class="answer-label">Đáp án ${i + 1}:</span>
      <input type="text" name="flowAnswer" required>
      <button type="button" class="remove-flow-answer-btn"><i class="fas fa-times"></i></button>
    `

    flowAnswersList.appendChild(answerRow)

    // Khởi tạo nút xóa
    const removeButton = answerRow.querySelector(".remove-flow-answer-btn")
    removeButton.addEventListener("click", () => {
      answerRow.remove()
    })
  }
}

// Xuất các hàm để sử dụng trong các file khác
window.saveOneAnswerQuestion = saveOneAnswerQuestion
window.saveMultipleAnswerQuestion = saveMultipleAnswerQuestion
window.saveMatchingQuestion = saveMatchingQuestion
window.savePlanMapDiagramQuestion = savePlanMapDiagramQuestion
window.saveNoteCompletionQuestion = saveNoteCompletionQuestion
window.saveFormTableCompletionQuestion = saveFormTableCompletionQuestion
window.saveFlowChartCompletionQuestion = saveFlowChartCompletionQuestion
window.validateQuestion = validateQuestion
window.handleQuestionTypeChange = handleQuestionTypeChange
window.initFormHandlers = initFormHandlers
window.updateImagePreview = updateImagePreview
window.updateAudioPreview = updateAudioPreview
window.updateMatchingAnswers = updateMatchingAnswers
window.updateNoteAnswers = updateNoteAnswers
window.updateFlowAnswers = updateFlowAnswers
window.addOptionItem = addOptionItem
window.addItemRow = addItemRow
window.addMatchRow = addMatchRow
window.addLabelRow = addLabelRow
window.addNoteRow = addNoteRow
window.addTableRow = addTableRow
window.addFlowItemRow = addFlowItemRow
window.addFlowOptionRow = addFlowOptionRow
