const express = require('express');
const { verifyStudent, getStudentResults, generateCertificate, verifyCertificate } = require('../controllers/studentController');
const { protectStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for student verification/login
router.post('/verify', verifyStudent);

// Public route for certificate verification by any user
router.get('/verify/:certificateNo', verifyCertificate);

// Protected routes - require student token
router.get('/results', protectStudent, getStudentResults);
router.get('/certificate/:resultId', protectStudent, generateCertificate);

module.exports = router; 