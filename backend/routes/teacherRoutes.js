const express = require('express');
const router = express.Router();
const { 
  getAssignedBatches, 
  getBatchResults, 
  saveProgress, 
  submitBatch 
} = require('../controllers/teacherController');
const { protect, teacher } = require('../middleware/authMiddleware');

router.use(protect);
router.use(teacher);

router.get('/assigned-batches', getAssignedBatches);
router.get('/batch-results/:batchId', getBatchResults);
router.put('/save-progress', saveProgress);
router.post('/submit-batch/:batchId', submitBatch);

module.exports = router;
