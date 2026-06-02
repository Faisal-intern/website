const express = require('express');
const multer = require('multer');
const { protect, teacher } = require('../middleware/authMiddleware');
const { uploadResults, getTeacherResults, getResultFile, getPendingBatchPreview, deleteResultBatch } = require('../controllers/teacherController');

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Apply authentication middleware
router.use(protect);
router.use(teacher);

router.delete('/delete-result/:batchId', deleteResultBatch);
router.post('/upload-results', upload.single('file'), uploadResults);
router.get('/results', getTeacherResults);
router.get('/result-file/:batchId', getResultFile);
router.get('/preview-batch/:batchId', getPendingBatchPreview);


module.exports = router; 