const db = require('../config/database');

class Test {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM tests');
    return rows;
  }

  static async getById(id) {
    const [testRows] = await db.query('SELECT * FROM tests WHERE id = ?', [id]);
    if (testRows.length === 0) {
      return null;
    }
    const test = testRows[0];

    const [questionRows] = await db.query(`
      SELECT q.*, qt.name as question_type 
      FROM questions q
      JOIN question_types qt ON q.question_type_id = qt.id
      WHERE q.test_id = ?
      ORDER BY q.part, q.id
    `, [id]);

    test.questions = questionRows;
    return test;
  }

  static async submitAnswers(userId, testId, answers) {
    const [questionRows] = await db.query('SELECT id, correct_answers FROM questions WHERE test_id = ?', [testId]);
    
    let score = 0;
    const totalQuestions = questionRows.length;

    questionRows.forEach(question => {
      const userAnswer = answers[`q${question.id}`];
      const correctAnswer = JSON.parse(question.correct_answers);

      if (Array.isArray(correctAnswer)) {
        if (Array.isArray(userAnswer) && userAnswer.length === correctAnswer.length && 
            userAnswer.every(answer => correctAnswer.includes(answer))) {
          score++;
        }
      } else {
        if (userAnswer === correctAnswer) {
          score++;
        }
      }
    });

    const percentage = (score / totalQuestions) * 100;

    await db.query(
      'INSERT INTO user_progress (user_id, test_id, score, completed_at) VALUES (?, ?, ?, NOW())',
      [userId, testId, percentage]
    );

    return { score, totalQuestions, percentage };
  }
}

module.exports = Test;