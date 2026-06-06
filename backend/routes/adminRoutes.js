const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadStudents, 
  assignBatch, 
  getDraftBatches, 
  getTeachers, 
  getPendingResults, 
  approveBatch, 
  disapproveBatch,
  getPendingBatchPreview,
  addTeacher,
  removeTeacher,
  changeTeacherPassword,
  deleteDraftBatch,
  updateBatchResults
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(protect);
router.use(admin);

router.post('/upload-students', upload.single('file'), uploadStudents);
router.post('/assign-batch', assignBatch);
router.get('/draft-batches', getDraftBatches);
router.delete('/draft-batch/:batchId', deleteDraftBatch);
router.get('/teachers', getTeachers);
router.get('/pending-results', getPendingResults);
router.get('/batch-preview/:batchId', getPendingBatchPreview);
router.put('/update-batch-results', updateBatchResults);
router.post('/approve-batch/:batchId', approveBatch);
router.post('/disapprove-batch/:batchId', disapproveBatch);

// Teacher management
router.post('/add-teacher', addTeacher);
router.delete('/teacher/:teacherId', removeTeacher);
router.put('/teacher-password/:teacherId', changeTeacherPassword);

module.exports = router;
