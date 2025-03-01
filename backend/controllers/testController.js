const Test = require('../models/Test');

exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.getAll();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTestById = async (req, res) => {
  try {
    const test = await Test.getById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { userId, answers } = req.body;
    const testId = req.params.id;
    const result = await Test.submitAnswers(userId, testId, answers);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};