const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  addTeacher,
  getTeachers,
  getPendingResults,
  approveResult,
  disapproveResult,
  getPendingBatchPreview,
  getResultFile,
  removeResultFile,
  getPublishedResults,
  removeTeacher,
  changeTeacherPassword,
  sendResetPasswordLink,
  resetPassword

} = require('../controllers/adminController');







const router = express.Router();


router.post("/send-reset-password-link",sendResetPasswordLink);
router.post('/reset-password', resetPassword);


// Apply authentication middleware to all routes
router.use(protect);
router.use(admin);






router.post('/add-teacher', addTeacher);
router.get('/teachers', getTeachers);
router.get('/pending-results', getPendingResults);
router.put('/approve-result/:resultId', approveResult);
router.put('/approve-batch/:batchId', approveResult);
router.put('/disapprove-result/:resultId', disapproveResult);
router.put('/disapprove-batch/:batchId', disapproveResult);
router.get('/preview-batch/:batchId', getPendingBatchPreview);
router.get('/result-file/:batchId', getResultFile);
router.get('/published-results', getPublishedResults);
router.delete('/remove-teacher/:teacherId', removeTeacher);
router.put('/change-teacher-password/:teacherId', changeTeacherPassword);
// Define the route for removing the result file
router.delete('/remove-file/:batchId', removeResultFile);


module.exports = router; 