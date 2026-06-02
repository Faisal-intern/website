const express = require('express');
const {
  getAuthURL,
  getToken,
  getUserInfo,
  readDrive,
  createFolder,
  fileUpload,
  deleteFile,
  downloadFile,
  upload,
} = require('../controllers/driveController');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log('Google Drive Route:', req.method, req.path);
  console.log('Request Body:', req.body);
  next();
});

// Routes
router.get('/auth-url', getAuthURL);
router.post('/get-token', getToken);
router.post('/user-info', getUserInfo);
router.post('/read-drive', readDrive);
router.post('/create-folder', createFolder);
router.post('/fileUpload', upload.single('file'), fileUpload);
router.delete('/delete-file/:id', deleteFile);
router.get('/download-file/:id', downloadFile);

module.exports = router;
