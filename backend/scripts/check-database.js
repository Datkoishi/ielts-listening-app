const { pool } = require("../config/database")

async function checkDatabase() {
  try {
    console.log("Kiểm tra kết nối database...")

    // Kiểm tra kết nối
    const connection = await pool.getConnection()
    console.log("Kết nối thành công!")
    connection.release()

    // Kiểm tra bảng tests
    console.log("\n--- KIỂM TRA BẢNG TESTS ---")
    const [tests] = await pool.execute("SELECT * FROM tests")
    console.log(`Số lượng bài thi: ${tests.length}`)

    if (tests.length > 0) {
      console.log("\nDanh sách bài thi:")
      tests.forEach((test, index) => {
        console.log(`${index + 1}. ID: ${test.id}, Tên: ${test.title}, Ngày tạo: ${test.created_at}`)
      })

      // Kiểm tra chi tiết bài thi đầu tiên
      const testId = tests[0].id
      console.log(`\nKiểm tra chi tiết bài thi ID: ${testId}`)

      // Kiểm tra sections
      const [sections] = await pool.execute("SELECT * FROM sections WHERE test_id = ?", [testId])
      console.log(`\nSố lượng phần: ${sections.length}`)

      if (sections.length > 0) {
        console.log("\nDanh sách phần:")
        sections.forEach((section, index) => {
          console.log(`${index + 1}. ID: ${section.id}, Tên: ${section.title}`)
        })

        // Kiểm tra questions của section đầu tiên
        const sectionId = sections[0].id
        console.log(`\nKiểm tra câu hỏi của phần ID: ${sectionId}`)

        const [questions] = await pool.execute("SELECT * FROM questions WHERE section_id = ?", [sectionId])
        console.log(`\nSố lượng câu hỏi: ${questions.length}`)

        if (questions.length > 0) {
          console.log("\nDanh sách câu hỏi:")
          questions.forEach((question, index) => {
            console.log(`${index + 1}. ID: ${question.id}, Loại: ${question.type}`)

            // Kiểm tra dữ liệu JSON
            try {
              const data = JSON.parse(question.data)
              console.log(`   - Dữ liệu hợp lệ: ${typeof data === "object" ? "Có" : "Không"}`)

              // Kiểm tra chi tiết theo loại câu hỏi
              switch (question.type) {
                case "single_choice":
                  console.log(`   - Nội dung: ${data.question}`)
                  console.log(`   - Số lựa chọn: ${data.options ? data.options.length : "N/A"}`)
                  console.log(`   - Đáp án: ${data.answer}`)
                  break
                case "multiple_choice":
                  console.log(`   - Nội dung: ${data.question}`)
                  console.log(`   - Số lựa chọn: ${data.options ? data.options.length : "N/A"}`)
                  console.log(`   - Đáp án: ${JSON.stringify(data.answers)}`)
                  break
                case "matching":
                  console.log(`   - Tiêu đề: ${data.title}`)
                  console.log(`   - Số câu hỏi: ${data.questions ? data.questions.length : "N/A"}`)
                  console.log(`   - Số từ khóa: ${data.options ? data.options.length : "N/A"}`)
                  break
                case "plan_map_diagram":
                  console.log(`   - Loại: ${data.type}`)
                  console.log(`   - Hướng dẫn: ${data.instructions}`)
                  console.log(`   - Hình ảnh: ${data.imageUrl ? "Có" : "Không"}`)
                  console.log(`   - Số nhãn: ${data.labels ? data.labels.length : "N/A"}`)
                  break
                case "note_completion":
                  console.log(`   - Hướng dẫn: ${data.instructions}`)
                  console.log(`   - Chủ đề: ${data.topic}`)
                  console.log(`   - Số ghi chú: ${data.notes ? data.notes.length : "N/A"}`)
                  break
                case "form_completion":
                  console.log(`   - Hướng dẫn: ${data.instructions}`)
                  console.log(`   - Số hàng: ${data.rows ? data.rows.length : "N/A"}`)
                  break
                case "flow_chart":
                  console.log(`   - Tiêu đề: ${data.title}`)
                  console.log(`   - Hướng dẫn: ${data.instructions}`)
                  console.log(`   - Số mục: ${data.items ? data.items.length : "N/A"}`)
                  break
                default:
                  console.log(`   - Loại không xác định: ${question.type}`)
              }
            } catch (err) {
              console.log(`   - Lỗi phân tích dữ liệu JSON: ${err.message}`)
              console.log(`   - Dữ liệu gốc: ${question.data}`)
            }
          })
        } else {
          console.log("Không có câu hỏi nào trong phần này.")
        }
      } else {
        console.log("Không có phần nào trong bài thi này.")
      }
    } else {
      console.log("Không có bài thi nào trong database.")
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra database:", error)
  } finally {
    // Đóng kết nối pool
    await pool.end()
  }
}

// Chạy hàm kiểm tra
checkDatabase()
