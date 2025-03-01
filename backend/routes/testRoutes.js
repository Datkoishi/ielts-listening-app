const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/', testController.getAllTests);
router.get('/:id', testController.getTestById);
router.post('/:id/submit', testController.submitTest);

module.exports = router;