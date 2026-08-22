const express = require('express');
const router = express.Router();
const { submitAssessment, getAssessmentsQueue } = require('../controllers/assessmentController');
const { verifyToken, requireRole } = require('../middleware/auth');


router.use(verifyToken);


router.post('/', requireRole(['student']), submitAssessment);


router.get('/queue', requireRole(['counsellor', 'admin']), getAssessmentsQueue);

module.exports = router;