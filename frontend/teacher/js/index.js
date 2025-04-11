// Thêm đoạn này vào đầu tệp để đảm bảo nó được thực thi sớm
// Đảm bảo form-handlers.js được tải trước các script khác
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM đã được tải, kiểm tra xem form-handlers.js đã được tải chưa")

  // Kiểm tra xem các hàm tạo form có sẵn không
  if (typeof window.createOneAnswerForm !== "function") {
    console.warn("Không tìm thấy các hàm tạo form. Đang tải form-handlers.js động")

    // Tạo phần tử script để tải form-handlers.js
    const script = document.createElement("script")
    script.src = "js/form-handlers.js"
    script.onload = () => {
      console.log("form-handlers.js đã được tải động")
      // Khởi tạo lại các thành phần cần thiết
      if (typeof window.renderTestCreation === "function") {
        window.renderTestCreation()
      }
    }
    script.onerror = () => {
      console.error("Không thể tải form-handlers.js")
    }

    document.head.appendChild(script)
  }

  // Thêm trình lắng nghe sự kiện toàn cục cho các nút xóa bằng cách sử dụng ủy quyền sự kiện
  document.body.addEventListener("click", (event) => {
    const target = event.target

    // Kiểm tra xem phần tử được nhấp có phải là nút xóa hoặc biểu tượng của nó không
    if (
      target.classList.contains("delete-question") ||
      (target.tagName === "I" && target.parentElement.classList.contains("delete-question"))
    ) {
      // Lấy nút thực tế (có thể là phần tử cha của biểu tượng)
      const deleteButton = target.classList.contains("delete-question") ? target : target.parentElement

      // Tìm container câu hỏi
      const questionDiv = deleteButton.closest(".question")
      if (!questionDiv) {
        console.error("Không thể tìm thấy div câu hỏi cha")
        return
      }

      // Tìm container phần
      const partDiv = questionDiv.closest(".part")
      if (!partDiv) {
        console.error("Không thể tìm thấy div phần cha")
        return
      }

      // Lấy số phần từ id của div phần
      const partId = partDiv.id
      const partNumber = Number.parseInt(partId.replace("part", ""))

      // Lấy chỉ mục của câu hỏi trong phần của nó
      const questions = Array.from(partDiv.querySelectorAll(".question"))
      const questionIndex = questions.indexOf(questionDiv)

      console.log(`Đang xóa câu hỏi tại chỉ mục ${questionIndex} trong phần ${partNumber}`)

      // Xác nhận xóa
      if (confirm("Bạn có chắc chắn muốn xóa câu hỏi này không?")) {
        try {
          // Xóa câu hỏi khỏi đối tượng test
          if (
            window.test &&
            window.test[`part${partNumber}`] &&
            questionIndex >= 0 &&
            questionIndex < window.test[`part${partNumber}`].length
          ) {
            window.test[`part${partNumber}`].splice(questionIndex, 1)

            // Xóa câu hỏi khỏi DOM
            questionDiv.remove()

            // Cập nhật UI
            if (typeof window.updateQuestionCount === "function") {
              window.updateQuestionCount()
            }

            // Hiển thị lại câu hỏi nếu cần
            if (typeof window.renderQuestionsForCurrentPart === "function") {
              window.renderQuestionsForCurrentPart()
            }

            alert("Đã xóa câu hỏi thành công")
          } else {
            console.error("Chỉ mục câu hỏi không hợp lệ hoặc cấu trúc test không đúng", {
              test: window.test,
              partKey: `part${partNumber}`,
              questionIndex: questionIndex,
            })
            alert("Không thể xóa câu hỏi. Dữ liệu không hợp lệ.")
          }
        } catch (error) {
          console.error("Lỗi khi xóa câu hỏi:", error)
          alert("Lỗi khi xóa câu hỏi: " + error.message)
        }
      }
    }
  })

  // Adicionar funções para manipular os modos de visualização e edição
  // Código existente...

  // Garantir que as funções de edição estejam disponíveis globalmente
  window.toggleQuestionEdit = (button) => {
    const questionDiv = button.closest(".question")
    if (!questionDiv) return

    const isViewMode = questionDiv.classList.contains("view-mode")
    if (isViewMode) {
      if (typeof window.setQuestionEditMode === "function") {
        window.setQuestionEditMode(questionDiv)
      } else {
        console.error("setQuestionEditMode function not found")
      }
    } else {
      if (typeof window.setQuestionViewMode === "function") {
        window.setQuestionViewMode(questionDiv)
      } else {
        console.error("setQuestionViewMode function not found")
      }
    }
  }

  // Cập nhật hàm setQuestionEditMode để hiển thị form giống như khi tạo câu hỏi mới
  window.setQuestionEditMode = (questionDiv) => {
    try {
      // Lấy dữ liệu câu hỏi
      const partElement = questionDiv.closest(".part")
      const questions = Array.from(partElement.querySelectorAll(".question"))
      const questionIndex = questions.indexOf(questionDiv)

      if (questionIndex !== -1 && window.test && window.test[`part${window.currentPart}`]) {
        const questionData = window.test[`part${window.currentPart}`][questionIndex]
        const questionType = questionData.type

        // Lưu lại nội dung cũ để có thể khôi phục khi hủy
        questionDiv.setAttribute("data-original-content", questionDiv.innerHTML)

        // Lưu lại chỉ mục câu hỏi để sử dụng khi lưu
        questionDiv.setAttribute("data-question-index", questionIndex)

        // Xóa nội dung cũ
        questionDiv.innerHTML = ""

        // Thêm tiêu đề và nút xóa
        const questionNumber = questionIndex + 1
        questionDiv.innerHTML = `
          <h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionNumber}</h4>
          <h3>${getIconForType(questionType)} ${questionType}</h3>
          <button class="delete-question" onclick="deleteQuestion(${questionIndex})"><i class="fas fa-trash"></i></button>
        `

        // Tạo form mới dựa trên loại câu hỏi - sử dụng CHÍNH XÁC cùng một hàm như khi tạo câu hỏi mới
        let formHTML = ""
        switch (questionType) {
          case "Một đáp án":
            formHTML = window.createOneAnswerFormOriginal
              ? window.createOneAnswerFormOriginal()
              : window.createOneAnswerForm()
            break
          case "Nhiều đáp án":
            formHTML = window.createMultipleAnswerFormOriginal
              ? window.createMultipleAnswerFormOriginal()
              : window.createMultipleAnswerForm()
            break
          case "Ghép nối":
            formHTML = window.createMatchingFormOriginal
              ? window.createMatchingFormOriginal()
              : window.createMatchingForm()
            break
          case "Ghi nhãn Bản đồ/Sơ đồ":
            formHTML = window.createPlanMapDiagramFormOriginal
              ? window.createPlanMapDiagramFormOriginal()
              : window.createPlanMapDiagramForm()
            break
          case "Hoàn thành ghi chú":
            formHTML = window.createNoteCompletionFormOriginal
              ? window.createNoteCompletionFormOriginal()
              : window.createNoteCompletionForm()
            break
          case "Hoàn thành bảng/biểu mẫu":
            formHTML = window.createFormTableCompletionFormOriginal
              ? window.createFormTableCompletionFormOriginal()
              : window.createFormTableCompletionForm()
            break
          case "Hoàn thành lưu đồ":
            formHTML = window.createFlowChartCompletionFormOriginal
              ? window.createFlowChartCompletionFormOriginal()
              : window.createFlowChartCompletionForm()
            break
        }

        // Thêm form vào câu hỏi
        questionDiv.innerHTML += formHTML

        // Thêm nút lưu và hủy
        const actionButtons = document.createElement("div")
        actionButtons.className = "question-actions"
        actionButtons.innerHTML = `
          <button class="edit-question-btn" onclick="toggleQuestionEdit(this)" style="display: none;">
            <i class="fas fa-edit"></i> Chỉnh sửa
          </button>
          <button class="save-question-btn" onclick="saveQuestionChanges(this)">
            <i class="fas fa-save"></i> Lưu thay đổi
          </button>
          <button class="cancel-edit-btn" onclick="cancelQuestionEdit(this)">
            <i class="fas fa-times"></i> Hủy
          </button>
        `
        questionDiv.appendChild(actionButtons)

        // Chuyển sang chế độ chỉnh sửa
        questionDiv.classList.remove("view-mode")
        questionDiv.classList.add("edit-mode")

        // Điền dữ liệu vào form
        setTimeout(() => {
          fillFormWithQuestionData(questionDiv, questionData)

          // Khởi tạo các chức năng của form
          initializeFormFunctions(questionDiv, questionType)

          // Hiển thị thông báo
          window.showNotification("Đã chuyển sang chế độ chỉnh sửa. Form đã được điền sẵn dữ liệu hiện có.", "info")
        }, 100) // Đợi một chút để đảm bảo DOM đã được cập nhật
      }
    } catch (error) {
      console.error("Lỗi khi chuyển sang chế độ chỉnh sửa:", error)
      window.showNotification("Đã xảy ra lỗi khi chuyển sang chế độ chỉnh sửa: " + error.message, "error")
    }
  }

  window.setQuestionViewMode =
    window.setQuestionViewMode ||
    ((questionDiv) => {
      questionDiv.classList.remove("edit-mode")
      questionDiv.classList.add("view-mode")

      const editBtn = questionDiv.querySelector(".edit-question-btn")
      const saveBtn = questionDiv.querySelector(".save-question-btn")
      const cancelBtn = questionDiv.querySelector(".cancel-edit-btn")

      if (editBtn) editBtn.style.display = "inline-block"
      if (saveBtn) saveBtn.style.display = "none"
      if (cancelBtn) cancelBtn.style.display = "none"

      const inputs = questionDiv.querySelectorAll("input, textarea, select")
      inputs.forEach((input) => {
        input.disabled = true
      })
    })

  // Thêm hàm mới để điền dữ liệu vào form
  function fillFormWithQuestionData(questionDiv, questionData) {
    try {
      console.log("Đang điền dữ liệu vào form:", questionData)
      const questionType = questionData.type

      switch (questionType) {
        case "Một đáp án":
          const oneAnswerForm = questionDiv.querySelector(".t3-one-answer-form")
          if (oneAnswerForm) {
            const questionText = oneAnswerForm.querySelector("#t3-questionText")
            const options = oneAnswerForm.querySelector("#t3-options")
            const correctAnswer = oneAnswerForm.querySelector("#t3-correctAnswer")

            if (questionText) questionText.value = questionData.content[0] || ""
            if (options) options.value = questionData.content.slice(1).join("\n") || ""
            if (correctAnswer) correctAnswer.value = questionData.correctAnswers || ""

            console.log("Đã điền dữ liệu vào form Một đáp án")
          } else {
            console.warn("Không tìm thấy form Một đáp án")
          }
          break
        case "Nhiều đáp án":
          const multipleAnswerForm = questionDiv.querySelector("#t4-questionForm")
          if (multipleAnswerForm) {
            const questionText = multipleAnswerForm.querySelector("#t4-questionText")
            const options = multipleAnswerForm.querySelector("#t4-options")
            const correctAnswers = multipleAnswerForm.querySelector("#t4-correctAnswers")

            if (questionText) questionText.value = questionData.content[0] || ""
            if (options) options.value = questionData.content.slice(1).join("\n") || ""
            if (correctAnswers)
              correctAnswers.value = Array.isArray(questionData.correctAnswers)
                ? questionData.correctAnswers.join(", ")
                : questionData.correctAnswers || ""

            console.log("Đã điền dữ liệu vào form Nhiều đáp án")
          } else {
            console.warn("Không tìm thấy form Nhiều đáp án")
          }
          break
        case "Ghép nối":
          const matchingForm = questionDiv.querySelector("#t3-questionForm")
          if (matchingForm) {
            const title = matchingForm.querySelector("#t3-questionTitle")
            const people = matchingForm.querySelector("#t3-people")
            const responsibilities = matchingForm.querySelector("#t3-responsibilities")
            const correctAnswers = matchingForm.querySelector("#t3-correctAnswers")

            const midPoint = Math.ceil(questionData.content.length / 2)

            if (title) title.value = questionData.content[0] || ""
            if (people) people.value = questionData.content.slice(1, midPoint).join("\n") || ""
            if (responsibilities) responsibilities.value = questionData.content.slice(midPoint).join("\n") || ""
            if (correctAnswers)
              correctAnswers.value = Array.isArray(questionData.correctAnswers)
                ? questionData.correctAnswers.join("\n")
                : questionData.correctAnswers || ""

            console.log("Đã điền dữ liệu vào form Ghép nối")
          } else {
            console.warn("Không tìm thấy form Ghép nối")
          }
          break
        case "Ghi nhãn Bản đồ/Sơ đồ":
          const mapForm = questionDiv.querySelector("#questionForm")
          if (mapForm) {
            const type = mapForm.querySelector("#questionType")
            const instructions = mapForm.querySelector("#instructions")

            if (type) type.value = questionData.content[0] || "map"
            if (instructions) instructions.value = questionData.content[1] || ""

            // Thêm hình ảnh nếu có
            const imageContainer = document.createElement("div")
            imageContainer.className = "t1-form-group"
            imageContainer.innerHTML = `
              <label for="imageFile">Hình ảnh đã tải lên:</label>
              <img src="${questionData.content[2]}" alt="Hình ảnh đã tải lên" style="max-width: 200px;">
            `
            mapForm.appendChild(imageContainer)

            // Thêm các nhãn và đáp án
            const answerInputs = mapForm.querySelector("#answerInputs") || document.createElement("div")
            answerInputs.id = "answerInputs"
            answerInputs.innerHTML = ""

            for (let i = 0; i < questionData.content.slice(3).length; i++) {
              const label = questionData.content[i + 3]
              const answer = questionData.correctAnswers[i] || ""

              const answerGroup = document.createElement("div")
              answerGroup.className = "t1-form-group"
              answerGroup.innerHTML = `
                <label for="answer${i}">Nhãn ${i + 1}:</label>
                <input type="text" id="answer${i}" value="${label}" required>
                <label for="correctAnswer${i}">Đáp án đúng cho nhãn ${i + 1}:</label>
                ${
                  questionData.content[0] === "map"
                    ? `<select id="correctAnswer${i}" required>
                      ${["A", "B", "C", "D", "E", "F", "G", "H"]
                        .map(
                          (letter) =>
                            `<option value="${letter}" ${answer === letter ? "selected" : ""}>${letter}</option>`,
                        )
                        .join("")}
                    </select>`
                    : `<input type="text" id="correctAnswer${i}" value="${answer}" required>`
                }
              `
              answerInputs.appendChild(answerGroup)
            }

            if (!mapForm.querySelector("#answerInputs")) {
              mapForm.appendChild(answerInputs)
            }

            console.log("Đã điền dữ liệu vào form Ghi nhãn Bản đồ/Sơ đồ")
          } else {
            console.warn("Không tìm thấy form Ghi nhãn Bản đồ/Sơ đồ")
          }
          break
        case "Hoàn thành ghi chú":
          const noteForm = questionDiv.querySelector("#t2ListeningExerciseForm")
          if (noteForm) {
            const instructions = noteForm.querySelector("#t2ListeningExerciseInstructions")
            const topic = noteForm.querySelector("#t2ListeningExerciseTopic")

            if (instructions) instructions.value = questionData.content[0] || ""
            if (topic) topic.value = questionData.content[1] || ""

            // Thêm các ghi chú và đáp án
            const questionContainer =
              noteForm.querySelector("#t2ListeningExerciseQuestionContainer") || document.createElement("div")
            questionContainer.id = "t2ListeningExerciseQuestionContainer"
            questionContainer.innerHTML = ""

            for (let i = 0; i < questionData.content.slice(2).length; i++) {
              const note = questionData.content[i + 2]
              const answer = questionData.correctAnswers[i] || ""

              const noteGroup = document.createElement("div")
              noteGroup.className = "t2-listening-exercise-form-group"
              noteGroup.innerHTML = `
                <label for="t2ListeningExerciseQuestion${i + 1}">Câu hỏi ${i + 1}:</label>
                <div class="t2-listening-exercise-answer-fields">
                  <textarea id="t2ListeningExerciseQuestion${i + 1}" name="question${i + 1}">${note}</textarea>
                </div>
                <div class="t2-listening-exercise-correct-answers" id="t2ListeningExerciseCorrectAnswers${i + 1}">
                  <span class="t2-listening-exercise-correct-answer-label">Đáp án đúng:</span>
                  <input type="text" class="t2-listening-exercise-correct-answer-input" value="${answer}">
                </div>
              `
              questionContainer.appendChild(noteGroup)
            }

            if (!noteForm.querySelector("#t2ListeningExerciseQuestionContainer")) {
              noteForm.appendChild(questionContainer)
            }

            console.log("Đã điền dữ liệu vào form Hoàn thành ghi chú")
          } else {
            console.warn("Không tìm thấy form Hoàn thành ghi chú")
          }
          break
        case "Hoàn thành bảng/biểu mẫu":
          const tableSection = questionDiv.querySelector("#tableSection")
          if (tableSection) {
            const instruction = tableSection.querySelector("#tableInstruction")
            const table = tableSection.querySelector("#fareTable")

            if (instruction) instruction.value = questionData.content[0] || ""

            // Thêm các hàng vào bảng
            const tbody = table.querySelector("tbody") || table
            tbody.innerHTML = `
              <tr>
                <th>Phương tiện</th>
                <th>Giá tiền mặt</th>
                <th>Giá thẻ</th>
                <th>Đáp án đúng</th>
                <th>Thao tác</th>
              </tr>
            `

            const rowCount = Math.floor((questionData.content.length - 1) / 3)
            for (let i = 0; i < rowCount; i++) {
              const startIdx = 1 + i * 3
              const row = document.createElement("tr")
              row.innerHTML = `
                <td><input type="text" value="${questionData.content[startIdx] || ""}"></td>
                <td><input type="text" value="${questionData.content[startIdx + 1] || ""}"></td>
                <td><input type="text" value="${questionData.content[startIdx + 2] || ""}"></td>
                <td><input type="text" class="t6-correct-answer-input" value="${questionData.correctAnswers[i] || ""}"></td>
                <td><button class="t6-delete-btn">Xóa</button></td>
              `
              tbody.appendChild(row)
            }

            console.log("Đã điền dữ liệu vào form Hoàn thành bảng/biểu mẫu")
          } else {
            console.warn("Không tìm thấy form Hoàn thành bảng/biểu mẫu")
          }
          break
        case "Hoàn thành lưu đồ":
          const flowForm = questionDiv.querySelector("#teacherForm")
          if (flowForm) {
            const title = flowForm.querySelector("#title")
            const instructions = flowForm.querySelector("#instructions")
            const flowItems = flowForm.querySelector("#flowItems1")
            const options = flowForm.querySelector("#options1")
            const correctAnswers = flowForm.querySelector("#correctAnswers1")

            if (title) title.value = questionData.content[0] || ""
            if (instructions) instructions.value = questionData.content[1] || ""

            const flowItemCount = Math.floor((questionData.content.length - 2) / 2)

            if (flowItems) flowItems.value = questionData.content.slice(2, 2 + flowItemCount).join("\n") || ""
            if (options) options.value = questionData.content.slice(2 + flowItemCount).join("\n") || ""
            if (correctAnswers)
              correctAnswers.value = Array.isArray(questionData.correctAnswers)
                ? questionData.correctAnswers.join(", ")
                : questionData.correctAnswers || ""

            console.log("Đã điền dữ liệu vào form Hoàn thành lưu đồ")
          } else {
            console.warn("Không tìm thấy form Hoàn thành lưu đồ")
          }
          break
        default:
          console.warn("Không hỗ trợ loại câu hỏi:", questionType)
      }
    } catch (error) {
      console.error("Lỗi khi điền dữ liệu vào form:", error)
      window.showNotification("Đã xảy ra lỗi khi điền dữ liệu vào form: " + error.message, "error")
    }
  }

  // Thêm hàm mới để khởi tạo các chức năng của form
  function initializeFormFunctions(questionDiv, questionType) {
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
  }

  // Cập nhật hàm cancelQuestionEdit để khôi phục nội dung gốc
  window.cancelQuestionEdit = (button) => {
    try {
      const questionDiv = button.closest(".question")
      if (!questionDiv) {
        window.showNotification("Không tìm thấy câu hỏi để hủy chỉnh sửa", "error")
        return
      }

      // Khôi phục nội dung gốc nếu có
      const originalContent = questionDiv.getAttribute("data-original-content")
      if (originalContent) {
        questionDiv.innerHTML = originalContent
        window.showNotification("Đã hủy chỉnh sửa và khôi phục dữ liệu gốc", "info")
      } else {
        // Nếu không có nội dung gốc, render lại câu hỏi
        window.renderQuestionsForCurrentPart()
        window.showNotification("Đã hủy chỉnh sửa và render lại câu hỏi", "info")
      }

      // Chuyển về chế độ xem
      questionDiv.classList.remove("edit-mode")
      questionDiv.classList.add("view-mode")
    } catch (error) {
      console.error("Lỗi khi hủy chỉnh sửa:", error)
      window.showNotification("Đã xảy ra lỗi khi hủy chỉnh sửa: " + error.message, "error")
    }
  }

  // Código existente...
})

// Add these fallback functions to ensure edit functions are globally available
document.addEventListener("DOMContentLoaded", () => {
  // Ensure edit functions are available globally
  window.toggleQuestionEdit =
    window.toggleQuestionEdit ||
    ((button) => {
      const questionDiv = button.closest(".question")
      if (!questionDiv) return

      const isViewMode = questionDiv.classList.contains("view-mode")
      if (isViewMode) {
        window.setQuestionEditMode(questionDiv)
      } else {
        window.setQuestionViewMode(questionDiv)
      }
    })

  window.setQuestionEditMode =
    window.setQuestionEditMode ||
    ((questionDiv) => {
      questionDiv.classList.remove("view-mode")
      questionDiv.classList.add("edit-mode")

      const editBtn = questionDiv.querySelector(".edit-question-btn")
      const saveBtn = questionDiv.querySelector(".save-question-btn")
      const cancelBtn = questionDiv.querySelector(".cancel-edit-btn")

      if (editBtn) editBtn.style.display = "none"
      if (saveBtn) saveBtn.style.display = "inline-block"
      if (cancelBtn) cancelBtn.style.display = "inline-block"

      const inputs = questionDiv.querySelectorAll("input, textarea, select")
      inputs.forEach((input) => {
        input.disabled = false
      })

      if (typeof window.showNotification === "function") {
        window.showNotification("Đã chuyển sang chế độ chỉnh sửa", "info")
      }
    })

  window.setQuestionViewMode =
    window.setQuestionViewMode ||
    ((questionDiv) => {
      questionDiv.classList.remove("edit-mode")
      questionDiv.classList.add("view-mode")

      const editBtn = questionDiv.querySelector(".edit-question-btn")
      const saveBtn = questionDiv.querySelector(".save-question-btn")
      const cancelBtn = questionDiv.querySelector(".cancel-edit-btn")

      if (editBtn) editBtn.style.display = "inline-block"
      if (saveBtn) saveBtn.style.display = "none"
      if (cancelBtn) cancelBtn.style.display = "none"

      const inputs = questionDiv.querySelectorAll("input, textarea, select")
      inputs.forEach((input) => {
        input.disabled = true
      })
    })

  window.cancelQuestionEdit =
    window.cancelQuestionEdit ||
    ((button) => {
      const questionDiv = button.closest(".question")
      if (!questionDiv) return

      // Get the index of this question
      const part = document.getElementById(`part${window.currentPart}`)
      const questions = Array.from(part.querySelectorAll(".question"))
      const questionIndex = questions.indexOf(questionDiv)

      if (questionIndex === -1) return

      // Rerender the question with original data
      if (typeof window.renderQuestionsForCurrentPart === "function") {
        window.renderQuestionsForCurrentPart()
      } else {
        // Fallback to just switching to view mode
        window.setQuestionViewMode(questionDiv)
      }

      if (typeof window.showNotification === "function") {
        window.showNotification("Đã hủy chỉnh sửa", "info")
      }
    })
})

// Đảm bảo tất cả các hàm cần thiết được định nghĩa trong phạm vi toàn cục
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM đã được tải")

  // Định nghĩa các hàm toàn cục trước
  // Hàm renderTestCreation
  // Sửa hàm renderTestCreation để đảm bảo các phần tử part được tạo ra đúng cách
  window.renderTestCreation = () => {
    console.log("Đang hiển thị form tạo bài kiểm tra từ index.js")
    const testContent = document.getElementById("testContent")
    if (!testContent) {
      console.error("Không tìm thấy phần tử testContent!")
      return
    }

    // Tạo HTML cho phần metadata và các nút điều hướng
    testContent.innerHTML = `
<div class="test-card">
  <div class="test-header">
    <span class="test-icon"><i class="fas fa-pencil-alt"></i></span>
    <span>Bài kiểm tra IELTS Listening</span>
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

    // Hiển thị câu hỏi trong phần hiện tại nếu có
    if (typeof window.renderQuestionsForCurrentPart === "function") {
      window.renderQuestionsForCurrentPart()
    } else {
      console.warn("Không tìm thấy hàm renderQuestionsForCurrentPart")
    }
  }

  // Định nghĩa hàm startTestCreation trong phạm vi toàn cục
  window.startTestCreation = () => {
    console.log("Đã gọi hàm bắt đầu tạo bài kiểm tra")

    // Lấy các loại câu hỏi đã chọn
    const selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value)

    if (selectedTypes.length === 0) {
      alert("Vui lòng chọn ít nhất một loại câu hỏi.")
      return
    }

    console.log("Các loại đã chọn:", selectedTypes)

    // Lưu các loại đã chọn trong đối tượng window để sử dụng sau
    window.selectedTypes = selectedTypes

    // Ẩn trang chọn và hiển thị trang tạo bài kiểm tra
    document.getElementById("selectionPage").classList.add("hidden")
    document.getElementById("testCreationPage").classList.remove("hidden")

    // Khởi tạo đối tượng test
    window.test = {
      title: "Bài kiểm tra IELTS Listening mới",
      description: "Mô tả bài kiểm tra",
      part1: [],
      part2: [],
      part3: [],
      part4: [],
    }

    // Đặt phần hiện tại là 1
    window.currentPart = 1

    // Gọi renderTestCreation
    window.renderTestCreation()

    // Tự động tạo câu hỏi đầu tiên của loại đã chọn
    // if (selectedTypes.length > 0 && typeof window.addQuestionDirectly === "function") {
    //   console.log("Đang tạo câu hỏi đầu tiên loại:", selectedTypes[0])
    //   window.addQuestionDirectly(selectedTypes[0])
    // }
    console.log("Đã bắt đầu tạo bài kiểm tra. Nhấp 'Thêm câu hỏi' để tạo câu hỏi đầu tiên của bạn.")
  }

  // Định nghĩa các hàm cần thiết khác
  window.previousPart = () => {
    console.log("Đã gọi previousPart, phần hiện tại:", window.currentPart)
    if (window.currentPart > 1) {
      window.currentPart--
      console.log("Chuyển đến phần trước:", window.currentPart)
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
    console.log("Đã gọi nextPart, phần hiện tại:", window.currentPart)
    if (window.currentPart < 4) {
      window.currentPart++
      console.log("Chuyển đến phần tiếp theo:", window.currentPart)
      window.renderTestCreation()
    } else {
      if (typeof window.showNotification === "function") {
        window.showNotification("Đây đã là phần cuối cùng", "info")
      } else {
        alert("Đây đã là phần cuối cùng")
      }
    }
  }

  // Thay thế triển khai đơn giản của addQuestionDirectly bằng phiên bản cải tiến này
  window.addQuestionDirectly = (questionType) => {
    console.log("Đang thêm câu hỏi loại:", questionType)

    // Đảm bảo currentPart được định nghĩa
    if (typeof window.currentPart === "undefined") {
      window.currentPart = 1
      console.log("Đặt currentPart mặc định là 1")
    }

    // Lấy phần tử part
    const partId = `part${window.currentPart}`
    let partElement = document.getElementById(partId)

    // Nếu phần tử part không tồn tại, tạo nó
    if (!partElement) {
      console.warn(`Không tìm thấy phần tử cho ${partId}, đang tạo mới`)
      partElement = document.createElement("div")
      partElement.id = partId
      partElement.className = "part"
      partElement.style.display = "block"

      // Thêm vào testContent
      const testContent = document.getElementById("testContent")
      if (testContent) {
        testContent.appendChild(partElement)
      } else {
        console.error("Không tìm thấy phần tử testContent, không thể thêm container part")
        return
      }
    }

    // Tạo div câu hỏi mới
    const questionDiv = document.createElement("div")
    questionDiv.className = "question"

    // Thêm số câu hỏi và nút xóa
    const questionNumber = (window.test[`part${window.currentPart}`] || []).length + 1

    // Tạo nội dung câu hỏi
    questionDiv.innerHTML = `
<h4><i class="fas fa-question-circle"></i> Câu hỏi ${questionNumber}</h4>
<h3>${getIconForType(questionType)} ${questionType}</h3>
<button class="delete-question" type="button"><i class="fas fa-trash"></i></button>
`

    // Thêm form phù hợp dựa trên loại
    let formHTML = ""

    // Sử dụng cách tiếp cận trực tiếp hơn để tạo form với các tùy chọn động
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
        <button type="button" class="add-option-btn"><i class="fas fa-plus"></i> Thêm lựa chọn</button>
      </div>
      <button type="button" class="save-question-btn"><i class="fas fa-save"></i> Lưu câu hỏi</button>
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
        <button type="button" class="add-option-btn"><i class="fas fa-plus"></i> Thêm lựa chọn</button>
      </div>
      <button type="button" class="save-question-btn"><i class="fas fa-save"></i> Lưu câu hỏi</button>
    </div>
  `
        break
      case "Ghép nối":
        formHTML = `
<div class="matching-form">
  <div class="form-group">
    <label for="title">Tiêu đề bài ghép nối:</label>
    <input type="text" id="title" name="title" required placeholder="Ví dụ: Ghép nối người với công việc">
  </div>
  
  <div class="matching-container">
    <div class="matching-items">
      <div class="section-title-container">
        <input type="text" class="section-title-input" id="itemsTitle" name="itemsTitle" value="Danh sách câu hỏi" placeholder="Đặt tên cho danh sách câu hỏi">
        <i class="fas fa-question section-icon"></i>
      </div>
      <div id="items-list">
        <div class="item-row">
          <input type="text" name="item" required placeholder="Câu hỏi 1">
          <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="item-row">
          <input type="text" name="item" required placeholder="Câu hỏi 2">
          <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
        </div>
      </div>
      <button type="button" class="add-item-btn"><i class="fas fa-plus"></i> Thêm câu hỏi</button>
    </div>
    
    <div class="matching-matches">
      <div class="section-title-container">
        <input type="text" class="section-title-input" id="matchesTitle" name="matchesTitle" value="Danh sách từ khóa nối" placeholder="Đặt tên cho danh sách từ khóa">
        <i class="fas fa-link section-icon"></i>
      </div>
      <div id="matches-list">
        <div class="match-row">
          <input type="text" name="match" required placeholder="Từ khóa nối 1">
          <button type="button" class="remove-match-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="match-row">
          <input type="text" name="match" required placeholder="Từ khóa nối 2">
          <button type="button" class="remove-match-btn"><i class="fas fa-times"></i></button>
        </div>
      </div>
      <button type="button" class="add-match-btn"><i class="fas fa-plus"></i> Thêm từ khóa nối</button>
    </div>
  </div>
  
  <div class="matching-answers">
    <h4><i class="fas fa-exchange-alt"></i> Thiết lập ghép nối</h4>
    <p class="matching-help">Chọn từ khóa nối tương ứng với mỗi câu hỏi:</p>
    <div id="matching-answers-list">
      <!-- Sẽ được điền động bằng JavaScript -->
    </div>
  </div>
  
  <button type="button" class="save-question-btn"><i class="fas fa-save"></i> Lưu câu hỏi</button>
</div>
`
        break
      case "Ghi nhãn Bản đồ/Sơ đồ":
        formHTML = `
  <div class="plan-map-diagram-form">
    <div class="form-group">
      <label for="type">Loại câu hỏi:</label>
      <select id="type" name="type" required onchange="updatePlanMapDiagramForm(this)">
        <option value="map">Ghi nhãn Bản đồ (Chọn từ A-H)</option>
        <option value="ship">Sơ đồ Tàu (Nhập đáp án)</option>
      </select>
      <p class="form-help-text" id="typeHelpText">
        <i class="fas fa-info-circle"></i> 
        <span>Ghi nhãn Bản đồ: Người dùng chọn đáp án từ các lựa chọn có sẵn (A-H)</span>
      </p>
    </div>
    
    <div class="form-group">
      <label for="instructions">Hướng dẫn:</label>
      <textarea id="instructions" name="instructions" rows="3" required placeholder="Nhập hướng dẫn cho câu hỏi"></textarea>
    </div>
    
    <div class="form-group">
      <label for="image">Hình ảnh:</label>
      <input type="file" id="image" name="image" accept="image/*" required>
      <div id="imagePreview" class="image-preview"></div>
    </div>
    
    <div id="labels-container">
      <h4><i class="fas fa-tags"></i> Danh sách nhãn và đáp án</h4>
      <div class="label-row">
        <div class="label-input-group">
          <label for="label1">Nhãn 1:</label>
          <input type="text" id="label1" name="label" required placeholder="Nhập nhãn">
        </div>
        <div class="answer-input-group map-answer-group">
          <label for="answer1">Đáp án:</label>
          <select id="answer1" name="answer" required>
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
        <div class="answer-input-group ship-answer-group" style="display: none;">
          <label for="shipAnswer1">Đáp án:</label>
          <input type="text" id="shipAnswer1" name="shipAnswer" required placeholder="Nhập đáp án">
        </div>
        <button type="button" class="remove-label-btn"><i class="fas fa-times"></i></button>
      </div>
    </div>
    
    <button type="button" class="add-label-btn"><i class="fas fa-plus"></i> Thêm nhãn</button>
    <button type="button" class="save-question-btn"><i class="fas fa-save"></i> Lưu câu hỏi</button>
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
      <button type="button" class="add-note-btn"><i class="fas fa-plus"></i> Thêm ghi chú</button>
      <div id="answers-container">
        <label>Đáp án đúng (theo thứ tự [ANSWER]):</label>
        <div id="note-answers-list">
          <div class="answer-row">
            <span class="answer-label">Đáp án 1:</span>
            <input type="text" name="noteAnswer" required>
            <button type="button" class="remove-answer-btn"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <button type="button" class="add-answer-btn"><i class="fas fa-plus"></i> Thêm đáp án</button>
      </div>
      <button type="button" class="save-question-btn"><i class="fas fa-save"></i> Lưu câu hỏi</button>
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
      <button type="button" class="add-row-btn"><i class="fas fa-plus"></i> Thêm hàng</button>
      <button type="button" class="save-question-btn"><i class="fas fa-save"></i> Lưu câu hỏi</button>
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
        <button type="button" class="add-flow-item-btn"><i class="fas fa-plus"></i> Thêm mục</button>
      </div>
      <div id="flow-options-container">
        <label>Lựa chọn:</label>
        <div id="flow-options-list">
          <div class="flow-option-row">
            <input type="text" name="flowOption" required>
            <button type="button" class="remove-flow-option-btn"><i class="fas fa-times"></i></button>
          </div>
        </div>
        <button type="button" class="add-flow-option-btn"><i class="fas fa-plus"></i> Thêm lựa chọn</button>
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
        <button type="button" class="add-flow-answer-btn"><i class="fas fa-plus"></i> Thêm đáp án</button>
      </div>
      <button type="button" class="save-question-btn"><i class="fas fa-save"></i> Lưu câu hỏi</button>
    </div>
  `
        break
      default:
        formHTML = `<p>Không hỗ trợ loại câu hỏi: ${questionType}</p>`
    }

    // Tạo container form và thêm HTML form
    const formContainer = document.createElement("div")
    formContainer.className = "question-form-container"
    formContainer.innerHTML = formHTML
    questionDiv.appendChild(formContainer)

    // Đảm bảo phần tử part hiển thị
    partElement.style.display = "block"

    // Thêm div câu hỏi vào phần tử part
    partElement.appendChild(questionDiv)

    // Đảm bảo div câu hỏi hiển thị
    questionDiv.style.display = "block"

    // Tạo đối tượng câu hỏi cơ bản và thêm vào test
    const newQuestion = {
      type: questionType,
      content: ["Câu hỏi mẫu"],
      correctAnswers: ["Đáp án mẫu"],
    }

    // Thêm vào phần hiện tại
    if (!window.test[`part${window.currentPart}`]) {
      window.test[`part${window.currentPart}`] = []
    }

    window.test[`part${window.currentPart}`].push(newQuestion)

    // Xóa thông báo "không có câu hỏi" nếu tồn tại
    const noQuestionsMsg = partElement.querySelector(".no-questions")
    if (noQuestionsMsg) {
      noQuestionsMsg.remove()
    }

    // Khởi tạo trình lắng nghe sự kiện cho các phần tử form động
    initializeDynamicFormElements(questionDiv, questionType)

    console.log("Đã thêm câu hỏi thành công:", questionType)
  }

  // Thêm trình lắng nghe sự kiện cho nút bắt đầu kiểm tra
  const startTestBtn = document.getElementById("startTestBtn")
  if (startTestBtn) {
    startTestBtn.addEventListener("click", window.startTestCreation)
  } else {
    console.error("Không tìm thấy nút bắt đầu kiểm tra")
  }

  // Khởi tạo các trình lắng nghe sự kiện khác
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
        console.error("Không tìm thấy hàm saveTest trong đối tượng window")
        alert("Chức năng lưu bài kiểm tra chưa được cài đặt")
      }
    })
  }
})

// Hàm toàn cục để xử lý việc tạo câu hỏi
window.addQuestion = (questionType) => {
  console.log("Đã gọi addQuestion toàn cục với loại:", questionType)

  if (typeof window.addQuestionDirectly === "function") {
    window.addQuestionDirectly(questionType)
  } else {
    console.error("Không tìm thấy hàm addQuestionDirectly")
    alert("Lỗi: Không thể tạo câu hỏi. Vui lòng làm mới trang và thử lại.")
  }
}

// Triển khai đơn giản của renderQuestionsForCurrentPart
window.renderQuestionsForCurrentPart = () => {
  console.log("Đang hiển thị câu hỏi cho phần hiện tại:", window.currentPart)

  const partElement = document.getElementById(`part${window.currentPart}`)
  if (!partElement) {
    console.error(`Không tìm thấy phần tử cho part${window.currentPart}`)
    return
  }

  // Xóa nội dung container phần
  partElement.innerHTML = ""

  // Lấy câu hỏi cho phần hiện tại
  const questions = window.test[`part${window.currentPart}`] || []

  if (questions.length === 0) {
    partElement.innerHTML = `<div class="no-questions">Không có câu hỏi nào trong phần này. Nhấn "Thêm câu hỏi" để bắt đầu.</div>`
    return
  }

  // Hiển thị từng câu hỏi
  questions.forEach((question, index) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question view-mode" // Added view-mode class

    // Tạo nội dung câu hỏi
    questionDiv.innerHTML = `
    <h4><i class="fas fa-question-circle"></i> Câu hỏi ${index + 1}</h4>
    <h3><i class="fas fa-check-circle"></i> ${question.type}</h3>
    <div class="question-content">
      <p><strong>Nội dung:</strong> ${question.content[0]}</p>
      <p><strong>Đáp án:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
    </div>
    <div class="question-controls">
      <button class="edit-question-btn" onclick="window.toggleQuestionEdit(this)"><i class="fas fa-edit"></i> Chỉnh sửa</button>
      <button class="save-question-btn" style="display: none;"><i class="fas fa-save"></i> Lưu</button>
      <button class="cancel-edit-btn" style="display: none;"><i class="fas fa-times"></i> Hủy</button>
      <button class="delete-question" type="button"><i class="fas fa-trash"></i></button>
    </div>
  `

    partElement.appendChild(questionDiv)
  })
}

// Triển khai đơn giản của deleteQuestion - hiện được xử lý bởi cách tiếp cận ủy quyền sự kiện
window.deleteQuestion = (index) => {
  console.log("Đã gọi deleteQuestion cũ với chỉ mục:", index)
  // Hàm này được giữ lại để tương thích ngược nhưng việc xóa thực tế
  // được xử lý bởi cách tiếp cận ủy quyền sự kiện ở trên
}

// Triển khai đơn giản của showNotification
window.showNotification = (message, type) => {
  console.log(`${type}: ${message}`)

  // Tạo phần tử thông báo
  let notification = document.querySelector(".notification")
  if (!notification) {
    notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    document.body.appendChild(notification)
  } else {
    notification.className = `notification notification-${type}`
  }

  // Thiết lập nội dung và hiển thị
  notification.innerHTML = message
  notification.style.display = "block"

  // Tự động ẩn sau 5 giây
  setTimeout(() => {
    notification.style.opacity = "0"
    setTimeout(() => {
      notification.style.display = "none"
    }, 500)
  }, 5000)
}

// Triển khai đơn giản của saveTest
window.saveTest = () => {
  console.log("Đang lưu bài kiểm tra:", window.test)

  // Cập nhật tiêu đề và mô tả từ form
  const titleInput = document.getElementById("testTitle")
  const descriptionInput = document.getElementById("testDescription")

  if (titleInput && descriptionInput) {
    window.test.title = titleInput.value
    window.test.description = descriptionInput.value
  }

  // Kiểm tra tính hợp lệ
  if (!window.test.title) {
    window.showNotification("Vui lòng nhập tiêu đề bài kiểm tra", "error")
    return
  }

  // Kiểm tra xem có câu hỏi nào không
  let hasQuestions = false
  for (let i = 1; i <= 4; i++) {
    if (window.test[`part${i}`] && window.test[`part${i}`].length > 0) {
      hasQuestions = true
      break
    }
  }

  if (!hasQuestions) {
    window.showNotification("Không có câu hỏi nào để lưu. Vui lòng thêm ít nhất một câu hỏi.", "error")
    return
  }

  window.showNotification("Đã lưu bài kiểm tra thành công!", "success")
}

console.log("index.js đã được tải thành công")

// Thêm hàm trợ giúp để lấy biểu tượng cho loại câu hỏi
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

// Thêm các hàm này ở cuối tệp để đảm bảo chúng có sẵn
// Đây là các hàm giữ chỗ sẽ gọi các triển khai thực tế từ form-handlers.js

// Thay thế các hàm tạo form bằng các phiên bản này không gây ra đệ quy
// Các hàm tạo form
function createOneAnswerForm() {
  // Không gọi window.createOneAnswerForm ở đây để tránh đệ quy
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
  // Không gọi window.createMultipleAnswerForm ở đây để tránh đệ quy
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

// Find the createPlanMapDiagramForm function and replace it with this improved version
function createPlanMapDiagramForm() {
  return `
  <div class="plan-map-diagram-form">
    <div class="form-group">
      <label for="type">Loại câu hỏi:</label>
      <select id="type" name="type" required onchange="updatePlanMapDiagramForm(this)">
        <option value="map">Ghi nhãn Bản đồ (Chọn từ A-H)</option>
        <option value="ship">Sơ đồ Tàu (Nhập đáp án)</option>
      </select>
      <p class="form-help-text" id="typeHelpText">
        <i class="fas fa-info-circle"></i> 
        <span>Ghi nhãn Bản đồ: Người dùng chọn đáp án từ các lựa chọn có sẵn (A-H)</span>
      </p>
    </div>
    
    <div class="form-group">
      <label for="instructions">Hướng dẫn:</label>
      <textarea id="instructions" name="instructions" rows="3" required placeholder="Nhập hướng dẫn cho câu hỏi"></textarea>
    </div>
    
    <div class="form-group">
      <label for="image">Hình ảnh:</label>
      <input type="file" id="image" name="image" accept="image/*" required>
      <div id="imagePreview" class="image-preview"></div>
    </div>
    
    <div id="labels-container">
      <h4><i class="fas fa-tags"></i> Danh sách nhãn và đáp án</h4>
      <div class="label-row">
        <div class="label-input-group">
          <label for="label1">Nhãn 1:</label>
          <input type="text" id="label1" name="label" required placeholder="Nhập nhãn">
        </div>
        <div class="answer-input-group map-answer-group">
          <label for="answer1">Đáp án:</label>
          <select id="answer1" name="answer" required>
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
        <div class="answer-input-group ship-answer-group" style="display: none;">
          <label for="shipAnswer1">Đáp án:</label>
          <input type="text" id="shipAnswer1" name="shipAnswer" required placeholder="Nhập đáp án">
        </div>
        <button type="button" class="remove-label-btn"><i class="fas fa-times"></i></button>
      </div>
    </div>
    
    <button type="button" class="add-label-btn"><i class="fas fa-plus"></i> Thêm nhãn</button>
    <button type="button" class="save-question-btn"><i class="fas fa-save"></i> Lưu câu hỏi</button>
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

// Add this new function to update the form based on the selected type
function updatePlanMapDiagramForm(selectElement) {
  const questionDiv = selectElement.closest(".question")
  const selectedType = selectElement.value
  const helpText = questionDiv.querySelector("#typeHelpText span")

  // Update help text based on selected type
  if (selectedType === "map") {
    helpText.textContent = "Ghi nhãn Bản đồ: Người dùng chọn đáp án từ các lựa chọn có sẵn (A-H)"
  } else if (selectedType === "ship") {
    helpText.textContent = "Sơ đồ Tàu: Người dùng nhập đáp án vào ô trống (không có lựa chọn sẵn)"
  }

  // Update all label rows to show/hide appropriate answer inputs
  const labelRows = questionDiv.querySelectorAll(".label-row")
  labelRows.forEach((row) => {
    const mapAnswerGroup = row.querySelector(".map-answer-group")
    const shipAnswerGroup = row.querySelector(".ship-answer-group")

    if (selectedType === "map") {
      mapAnswerGroup.style.display = "block"
      shipAnswerGroup.style.display = "none"
    } else {
      mapAnswerGroup.style.display = "none"
      shipAnswerGroup.style.display = "block"
    }
  })
}

// Khởi tạo các phần tử form động
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

      // Khởi tạo nút xóa cho tùy chọn mới
      const removeButton = newOptionItem.querySelector(".remove-option-btn")
      removeButton.addEventListener("click", () => {
        newOptionItem.remove()
      })
    })
  }

  // Khởi tạo các nút xóa hiện có
  const removeOptionBtns = questionDiv.querySelectorAll(".remove-option-btn")
  removeOptionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".option-item").remove()
    })
  })

  // Nút lưu câu hỏi
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Triển khai logic lưu ở đây
      saveOneAnswerQuestion(questionDiv)
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

      // Khởi tạo nút xóa cho tùy chọn mới
      const removeButton = newOptionItem.querySelector(".remove-option-btn")
      removeButton.addEventListener("click", () => {
        newOptionItem.remove()
      })
    })
  }

  // Khởi tạo các nút xóa hiện có
  const removeOptionBtns = questionDiv.querySelectorAll(".remove-option-btn")
  removeOptionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".option-item").remove()
    })
  })

  // Nút lưu câu hỏi
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Triển khai logic lưu ở đây
      saveMultipleAnswerQuestion(questionDiv)
    })
  }
}

// Thay thế hàm initializeMatchingForm hiện tại bằng phiên bản cải tiến này
function initializeMatchingForm(questionDiv) {
  const addItemBtn = questionDiv.querySelector(".add-item-btn")
  const addMatchBtn = questionDiv.querySelector(".add-match-btn")
  const itemsList = questionDiv.querySelector("#items-list")
  const matchesList = questionDiv.querySelector("#matches-list")
  const matchingAnswersList = questionDiv.querySelector("#matching-answers-list")
  const itemsTitle = questionDiv.querySelector("#itemsTitle")
  const matchesTitle = questionDiv.querySelector("#matchesTitle")

  if (addItemBtn && itemsList && matchesList && matchingAnswersList) {
    addItemBtn.addEventListener("click", () => {
      const itemCount = itemsList.children.length
      const newItemRow = document.createElement("div")
      newItemRow.className = "item-row"
      newItemRow.innerHTML = `
      <input type="text" name="item" required placeholder="Câu hỏi ${itemCount + 1}">
      <button type="button" class="remove-item-btn"><i class="fas fa-times"></i></button>
    `
      itemsList.appendChild(newItemRow)

      // Khởi tạo nút xóa cho mục mới
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
      <input type="text" name="match" required placeholder="Từ khóa nối">
      <button type="button" class="remove-match-btn"><i class="fas fa-times"></i></button>
    `
      matchesList.appendChild(newMatchRow)

      // Khởi tạo nút xóa cho ghép nối mới
      const removeButton = newMatchRow.querySelector(".remove-match-btn")
      removeButton.addEventListener("click", () => {
        newMatchRow.remove()
        updateMatchingAnswers()
      })

      // Cập nhật danh sách từ khóa nối
      updateMatchingAnswers()
    })

    // Thêm sự kiện lắng nghe cho thay đổi tiêu đề
    if (itemsTitle) {
      itemsTitle.addEventListener("input", updateMatchingAnswers)
    }

    if (matchesTitle) {
      matchesTitle.addEventListener("input", updateMatchingAnswers)
    }

    // Hàm cập nhật đáp án ghép nối
    function updateMatchingAnswers() {
      matchingAnswersList.innerHTML = ""
      const itemCount = itemsList.children.length
      const matchOptions = Array.from(matchesList.querySelectorAll('input[name="match"]')).map((input) => input.value)
      const currentItemsTitle = itemsTitle ? itemsTitle.value || "Danh sách câu hỏi" : "Danh sách câu hỏi"

      for (let i = 0; i < itemCount; i++) {
        const answerRow = document.createElement("div")
        answerRow.className = "answer-row"

        // Lấy nội dung câu hỏi để hiển thị
        const itemText = itemsList.children[i].querySelector('input[name="item"]').value || `Câu hỏi ${i + 1}`

        // Tạo dropdown để chọn từ khóa nối
        answerRow.innerHTML = `
        <span class="item-label">${itemText}:</span>
        <select name="matchingAnswer" required>
          <option value="">-- Chọn từ khóa nối --</option>
          ${matchOptions.map((match, idx) => `<option value="${match}">${match}</option>`).join("")}
        </select>
        <button type="button" class="preview-match-btn" title="Xem trước"><i class="fas fa-eye"></i></button>
      `
        matchingAnswersList.appendChild(answerRow)

        // Thêm sự kiện xem trước
        const previewBtn = answerRow.querySelector(".preview-match-btn")
        previewBtn.addEventListener("click", () => {
          const selectedMatch = answerRow.querySelector("select").value
          if (selectedMatch) {
            window.showNotification(`Ghép nối: "${itemText}" → "${selectedMatch}"`, "info")
          } else {
            window.showNotification("Vui lòng chọn từ khóa nối trước", "warning")
          }
        })
      }
    }

    // Khởi tạo các nút xóa hiện có cho mục
    const removeItemBtns = questionDiv.querySelectorAll(".remove-item-btn")
    removeItemBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".item-row").remove()
        updateMatchingAnswers()
      })
    })

    // Khởi tạo các nút xóa hiện có cho ghép nối
    const removeMatchBtns = questionDiv.querySelectorAll(".remove-match-btn")
    removeMatchBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".match-row").remove()
        // Cập nhật lại danh sách từ khóa trong dropdown
        updateMatchingAnswers()
      })
    })

    // Thêm sự kiện lắng nghe cho thay đổi trong danh sách từ khóa
    matchesList.addEventListener("input", () => {
      updateMatchingAnswers()
    })

    // Cập nhật ban đầu của đáp án ghép nối
    updateMatchingAnswers()
  }

  // Nút lưu câu hỏi
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Triển khai logic lưu ở đây
      saveMatchingQuestion(questionDiv)
    })
  }
}

// Update the initializePlanMapDiagram function
function initializePlanMapDiagram(questionDiv) {
  const typeSelect = questionDiv.querySelector("#type")
  const addLabelBtn = questionDiv.querySelector(".add-label-btn")
  const labelsContainer = questionDiv.querySelector("#labels-container")
  const imageInput = questionDiv.querySelector("#image")
  const imagePreview = questionDiv.querySelector("#imagePreview")

  // Initialize the form based on the selected type
  if (typeSelect) {
    updatePlanMapDiagramForm(typeSelect)

    // Add event listener for type change
    typeSelect.addEventListener("change", function () {
      updatePlanMapDiagramForm(this)
    })
  }

  // Image preview functionality
  if (imageInput && imagePreview) {
    imageInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px;">`
        }
        reader.readAsDataURL(e.target.files[0])
      }
    })
  }

  // Add new label row functionality
  if (addLabelBtn && labelsContainer) {
    addLabelBtn.addEventListener("click", () => {
      const labelRows = labelsContainer.querySelectorAll(".label-row")
      const newIndex = labelRows.length + 1
      const selectedType = typeSelect.value

      const newLabelRow = document.createElement("div")
      newLabelRow.className = "label-row"
      newLabelRow.innerHTML = `
        <div class="label-input-group">
          <label for="label${newIndex}">Nhãn ${newIndex}:</label>
          <input type="text" id="label${newIndex}" name="label" required placeholder="Nhập nhãn">
        </div>
        <div class="answer-input-group map-answer-group" ${selectedType !== "map" ? 'style="display: none;"' : ""}>
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
        <div class="answer-input-group ship-answer-group" ${selectedType !== "ship" ? 'style="display: none;"' : ""}>
          <label for="shipAnswer${newIndex}">Đáp án:</label>
          <input type="text" id="shipAnswer${newIndex}" name="shipAnswer" required placeholder="Nhập đáp án">
        </div>
        <button type="button" class="remove-label-btn"><i class="fas fa-times"></i></button>
      `

      labelsContainer.appendChild(newLabelRow)

      // Initialize remove button for the new row
      const removeButton = newLabelRow.querySelector(".remove-label-btn")
      if (removeButton) {
        removeButton.addEventListener("click", () => {
          newLabelRow.remove()
        })
      }
    })
  }

  // Initialize existing remove buttons
  const removeButtons = questionDiv.querySelectorAll(".remove-label-btn")
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest(".label-row").remove()
    })
  })

  // Save question button
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      savePlanMapDiagramQuestion(questionDiv)
    })
  }
}

// Update the savePlanMapDiagramQuestion function
function savePlanMapDiagramQuestion(questionDiv) {
  try {
    // Get form data
    const type = questionDiv.querySelector("#type").value
    const instructions = questionDiv.querySelector("#instructions").value.trim()
    const imageFile = questionDiv.querySelector("#image").files[0]
    const imagePreview = questionDiv.querySelector("#imagePreview img")
    const imageDataUrl = imagePreview ? imagePreview.src : ""

    // Get labels and answers based on the selected type
    const labels = Array.from(questionDiv.querySelectorAll('input[name="label"]')).map((input) => input.value.trim())
    let answers = []

    if (type === "map") {
      answers = Array.from(questionDiv.querySelectorAll('select[name="answer"]')).map((select) => select.value)
    } else if (type === "ship") {
      answers = Array.from(questionDiv.querySelectorAll('input[name="shipAnswer"]')).map((input) => input.value.trim())
    }

    // Validate inputs
    if (!instructions || labels.length === 0 || answers.length === 0 || !imageDataUrl) {
      window.showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return
    }

    // Validate that all labels have answers
    if (labels.length !== answers.length) {
      window.showNotification("Mỗi nhãn phải có một đáp án tương ứng", "error")
      return
    }

    // Validate that all fields are filled
    if (labels.some((label) => !label) || answers.some((answer) => !answer)) {
      window.showNotification("Vui lòng điền đầy đủ tất cả các nhãn và đáp án", "error")
      return
    }

    // Create question data object
    const questionData = {
      type: "Ghi nhãn Bản đồ/Sơ đồ",
      content: [type, instructions, imageDataUrl, ...labels],
      correctAnswers: answers,
    }

    // Add to test object
    if (!window.test[`part${window.currentPart}`]) {
      window.test[`part${window.currentPart}`] = []
    }

    // Find the index of this question in the part
    const questionElement = questionDiv.closest(".question")
    const partElement = questionElement.closest(".part")
    const questions = Array.from(partElement.querySelectorAll(".question"))
    const questionIndex = questions.indexOf(questionElement)

    if (questionIndex !== -1) {
      // Update existing question
      window.test[`part${window.currentPart}`][questionIndex] = questionData
    } else {
      // Add new question
      window.test[`part${window.currentPart}`].push(questionData)
    }

    window.showNotification("Đã lưu câu hỏi thành công!", "success")

    // Update UI
    if (typeof window.renderQuestionsForCurrentPart === "function") {
      window.renderQuestionsForCurrentPart()
    }
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi ghi nhãn bản đồ/sơ đồ:", error)
    window.showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
  }
}

// Cập nhật hàm saveMatchingQuestion để xử lý dữ liệu từ form mới
function saveMatchingQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const title = questionDiv.querySelector("#title").value
    const itemsTitle = questionDiv.querySelector("#itemsTitle").value || "Danh sách câu hỏi"
    const matchesTitle = questionDiv.querySelector("#matchesTitle").value || "Danh sách từ khóa nối"
    const items = Array.from(questionDiv.querySelectorAll('input[name="item"]')).map((input) => input.value)
    const matches = Array.from(questionDiv.querySelectorAll('input[name="match"]')).map((input) => input.value)
    const answers = Array.from(questionDiv.querySelectorAll('select[name="matchingAnswer"]')).map(
      (select) => select.value,
    )

    if (!title || items.length === 0 || matches.length === 0) {
      window.showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return
    }

    // Kiểm tra xem tất cả các câu hỏi đã được ghép nối chưa
    if (answers.some((answer) => !answer)) {
      window.showNotification("Vui lòng chọn từ khóa nối cho tất cả các câu hỏi", "warning")
      return
    }

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Ghép nối",
      content: [title, itemsTitle, matchesTitle, ...items, ...matches],
      correctAnswers: answers,
    }

    // Thêm vào đối tượng test
    if (!window.test[`part${window.currentPart}`]) {
      window.test[`part${window.currentPart}`] = []
    }

    // Tìm chỉ mục của câu hỏi này trong phần
    const questionElement = questionDiv.closest(".question")
    const partElement = questionElement.closest(".part")
    const questions = Array.from(partElement.querySelectorAll(".question"))
    const questionIndex = questions.indexOf(questionElement)

    if (questionIndex !== -1) {
      // Cập nhật câu hỏi hiện có
      window.test[`part${window.currentPart}`][questionIndex] = questionData
    } else {
      // Thêm câu hỏi mới
      window.test[`part${window.currentPart}`].push(questionData)
    }

    window.showNotification("Đã lưu câu hỏi thành công!", "success")

    // Cập nhật UI
    if (typeof window.renderQuestionsForCurrentPart === "function") {
      window.renderQuestionsForCurrentPart()
    }
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi ghép nối:", error)
    window.showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
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

      // Khởi tạo nút xóa cho ghi chú mới
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

      // Khởi tạo nút xóa cho đáp án mới
      const removeButton = newAnswerRow.querySelector(".remove-answer-btn")
      removeButton.addEventListener("click", () => {
        newAnswerRow.remove()
      })
    })

    // Hàm cập nhật đáp án ghi chú
    function updateNoteAnswers() {
      noteAnswersList.innerHTML = ""
      const noteCount = notesContainer.children.length

      for (let i = 0; i < noteCount; i++) {
        const answerRow = document.createElement("div")
        answerRow.className = "answer-row"
        answerRow.innerHTML = `
        <span class="answer-label">Đáp án ${i + 1}:</span>
        <input type="text" name="noteAnswer" required>
        <button type="button" class="remove-answer-btn"><i class="fas fa-times"></i></button>
      `
        noteAnswersList.appendChild(answerRow)

        // Khởi tạo nút xóa cho đáp án
        const removeButton = answerRow.querySelector(".remove-answer-btn")
        removeButton.addEventListener("click", () => {
          answerRow.remove()
        })
      }
    }

    // Khởi tạo các nút xóa hiện có cho ghi chú
    const removeNoteBtns = questionDiv.querySelectorAll(".remove-note-btn")
    removeNoteBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".note-row").remove()
        updateNoteAnswers()
      })
    })

    // Khởi tạo các nút xóa hiện có cho đáp án
    const removeAnswerBtns = questionDiv.querySelectorAll(".remove-answer-btn")
    removeAnswerBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".answer-row").remove()
      })
    })

    // Cập nhật ban đầu của đáp án ghi chú
    updateNoteAnswers()
  }

  // Nút lưu câu hỏi
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Triển khai logic lưu ở đây
      saveNoteCompletionQuestion(questionDiv)
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

      // Khởi tạo nút xóa cho hàng mới
      const removeButton = newRow.querySelector(".remove-row-btn")
      removeButton.addEventListener("click", () => {
        newRow.remove()
      })
    })
  }

  // Khởi tạo các nút xóa hiện có
  const removeRowBtns = questionDiv.querySelectorAll(".remove-row-btn")
  removeRowBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest("tr").remove()
    })
  })

  // Nút lưu câu hỏi
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Triển khai logic lưu ở đây
      saveFormTableCompletionQuestion(questionDiv)
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

      // Khởi tạo nút xóa cho mục mới
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

      // Khởi tạo nút xóa cho tùy chọn mới
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

      // Khởi tạo nút xóa cho đáp án mới
      const removeButton = newAnswerRow.querySelector(".remove-flow-answer-btn")
      removeButton.addEventListener("click", () => {
        newAnswerRow.remove()
      })
    })

    // Hàm cập nhật đáp án lưu đồ
    function updateFlowAnswers() {
      flowAnswersList.innerHTML = ""
      const itemCount = flowItemsList.children.length

      for (let i = 0; i < itemCount; i++) {
        const answerRow = document.createElement("div")
        answerRow.className = "flow-answer-row"
        answerRow.innerHTML = `
        <span class="answer-label">Đáp án ${i + 1}:</span>
        <input type="text" name="flowAnswer" required>
        <button type="button" class="remove-flow-answer-btn"><i class="fas fa-times"></i></button>
      `
        flowAnswersList.appendChild(answerRow)

        // Khởi tạo nút xóa cho đáp án
        const removeButton = answerRow.querySelector(".remove-flow-answer-btn")
        removeButton.addEventListener("click", () => {
          answerRow.remove()
        })
      }
    }

    // Khởi tạo các nút xóa hiện có cho mục
    const removeItemBtns = questionDiv.querySelectorAll(".remove-flow-item-btn")
    removeItemBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".flow-item-row").remove()
        updateFlowAnswers()
      })
    })

    // Khởi tạo các nút xóa hiện có cho tùy chọn
    const removeOptionBtns = questionDiv.querySelectorAll(".remove-flow-option-btn")
    removeOptionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".flow-option-row").remove()
      })
    })

    // Khởi tạo các nút xóa hiện có cho đáp án
    const removeAnswerBtns = questionDiv.querySelectorAll(".remove-flow-answer-btn")
    removeAnswerBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.closest(".flow-answer-row").remove()
      })
    })

    // Cập nhật ban đầu của đáp án lưu đồ
    updateFlowAnswers()
  }

  // Nút lưu câu hỏi
  const saveQuestionBtn = questionDiv.querySelector(".save-question-btn")
  if (saveQuestionBtn) {
    saveQuestionBtn.addEventListener("click", () => {
      // Triển khai logic lưu ở đây
      saveFlowChartCompletionQuestion(questionDiv)
    })
  }
}

// Hàm lưu câu hỏi
function saveOneAnswerQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const questionText = questionDiv.querySelector("#question").value
    const options = Array.from(questionDiv.querySelectorAll('input[name="option"]')).map((input) => input.value)
    const selectedRadio = questionDiv.querySelector('input[name="correctAnswer"]:checked')

    if (!questionText || options.length === 0 || !selectedRadio) {
      window.showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return
    }

    const correctAnswerIndex = Number.parseInt(selectedRadio.value)
    const correctAnswer = options[correctAnswerIndex]

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Một đáp án",
      content: [questionText, ...options],
      correctAnswers: correctAnswer,
    }

    // Thêm vào đối tượng test
    if (!window.test[`part${window.currentPart}`]) {
      window.test[`part${window.currentPart}`] = []
    }

    // Tìm chỉ mục của câu hỏi này trong phần
    const questionElement = questionDiv.closest(".question")
    const partElement = questionElement.closest(".part")
    const questions = Array.from(partElement.querySelectorAll(".question"))
    const questionIndex = questions.indexOf(questionElement)

    if (questionIndex !== -1) {
      // Cập nhật câu hỏi hiện có
      window.test[`part${window.currentPart}`][questionIndex] = questionData
    } else {
      // Thêm câu hỏi mới
      window.test[`part${window.currentPart}`].push(questionData)
    }

    window.showNotification("Đã lưu câu hỏi thành công!", "success")

    // Cập nhật UI
    if (typeof window.renderQuestionsForCurrentPart === "function") {
      window.renderQuestionsForCurrentPart()
    }
    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi một đáp án:", error)
    window.showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
  }
}

function saveMultipleAnswerQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const questionText = questionDiv.querySelector("#question").value
    const options = Array.from(questionDiv.querySelectorAll('input[name="option"]')).map((input) => input.value)
    const selectedCheckboxes = Array.from(questionDiv.querySelectorAll('input[name="correctAnswer"]:checked'))

    if (!questionText || options.length === 0 || selectedCheckboxes.length === 0) {
      window.showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return
    }

    const correctAnswerIndices = selectedCheckboxes.map((checkbox) => Number.parseInt(checkbox.value))
    const correctAnswers = correctAnswerIndices.map((index) => options[index])

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Nhiều đáp án",
      content: [questionText, ...options],
      correctAnswers: correctAnswers,
    }

    // Thêm vào đối tượng test
    if (!window.test[`part${window.currentPart}`]) {
      window.test[`part${window.currentPart}`] = []
    }

    // Tìm chỉ mục của câu hỏi này trong phần
    const questionElement = questionDiv.closest(".question")
    const partElement = questionElement.closest(".part")
    const questions = Array.from(partElement.querySelectorAll(".question"))
    const questionIndex = questions.indexOf(questionElement)

    if (questionIndex !== -1) {
      // Cập nhật câu hỏi hiện có
      window.test[`part${window.currentPart}`][questionIndex] = questionData
    } else {
      // Thêm câu hỏi mới
      window.test[`part${window.currentPart}`].push(questionData)
    }

    window.showNotification("Đã lưu câu hỏi thành công!", "success")

    // Cập nhật UI
    if (typeof window.renderQuestionsForCurrentPart === "function") {
      window.renderQuestionsForCurrentPart()
    }
    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi nhiều đáp án:", error)
    window.showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
  }
}

function saveNoteCompletionQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const instructions = questionDiv.querySelector("#instructions").value
    const topic = questionDiv.querySelector("#topic").value
    const notes = Array.from(questionDiv.querySelectorAll('textarea[name="note"]')).map((textarea) => textarea.value)
    const answers = Array.from(questionDiv.querySelectorAll('input[name="noteAnswer"]')).map((input) => input.value)

    if (!instructions || !topic || notes.length === 0 || answers.length === 0) {
      window.showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return
    }

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Hoàn thành ghi chú",
      content: [instructions, topic, ...notes],
      correctAnswers: answers,
    }

    // Thêm vào đối tượng test
    if (!window.test[`part${window.currentPart}`]) {
      window.test[`part${window.currentPart}`] = []
    }

    // Tìm chỉ mục của câu hỏi này trong phần
    const questionElement = questionDiv.closest(".question")
    const partElement = questionElement.closest(".part")
    const questions = Array.from(partElement.querySelectorAll(".question"))
    const questionIndex = questions.indexOf(questionElement)

    if (questionIndex !== -1) {
      // Cập nhật câu hỏi hiện có
      window.test[`part${window.currentPart}`][questionIndex] = questionData
    } else {
      // Thêm câu hỏi mới
      window.test[`part${window.currentPart}`].push(questionData)
    }

    window.showNotification("Đã lưu câu hỏi thành công!", "success")

    // Cập nhật UI
    if (typeof window.renderQuestionsForCurrentPart === "function") {
      window.renderQuestionsForCurrentPart()
    }
    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi hoàn thành ghi chú:", error)
    window.showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
  }
}

function saveFormTableCompletionQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const instructions = questionDiv.querySelector("#instructions").value
    const cells = Array.from(questionDiv.querySelectorAll('input[name="cell"]')).map((input) => input.value)
    const tableAnswers = Array.from(questionDiv.querySelectorAll('input[name="tableAnswer"]')).map(
      (input) => input.value,
    )

    if (!instructions || cells.length === 0 || tableAnswers.length === 0) {
      window.showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return
    }

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Hoàn thành bảng/biểu mẫu",
      content: [instructions, ...cells],
      correctAnswers: tableAnswers,
    }

    // Thêm vào đối tượng test
    if (!window.test[`part${window.currentPart}`]) {
      window.test[`part${window.currentPart}`] = []
    }

    // Tìm chỉ mục của câu hỏi này trong phần
    const questionElement = questionDiv.closest(".question")
    const partElement = questionElement.closest(".part")
    const questions = Array.from(partElement.querySelectorAll(".question"))
    const questionIndex = questions.indexOf(questionElement)

    if (questionIndex !== -1) {
      // Cập nhật câu hỏi hiện có
      window.test[`part${window.currentPart}`][questionIndex] = questionData
    } else {
      // Thêm câu hỏi mới
      window.test[`part${window.currentPart}`].push(questionData)
    }

    window.showNotification("Đã lưu câu hỏi thành công!", "success")

    // Cập nhật UI
    if (typeof window.renderQuestionsForCurrentPart === "function") {
      window.renderQuestionsForCurrentPart()
    }
    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi hoàn thành bảng/biểu mẫu:", error)
    window.showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
  }
}

function saveFlowChartCompletionQuestion(questionDiv) {
  try {
    // Lấy dữ liệu từ form
    const title = questionDiv.querySelector("#title").value
    const instructions = questionDiv.querySelector("#instructions").value
    const flowItems = Array.from(questionDiv.querySelectorAll('input[name="flowItem"]')).map((input) => input.value)
    const flowOptions = Array.from(questionDiv.querySelectorAll('input[name="flowOption"]')).map((input) => input.value)
    const flowAnswers = Array.from(questionDiv.querySelectorAll('input[name="flowAnswer"]')).map((input) => input.value)

    if (!title || !instructions || flowItems.length === 0 || flowAnswers.length === 0) {
      window.showNotification("Vui lòng điền đầy đủ thông tin câu hỏi", "error")
      return
    }

    // Tạo đối tượng câu hỏi
    const questionData = {
      type: "Hoàn thành lưu đồ",
      content: [title, instructions, ...flowItems, ...flowOptions],
      correctAnswers: flowAnswers,
    }

    // Thêm vào đối tượng test
    if (!window.test[`part${window.currentPart}`]) {
      window.test[`part${window.currentPart}`] = []
    }

    // Tìm chỉ mục của câu hỏi này trong phần
    const questionElement = questionDiv.closest(".question")
    const partElement = questionElement.closest(".part")
    const questions = Array.from(partElement.querySelectorAll(".question"))
    const questionIndex = questions.indexOf(questionElement)

    if (questionIndex !== -1) {
      // Cập nhật câu hỏi hiện có
      window.test[`part${window.currentPart}`][questionIndex] = questionData
    } else {
      // Thêm câu hỏi mới
      window.test[`part${window.currentPart}`].push(questionData)
    }

    window.showNotification("Đã lưu câu hỏi thành công!", "success")

    // Cập nhật UI
    if (typeof window.renderQuestionsForCurrentPart === "function") {
      window.renderQuestionsForCurrentPart()
    }
    return questionData
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi hoàn thành lưu đồ:", error)
    window.showNotification("Lỗi khi lưu câu hỏi: " + error.message, "error")
  }
}

// Cập nhật hàm saveQuestionChanges để hiển thị thông báo chi tiết hơn
window.saveQuestionChanges = (button) => {
  try {
    // Tìm phần tử câu hỏi chứa nút được nhấn
    const questionDiv = button.closest(".question")
    if (!questionDiv) {
      window.showNotification("Không tìm thấy câu hỏi để lưu", "error")
      return
    }

    // Lấy chỉ mục của câu hỏi trong phần hiện tại
    const questionIndex = Number.parseInt(questionDiv.getAttribute("data-question-index"))
    if (isNaN(questionIndex)) {
      const part = document.getElementById(`part${window.currentPart}`)
      const questions = Array.from(part.querySelectorAll(".question"))
      const index = questions.indexOf(questionDiv)

      if (index === -1) {
        window.showNotification("Không thể xác định vị trí câu hỏi", "error")
        return
      }

      questionDiv.setAttribute("data-question-index", index)
    }

    // Lấy loại câu hỏi
    const questionType = questionDiv
      .querySelector("h3")
      .textContent.trim()
      .replace(/^[\s\S]*?(\w+\s+\w+\s*\/?\s*\w*)$/, "$1")

    // Lấy dữ liệu từ form dựa trên loại câu hỏi
    let updatedQuestion = null

    switch (questionType) {
      case "Một đáp án":
        updatedQuestion = saveOneAnswerQuestion(questionDiv)
        break
      case "Nhiều đáp án":
        updatedQuestion = saveMultipleAnswerQuestion(questionDiv)
        break
      case "Ghép nối":
        updatedQuestion = saveMatchingQuestion(questionDiv)
        break
      case "Ghi nhãn Bản đồ/Sơ đồ":
        updatedQuestion = savePlanMapDiagramQuestion(questionDiv)
        break
      case "Hoàn thành ghi chú":
        updatedQuestion = saveNoteCompletionQuestion(questionDiv)
        break
      case "Hoàn thành bảng/biểu mẫu":
        updatedQuestion = saveFormTableCompletionQuestion(questionDiv)
        break
      case "Hoàn thành lưu đồ":
        updatedQuestion = saveFlowChartCompletionQuestion(questionDiv)
        break
    }

    if (updatedQuestion) {
      // Cập nhật câu hỏi trong đối tượng test
      const index = Number.parseInt(questionDiv.getAttribute("data-question-index"))
      window.test[`part${window.currentPart}`][index] = updatedQuestion
      window.showNotification(`Đã lưu thay đổi cho câu hỏi ${index + 1} thành công!`, "success")

      // Chuyển sang chế độ xem sau khi lưu
      window.setQuestionViewMode(questionDiv)
    } else {
      window.showNotification("Không thể lưu câu hỏi, vui lòng kiểm tra dữ liệu nhập", "error")
    }
  } catch (error) {
    console.error("Lỗi khi lưu câu hỏi:", error)
    window.showNotification(`Lỗi khi lưu câu hỏi: ${error.message}`, "error")
  }
}

// Cập nhật hàm getIconForType để đảm bảo nó có sẵn trong phạm vi toàn cục
window.getIconForType = (type) => {
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
