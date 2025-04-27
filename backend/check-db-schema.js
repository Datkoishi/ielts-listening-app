import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

async function checkAndFixDatabaseSchema() {
  console.log("Checking database schema...")

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    console.log("Connected to database successfully")

    // Check if tables exist
    const [tables] = await connection.query("SHOW TABLES")
    const tableNames = tables.map((t) => Object.values(t)[0])
    console.log("Existing tables:", tableNames)

    // Define required tables
    const requiredTables = {
      tests: `
        CREATE TABLE tests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          vietnamese_name VARCHAR(255),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `,
      parts: `
        CREATE TABLE parts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          test_id INT NOT NULL,
          part_number INT NOT NULL,
          audio_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
        )
      `,
      questions: `
        CREATE TABLE questions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          part_id INT NOT NULL,
          question_type VARCHAR(100) NOT NULL,
          content TEXT NOT NULL,
          correct_answers TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
        )
      `,
      audio_files: `
        CREATE TABLE audio_files (
          id INT AUTO_INCREMENT PRIMARY KEY,
          test_id INT NOT NULL,
          part_number INT NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(255) NOT NULL,
          file_size INT,
          duration FLOAT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
        )
      `,
      student_answers: `
        CREATE TABLE student_answers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          test_id INT NOT NULL,
          question_id INT NOT NULL,
          answer TEXT NOT NULL,
          is_correct BOOLEAN NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
        )
      `,
    }

    // Create missing tables
    for (const [tableName, createSQL] of Object.entries(requiredTables)) {
      if (!tableNames.includes(tableName)) {
        console.log(`Creating missing table: ${tableName}`)
        await connection.query(createSQL)
        console.log(`Table ${tableName} created successfully`)
      } else {
        console.log(`Table ${tableName} already exists`)

        // Check table structure
        const [columns] = await connection.query(`DESCRIBE ${tableName}`)
        console.log(
          `Table ${tableName} structure:`,
          columns.map((c) => c.Field),
        )

        // Check for missing columns
        if (tableName === "tests" && !columns.some((c) => c.Field === "vietnamese_name")) {
          console.log("Adding missing column 'vietnamese_name' to tests table")
          await connection.query("ALTER TABLE tests ADD COLUMN vietnamese_name VARCHAR(255) AFTER title")
        }
      }
    }

    // Check for test data
    const [testCount] = await connection.query("SELECT COUNT(*) as count FROM tests")
    console.log(`Database contains ${testCount[0].count} tests`)

    if (testCount[0].count > 0) {
      const [sampleTest] = await connection.query("SELECT * FROM tests LIMIT 1")
      console.log("Sample test:", sampleTest[0])

      // Check related data
      const [partCount] = await connection.query("SELECT COUNT(*) as count FROM parts WHERE test_id = ?", [
        sampleTest[0].id,
      ])
      console.log(`Sample test has ${partCount[0].count} parts`)

      if (partCount[0].count > 0) {
        const [samplePart] = await connection.query("SELECT * FROM parts WHERE test_id = ? LIMIT 1", [sampleTest[0].id])
        console.log("Sample part:", samplePart[0])

        const [questionCount] = await connection.query("SELECT COUNT(*) as count FROM questions WHERE part_id = ?", [
          samplePart[0].id,
        ])
        console.log(`Sample part has ${questionCount[0].count} questions`)

        if (questionCount[0].count > 0) {
          const [sampleQuestion] = await connection.query("SELECT * FROM questions WHERE part_id = ? LIMIT 1", [
            samplePart[0].id,
          ])
          console.log("Sample question:", sampleQuestion[0])

          // Check content and correct_answers format
          try {
            const content = JSON.parse(sampleQuestion[0].content)
            const correctAnswers = JSON.parse(sampleQuestion[0].correct_answers)
            console.log("Content parsed successfully:", typeof content)
            console.log("Correct answers parsed successfully:", typeof correctAnswers)
          } catch (e) {
            console.error("Error parsing JSON data in question:", e)
          }
        }
      }
    }

    console.log("Database schema check completed")
    await connection.end()
  } catch (error) {
    console.error("Error checking database schema:", error)
  }
}

checkAndFixDatabaseSchema()
