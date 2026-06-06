const User = require('../models/User');
const Result = require('../models/Result');
const FileUpload = require('../models/FileUpload');
const { processCSV, processExcel } = require('../utils/fileParser');
const mongoose = require('mongoose');

// Admin uploads student data -> Creates "draft" results
const uploadStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ message: 'Subject is required' });

    console.log(`Starting upload for subject: ${subject}, file: ${req.file.originalname}`);

    const batchId = `BATCH-${Date.now()}`;
    const batchName = `${subject} - ${new Date().toISOString().split('T')[0]}`;

    let parsedResults = [];
    try {
      if (req.file.mimetype === 'text/csv' || req.file.originalname.toLowerCase().endsWith('.csv')) {
        parsedResults = await processCSV(req.file.buffer);
      } else {
        parsedResults = await processExcel(req.file.buffer);
      }
    } catch (parseErr) {
      console.error('Parsing Error:', parseErr);
      return res.status(400).json({ message: 'Error parsing file. Ensure it is a valid CSV or Excel file.', error: parseErr.message });
    }

    if (!parsedResults.length) {
      return res.status(400).json({ message: 'No valid student data found. Please check your file format.' });
    }

    // Store raw file
    await FileUpload.create({
      batchId,
      fileName: req.file.originalname,
      fileContent: req.file.buffer,
      fileType: req.file.mimetype,
      uploadedBy: req.user._id
    });

    const resultsToInsert = [];
    
    // Process students sequentially to avoid duplicate email race conditions
    for (const data of parsedResults) {
      let student = await User.findOne({ email: data.email, role: 'student' });
      
      if (!student) {
        const password = data.dateOfBirth ? data.dateOfBirth.replace(/-/g, '') : 'student123';
        try {
          student = await User.create({
            name: data.candidateNameEnglish || data.email.split('@')[0],
            email: data.email,
            password,
            role: 'student',
            dateOfBirth: data.dateOfBirth
          });
        } catch (createErr) {
          if (createErr.code === 11000) {
            student = await User.findOne({ email: data.email, role: 'student' });
          } else {
            throw createErr;
          }
        }
      }

      resultsToInsert.push({
        ...data,
        student: student._id,
        subject,
        batchId,
        batchName,
        uploadedBy: req.user._id,
        status: 'draft'
      });
    }

    const savedResults = await Result.insertMany(resultsToInsert);

    res.status(201).json({ 
      batchId, 
      batchName, 
      count: savedResults.length,
      message: `Successfully uploaded ${savedResults.length} students and created draft batch.`
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Error uploading students', error: error.message });
  }
};

const assignBatch = async (req, res) => {
  try {
    const { batchId, teacherId } = req.body;
    await Result.updateMany({ batchId }, { uploadedBy: teacherId });
    res.json({ message: 'Batch assigned to teacher successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning batch', error: error.message });
  }
};

const getDraftBatches = async (req, res) => {
  try {
    const batches = await Result.aggregate([
      { $match: { status: 'draft' } },
      {
        $group: {
          _id: '$batchId',
          batchName: { $first: '$batchName' },
          subject: { $first: '$subject' },
          uploadedBy: { $first: '$uploadedBy' },
          createdAt: { $first: '$createdAt' },
          studentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'uploader'
        }
      },
      { $unwind: '$uploader' },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching draft batches', error: error.message });
  }
};

const getPendingResults = async (req, res) => {
  try {
    const batches = await Result.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: '$batchId',
          batchName: { $first: '$batchName' },
          subject: { $first: '$subject' },
          uploadedBy: { $first: '$uploadedBy' },
          createdAt: { $first: '$createdAt' },
          studentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploadedBy',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      { $unwind: '$teacher' },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending results', error: error.message });
  }
};

const approveBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    await Result.updateMany({ batchId }, { status: 'approved' });
    res.json({ message: 'Batch approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving batch', error: error.message });
  }
};

const disapproveBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    await Result.updateMany({ batchId }, { status: 'disapproved' });
    res.json({ message: 'Batch disapproved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error disapproving batch', error: error.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
};

const getPendingBatchPreview = async (req, res) => {
  try {
    const { batchId } = req.params;
    const results = await Result.find({ batchId }).populate('student', 'name email');
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching preview', error: error.message });
  }
};

// Restore teacher management functions
const addTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const teacherExists = await User.findOne({ email });
    if (teacherExists) return res.status(400).json({ message: 'Teacher already exists' });

    const teacher = await User.create({ name, email, password, role: 'teacher' });
    res.status(201).json({ _id: teacher._id, name: teacher.name, email: teacher.email, role: teacher.role });
  } catch (error) {
    res.status(500).json({ message: 'Error adding teacher', error: error.message });
  }
};

const removeTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    if (!mongoose.Types.ObjectId.isValid(teacherId)) return res.status(400).json({ message: 'Invalid teacher ID' });

    const pendingResults = await Result.findOne({ uploadedBy: teacherId, status: 'pending' });
    if (pendingResults) return res.status(400).json({ message: 'Cannot remove teacher with pending results.' });

    const removedTeacher = await User.findByIdAndDelete(teacherId);
    if (!removedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    res.json({ message: 'Teacher removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing teacher', error: error.message });
  }
};

const changeTeacherPassword = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: 'Password is required' });

    const user = await User.findById(teacherId);
    if (!user) return res.status(404).json({ message: 'Teacher not found' });

    user.password = newPassword; // Hashing handled by pre-save hook
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

const deleteDraftBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Ensure the batch is actually a draft before deleting
    const draftResults = await Result.find({ batchId, status: 'draft' });
    if (draftResults.length === 0) {
      return res.status(404).json({ message: 'Draft batch not found or already processed' });
    }

    // Delete all results in this batch
    await Result.deleteMany({ batchId, status: 'draft' });
    
    // Delete the associated file upload
    await FileUpload.deleteOne({ batchId });

    res.json({ message: 'Draft batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting draft batch', error: error.message });
  }
};

const updateBatchResults = async (req, res) => {
  try {
    const { results } = req.body;
    
    await Promise.all(results.map(async (item) => {
      const marksTotal = (parseFloat(item.iaMarks) || 0) + (parseFloat(item.meMarks) || 0);
      return Result.findByIdAndUpdate(item.resultId, {
        iaMarks: item.iaMarks,
        meMarks: item.meMarks,
        marksTotal: marksTotal,
        resultRemarkEnglish: item.resultRemarkEnglish,
        resultRemarkHindi: item.resultRemarkHindi
      });
    }));

    res.json({ message: 'Results updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating results', error: error.message });
  }
};

module.exports = {
  uploadStudents,
  assignBatch,
  getDraftBatches,
  getPendingResults,
  approveBatch,
  disapproveBatch,
  getTeachers,
  getPendingBatchPreview,
  addTeacher,
  removeTeacher,
  changeTeacherPassword,
  deleteDraftBatch,
  updateBatchResults
};
