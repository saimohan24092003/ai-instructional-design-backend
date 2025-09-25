// ===================================
// SME ROUTES (routes/sme.js) - ~150 lines
// ===================================
const express = require('express');
const router = express.Router();
const smeController = require('../controllers/smeController');

// SME question generation endpoint
router.post('/generate-sme-questions', smeController.generateQuestions);

// SME answer submission endpoint  
router.post('/submit-sme-answers', smeController.submitAnswers);

// SME session retrieval endpoint
router.get('/sme-session/:sessionId', smeController.getSession);

// SME session list endpoint (optional)
router.get('/sme-sessions', smeController.listSessions);

module.exports = router;