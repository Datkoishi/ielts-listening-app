document.addEventListener("DOMContentLoaded", () => {
  fetchTests()
})

async function fetchTests() {
  try {
    const response = await fetch("/api/tests/public")

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const tests = await response.json()
    displayTests(tests)
  } catch (error) {
    console.error("Lỗi: Error:", error)
    displayError("Không thể lấy danh sách bài thi")
  }
}

function displayTests(tests) {
  const testListContainer = document.getElementById("test-list")
  testListContainer.innerHTML = ""

  if (tests.length === 0) {
    testListContainer.innerHTML = `
            <div class="alert alert-info">
                Không có bài thi nào. Vui lòng quay lại sau.
            </div>
        `
    return
  }

  const testList = document.createElement("div")
  testList.className = "list-group"

  tests.forEach((test) => {
    const testItem = document.createElement("a")
    testItem.href = `test.html?id=${test.id}`
    testItem.className = "list-group-item list-group-item-action"

    const createdDate = new Date(test.created_at).toLocaleDateString("vi-VN")

    testItem.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">${test.title}</h5>
                <small>${createdDate}</small>
            </div>
            <p class="mb-1">${test.description || "Không có mô tả"}</p>
            <small>Thời gian: ${test.duration || 40} phút</small>
        `

    testList.appendChild(testItem)
  })

  testListContainer.appendChild(testList)
}

function displayError(message) {
  const testListContainer = document.getElementById("test-list")
  testListContainer.innerHTML = `
        <div class="alert alert-danger">
            <h4 class="alert-heading">Lỗi!</h4>
            <p>${message}. Vui lòng thử lại sau.</p>
            <hr>
            <p class="mb-0">Chi tiết lỗi: ${message}</p>
        </div>
    `
}
