const express = require('express');
const router = express.Router();

const { searchByAcademicYear } = require('../controllers/teacherController');

// Keep only the working route
router.post('/result/search', searchByAcademicYear);

// Remove the problematic getYear route
// router.get('/getYear', getDistinctAcademicYears); // This line was causing the crash

module.exports = router; 
