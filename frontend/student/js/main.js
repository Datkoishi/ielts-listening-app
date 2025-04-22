document.addEventListener("DOMContentLoaded", () => {
  fetchTests()
})

async function fetchTests() {
  try {
    const response = await fetch("http://localhost:3000/api/tests/public")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const tests = await response.json()
    displayTests(tests)
  } catch (error) {
    console.error("Lỗi:", error)
    displayError("Không thể lấy danh sách bài thi", error.message)
  }
}

function displayTests(tests) {
  const testListContainer = document.getElementById("test-list")

  if (!tests || tests.length === 0) {
    testListContainer.innerHTML = `
      <div class="alert alert-info">
        Không có bài kiểm tra nào.
      </div>
    `
    return
  }

  const testItems = tests
    .map(
      (test) => `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">${test.title}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${test.vietnamese_name || ""}</h6>
        <p class="card-text">${test.description || "Không có mô tả"}</p>
        <a href="test.html?id=${test.id}" class="btn btn-primary">Làm bài</a>
      </div>
    </div>
  `,
    )
    .join("")

  testListContainer.innerHTML = testItems
}

function displayError(title, details) {
  const testListContainer = document.getElementById("test-list")

  testListContainer.innerHTML = `
    <div class="alert alert-danger">
      <h4 class="alert-heading">${title}!</h4>
      <p>Vui lòng thử lại sau.</p>
      <hr>
      <p class="mb-0">Chi tiết lỗi: ${details}</p>
    </div>
  `
}
