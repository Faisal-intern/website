const express = require('express');
const router = express.Router();

const { searchByAcademicYear, getDistinctAcademicYears } = require('../controllers/teacherController');

// Keep only the working route
router.post('/result/search', searchByAcademicYear);

// Restore the working route
router.get('/getYear', getDistinctAcademicYears); 

module.exports = router; 
