const mongoose = require('mongoose');

const fileUploadSchema = new mongoose.Schema({
  batchId: {
    type: String,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileContent: {
    type: Buffer,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const FileUpload = mongoose.model('FileUpload', fileUploadSchema);
module.exports = FileUpload; 