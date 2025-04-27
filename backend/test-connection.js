import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

async function testDatabaseConnection() {
  console.log("Testing database connection...")
  console.log("Database configuration:")
  console.log("Host:", process.env.DB_HOST)
  console.log("Database:", process.env.DB_NAME)
  console.log("User:", process.env.DB_USER)

  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    // Test the connection
    const connection = await pool.getConnection()
    console.log("✅ Successfully connected to MySQL database!")

    // Check if tables exist
    const [tables] = await connection.query("SHOW TABLES")
    console.log(
      "Tables in database:",
      tables.map((t) => Object.values(t)[0]),
    )

    // Check tests table structure
    if (tables.some((t) => Object.values(t)[0] === "tests")) {
      const [columns] = await connection.query("DESCRIBE tests")
      console.log("Tests table structure:", columns)

      // Check if there are any tests in the database
      const [tests] = await connection.query("SELECT * FROM tests LIMIT 5")
      console.log(`Found ${tests.length} tests in database`)
      if (tests.length > 0) {
        console.log("Sample test:", tests[0])
      }
    } else {
      console.log("⚠️ Tests table does not exist!")
    }

    connection.release()
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("This is likely due to incorrect username or password")
    } else if (error.code === "ECONNREFUSED") {
      console.error("Could not connect to database server. Make sure it's running and accessible")
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("Database does not exist. You may need to create it first")
    }
    return false
  }
}

async function testApiEndpoint() {
  console.log("\nTesting API endpoint...")

  const testData = {
    title: "Test API Connection",
    vietnameseName: "Kiểm tra kết nối API",
    description: "This is a test to verify the API connection",
    part1: [
      {
        type: "Một đáp án",
        content: ["Test question", "Option A", "Option B", "Option C"],
        correctAnswers: "Option A",
      },
    ],
    part2: [],
    part3: [],
    part4: [],
  }

  try {
    // Normalize the test data
    const normalizedData = {
      title: testData.title,
      description: testData.description,
      vietnamese_name: testData.vietnameseName,
      parts: [],
    }

    // Convert parts to the format expected by the backend
    for (let i = 1; i <= 4; i++) {
      if (testData[`part${i}`] && testData[`part${i}`].length > 0) {
        normalizedData.parts.push({
          part_number: i,
          questions: testData[`part${i}`].map((question) => ({
            question_type: question.type,
            content: JSON.stringify(question.content),
            correct_answers: JSON.stringify(question.correctAnswers),
          })),
        })
      }
    }

    console.log("Sending test data to API:", JSON.stringify(normalizedData, null, 2))

    // Make the API request
    const apiUrl = process.env.API_URL || "http://localhost:3000/api"
    const response = await fetch(`${apiUrl}/tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API request failed with status ${response.status}:`, errorText)
      try {
        const errorJson = JSON.parse(errorText)
        console.error("Error details:", errorJson)
      } catch (e) {
        // Not JSON, just log the text
      }
      return false
    }

    const result = await response.json()
    console.log("✅ API request successful:", result)
    return true
  } catch (error) {
    console.error("❌ API request failed:", error.message)
    return false
  }
}

// Run the tests
async function runTests() {
  const dbConnected = await testDatabaseConnection()

  if (dbConnected) {
    await testApiEndpoint()
  } else {
    console.log("Skipping API test due to database connection failure")
  }
}

runTests()
