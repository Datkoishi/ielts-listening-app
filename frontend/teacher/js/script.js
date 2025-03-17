// Constants
const MAX_QUESTIONS = 40
const PARTS = 4

// Global variables
let selectedTypes = []
let currentPart = 1
let totalQuestions = 0
let audioFile = null
let audioDuration = 0

// Add test metadata to the test object
let test = {
  title: "",
  description: "",
  part1: [],
  part2: [],
  part3: [],
  part4: [],
}

// Fetch question types from the server or use predefined types
function fetchQuestionTypes() {
  const questionTypes = [
    "One answer",
    "More than one answer",
    "Matching",
    "Plan/Map/Diagram labelling",
    "Note Completion",
    "Form/Table Completion",
    "Flow chart Completion",
  ]
  const questionTypeContainer = document.getElementById("questionTypes")

  if (!questionTypeContainer) {
    console.error("Question type container not found")
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

// Save the question set to the server
function saveQuestionSet() {
  try {
    // Validate that we have questions to save
    let hasQuestions = false
    for (let i = 1; i <= 4; i++) {
      if (test[`part${i}`] && test[`part${i}`].length > 0) {
        hasQuestions = true
        break
      }
    }

    if (!hasQuestions) {
      showNotification("No questions to save. Please add at least one question.", "error")
      return
    }

    // Create a question set object
    const questionSet = {
      title: test.title || "Untitled Question Set",
      description: test.description || "",
      questions: [],
    }

    // Add all questions from all parts
    for (let i = 1; i <= 4; i++) {
      if (test[`part${i}`] && test[`part${i}`].length > 0) {
        test[`part${i}`].forEach((question) => {
          questionSet.questions.push({
            ...question,
            part: i,
          })
        })
      }
    }

    // Save to server
    saveTestToServer(questionSet)
      .then((response) => {
        showNotification("Question set saved successfully!", "success")
        console.log("Saved question set:", response)
      })
      .catch((error) => {
        showNotification(`Error saving question set: ${error.message}`, "error")
        console.error("Error saving question set:", error)
      })
  } catch (error) {
    console.error("Error in saveQuestionSet:", error)
    showNotification(`Error: ${error.message}`, "error")
  }
}

// Add the saveT2ListeningExercise function
function saveT2ListeningExercise() {
  try {
    const form = document.getElementById("t2ListeningExerciseForm")
    if (!form) {
      throw new Error("Form not found")
    }

    // Get form data
    const instructions = document.getElementById("t2ListeningExerciseInstructions")?.value?.trim()
    const topic = document.getElementById("t2ListeningExerciseTopic")?.value?.trim()
    const questionCount = Number.parseInt(document.getElementById("t2ListeningExerciseQuestionCount")?.value || "0", 10)

    // Validate required fields
    if (!instructions || !topic || questionCount <= 0) {
      const missing = []
      if (!instructions) missing.push("Instructions")
      if (!topic) missing.push("Topic")
      if (questionCount <= 0) missing.push("Number of Questions")

      showMessage(`Please fill in all required fields: ${missing.join(", ")}`, "error")
      return
    }

    // Get questions and answers
    const questions = []
    const correctAnswers = []
    let hasErrors = false

    for (let i = 1; i <= questionCount; i++) {
      const questionText = document.getElementById(`t2ListeningExerciseQuestion${i}`)?.value?.trim()
      const answerInputs = document.querySelectorAll(
        `#t2ListeningExerciseCorrectAnswers${i} .t2-listening-exercise-correct-answer-input`,
      )

      if (!questionText || questionText === "") {
        showMessage(`Question ${i} text is required`, "error")
        hasErrors = true
        continue
      }

      // Validate that question contains [ANSWER] placeholders
      const answerCount = (questionText.match(/\[ANSWER\]/g) || []).length
      if (answerCount === 0) {
        showMessage(`Question ${i} must contain at least one [ANSWER] placeholder`, "error")
        hasErrors = true
        continue
      }

      // Get correct answers
      const answers = Array.from(answerInputs).map((input) => input.value?.trim())
      if (answers.some((answer) => !answer)) {
        showMessage(`All correct answers for Question ${i} must be filled`, "error")
        hasErrors = true
        continue
      }

      if (answers.length !== answerCount) {
        showMessage(`Number of answers doesn't match number of [ANSWER] placeholders in Question ${i}`, "error")
        hasErrors = true
        continue
      }

      questions.push(questionText)
      correctAnswers.push(...answers)
    }

    if (hasErrors) {
      return
    }

    // Create question object
    const questionData = {
      type: "Note Completion",
      content: [instructions, topic, ...questions],
      correctAnswers,
    }

    // Add to test object
    const part = Math.ceil(totalQuestions / 10) || 1
    if (part >= 1 && part <= 4) {
      if (!test[`part${part}`]) {
        test[`part${part}`] = []
      }
      test[`part${part}`].push(questionData)
      totalQuestions += questionCount
    }

    console.log("Saved Note Completion question:", questionData)
    showMessage("Exercise saved successfully!", "success")

    // Reset form
    form.reset()
    updateT2ListeningExercisePreview()
  } catch (error) {
    console.error("Error saving Note Completion exercise:", error)
    showMessage(`Error saving exercise: ${error.message}`, "error")
  }
}

// Update the preview function
function updateT2ListeningExercisePreview() {
  try {
    const previewContent = document.getElementById("t2ListeningExercisePreviewContent")
    if (!previewContent) {
      console.warn("Preview content container not found")
      return
    }

    const instructions = document.getElementById("t2ListeningExerciseInstructions")?.value || ""
    const topic = document.getElementById("t2ListeningExerciseTopic")?.value || ""
    const questionCount = Number.parseInt(document.getElementById("t2ListeningExerciseQuestionCount")?.value || "0", 10)

    let previewHTML = `
      <div class="preview-section">
        <h3>${topic}</h3>
        <p class="instructions">${instructions}</p>
        <div class="questions">
    `

    for (let i = 1; i <= questionCount; i++) {
      const questionText = document.getElementById(`t2ListeningExerciseQuestion${i}`)?.value || ""
      const formattedQuestion = questionText.replace(/\[ANSWER\]/g, "___________")

      previewHTML += `
        <div class="question">
          <p>${i}. ${formattedQuestion}</p>
        </div>
      `
    }

    previewHTML += `
        </div>
      </div>
    `

    previewContent.innerHTML = previewHTML
    console.log("Preview updated successfully")
  } catch (error) {
    console.error("Error updating preview:", error)
  }
}

// Add function to validate test metadata
function validateTestMetadata() {
  if (!test.title) {
    showNotification("Please enter a test title", "error")
    return false
  }
  return true
}

// Add function to check minimum questions per part
function validatePartQuestions() {
  // Minimum 2 questions per part is recommended but not required
  const warnings = []
  for (let i = 1; i <= 4; i++) {
    const partQuestions = test[`part${i}`]?.length || 0
    if (partQuestions === 0) {
      warnings.push(`Part ${i} has no questions`)
    }
  }

  if (warnings.length > 0) {
    return confirm(`Warning:
${warnings.join("\n")}

Do you want to continue saving?`)
  }

  return true
}

// Update the saveTest function
function saveTest() {
  try {
    console.log("Starting to save test...")

    // Validate test metadata first
    if (!validateTestMetadata()) {
      return
    }

    // Check if we have any questions in any part
    let hasQuestions = false
    for (let i = 1; i <= 4; i++) {
      if (test[`part${i}`] && test[`part${i}`].length > 0) {
        hasQuestions = true
        break
      }
    }

    if (!hasQuestions) {
      showNotification("No questions found to save. Please add at least one question.", "error")
      return
    }

    // Validate part questions
    if (!validatePartQuestions()) {
      return
    }

    // Save to server
    saveTestToServer(test)
      .then((response) => {
        console.log("Test saved to server:", response)
        showNotification(`Test "${test.title}" saved successfully!`, "success")
      })
      .catch((error) => {
        console.error("Error saving test to server:", error)
        showNotification(`Error saving test: ${error.message}`, "error")
      })

    console.log("Final saved test:", test)
  } catch (error) {
    console.error("Error saving test:", error)
    showNotification(`Error saving test: ${error.message}`, "error")
  }
}

// Update test metadata form
function addTestMetadataForm() {
  const metadataForm = document.createElement("div")
  metadataForm.className = "test-metadata-form"
  metadataForm.innerHTML = `
    <div class="form-group">
      <label for="testTitle">Test Title:</label>
      <input type="text" id="testTitle" required 
        value="${test.title}"
        onchange="updateTestMetadata('title', this.value)">
    </div>
    <div class="form-group">
      <label for="testDescription">Description (optional):</label>
      <textarea id="testDescription" rows="2"
        onchange="updateTestMetadata('description', this.value)">${test.description}</textarea>
    </div>
  `

  // Add form to the beginning of test content
  const testContent = document.getElementById("testContent")
  if (testContent) {
    testContent.insertBefore(metadataForm, testContent.firstChild)
  } else {
    console.error("Test content container not found")
  }
}

// Update test metadata
function updateTestMetadata(field, value) {
  test[field] = value
}

// Initialize event listeners when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  if (!isLoggedIn()) {
    showLoginForm()
    return
  }

  // Add event listeners to main buttons
  const startTestBtn = document.getElementById("startTestBtn")
  if (startTestBtn) {
    startTestBtn.addEventListener("click", startTestCreation)
  }

  const previousPartBtn = document.getElementById("previousPartBtn")
  if (previousPartBtn) {
    previousPartBtn.addEventListener("click", previousPart)
  }

  const nextPartBtn = document.getElementById("nextPartBtn")
  if (nextPartBtn) {
    nextPartBtn.addEventListener("click", nextPart)
  }

  const saveTestBtn = document.getElementById("saveTestBtn")
  if (saveTestBtn) {
    saveTestBtn.addEventListener("click", saveTest)
  }

  // Create and add additional buttons
  const testCreationPage = document.getElementById("testCreationPage")
  if (testCreationPage) {
    // Preview Test button
    const previewTestBtn = document.createElement("button")
    previewTestBtn.id = "previewTestBtn"
    previewTestBtn.className = "action-button"
    previewTestBtn.innerHTML = '<i class="fas fa-eye"></i> Preview Test'
    previewTestBtn.addEventListener("click", previewEntireTest)
    testCreationPage.appendChild(previewTestBtn)

    // Export Test button
    const exportTestBtn = document.createElement("button")
    exportTestBtn.id = "exportTestBtn"
    exportTestBtn.className = "action-button"
    exportTestBtn.innerHTML = '<i class="fas fa-file-export"></i> Export Test'
    exportTestBtn.addEventListener("click", exportTest)
    testCreationPage.appendChild(exportTestBtn)

    // Import Test button
    const importTestBtn = document.createElement("button")
    importTestBtn.id = "importTestBtn"
    importTestBtn.className = "action-button"
    importTestBtn.innerHTML = '<i class="fas fa-file-import"></i> Import Test'
    importTestBtn.addEventListener("click", importTest)
    testCreationPage.appendChild(importTestBtn)

    // Save Question Set button
    const saveQuestionSetBtn = document.createElement("button")
    saveQuestionSetBtn.id = "saveQuestionSetBtn"
    saveQuestionSetBtn.className = "action-button"
    saveQuestionSetBtn.innerHTML = '<i class="fas fa-save"></i> Save Question Set'
    saveQuestionSetBtn.addEventListener("click", saveQuestionSet)
    testCreationPage.appendChild(saveQuestionSetBtn)

    // Load Test List button
    const loadTestListBtn = document.createElement("button")
    loadTestListBtn.id = "loadTestListBtn"
    loadTestListBtn.className = "action-button"
    loadTestListBtn.innerHTML = '<i class="fas fa-list"></i> Test List'
    loadTestListBtn.addEventListener("click", showTestList)
    testCreationPage.appendChild(loadTestListBtn)
  }

  // Fetch question types
  fetchQuestionTypes()

  // Add test metadata form
  addTestMetadataForm()

  // Setup audio handlers if needed
  setupAudioHandlers()
})

// Start test creation process
function startTestCreation() {
  selectedTypes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value)
  if (selectedTypes.length === 0) {
    alert("Please select at least one question type.")
    return
  }
  document.getElementById("selectionPage").classList.add("hidden")
  document.getElementById("testCreationPage").classList.remove("hidden")
  renderTestCreation()
}

// Render the test creation interface
function renderTestCreation() {
  const testContent = document.getElementById("testContent")
  if (!testContent) {
    console.error("Test content container not found")
    return
  }

  testContent.innerHTML = `
    <div class="part-header">
      <h2><i class="fas fa-list-ol"></i> Part ${currentPart}</h2>
      <div class="question-count"><i class="fas fa-question-circle"></i> Total Questions: ${totalQuestions}/${MAX_QUESTIONS}</div>
    </div>
  `

  // Add test metadata form
  addTestMetadataForm()

  // Create all part containers if they don't exist
  for (let i = 1; i <= 4; i++) {
    if (!document.getElementById(`part${i}`)) {
      const part = document.createElement("div")
      part.className = "part"
      part.id = `part${i}`
      part.style.display = i === currentPart ? "block" : "none"
      testContent.appendChild(part)
    }
  }

  const currentPartElement = document.getElementById(`part${currentPart}`)
  if (currentPartElement) {
    currentPartElement.style.display = "block"
    renderQuestionTypes(currentPartElement)
  }

  // Show existing questions for the current part
  displayExistingQuestions(currentPart)
}

// Display existing questions for a part
function displayExistingQuestions(partNumber) {
  const partElement = document.getElementById(`part${partNumber}`)
  if (!partElement) return

  const existingQuestions = test[`part${partNumber}`] || []

  existingQuestions.forEach((question, index) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question existing-question"

    // Add question header
    questionDiv.innerHTML = `
      <h3>${getIconForType(question.type)} ${question.type}</h3>
      <h4><i class="fas fa-question-circle"></i> Question ${index + 1}</h4>
      <button class="delete-question" onclick="deleteQuestion(this)"><i class="fas fa-trash"></i></button>
      <div class="question-content">
        ${renderQuestionContent(question)}
      </div>
    `

    partElement.appendChild(questionDiv)
  })
}

// Render question content based on type
function renderQuestionContent(question) {
  switch (question.type) {
    case "One answer":
      return `
        <p><strong>Question:</strong> ${question.content[0]}</p>
        <p><strong>Options:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map((option) => `<li>${option}</li>`)
            .join("")}
        </ul>
        <p><strong>Correct Answer:</strong> ${question.correctAnswers}</p>
      `
    case "More than one answer":
      return `
        <p><strong>Question:</strong> ${question.content[0]}</p>
        <p><strong>Options:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map((option) => `<li>${option}</li>`)
            .join("")}
        </ul>
        <p><strong>Correct Answers:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Matching":
      return `
        <p><strong>Title:</strong> ${question.content[0]}</p>
        <div class="matching-preview">
          <div class="matching-column">
            <h5>Items</h5>
            <ul>
              ${question.content
                .slice(1, Math.ceil(question.content.length / 2))
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
          <div class="matching-column">
            <h5>Matches</h5>
            <ul>
              ${question.content
                .slice(Math.ceil(question.content.length / 2))
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
        </div>
        <p><strong>Correct Matches:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Plan/Map/Diagram labelling":
      return `
        <p><strong>Type:</strong> ${question.content[0]}</p>
        <p><strong>Instructions:</strong> ${question.content[1]}</p>
        <div class="image-preview">
          <img src="${question.content[2]}" alt="Diagram" style="max-width: 200px;">
        </div>
        <p><strong>Labels:</strong> ${question.content.slice(3).join(", ")}</p>
        <p><strong>Correct Answers:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Note Completion":
      return `
        <p><strong>Instructions:</strong> ${question.content[0]}</p>
        <p><strong>Topic:</strong> ${question.content[1]}</p>
        <div class="notes-preview">
          ${question.content
            .slice(2)
            .map((note, i) => `<p>${i + 1}. ${note.replace(/\[ANSWER\]/g, "_______")}</p>`)
            .join("")}
        </div>
        <p><strong>Correct Answers:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Form/Table Completion":
      return `
        <p><strong>Instructions:</strong> ${question.content[0]}</p>
        <div class="table-preview">
          <table>
            <tr>
              <th>Column 1</th>
              <th>Column 2</th>
              <th>Column 3</th>
            </tr>
            ${renderTableRows(question.content.slice(1))}
          </table>
        </div>
        <p><strong>Correct Answers:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    case "Flow chart Completion":
      return `
        <p><strong>Title:</strong> ${question.content[0]}</p>
        <p><strong>Instructions:</strong> ${question.content[1]}</p>
        <div class="flowchart-preview">
          ${question.content
            .slice(2, question.content.length / 2)
            .map((item) => `<div class="flow-item">${item.replace(/___/g, "_______")}</div>`)
            .join('<div class="flow-arrow">↓</div>')}
        </div>
        <p><strong>Options:</strong> ${question.content.slice(question.content.length / 2).join(", ")}</p>
        <p><strong>Correct Answers:</strong> ${Array.isArray(question.correctAnswers) ? question.correctAnswers.join(", ") : question.correctAnswers}</p>
      `
    default:
      return `<p>Unknown question type: ${question.type}</p>`
  }
}

// Helper function to render table rows
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

// Render question types for selection
function renderQuestionTypes(container) {
  selectedTypes.forEach((type) => {
    const questionDiv = document.createElement("div")
    questionDiv.className = "question-type-selector"
    questionDiv.innerHTML = `
      <h3>${getIconForType(type)} ${type}</h3>
      <button class="add-question-btn" onclick="addQuestion('${type}', ${currentPart})">
        <i class="fas fa-plus"></i> Add ${type} Question
      </button>
    `
    container.appendChild(questionDiv)
  })
}

// Get icon for question type
function getIconForType(type) {
  const icons = {
    "One answer": '<i class="fas fa-check-circle"></i>',
    "More than one answer": '<i class="fas fa-check-double"></i>',
    Matching: '<i class="fas fa-link"></i>',
    "Plan/Map/Diagram labelling": '<i class="fas fa-map-marker-alt"></i>',
    "Note Completion": '<i class="fas fa-sticky-note"></i>',
    "Form/Table Completion": '<i class="fas fa-table"></i>',
    "Flow chart Completion": '<i class="fas fa-project-diagram"></i>',
  }
  return icons[type] || '<i class="fas fa-question"></i>'
}

// Add a new question
function addQuestion(type, partNumber) {
  if (totalQuestions >= MAX_QUESTIONS) {
    alert("You have reached the maximum limit of 40 questions.")
    return
  }

  const part = document.getElementById(`part${partNumber}`)
  const questionNumber = totalQuestions + 1
  const questionDiv = document.createElement("div")
  questionDiv.className = "question"

  // Add the question type header
  const typeHeader = document.createElement("h3")
  typeHeader.innerHTML = `${getIconForType(type)} ${type}`
  questionDiv.appendChild(typeHeader)

  // Add question number and delete button
  questionDiv.innerHTML += `
    <h4><i class="fas fa-question-circle"></i> Question ${questionNumber}</h4>
    <button class="delete-question" onclick="deleteQuestion(this)"><i class="fas fa-trash"></i></button>
  `

  // Add the appropriate form based on type
  switch (type) {
    case "One answer":
      questionDiv.innerHTML += createOneAnswerForm()
      break
    case "More than one answer":
      questionDiv.innerHTML += createMultipleAnswerForm()
      break
    case "Matching":
      questionDiv.innerHTML += createMatchingForm()
      break
    case "Plan/Map/Diagram labelling":
      questionDiv.innerHTML += createPlanMapDiagramForm()
      break
    case "Note Completion":
      questionDiv.innerHTML += createNoteCompletionForm()
      break
    case "Form/Table Completion":
      questionDiv.innerHTML += createFormTableCompletionForm()
      break
    case "Flow chart Completion":
      questionDiv.innerHTML += createFlowChartCompletionForm()
      break
    default:
      console.error("Unknown question type:", type)
      return
  }

  part.appendChild(questionDiv)
  totalQuestions++
  updateQuestionCount()

  // Initialize form functionality based on type
  switch (type) {
    case "One answer":
      initializeOneAnswerForm(questionDiv)
      break
    case "More than one answer":
      initializeMultipleAnswerForm(questionDiv)
      break
    case "Matching":
      initializeMatchingForm(questionDiv)
      break
    case "Plan/Map/Diagram labelling":
      initializePlanMapDiagram(questionDiv)
      break
    case "Note Completion":
      initializeNoteCompletionForm(questionDiv)
      break
    case "Form/Table Completion":
      initializeFormTableCompletionForm(questionDiv)
      break
    case "Flow chart Completion":
      initializeFlowChartCompletionForm(questionDiv)
      break
  }
}

// Delete a question
function deleteQuestion(button) {
  const questionDiv = button.closest(".question")
  const partDiv = questionDiv.closest(".part")
  const partNumber = Number.parseInt(partDiv.id.replace("part", ""))

  // Find the index of this question in the part
  const questions = Array.from(partDiv.querySelectorAll(".question"))
  const index = questions.indexOf(questionDiv)

  // Remove from the test object if it's an existing question
  if (index !== -1 && test[`part${partNumber}`] && test[`part${partNumber}`][index]) {
    test[`part${partNumber}`].splice(index, 1)
  }

  questionDiv.remove()
  totalQuestions--
  updateQuestionCount()
  renumberQuestions()
}

// Renumber questions after deletion
function renumberQuestions() {
  const questions = document.querySelectorAll(".question h4")
  questions.forEach((question, index) => {
    question.innerHTML = `<i class="fas fa-question-circle"></i> Question ${index + 1}`
  })
}

// Update the question count display
function updateQuestionCount() {
  const countElement = document.querySelector(".question-count")
  if (countElement) {
    countElement.innerHTML = `<i class="fas fa-question-circle"></i> Total Questions: ${totalQuestions}/${MAX_QUESTIONS}`
  }
}

// Navigate to previous part
function previousPart() {
  if (currentPart > 1) {
    // Hide current part
    const currentPartElement = document.getElementById(`part${currentPart}`)
    if (currentPartElement) {
      currentPartElement.style.display = "none"
    }

    // Show previous part
    currentPart--
    const previousPartElement = document.getElementById(`part${currentPart}`)
    if (previousPartElement) {
      previousPartElement.style.display = "block"
    }

    // Update part header
    const partHeader = document.querySelector(".part-header h2")
    if (partHeader) {
      partHeader.innerHTML = `<i class="fas fa-list-ol"></i> Part ${currentPart}`
    }
  }
}

// Navigate to next part
function nextPart() {
  if (currentPart < 4) {
    // Hide current part
    const currentPartElement = document.getElementById(`part${currentPart}`)
    if (currentPartElement) {
      currentPartElement.style.display = "none"
    }

    // Show next part
    currentPart++
    const nextPartElement = document.getElementById(`part${currentPart}`)
    if (nextPartElement) {
      nextPartElement.style.display = "block"
    }

    // Update part header
    const partHeader = document.querySelector(".part-header h2")
    if (partHeader) {
      partHeader.innerHTML = `<i class="fas fa-list-ol"></i> Part ${currentPart}`
    }

    // If this part hasn't been rendered yet, render it
    if (!nextPartElement.querySelector(".question-type-selector")) {
      renderQuestionTypes(nextPartElement)
      displayExistingQuestions(currentPart)
    }
  }
}

// Process question data based on type
function processQuestionByType(q, type, questionIndex, part) {
  switch (type) {
    case "One answer": {
      const questionText = q.querySelector("#t3-questionText")?.value?.trim()
      const options =
        q
          .querySelector("#t3-options")
          ?.value?.split("\n")
          .filter((o) => o.trim()) || []
      const correctAnswer = q.querySelector("#t3-correctAnswer")?.value?.trim()

      if (!questionText || options.length === 0 || !correctAnswer) {
        console.warn(`Incomplete data for One answer question ${questionIndex + 1}`)
        return null
      }

      return {
        type,
        content: [questionText, ...options],
        correctAnswers: correctAnswer,
      }
    }

    case "More than one answer": {
      const questionText = q.querySelector("#t4-questionText")?.value?.trim()
      const options =
        q
          .querySelector("#t4-options")
          ?.value?.split("\n")
          .filter((o) => o.trim()) || []
      const answers = q.querySelector("#t4-correctAnswers")?.value?.trim()

      if (!questionText || options.length === 0 || !answers) {
        console.warn(`Incomplete data for More than one answer question ${questionIndex + 1}`)
        return null
      }

      return {
        type,
        content: [questionText, ...options],
        correctAnswers: answers
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
      }
    }

    case "Matching": {
      const title = q.querySelector('[id^="t3-questionTitle"]')?.value?.trim()
      const people =
        q
          .querySelector('[id^="t3-people"]')
          ?.value?.split("\n")
          .filter((p) => p.trim()) || []
      const responsibilities =
        q
          .querySelector('[id^="t3-responsibilities"]')
          ?.value?.split("\n")
          .filter((r) => r.trim()) || []
      const answers =
        q
          .querySelector('[id^="t3-correctAnswers"]')
          ?.value?.split("\n")
          .filter((a) => a.trim()) || []

      if (!title || people.length === 0 || responsibilities.length === 0 || answers.length === 0) {
        console.warn(`Incomplete data for Matching question ${questionIndex + 1}`)
        return null
      }

      return {
        type,
        content: [title, ...people, ...responsibilities],
        correctAnswers: answers,
      }
    }

    case "Plan/Map/Diagram labelling": {
      const questionType = q.querySelector("#questionType")?.value
      const instructions = q.querySelector("#instructions")?.value?.trim()
      const imageElement = q.querySelector("img")
      const imageUrl = imageElement ? imageElement.src : ""
      const answers = Array.from(q.querySelectorAll('[id^="answer"]')).map((el) => el.value?.trim() || "")

      // Validate required fields
      if (!questionType || !instructions || !imageUrl || answers.length === 0) {
        console.warn(`Missing required fields for Plan/Map/Diagram question ${questionIndex + 1}`)
        return null
      }

      // Get correct answers based on question type
      let correctAnswers = []
      if (questionType === "map") {
        correctAnswers = answers
          .map((_, index) => {
            const selectedRadio = q.querySelector(`input[name="correctAnswer${index}"]:checked`)
            return selectedRadio ? selectedRadio.value : ""
          })
          .filter((answer) => answer)
      } else {
        correctAnswers = Array.from(q.querySelectorAll('[id^="correctAnswer"]'))
          .map((el) => el.value?.trim())
          .filter((answer) => answer)
      }

      // Validate correct answers
      if (correctAnswers.length !== answers.length) {
        console.warn(`Incorrect number of answers for question ${questionIndex + 1}`)
        return null
      }

      return {
        type,
        content: [questionType, instructions, imageUrl, ...answers],
        correctAnswers,
      }
    }

    case "Note Completion": {
      const instructions = q.querySelector("#t2ListeningExerciseInstructions")?.value?.trim()
      const topic = q.querySelector("#t2ListeningExerciseTopic")?.value?.trim()
      const questions = Array.from(q.querySelectorAll('[id^="t2ListeningExerciseQuestion"]'))
        .map((el) => el.value?.trim())
        .filter((q) => q)
      const answers = Array.from(q.querySelectorAll(".t2-listening-exercise-correct-answer-input"))
        .map((el) => el.value?.trim())
        .filter((a) => a)

      if (!instructions || !topic || questions.length === 0 || answers.length === 0) {
        console.warn(`Incomplete data for Note Completion question ${questionIndex + 1}`)
        return null
      }

      return {
        type,
        content: [instructions, topic, ...questions],
        correctAnswers: answers,
      }
    }

    case "Form/Table Completion": {
      const instruction = q.querySelector("#tableInstruction")?.value?.trim()
      const rows = Array.from(q.querySelectorAll("#fareTable tr")).slice(1) // Skip header row
      const tableData = rows
        .map((row) => {
          const inputs = row.querySelectorAll("input:not(.t6-correct-answer-input)")
          return Array.from(inputs).map((input) => input.value?.trim() || "")
        })
        .filter((row) => row.every((cell) => cell))

      const answers = Array.from(q.querySelectorAll(".t6-correct-answer-input"))
        .map((el) => el.value?.trim())
        .filter((a) => a)

      if (!instruction || tableData.length === 0 || answers.length === 0) {
        console.warn(`Incomplete data for Form/Table Completion question ${questionIndex + 1}`)
        return null
      }

      return {
        type,
        content: [instruction, ...tableData.flat()],
        correctAnswers: answers,
      }
    }

    case "Flow chart Completion": {
      const title = q.querySelector("#flowChartTitle")?.value?.trim()
      const instructions = q.querySelector("#flowChartInstructions")?.value?.trim()
      const flowItems =
        q
          .querySelector("#flowChartItems")
          ?.value?.split("\n")
          .filter((item) => item.trim()) || []
      const options =
        q
          .querySelector("#flowChartOptions")
          ?.value?.split("\n")
          .filter((item) => item.trim()) || []
      const answers = q
        .querySelector("#flowChartAnswers")
        ?.value?.split(",")
        .map((a) => a.trim())
        .filter((a) => a)

      if (!title || !instructions || flowItems.length === 0 || options.length === 0 || answers.length === 0) {
        console.warn(`Incomplete data for Flow chart Completion question ${questionIndex + 1}`)
        return null
      }

      return {
        type,
        content: [title, instructions, ...flowItems, ...options],
        correctAnswers: answers,
      }
    }

    default:
      console.warn(`Unknown question type: ${type}`)
      return null
  }
}

// Get correct answers from a question element
function getCorrectAnswers(questionElement) {
  if (!questionElement) {
    console.warn("Question element is null")
    return []
  }

  // Get the question type from the h3 element that contains the type header
  const typeElement = questionElement.querySelector("h3")
  if (!typeElement) {
    console.warn("Question type element (h3) not found")
    return []
  }

  // Extract only the question type text, removing any icons
  const type = typeElement.textContent.replace(/[^a-zA-Z\s/-]/g, "").trim()

  try {
    switch (type) {
      case "One answer": {
        const element = questionElement.querySelector("#t3-correctAnswer")
        return element?.value || ""
      }
      case "More than one answer": {
        const element = questionElement.querySelector("#t4-correctAnswers")
        return element?.value ? element.value.split(",").map((a) => a.trim()) : []
      }
      case "Matching": {
        const elements = questionElement.querySelectorAll('[id^="t3-correctAnswers"]')
        return Array.from(elements).map((el) => el?.value || "")
      }
      case "Plan/Map/Diagram labelling": {
        const elements = questionElement.querySelectorAll('[id^="correctAnswer"]')
        return Array.from(elements).map((el) => el?.value || "")
      }
      case "Note Completion": {
        const elements = questionElement.querySelectorAll(".t2-listening-exercise-correct-answer-input")
        return Array.from(elements).map((el) => el?.value || "")
      }
      case "Form/Table Completion": {
        const elements = questionElement.querySelectorAll(".t6-correct-answer-input")
        return Array.from(elements).map((el) => el?.value || "")
      }
      case "Flow chart Completion": {
        const element = questionElement.querySelector('[id^="correctAnswers"]')
        return element?.value ? element.value.split(",").map((a) => a.trim()) : []
      }
      default:
        console.warn(`Unknown question type: ${type}`)
        return []
    }
  } catch (error) {
    console.error(`Error processing answers for question type "${type}":`, error)
    return []
  }
}

// Create form for One Answer question type
function createOneAnswerForm() {
  return `
      <div class="t3-question-creator">
          <form class="t3-one-answer-form">
              <div class="t3-form-group">
                  <label for="t3-questionText">Question Text:</label>
                  <input type="text" id="t3-questionText" name="questionText" required>
              </div>
              <div class="t3-form-group">
                  <label for="t3-options">Options (one per line):</label>
                  <textarea id="t3-options" name="options" rows="4" required></textarea>
              </div>
              <div class="t3-form-group">
                  <label for="t3-correctAnswer">Correct Answer:</label>
                  <input type="text" id="t3-correctAnswer" name="correctAnswer" required>
              </div>
              <button type="submit">Create Question</button>
          </form>
          <div class="t3-preview">
              <h2>Question Preview</h2>
              <div id="t3-questionPreview"></div>
          </div>
      </div>
  `
}

// Create form for Multiple Answer question type
function createMultipleAnswerForm() {
  return `
      <div class="t4-container">
          <form id="t4-questionForm">
              <div class="t4-form-group">
                  <label for="t4-questionText">Question Text:</label>
                  <input type="text" id="t4-questionText" name="questionText" required>
              </div>
              <div class="t4-form-group">
                  <label for="t4-options">Options (one per line):</label>
                  <textarea id="t4-options" name="options" rows="4" required></textarea>
              </div>
              <div class="t4-form-group">
                  <label for="t4-correctAnswers">Correct Answers (comma-separated numbers):</label>
                  <input type="text" id="t4-correctAnswers" name="correctAnswers" required>
              </div>
              <button type="submit">Create Question</button>
          </form>
          <div id="t4-previewArea"></div>
      </div>
  `
}

// Create form for Matching question type
function createMatchingForm() {
  return `
      <div class="t3-question-creator">
          <form id="t3-questionForm">
              <div class="t3-form-group">
                  <label for="t3-numberOfQuestions">Number of Questions:</label>
                  <input type="number" id="t3-numberOfQuestions" name="numberOfQuestions" min="1" max="10" value="1" required>
              </div>
              <div id="t3-questionsContainer"></div>
              <button type="submit">Create Questions</button>
              <button type="button" id="t3-saveButton" class="t3-save-button">Save Questions</button>
          </form>
          <div id="t3-message" class="t3-message" style="display: none;"></div>
          <div class="t3-preview">
              <h2>Questions Preview</h2>
              <div id="t3-questionsPreview"></div>
          </div>
      </div>
  `
}

// Create form for Plan/Map/Diagram question type
function createPlanMapDiagramForm() {
  return `
  <div class="t1-ielts-creator">
      <h1>IELTS Listening Question Creator</h1>

      <div class="t1-instructions-section">
          <h2>Instructions for Creating Questions</h2>
          <ol class="t1-instructions-list">
              <li><strong>Select question type:</strong> Choose between Map Labelling, Ship Diagram, or Technical Diagram.</li>
              <li><strong>Set number of questions:</strong> Decide how many questions you want to create (1-10).</li>
              <li><strong>Write instructions:</strong> Provide clear instructions for students to follow.</li>
              <li><strong>Upload image:</strong> Select an appropriate image for your question (map, ship diagram, or technical diagram).</li>
              <li><strong>Add answers:</strong>
                  <ul>
                      <li>For Map Labelling: Enter location names and correct letters (A-H).</li>
                      <li>For Ship Diagram: Enter area names and correct letters or numbers.</li>
                      <li>For Technical Diagram: Enter only correct answers.</li>
                  </ul>
              </li>
              <li><strong>Review and Submit:</strong> Check all entries and click "Add Question" to create the question.</li>
              <li><strong>Save questions:</strong> After creating all questions, click "Save Questions" to submit to the system.</li>
          </ol>
      </div>

      <div class="t1-form-section">
          <h2>Create New Question</h2>
          <form id="questionForm">
              <div class="t1-form-group">
                  <label for="questionType">Question Type:</label>
                  <select id="questionType" required>
                      <option value="map">Map Labelling</option>
                      <option value="ship">Ship Diagram</option>
                      <option value="technical">Technical Diagram</option>
                  </select>
              </div>
              <div class="t1-form-group">
                  <label for="numQuestions">Number of Questions:</label>
                  <input type="number" id="numQuestions" min="1" max="10" value="3" required>
              </div>
              <div class="t1-form-group">
                  <label for="instructions">Instructions:</label>
                  <textarea id="instructions" rows="3" required></textarea>
              </div>
              <div class="t1-form-group">
                  <label for="imageFile">Upload Image:</label>
                  <input type="file" id="imageFile" accept="image/*" required>
              </div>
              <div id="answerInputs">
                  <!-- Answer inputs will be dynamically added here -->
              </div>
              <button type="submit">Add Question</button>
          </form>
      </div>

      <div id="questionDisplay" class="t1-question-display">
          <h2>Created Questions</h2>
          <!-- Questions will be dynamically added here -->
      </div>

      <div class="t1-save-button">
          <button id="saveQuestionsBtn">Save Questions</button>
      </div>

      <div id="notification" class="t1-notification" style="display: none;"></div>
  </div>
  `
}

// Create form for Note Completion question type
function createNoteCompletionForm() {
  return `
  <div class="t2-listening-exercise-app">
      <div class="t2-listening-exercise-container">
          <div class="t2-listening-exercise-form-container">
              <h2>Create Listening Exercise</h2>
              <div class="t2-listening-exercise-instructions-box">
                  <h3>Question Instructions:</h3>
                  <ul>
                      <li>Use [ANSWER] to mark where answers should be filled in.</li>
                      <li>You can place multiple [ANSWER] markers in one question.</li>
                      <li>Example: "The dining table is [ANSWER] shape and [ANSWER] years old."</li>
                      <li>Each [ANSWER] will be converted to a blank in the exercise.</li>
                      <li>Enter correct answers for each [ANSWER] in the fields below the question.</li>
                  </ul>
              </div>
              <form id="t2ListeningExerciseForm">
                  <div class="t2-listening-exercise-form-group">
                      <label for="t2ListeningExerciseInstructions">Instructions:</label>
                      <input type="text" id="t2ListeningExerciseInstructions" name="instructions" value="Complete the notes. Write ONE WORD AND/OR A NUMBER in each gap.">
                  </div>
                  <div class="t2-listening-exercise-form-group">
                      <label for="t2ListeningExerciseTopic">Topic:</label>
                      <input type="text" id="t2ListeningExerciseTopic" name="topic" value="Phone call about second-hand furniture">
                  </div>
                  <div class="t2-listening-exercise-form-group">
                      <label for="t2ListeningExerciseQuestionCount">Number of Questions:</label>
                      <input type="number" id="t2ListeningExerciseQuestionCount" name="questionCount" min="1" max="20" value="3">
                  </div>
                  <div id="t2ListeningExerciseQuestionContainer"></div>
                  <div class="t2-listening-exercise-button-group">
                      <button type="button" onclick="updateT2ListeningExercisePreview()">Update Preview</button>
                      <button type="button" class="t2-listening-exercise-save-button" onclick="saveT2ListeningExercise()">Save Exercise</button>
                  </div>
                  <div id="t2ListeningExerciseStatusMessage" class="t2-listening-exercise-status-message"></div>
              </form>
          </div>
          <div class="t2-listening-exercise-preview-container">
              <h2>Preview</h2>
              <div id="t2ListeningExercisePreviewContent">
                  <!-- Preview content will be inserted here -->
              </div>
          </div>
      </div>
  `
}

// Save Form/Table Completion question
function saveFormTableCompletion(container) {
  try {
    // Get form elements
    const instruction = container.querySelector("#tableInstruction")?.value?.trim()
    const table = container.querySelector("#fareTable")

    if (!instruction || !table) {
      showMessage("Instructions and table are required", "error")
      return
    }

    // Get all rows except header
    const rows = Array.from(table.querySelectorAll("tr")).slice(1)
    if (rows.length === 0) {
      showMessage("Please add at least one row to the table", "error")
      return
    }

    // Collect table data and answers
    const tableData = []
    const correctAnswers = []
    let hasErrors = false

    rows.forEach((row, index) => {
      const inputs = row.querySelectorAll("input:not(.t6-correct-answer-input)")
      const correctAnswerInput = row.querySelector(".t6-correct-answer-input")

      // Get row data
      const rowData = Array.from(inputs).map((input) => input.value.trim())

      // Validate row data
      if (rowData.some((cell) => cell === "")) {
        showMessage(`Row ${index + 1} has empty cells`, "error")
        hasErrors = true
        return
      }

      // Get and validate correct answer
      const correctAnswer = correctAnswerInput?.value?.trim()
      if (!correctAnswer) {
        showMessage(`Row ${index + 1} is missing a correct answer`, "error")
        hasErrors = true
        return
      }

      tableData.push(rowData)
      correctAnswers.push(correctAnswer)
    })

    if (hasErrors) {
      return
    }

    // Create question object
    const questionData = {
      type: "Form/Table Completion",
      content: [instruction, ...tableData.flat()],
      correctAnswers,
    }

    // Add to test object
    const part = Math.ceil(totalQuestions / 10) || 1
    if (part >= 1 && part <= 4) {
      if (!test[`part${part}`]) {
        test[`part${part}`] = []
      }
      test[`part${part}`].push(questionData)
      totalQuestions += correctAnswers.length
    }

    console.log("Saved Form/Table Completion question:", questionData)
    showMessage("Table saved successfully!", "success")

    // Reset form
    container.querySelector("#tableInstruction").value =
      "Complete the table. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each gap."
    const tbody = table.querySelector("tbody") || table
    while (tbody.rows.length > 1) {
      // Keep header row
      tbody.deleteRow(1)
    }
  } catch (error) {
    console.error("Error saving table:", error)
    showMessage(`Error saving table: ${error.message}`, "error")
  }
}

// Create form for Form/Table Completion question type
function createFormTableCompletionForm() {
  return `
  <div class="t6-ielts-listening-creator">
    <div id="tableSection" class="t6-question-container">
      <textarea id="tableInstruction" rows="2">Complete the table. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each gap.</textarea>
      <div class="t6-button-group">
        <button type="button" class="t6-add-row-btn">Add Row</button>
        <button type="button" class="t6-save-btn">Save Table</button>
      </div>
      <table id="fareTable">
        <tr>
          <th>Transport</th>
          <th>Cash Fare</th>
          <th>Card Fare</th>
          <th>Correct Answer</th>
          <th>Actions</th>
        </tr>
      </table>
    </div>
  </div>
`
}

// Initialize Form/Table Completion form
function initializeFormTableCompletionForm(container) {
  const addRowBtn = container.querySelector(".t6-add-row-btn")
  const fareTable = container.querySelector("#fareTable")
  const tableInstruction = container.querySelector("#tableInstruction")

  // Add save button if it doesn't exist
  let saveBtn = container.querySelector(".t6-save-btn")
  if (!saveBtn) {
    saveBtn = document.createElement("button")
    saveBtn.className = "t6-save-btn"
    saveBtn.textContent = "Save Question"
    container.appendChild(saveBtn)
  }

  addRowBtn.addEventListener("click", () => {
    const newRow = fareTable.insertRow()
    newRow.innerHTML = `
      <td><input type="text" class="t6-transport-input" placeholder="Transport type"></td>
      <td><input type="text" class="t6-cash-fare-input" placeholder="Cash fare"></td>
      <td><input type="text" class="t6-card-fare-input" placeholder="Card fare"></td>
      <td><input type="text" class="t6-correct-answer-input" placeholder="Correct answer"></td>
      <td><button class="t6-delete-btn">Delete</button></td>
    `
    setupDeleteButtons(container)
  })

  // Add save functionality
  saveBtn.addEventListener("click", () => {
    try {
      // Validate instruction
      const instruction = tableInstruction.value.trim()
      if (!instruction) {
        showNotification("Please enter table instructions", "error")
        return
      }

      // Get all rows except header
      const rows = Array.from(fareTable.querySelectorAll("tr")).slice(1)
      if (rows.length === 0) {
        showNotification("Please add at least one row to the table", "error")
        return
      }

      // Collect row data and validate
      const tableData = []
      const correctAnswers = []
      let hasError = false
      let errorMessage = ""

      rows.forEach((row, index) => {
        const transport = row.querySelector(".t6-transport-input")?.value.trim()
        const cashFare = row.querySelector(".t6-cash-fare-input")?.value.trim()
        const cardFare = row.querySelector(".t6-card-fare-input")?.value.trim()
        const correctAnswer = row.querySelector(".t6-correct-answer-input")?.value.trim()

        if (!transport || !cashFare || !cardFare) {
          hasError = true
          errorMessage = `Please fill all fields in row ${index + 1}`
          return
        }

        if (!correctAnswer) {
          hasError = true
          errorMessage = `Please provide a correct answer for row ${index + 1}`
          return
        }

        tableData.push([transport, cashFare, cardFare])
        correctAnswers.push(correctAnswer)
      })

      if (hasError) {
        showNotification(errorMessage, "error")
        return
      }

      // Create question object
      const questionData = {
        type: "Form/Table Completion",
        content: [instruction, ...tableData.flat()],
        correctAnswers: correctAnswers,
      }

      // Add to test object
      const part = Math.ceil((totalQuestions + 1) / 10)
      if (part >= 1 && part <= 4) {
        if (!test[`part${part}`]) {
          test[`part${part}`] = []
        }
        test[`part${part}`].push(questionData)
      }

      // Update question count and display
      totalQuestions++
      updateQuestionCount()
      showNotification("Table completion question saved successfully!", "success")

      // Clear form for next question
      tableInstruction.value = "Complete the table. Write NO MORE THAN ONE WORD AND/OR A NUMBER for each gap."
      while (fareTable.rows.length > 1) {
        fareTable.deleteRow(1)
      }

      console.log("Saved question:", questionData)
    } catch (error) {
      console.error("Error saving table completion question:", error)
      showNotification("Error saving question. Please try again.", "error")
    }
  })

  setupDeleteButtons(container)

  // Add initial row if table is empty
  if (fareTable.rows.length <= 1) {
    addRowBtn.click()
  }
}

// Create form for Flow Chart Completion question type
function createFlowChartCompletionForm() {
  return `
  <div class="t7-ielts-flow-chart-creator">
    <form id="flowChartForm" class="flow-chart-form">
      <div class="form-group">
        <label for="flowChartTitle">Title:</label>
        <input type="text" id="flowChartTitle" name="title" required>
      </div>
      
      <div class="form-group">
        <label for="flowChartInstructions">Instructions:</label>
        <textarea id="flowChartInstructions" name="instructions" required></textarea>
      </div>

      <div class="form-group">
        <label for="flowChartItems">Flow Chart Items (one per line, use ___ for gaps):</label>
        <textarea id="flowChartItems" name="flowItems" required></textarea>
      </div>

      <div class="form-group">
        <label for="flowChartOptions">Options (one per line):</label>
        <textarea id="flowChartOptions" name="options" required></textarea>
      </div>

      <div class="form-group">
        <label for="flowChartAnswers">Correct Answers (comma-separated):</label>
        <input type="text" id="flowChartAnswers" name="correctAnswers" required>
      </div>

      <div class="button-group">
        <button type="submit" class="save-btn">Save Question</button>
        <button type="button" class="preview-btn">Preview</button>
      </div>
    </form>
    <div id="flowChartPreview" class="preview-section"></div>
  </div>
`
}

// Initialize One Answer form
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

    // Validate inputs
    if (!questionText || options.length === 0 || !correctAnswer) {
      showNotification("Please fill in all question information", "error")
      return
    }

    // Create question object
    const questionData = {
      type: "One answer",
      content: [questionText, ...options],
      correctAnswers: correctAnswer,
    }

    // Add to test object
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
          ${option === correctAnswer ? ' <span class="t3-correct-answer">(Correct)</span>' : ""}
        </div>
      `,
        )
        .join("")}
    `

    showNotification("Question saved successfully!", "success")

    // Reset form for next question
    form.reset()
  })
}

// Initialize Multiple Answer form
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

    // Validate inputs
    if (!questionText || options.length === 0 || correctAnswers.length === 0) {
      showNotification("Please fill in all question information", "error")
      return
    }

    // Create question object
    const questionData = {
      type: "More than one answer",
      content: [questionText, ...options],
      correctAnswers: correctAnswers,
    }

    // Add to test object
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
              ${correctAnswers.includes((index + 1).toString()) ? '<span class="t4-correct-answer"> (Correct)</span>' : ""}
            </label>
          `,
          )
          .join("")}
      </div>
    `

    showNotification("Question saved successfully!", "success")

    // Reset form for next question
    form.reset()
  })
}

// Save Matching questions
function saveMatchingQuestions(container) {
  const count = Number.parseInt(container.querySelector("#t3-numberOfQuestions").value)

  // Validate that we have at least one question
  if (count <= 0) {
    showNotification("Please add at least one question", "error")
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

    // Validate inputs
    if (!title || people.length === 0 || responsibilities.length === 0 || correctAnswers.length === 0) {
      showNotification(`Please fill in all information for question ${i + 1}`, "error")
      return
    }

    // Create question object
    const questionData = {
      type: "Matching",
      content: [title, ...people, ...responsibilities],
      correctAnswers: correctAnswers,
    }

    // Add to test object
    const part = currentPart
    if (part >= 1 && part <= 4) {
      if (!test[`part${part}`]) {
        test[`part${part}`] = []
      }
      test[`part${part}`].push(questionData)
    }
  }

  showNotification("Questions saved successfully!", "success")

  // Reset form for next question
  container.querySelector("#t3-numberOfQuestions").value = "1"
  container.querySelector("#t3-questionsContainer").innerHTML = createQuestionFields(0)
}

// Initialize Flow Chart Completion form
function initializeFlowChartCompletionForm(container) {
  if (!container) return

  const form = container.querySelector(".flow-chart-form")
  const preview = container.querySelector("#flowChartPreview")

  if (!form || !preview) return

  form.addEventListener("submit", (e) => {
    e.preventDefault()

    try {
      const title = form.querySelector("#flowChartTitle").value
      const instructions = form.querySelector("#flowChartInstructions").value
      const flowItems = form
        .querySelector("#flowChartItems")
        .value.split("\n")
        .filter((item) => item.trim())
      const options = form
        .querySelector("#flowChartOptions")
        .value.split("\n")
        .filter((item) => item.trim())
      const correctAnswers = form
        .querySelector("#flowChartAnswers")
        .value.split(",")
        .map((item) => item.trim())
        .filter((item) => item)

      // Validate inputs
      if (!title || !instructions || flowItems.length === 0 || options.length === 0 || correctAnswers.length === 0) {
        showNotification("Please fill in all question information", "error")
        return
      }

      // Create question object
      const questionData = {
        type: "Flow chart Completion",
        content: [title, instructions, ...flowItems, ...options],
        correctAnswers: correctAnswers,
      }

      // Add to test object
      const part = currentPart
      if (part >= 1 && part <= 4) {
        if (!test[`part${part}`]) {
          test[`part${part}`] = []
        }
        test[`part${part}`].push(questionData)
      }

      // Update preview
      updateFlowChartPreview(
        {
          title,
          instructions,
          flowItems,
          options,
          correctAnswers,
        },
        preview,
      )

      showNotification("Question saved successfully!", "success")

      // Reset form for next question
      form.reset()
    } catch (error) {
      console.error("Error saving flow chart question:", error)
      showNotification("Error saving question. Please check your inputs.", "error")
    }
  })

  // Initialize preview button
  const previewBtn = form.querySelector(".preview-btn")
  if (previewBtn) {
    previewBtn.addEventListener("click", () => {
      const formData = {
        title: form.querySelector("#flowChartTitle").value,
        instructions: form.querySelector("#flowChartInstructions").value,
        flowItems: form
          .querySelector("#flowChartItems")
          .value.split("\n")
          .filter((item) => item.trim()),
        options: form
          .querySelector("#flowChartOptions")
          .value.split("\n")
          .filter((item) => item.trim()),
        correctAnswers: form
          .querySelector("#flowChartAnswers")
          .value.split(",")
          .map((item) => item.trim()),
      }
      updateFlowChartPreview(formData, preview)
    })
  }
}

// Initialize Plan/Map/Diagram form
function initializePlanMapDiagram(container) {
  // Initialize container reference first
  const questionContainer = container || document.createElement("div")
  if (!container) {
    console.warn("Container not provided, creating new container")
    questionContainer.className = "t1-ielts-creator"
  }

  // Rest of initialization code...
  if (!questionContainer) {
    console.error("Container not found")
    return
  }

  const questionForm = questionContainer.querySelector("#questionForm")
  if (!questionForm) {
    console.error("Question form not found")
    return
  }

  // Prevent default form submission
  questionForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Save the question when form is submitted
    saveMapDiagramQuestion(questionContainer)
  })

  const answerInputs = questionContainer.querySelector("#answerInputs")
  const numQuestionsInput = questionContainer.querySelector("#numQuestions")
  const questionTypeSelect = questionContainer.querySelector("#questionType")
  const imageFileInput = questionContainer.querySelector("#imageFile")
  const saveQuestionsBtn = questionContainer.querySelector("#saveQuestionsBtn")
  const notification = questionContainer.querySelector("#notification")

  // Initialize state
  let imageDataUrl = ""

  // Handle image upload
  if (imageFileInput) {
    imageFileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const reader = new FileReader()
          reader.onload = (e) => {
            imageDataUrl = e.target.result
            // Create preview image
            const previewImg = document.createElement("img")
            previewImg.src = imageDataUrl
            previewImg.style.maxWidth = "200px"
            previewImg.style.marginTop = "10px"
            const container = imageFileInput.parentElement
            // Remove old preview if exists
            const oldPreview = container.querySelector("img")
            if (oldPreview) {
              container.removeChild(oldPreview)
            }
            container.appendChild(previewImg)
          }
          reader.readAsDataURL(file)
          console.log("Image file loaded")
        } catch (error) {
          console.error("Error loading image:", error)
          showNotification("Error loading image", "error")
        }
      }
    })
  }

  // Declare updateAnswerInputs here
  function updateAnswerInputs() {
    if (!answerInputs || !numQuestionsInput || !questionTypeSelect) {
      console.warn("Required elements not found for updating answer inputs")
      return
    }

    const numQuestions = Number.parseInt(numQuestionsInput.value, 10)
    const questionType = questionTypeSelect.value

    answerInputs.innerHTML = ""
    for (let i = 0; i < numQuestions; i++) {
      const answerDiv = document.createElement("div")
      answerDiv.className = "t1-form-group"
      answerDiv.innerHTML = `
                <label for="answer${i}">Answer ${i + 1}:</label>
                <input type="text" id="answer${i}" required>
            `

      if (questionType === "map") {
        answerDiv.innerHTML += `
                    <div class="t1-radio-group">
                        <label>Select correct answer:</label>
                        ${["A", "B", "C", "D", "E", "F", "G", "H"]
                          .map(
                            (letter) => `
                            <label>
                                <input type="radio" name="correctAnswer${i}" value="${letter}" required>
                                ${letter}
                            </label>
                        `,
                          )
                          .join("")}
                    </div>
                `
      } else {
        answerDiv.innerHTML += `
                    <label for="correctAnswer${i}">Correct answer for question ${i + 1}:</label>
                    <input type="text" id="correctAnswer${i}" required>
                `
      }

      answerInputs.appendChild(answerDiv)
    }
  }

  // Update event listeners
  if (numQuestionsInput) {
    numQuestionsInput.addEventListener("change", updateAnswerInputs)
  }

  if (questionTypeSelect) {
    questionTypeSelect.addEventListener("change", updateAnswerInputs)
  }

  // Initialize with default values
  updateAnswerInputs()

  // Handle save button click
  if (saveQuestionsBtn) {
    saveQuestionsBtn.addEventListener("click", () => {
      saveMapDiagramQuestion(questionContainer)
    })
  }

  // Function to save the map/diagram question
  function saveMapDiagramQuestion(questionContainer) {
    try {
      const questionType = questionTypeSelect?.value
      const instructions = questionContainer.querySelector("#instructions")?.value?.trim()
      const numQuestions = Number.parseInt(numQuestionsInput?.value || "0", 10)

      // Validate the form
      if (!validatePlanMapDiagramQuestion(questionForm) || !validateAnswerCount(questionForm, numQuestions)) {
        return
      }

      console.log("Saving form data:", {
        questionType,
        instructions,
        hasImage: !!imageDataUrl,
        numQuestions,
      })

      // Collect answers and validate
      const answers = []
      const correctAnswers = []

      for (let i = 0; i < numQuestions; i++) {
        const answerInput = questionContainer.querySelector(`#answer${i}`)
        const answer = answerInput?.value?.trim() || ""
        answers.push(answer)

        if (questionType === "map") {
          const selectedRadio = questionContainer.querySelector(`input[name="correctAnswer${i}"]:checked`)
          correctAnswers.push(selectedRadio.value)
        } else {
          const correctAnswerInput = questionContainer.querySelector(`#correctAnswer${i}`)
          const correctAnswer = correctAnswerInput?.value?.trim() || ""
          correctAnswers.push(correctAnswer)
        }
      }

      // Create question object
      const questionData = {
        type: "Plan/Map/Diagram labelling",
        content: [questionType, instructions, imageDataUrl, ...answers],
        correctAnswers,
      }

      // Add to test object
      const part = currentPart
      if (part >= 1 && part <= 4) {
        if (!test[`part${part}`]) {
          test[`part${part}`] = []
        }
        test[`part${part}`].push(questionData)
      }

      console.log("Saved question:", questionData)
      showNotification("Question saved successfully!", "success")

      // Reset form
      questionForm.reset()
      imageDataUrl = ""
      // Remove image preview
      const container = imageFileInput.parentElement
      const oldPreview = container.querySelector("img")
      if (oldPreview) {
        container.removeChild(oldPreview)
      }
      updateAnswerInputs()
    } catch (error) {
      console.error("Error saving questions:", error)
      showNotification(`Error occurred: ${error.message}`, "error")
    }
  }
}

// Create question fields for Matching questions
function createQuestionFields(index) {
  return `
      <div class="t3-question-fields" data-question="${index}">
          <h3>Question ${index + 1}</h3>
          <div class="t3-form-group">
              <label for="t3-questionTitle${index}">Question Title:</label>
              <input type="text" id="t3-questionTitle${index}" name="questionTitle${index}" required>
          </div>
          <div class="t3-form-group">
              <label for="t3-people${index}">People (one per line):</label>
              <textarea id="t3-people${index}" name="people${index}" required></textarea>
          </div>
          <div class="t3-form-group">
              <label for="t3-responsibilities${index}">Responsibilities (one per line):</label>
              <textarea id="t3-responsibilities${index}" name="responsibilities${index}" required></textarea>
          </div>
          <div class="t3-form-group">
              <label for="t3-correctAnswers${index}">Correct Answers (one per line, in order of people):</label>
              <textarea id="t3-correctAnswers${index}" name="correctAnswers${index}" required></textarea>
          </div>
      </div>
  `
}

// Update Matching preview
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
                <h3>Question ${i + 1}</h3>
                <div class="t3-question-title">${title}</div>
                <div class="t3-matching-section">
                    <div>
                        <div class="t3-column-header">People</div>
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
                        <div class="t3-column-header">Staff Responsibilities</div>
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

// Show message to user
function showMessage(message, type = "info") {
  // Try to find existing message element
  let messageElement = document.getElementById("message")

  // Create new message element if it doesn't exist
  if (!messageElement) {
    messageElement = document.createElement("div")
    messageElement.id = "message"
    document.body.appendChild(messageElement)
  }

  // Set message content and style
  messageElement.textContent = message
  messageElement.className = `message message-${type}`
  messageElement.style.display = "block"

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (messageElement) {
      messageElement.style.display = "none"
    }
  }, 5000)
}

// Update Flow Chart preview
function updateFlowChartPreview(data, previewElement) {
  if (!previewElement) return

  const previewHTML = `
    <div class="flow-chart-preview">
      <h3>${data.title}</h3>
      <p class="instructions">${data.instructions}</p>
      <div class="flow-items">
        ${data.flowItems
          .map(
            (item) => `
          <div class="flow-item">
            ${item.replace("___", '<div class="gap" data-droppable="true"></div>')}
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="options">
        ${data.options
          .map(
            (option) => `
          <div class="option" draggable="true">${option}</div>
        `,
          )
          .join("")}
      </div>
    </div>
  `

  previewElement.innerHTML = previewHTML
  initializeDragAndDrop(previewElement)
}

// Initialize drag and drop functionality
function initializeDragAndDrop(container) {
  const options = container.querySelectorAll(".option")
  const gaps = container.querySelectorAll(".gap")

  options.forEach((option) => {
    option.addEventListener("dragstart", dragStart)
    option.addEventListener("dragend", dragEnd)
  })

  gaps.forEach((gap) => {
    gap.addEventListener("dragover", dragOver)
    gap.addEventListener("dragenter", dragEnter)
    gap.addEventListener("dragleave", dragLeave)
    gap.addEventListener("drop", drop)
  })
}

// Drag and drop event handlers
function dragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.innerText)
  e.target.classList.add("dragging")
}

function dragEnd(e) {
  e.target.classList.remove("dragging")
}

function dragOver(e) {
  e.preventDefault()
}

function dragEnter(e) {
  e.preventDefault()
  e.target.classList.add("drag-over")
}

function dragLeave(e) {
  e.target.classList.remove("drag-over")
}

function drop(e) {
  e.preventDefault()
  e.target.classList.remove("drag-over")
  const data = e.dataTransfer.getData("text/plain")
  e.target.textContent = data
}

// Preview entire test
function previewEntireTest() {
  const previewWindow = window.open("", "Preview", "width=800,height=600")
  let previewContent = "<h1>IELTS Listening Test Preview</h1>"

  for (let i = 1; i <= 4; i++) {
    previewContent += `<h2>Part ${i}</h2>`
    const partQuestions = test[`part${i}`] || []

    if (partQuestions.length === 0) {
      previewContent += `<p>No questions in this part</p>`
    } else {
      partQuestions.forEach((question, index) => {
        previewContent += `
          <div class="preview-question">
            <h3>Question ${index + 1}: ${question.type}</h3>
            <div>${renderQuestionPreview(question)}</div>
          </div>
        `
      })
    }
  }

  // Add some basic styling
  previewContent = `
    <html>
      <head>
        <title>IELTS Listening Test Preview</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2c3e50; }
          h2 { color: #3498db; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          h3 { color: #2980b9; }
          .preview-question { margin-bottom: 20px; border: 1px solid #eee; padding: 15px; border-radius: 5px; }
          .correct-answer { color: #27ae60; font-weight: bold; }
          img { max-width: 100%; height: auto; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
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

// Render question preview for the preview window
function renderQuestionPreview(question) {
  switch (question.type) {
    case "One answer":
      return `
        <p><strong>Question:</strong> ${question.content[0]}</p>
        <p><strong>Options:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map(
              (option) =>
                `<li>${option} ${option === question.correctAnswers ? '<span class="correct-answer">(Correct)</span>' : ""}</li>`,
            )
            .join("")}
        </ul>
      `
    case "More than one answer":
      return `
        <p><strong>Question:</strong> ${question.content[0]}</p>
        <p><strong>Options:</strong></p>
        <ul>
          ${question.content
            .slice(1)
            .map(
              (option, index) =>
                `<li>${option} ${question.correctAnswers.includes((index + 1).toString()) ? '<span class="correct-answer">(Correct)</span>' : ""}</li>`,
            )
            .join("")}
        </ul>
      `
    case "Matching":
      const midPoint = Math.ceil(question.content.length / 2)
      return `
        <p><strong>Title:</strong> ${question.content[0]}</p>
        <div style="display: flex; gap: 20px;">
          <div style="flex: 1;">
            <h4>Items</h4>
            <ul>
              ${question.content
                .slice(1, midPoint)
                .map((item, idx) => `<li>${item} → ${question.correctAnswers[idx] || ""}</li>`)
                .join("")}
            </ul>
          </div>
          <div style="flex: 1;">
            <h4>Options</h4>
            <ul>
              ${question.content
                .slice(midPoint)
                .map((item) => `<li>${item}</li>`)
                .join("")}
            </ul>
          </div>
        </div>
      `
    case "Plan/Map/Diagram labelling":
      return `
        <p><strong>Type:</strong> ${question.content[0]}</p>
        <p><strong>Instructions:</strong> ${question.content[1]}</p>
        <div>
          <img src="${question.content[2]}" alt="Diagram" style="max-width: 400px;">
        </div>
        <p><strong>Labels:</strong></p>
        <ul>
          ${question.content
            .slice(3)
            .map((label, idx) => `<li>${label} → ${question.correctAnswers[idx] || ""}</li>`)
            .join("")}
        </ul>
      `
    case "Note Completion":
      return `
        <p><strong>Instructions:</strong> ${question.content[0]}</p>
        <p><strong>Topic:</strong> ${question.content[1]}</p>
        <div>
          ${question.content
            .slice(2)
            .map((note, idx) => {
              // Replace [ANSWER] with the correct answer and highlight it
              const highlightedNote = note.replace(
                /\[ANSWER\]/g,
                `<span class="correct-answer">${question.correctAnswers[idx] || "_____"}</span>`,
              )
              return `<p>${idx + 1}. ${highlightedNote}</p>`
            })
            .join("")}
        </div>
      `
    case "Form/Table Completion":
      const rowCount = Math.floor((question.content.length - 1) / 3)
      return `
        <p><strong>Instructions:</strong> ${question.content[0]}</p>
        <table>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
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
        <p><strong>Correct Answers:</strong> ${question.correctAnswers.join(", ")}</p>
      `
    case "Flow chart Completion":
      const flowItemCount = Math.floor(question.content.length / 2)
      return `
        <p><strong>Title:</strong> ${question.content[0]}</p>
        <p><strong>Instructions:</strong> ${question.content[1]}</p>
        <div style="display: flex; flex-direction: column; align-items: center;">
          ${question.content
            .slice(2, 2 + flowItemCount)
            .map((item, idx) => {
              // Replace ___ with the correct answer and highlight it
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
        <p><strong>Options:</strong> ${question.content.slice(2 + flowItemCount).join(", ")}</p>
      `
    default:
      return `<p>Unknown question type: ${question.type}</p>`
  }
}

// Export test to JSON file
function exportTest() {
  const testData = JSON.stringify(test, null, 2)
  const blob = new Blob([testData], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "ielts_listening_test.json"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Import test from JSON file
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
        test = importedTest
        renderImportedTest()
      } catch (error) {
        console.error("Error parsing imported test:", error)
        alert("Error importing test. Please make sure the file is a valid JSON.")
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

// Render imported test
function renderImportedTest() {
  document.getElementById("selectionPage").classList.add("hidden")
  document.getElementById("testCreationPage").classList.remove("hidden")
  totalQuestions = 0

  for (let i = 1; i <= 4; i++) {
    const part = document.getElementById(`part${i}`)
    part.innerHTML = ""
    test[`part${i}`].forEach((question) => {
      const questionDiv = document.createElement("div")
      questionDiv.className = "question"
      questionDiv.innerHTML = `
                <h4><i class="fas fa-question-circle"></i> Question ${totalQuestions + 1}</h4>
                <h3>${question.type}</h3>
                <button class="delete-question" onclick="deleteQuestion(this)"><i class="fas fa-trash"></i></button>
                ${renderImportedQuestion(question)}
            `
      part.appendChild(questionDiv)
      totalQuestions++
    })
  }

  updateQuestionCount()
  currentPart = 1
  renderTestCreation()
}

// Render imported question
function renderImportedQuestion(question) {
  switch (question.type) {
    case "One answer":
      return renderImportedOneAnswer(question)
    case "More than one answer":
      return renderImportedMultipleAnswer(question)
    case "Matching":
      return renderImportedMatching(question)
    case "Plan/Map/Diagram labelling":
      return renderImportedPlanMapDiagram(question)
    case "Note Completion":
      return renderImportedNoteCompletion(question)
    case "Form/Table Completion":
      return renderImportedFormTableCompletion(question)
    case "Flow chart Completion":
      return renderImportedFlowChartCompletion(question)
    default:
      return "<p>Unsupported question type</p>"
  }
}

// Render imported One Answer question
function renderImportedOneAnswer(question) {
  return `
      <div class="t3-question-creator">
          <form class="t3-one-answer-form">
              <div class="t3-form-group">
                  <label for="t3-questionText">Question Text:</label>
                  <input type="text" id="t3-questionText" name="questionText" value="${question.content[0]}" required>
              </div>
              <div class="t3-form-group">
                  <label for="t3-options">Options (one per line):</label>
                  <textarea id="t3-options" name="options" rows="4" required>${question.content.slice(1).join("\n")}</textarea>
              </div>
              <div class="t3-form-group">
                  <label for="t3-correctAnswer">Correct Answer:</label>
                  <input type="text" id="t3-correctAnswer" name="correctAnswer" value="${question.correctAnswers}" required>
              </div>
          </form>
      </div>
  `
}

// Render imported Multiple Answer question
function renderImportedMultipleAnswer(question) {
  return `
      <div class="t4-container">
          <form id="t4-questionForm">
              <div class="t4-form-group">
                  <label for="t4-questionText">Question Text:</label>
                  <input type="text" id="t4-questionText" name="questionText" value="${question.content[0]}" required>
              </div>
              <div class="t4-form-group">
                  <label for="t4-options">Options (one per line):</label>
                  <textarea id="t4-options" name="options" rows="4" required>${question.content.slice(1).join("\n")}</textarea>
              </div>
              <div class="t4-form-group">
                  <label for="t4-correctAnswers">Correct Answers (comma-separated numbers):</label>
                  <input type="text" id="t4-correctAnswers" name="correctAnswers" value="${question.correctAnswers.join(", ")}" required>
              </div>
          </form>
      </div>
  `
}

// Render imported Matching question
function renderImportedMatching(question) {
  return `
      <div class="t3-question-creator">
          <form id="t3-questionForm">
              <div class="t3-form-group">
                  <label for="t3-questionTitle">Question Title:</label>
                  <input type="text" id="t3-questionTitle" name="questionTitle" value="${question.content[0]}" required>
              </div>
              <div class="t3-form-group">
                  <label for="t3-people">People (one per line):</label>
                  <textarea id="t3-people" name="people" required>${question.content[1]}</textarea>
              </div>
              <div class="t3-form-group">
                  <label for="t3-responsibilities">Responsibilities (one per line):</label>
                  <textarea id="t3-responsibilities" name="responsibilities" required>${question.content[2]}</textarea>
              </div>
              <div class="t3-form-group">
                  <label for="t3-correctAnswers">Correct Answers (one per line, in order of people):</label>
                  <textarea id="t3-correctAnswers" name="correctAnswers" required>${question.correctAnswers.join("\n")}</textarea>
              </div>
          </form>
      </div>
  `
}

// Render imported Plan/Map/Diagram question
function renderImportedPlanMapDiagram(question) {
  return `
      <div class="t1-ielts-creator">
          <form id="questionForm">
              <div class="t1-form-group">
                  <label for="questionType">Question Type:</label>
                  <select id="questionType" required>
                      <option value="map" ${question.content[0] === "map" ? "selected" : ""}>Map Labelling</option>
                      <option value="ship" ${question.content[0] === "ship" ? "selected" : ""}>Ship Diagram</option>
                      <option value="technical" ${question.content[0] === "technical" ? "selected" : ""}>Technical Diagram</option>
                  </select>
              </div>
              <div class="t1-form-group">
                  <label for="instructions">Instructions:</label>
                  <textarea id="instructions" rows="3" required>${question.content[1]}</textarea>
              </div>
              <div class="t1-form-group">
                  <label for="imageFile">Uploaded Image:</label>
                  <img src="${question.content[2]}" alt="Uploaded image" style="max-width: 200px;">
              </div>
              <div id="answerInputs">
                  ${question.content
                    .slice(3)
                    .map(
                      (answer, index) => `
                      <div class="t1-form-group">
                          <label for="answer${index}">Answer ${index + 1}:</label>
                          <input type="text" id="answer${index}" value="${answer}" required>
                          <label for="correctAnswer${index}">Correct answer for question ${index + 1}:</label>
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

// Render imported Note Completion question
function renderImportedNoteCompletion(question) {
  return `
      <div class="t2-listening-exercise-app">
          <div class="t2-listening-exercise-container">
              <div class="t2-listening-exercise-form-container">
                  <form id="t2ListeningExerciseForm">
                      <div class="t2-listening-exercise-form-group">
                          <label for="t2ListeningExerciseInstructions">Instructions:</label>
                          <input type="text" id="t2ListeningExerciseInstructions" name="instructions" value="${question.content[0]}">
                      </div>
                      <div class="t2-listening-exercise-form-group">
                          <label for="t2ListeningExerciseTopic">Topic:</label>
                          <input type="text" id="t2ListeningExerciseTopic" name="topic" value="${question.content[1]}">
                      </div>
                      <div id="t2ListeningExerciseQuestionContainer">
                          ${question.content
                            .slice(2)
                            .map(
                              (q, index) => `
                              <div class="t2-listening-exercise-form-group">
                                  <label for="t2ListeningExerciseQuestion${index + 1}">Question ${index + 1}:</label>
                                  <div class="t2-listening-exercise-answer-fields">
                                      <textarea id="t2ListeningExerciseQuestion${index + 1}" name="question${index + 1}">${q}</textarea>
                                  </div>
                                  <div class="t2-listening-exercise-correct-answers" id="t2ListeningExerciseCorrectAnswers${index + 1}">
                                      <span class="t2-listening-exercise-correct-answer-label">Correct Answer:</span>
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

// Render imported Form/Table Completion question
function renderImportedFormTableCompletion(question) {
  return `
      <div class="t6-ielts-listening-creator">
          <div id="tableSection" class="t6-question-container">
              <textarea id="tableInstruction" rows="2">${question.content[0]}</textarea>
              <table id="fareTable">
                  <tr>
                      <th>Transport</th>
                      <th>Cash Fare</th>
                      <th>Card Fare</th>
                      <th>Correct Answer</th>
                      <th>Actions</th>
                  </tr>
                  ${question.content
                    .slice(1)
                    .map(
                      (row, index) => `
                      <tr>
                          <td><input type="text" value="${row[0]}"></td>
                          <td><input type="text" value="${row[1]}"></td>
                          <td><input type="text" value="${row[2]}"></td>
                          <td><input type="text" class="t6-correct-answer-input" value="${question.correctAnswers[index]}"></td>
                          <td><button class="t6-delete-btn">Delete</button></td>
                      </tr>
                  `,
                    )
                    .join("")}
              </table>
          </div>
      </div>
  `
}

// Render imported Flow Chart Completion question
function renderImportedFlowChartCompletion(question) {
  return `
      <div class="t7-ielts-flow-chart-creator">
          <form id="teacherForm">
              <label for="title">Title:</label>
              <input type="text" id="title" name="title" value="${question.content[0]}" required>

              <label for="instructions">Instructions:</label>
              <textarea id="instructions" name="instructions" required>${question.content[1]}</textarea>

              <div id="questionForms">
                  <div class="t7-question-form">
                      <h3>Question 1</h3>
                      <label for="flowItems1">Flow Chart Items (one per line, use ___ for gaps):</label>
                      <textarea id="flowItems1" name="flowItems1" required>${question.content[2]}</textarea>
                      <label for="options1">Options (one per line):</label>
                      <textarea id="options1" name="options1" required>${question.content[3]}</textarea>
                      <label for="correctAnswers1">Correct Answers (comma-separated):</label>
                      <input type="text" id="correctAnswers1" name="correctAnswers1" value="${question.correctAnswers.join(", ")}" required>
                  </div>
              </div>
          </form>
      </div>
  `
}

// Setup delete buttons for table rows
function setupDeleteButtons(container) {
  const deleteButtons = container.querySelectorAll(".t6-delete-btn")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      this.closest("tr").remove()
    })
  })
}

// Update correct answer fields for Note Completion questions
function updateT2ListeningExerciseCorrectAnswerFields(questionNumber) {
  const questionText = document.getElementById(`t2ListeningExerciseQuestion${questionNumber}`).value
  const correctAnswersContainer = document.getElementById(`t2ListeningExerciseCorrectAnswers${questionNumber}`)
  const answerCount = (questionText.match(/\[ANSWER\]/g) || []).length

  correctAnswersContainer.innerHTML = `
        <span class="t2-listening-exercise-correct-answer-label">Correct Answers:</span>
    `

  for (let i = 0; i < answerCount; i++) {
    correctAnswersContainer.innerHTML += `
            <input type="text" class="t2-listening-exercise-correct-answer-input" placeholder="Answer ${i + 1}">
        `
  }
}

// Initialize Matching form
function initializeMatchingForm(container) {
  const form = container.querySelector("#t3-questionForm")
  const questionsContainer = container.querySelector("#t3-questionsContainer")
  const numberOfQuestionsInput = container.querySelector("#t3-numberOfQuestions")
  const saveButton = container.querySelector("#t3-saveButton")
  const questionsPreview = container.querySelector("#t3-questionsPreview")

  // Initialize with one question field
  questionsContainer.innerHTML = createQuestionFields(0)

  // Update question fields when number of questions changes
  numberOfQuestionsInput.addEventListener("change", () => {
    const count = Number.parseInt(numberOfQuestionsInput.value)
    let fieldsHTML = ""
    for (let i = 0; i < count; i++) {
      fieldsHTML += createQuestionFields(i)
    }
    questionsContainer.innerHTML = fieldsHTML
  })

  // Save questions
  saveButton.addEventListener("click", () => {
    saveMatchingQuestions(container)
  })

  // Update preview
  form.addEventListener("input", () => {
    updateMatchingPreview(container)
  })
}

// Initialize Note Completion form
function initializeNoteCompletionForm(container) {
  const questionCountInput = container.querySelector("#t2ListeningExerciseQuestionCount")
  const questionContainer = container.querySelector("#t2ListeningExerciseQuestionContainer")

  // Function to update question fields
  function updateQuestionFields() {
    const questionCount = Number.parseInt(questionCountInput.value, 10)
    let questionFieldsHTML = ""

    for (let i = 1; i <= questionCount; i++) {
      questionFieldsHTML += `
        <div class="t2-listening-exercise-form-group">
          <label for="t2ListeningExerciseQuestion${i}">Question ${i}:</label>
          <div class="t2-listening-exercise-answer-fields">
            <textarea id="t2ListeningExerciseQuestion${i}" name="question${i}" oninput="updateT2ListeningExerciseCorrectAnswerFields(${i})"></textarea>
          </div>
          <div class="t2-listening-exercise-correct-answers" id="t2ListeningExerciseCorrectAnswers${i}">
            <span class="t2-listening-exercise-correct-answer-label">Correct Answers:</span>
            <input type="text" class="t2-listening-exercise-correct-answer-input" placeholder="Answer 1">
          </div>
        </div>
      `
    }

    questionContainer.innerHTML = questionFieldsHTML
  }

  // Initial call to create question fields
  updateQuestionFields()

  // Event listener for question count change
  questionCountInput.addEventListener("change", updateQuestionFields)
}

// Setup audio handlers
function setupAudioHandlers() {
  // Add audio upload functionality if needed
  const audioUploadBtn = document.createElement("button")
  audioUploadBtn.id = "audioUploadBtn"
  audioUploadBtn.className = "action-button"
  audioUploadBtn.innerHTML = '<i class="fas fa-music"></i> Upload Audio'
  audioUploadBtn.addEventListener("click", () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "audio/*"
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        audioFile = file
        const audioPlayer = document.getElementById("audioPlayer") || document.createElement("audio")
        audioPlayer.id = "audioPlayer"
        audioPlayer.controls = true
        audioPlayer.src = URL.createObjectURL(file)

        // Add to the page if it doesn't exist
        if (!document.getElementById("audioPlayer")) {
          const audioContainer = document.createElement("div")
          audioContainer.id = "audioContainer"
          audioContainer.className = "audio-container"
          audioContainer.innerHTML = `<h3>Test Audio</h3>`
          audioContainer.appendChild(audioPlayer)

          const testContent = document.getElementById("testContent")
          if (testContent) {
            testContent.insertBefore(audioContainer, testContent.firstChild)
          }
        }

        // Get audio duration when metadata is loaded
        audioPlayer.onloadedmetadata = () => {
          audioDuration = audioPlayer.duration
          const durationDisplay = document.createElement("div")
          durationDisplay.textContent = `Duration: ${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60)
            .toString()
            .padStart(2, "0")}`
          audioContainer.appendChild(durationDisplay)
        }

        showNotification("Audio file uploaded successfully", "success")
      }
    }
    input.click()
  })

  // Add to the page
  const testCreationPage = document.getElementById("testCreationPage")
  if (testCreationPage) {
    testCreationPage.appendChild(audioUploadBtn)
  }
}

// Validate Plan/Map/Diagram question
function validatePlanMapDiagramQuestion(questionElement) {
  if (!questionElement) {
    console.warn("Question element is null")
    return false
  }

  // Get the selected question type
  const questionType = questionElement.querySelector("#questionType")?.value
  const instructions = questionElement.querySelector("#instructions")?.value?.trim()
  const imageElement = questionElement.querySelector("img")
  const imageFile = questionElement.querySelector("#imageFile")?.files[0]
  const imageDataUrl = imageElement?.src

  // Log validation state
  console.log("Validating Plan/Map/Diagram question:", {
    questionType,
    hasInstructions: !!instructions,
    hasImage: !!(imageElement || imageFile),
    hasImageData: !!imageDataUrl,
  })

  // Check basic required fields
  if (!questionType) {
    showNotification("Please select a question type", "error")
    return false
  }

  if (!instructions) {
    showNotification("Please enter instructions", "error")
    return false
  }

  // Check for image
  if (!imageDataUrl && !imageFile) {
    showNotification("Please upload an image", "error")
    return false
  }

  // Get number of questions
  const numQuestions = Number.parseInt(questionElement.querySelector("#numQuestions")?.value || "0", 10)
  if (numQuestions <= 0) {
    showNotification("Please enter a valid number of questions", "error")
    return false
  }

  // Validate answers based on selected type
  let hasValidAnswers = true
  for (let i = 0; i < numQuestions; i++) {
    const answer = questionElement.querySelector(`#answer${i}`)?.value?.trim()
    if (!answer) {
      showNotification(`Please enter an answer for question ${i + 1}`, "error")
      hasValidAnswers = false
      break
    }

    if (questionType === "map") {
      const radioButtons = questionElement.querySelectorAll(`input[name="correctAnswer${i}"]`)
      const selectedRadio = Array.from(radioButtons).find((radio) => radio.checked)

      if (!selectedRadio) {
        showNotification(`Please select a correct answer for question ${i + 1}`, "error")
        hasValidAnswers = false
        break
      }

      // Validate that the selected answer is valid (A-H)
      const validAnswers = ["A", "B", "C", "D", "E", "F", "G", "H"]
      if (!validAnswers.includes(selectedRadio.value)) {
        showNotification(`Invalid answer for question ${i + 1}`, "error")
        hasValidAnswers = false
        break
      }
    } else {
      const correctAnswer = questionElement.querySelector(`#correctAnswer${i}`)?.value?.trim()
      if (!correctAnswer) {
        showNotification(`Please enter a correct answer for question ${i + 1}`, "error")
        hasValidAnswers = false
        break
      }
    }
  }

  return hasValidAnswers
}

// Validate answer count
function validateAnswerCount(questionElement, numQuestions) {
  const answers = Array.from(questionElement.querySelectorAll('[id^="answer"]'))
    .map((el) => el.value?.trim())
    .filter(Boolean)

  const correctAnswers = Array.from(questionElement.querySelectorAll('[name^="correctAnswer"]:checked'))
    .map((el) => el.value)
    .filter(Boolean)

  if (answers.length !== numQuestions) {
    showNotification(
      `Number of answers (${answers.length}) does not match number of questions (${numQuestions})`,
      "error",
    )
    return false
  }

  if (correctAnswers.length !== numQuestions) {
    showNotification(
      `Number of correct answers (${correctAnswers.length}) does not match number of questions (${numQuestions})`,
      "error",
    )
    return false
  }

  return true
}

// Show notification
function showNotification(message, type = "info") {
  let notification = document.getElementById("notification")

  // Create notification element if it doesn't exist
  if (!notification) {
    notification = document.createElement("div")
    notification.id = "notification"
    document.body.appendChild(notification)
  }

  // Set message content and style
  notification.textContent = message
  notification.className = `notification notification-${type}`
  notification.style.display = "block"

  // Add styles
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    zIndex: "9999",
    maxWidth: "300px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  })

  if (type === "error") {
    Object.assign(notification.style, {
      backgroundColor: "#fee2e2",
      color: "#dc2626",
      border: "1px solid #dc2626",
    })
  } else if (type === "success") {
    Object.assign(notification.style, {
      backgroundColor: "#dcfce7",
      color: "#16a34a",
      border: "1px solid #16a34a",
    })
  }

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (notification) {
      notification.style.display = "none"
    }
  }, 5000)
}

// Show login form
function showLoginForm() {
  const loginModal = document.createElement("div")
  loginModal.className = "login-modal"
  loginModal.innerHTML = `
    <div class="login-content">
      <h2>Login</h2>
      <form id="loginForm">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" required>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="#" id="showRegisterForm">Register</a></p>
      <div id="loginMessage" class="message"></div>
    </div>
  `

  document.body.appendChild(loginModal)

  // Handle login form submission
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault()
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    login(username, password)
      .then(() => {
        document.body.removeChild(loginModal)
        showNotification("Login successful", "success")
      })
      .catch((error) => {
        document.getElementById("loginMessage").textContent = error.message
        document.getElementById("loginMessage").className = "message error"
      })
  })

  // Handle switch to register form
  document.getElementById("showRegisterForm").addEventListener("click", (e) => {
    e.preventDefault()
    document.body.removeChild(loginModal)
    showRegisterForm()
  })
}

// Show register form
function showRegisterForm() {
  const registerModal = document.createElement("div")
  registerModal.className = "register-modal"
  registerModal.innerHTML = `
    <div class="register-content">
      <h2>Register</h2>
      <form id="registerForm">
        <div class="form-group">
          <label for="regUsername">Username:</label>
          <input type="text" id="regUsername" required>
        </div>
        <div class="form-group">
          <label for="regPassword">Password:</label>
          <input type="password" id="regPassword" required>
        </div>
        <div class="form-group">
          <label for="regConfirmPassword">Confirm Password:</label>
          <input type="password" id="regConfirmPassword" required>
        </div>
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="#" id="showLoginForm">Login</a></p>
      <div id="registerMessage" class="message"></div>
    </div>
  `

  document.body.appendChild(registerModal)

  // Handle register form submission
  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault()
    const username = document.getElementById("regUsername").value
    const password = document.getElementById("regPassword").value
    const confirmPassword = document.getElementById("regConfirmPassword").value

    if (password !== confirmPassword) {
      document.getElementById("registerMessage").textContent = "Passwords do not match"
      document.getElementById("registerMessage").className = "message error"
      return
    }

    register(username, password, "teacher")
      .then(() => {
        document.body.removeChild(registerModal)
        showNotification("Registration successful", "success")
      })
      .catch((error) => {
        document.getElementById("registerMessage").textContent = error.message
        document.getElementById("registerMessage").className = "message error"
      })
  })

  // Handle switch to login form
  document.getElementById("showLoginForm").addEventListener("click", (e) => {
    e.preventDefault()
    document.body.removeChild(registerModal)
    showLoginForm()
  })
}

// Show test list
function showTestList() {
  getTests()
    .then((tests) => {
      if (!tests || tests.length === 0) {
        showNotification("No tests found", "info")
        return
      }

      // Create modal to display the list
      const modal = document.createElement("div")
      modal.className = "test-list-modal"
      modal.innerHTML = `
        <div class="test-list-content">
          <span class="close-button">&times;</span>
          <h2>Test List</h2>
          <div class="test-list">
            ${tests
              .map(
                (test) => `
              <div class="test-item" data-id="${test.id}">
                <h3>${test.title}</h3>
                <p>${test.description || "No description"}</p>
                <div class="test-actions">
                  <button class="load-test-btn">Load</button>
                  <button class="delete-test-btn">Delete</button>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `

      document.body.appendChild(modal)

      // Handle close button
      const closeButton = modal.querySelector(".close-button")
      closeButton.addEventListener("click", () => {
        document.body.removeChild(modal)
      })

      // Handle load test button
      const loadButtons = modal.querySelectorAll(".load-test-btn")
      loadButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const testId = button.closest(".test-item").dataset.id
          loadTestFromServer(testId)
          document.body.removeChild(modal)
        })
      })

      // Handle delete test button
      const deleteButtons = modal.querySelectorAll(".delete-test-btn")
      deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const testItem = button.closest(".test-item")
          const testId = testItem.dataset.id
          const testTitle = testItem.querySelector("h3").textContent

          if (confirm(`Are you sure you want to delete test "${testTitle}"?`)) {
            deleteTest(testId)
              .then(() => {
                testItem.remove()
                showNotification(`Deleted test "${testTitle}"`, "success")

                // If no tests left, close modal
                if (modal.querySelectorAll(".test-item").length === 0) {
                  document.body.removeChild(modal)
                  showNotification("No tests left", "info")
                }
              })
              .catch((error) => {
                console.error("Error deleting test:", error)
                showNotification(`Error deleting test: ${error.message}`, "error")
              })
          }
        })
      })
    })
    .catch((error) => {
      console.error("Error getting test list:", error)
      showNotification(`Error getting test list: ${error.message}`, "error")
    })
}

// Load test from server
function loadTestFromServer(testId) {
  getTestById(testId)
    .then((testData) => {
      if (!testData) {
        showNotification("Could not load test", "error")
        return
      }

      // Update test object with data from server
      test.title = testData.title
      test.description = testData.description

      // Initialize parts
      for (let i = 1; i <= 4; i++) {
        test[`part${i}`] = []
      }

      // Add questions to corresponding parts
      if (testData.parts && testData.parts.length > 0) {
        testData.parts.forEach((part) => {
          const partNumber = part.part_number
          if (partNumber >= 1 && partNumber <= 4) {
            part.questions.forEach((question) => {
              // Convert data from JSON format if needed
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

      // Update total questions
      totalQuestions = 0
      for (let i = 1; i <= 4; i++) {
        totalQuestions += test[`part${i}`].length
      }

      // Display loaded test
      showNotification(`Loaded test "${test.title}"`, "success")
      renderTestCreation()
    })
    .catch((error) => {
      console.error("Error loading test:", error)
      showNotification(`Error loading test: ${error.message}`, "error")
    })
}

// Add CSS styles
const styles = `
.test-metadata-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.test-metadata-form .form-group {
  margin-bottom: 15px;
}

.test-metadata-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.test-metadata-form input[type="text"],
.test-metadata-form textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.test-metadata-form input[type="text"]:focus,
.test-metadata-form textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.login-modal, .register-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.login-content, .register-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}

.message.error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #dc2626;
}

.message.success {
  background-color: #dcfce7;
  color: #16a34a;
  border: 1px solid #16a34a;
}

.test-list-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.test-list-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.close-button {
  float: right;
  font-size: 24px;
  cursor: pointer;
}

.test-item {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.test-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.test-actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.load-test-btn {
  background-color: #3b82f6;
  color: white;
}

.delete-test-btn {
  background-color: #ef4444;
  color: white;
}

.action-button {
  margin: 5px;
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button:hover {
  background-color: #3a7bc8;
}

.question-type-selector {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.question {
  position: relative;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.delete-question {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

.audio-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}
`

// Add styles to document
const styleElement = document.createElement("style")
styleElement.textContent = styles
document.head.appendChild(styleElement)
