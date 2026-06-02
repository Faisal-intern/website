const User = require('../models/User');
const Result = require('../models/Result');
const FileUpload = require('../models/FileUpload');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender'); 



const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find admin with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure token is valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

  

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};





const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

const sendResetPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the admin user
    const user = await User.findOne({ email, role: "admin" });
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Generate a 6-digit OTP
    const otp = generateOTP();

    // Store OTP with expiry (valid for 10 minutes)
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Email content
    const emailTitle = "Reset Your Password - OTP Verification";
    const emailBody = `
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Use the OTP below to reset your password:</p>
      <h2 style="color: #4CAF50;">${otp}</h2>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // Send email using mailSender
    await mailSender(user.email, emailTitle, emailBody);

    res.status(200).json({ message: "OTP sent to email for password reset" });

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




// Add a new teacher
const addTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const teacherExists = await User.findOne({ email });
    if (teacherExists) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    const teacher = await User.create({
      name,
      email,
      password,
      role: 'teacher',
    });

    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding teacher', error: error.message });
  }
};

// Get all teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
};

// Get pending results
const getPendingResults = async (req, res) => {
  try {
    // Group pending results by batch
    const results = await Result.aggregate([
      { $match: { status: 'pending' } },
      {
        $group: {
          _id: '$batchId',
          batchName: { $first: '$batchName' },
          subject: { $first: '$subject' },
          uploadedBy: { $first: '$uploadedBy' },
          createdAt: { $first: '$createdAt' },
          studentsCount: { $sum: 1 }
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

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending results', error: error.message });
  }
};

// Approve result
const approveResult = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Update all results in the batch
    const result = await Result.updateMany(
      { batchId },
      { 
        $set: { 
          status: 'approved',
          updatedAt: new Date() // Explicitly update the timestamp
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Log the update result for debugging
    console.log('Batch approval result:', result);

    res.json({ 
      message: 'Batch approved successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error in approveResult:', error);
    res.status(500).json({ message: 'Error approving batch', error: error.message });
  }
};

// Disapprove result
const disapproveResult = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Update all results in the batch
    const result = await Result.updateMany(
      { batchId },
      { 
        $set: { 
          status: 'disapproved',
          updatedAt: new Date() // Explicitly update the timestamp
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Batch not found or no results to disapprove' });
    }

    // Log the update result for debugging
    console.log('Batch disapproval result:', result);

    res.json({ 
      message: 'Batch disapproved successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error in disapproveResult:', error);
    res.status(500).json({ message: 'Error disapproving batch', error: error.message });
  }
};

// Get pending batch preview
const getPendingBatchPreview = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const results = await Result.find({ batchId })
      .select(`
        rollNo enrolmentNo
        candidateNameEnglish candidateNameHindi
        fatherNameEnglish fatherNameHindi
        courseNameEnglish courseNameHindi
        courseYearEnglish courseYearHindi
        subject
        iaSubCode meSubCode
        iaMarks meMarks marksTotal
        maxMarks iaMaxMarks meMaxMarks
        modeEnglish modeHindi
        resultRemarkEnglish resultRemarkHindi
        dateOfResultEnglish dateOfResultHindi
        dateOfBirth
        durationEnglish durationHindi
      `)
      .sort('rollNo');

    if (!results.length) {
      return res.status(404).json({ message: 'No results found for this batch' });
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batch preview', error: error.message });
  }
};

// Get result file
const getResultFile = async (req, res) => {
  try {
    const { batchId } = req.params;
    const fileUpload = await FileUpload.findOne({ batchId });
    
    if (!fileUpload) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.set({
      'Content-Type': fileUpload.fileType,
      'Content-Disposition': `attachment; filename="${fileUpload.fileName}"`,
    });

    res.send(fileUpload.fileContent);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
};

// Update result file status to 'pending'
const removeResultFile = async (req, res) => {
  try {
    const { batchId } = req.params;

    // Check if the file exists in the FileUpload collection
    const fileUpload = await FileUpload.findOne({ batchId });
    if (!fileUpload) {
      return res.status(404).json({ message: 'File not found in FileUpload' });
    }

    // Update the `Result` schema to reflect the file status change
    const resultUpdate = await Result.updateMany(
      { batchId },
      {
        $set: { status: 'pending', teacherArchived: true }, // Update status and other relevant fields
        $currentDate: { updatedAt: true }, // Update the `updatedAt` field
      }
    );

    if (resultUpdate.matchedCount === 0) {
      return res.status(404).json({ message: 'No matching results found for batchId' });
    }

    res.json({
      message: 'File status updated to "pending" successfully in Result schema',
      resultsUpdated: resultUpdate.modifiedCount,
    });
  } catch (error) {
    console.error('Error updating file status:', error);
    res.status(500).json({ message: 'Error updating file status', error: error.message });
  }
};




// Add this function to get published results
const getPublishedResults = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await Result.aggregate([
      { $match: { status: 'approved', archived: { $ne: true } } }, // Exclude archived results
      {
        $group: {
          _id: '$batchId',
          batchId: { $first: '$batchId' },
          batchName: { $first: '$batchName' },
          subject: { $first: '$subject' },
          uploadedBy: { $first: '$uploadedBy' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          studentsCount: { $sum: 1 }
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
      { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          batchId: 1,
          batchName: { $ifNull: ['$batchName', 'Unknown Batch'] },
          subject: 1,
          'teacher.name': { $ifNull: ['$teacher.name', 'Unknown Teacher'] },
          studentsCount: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    console.log('Published results:', results);
    res.json(results);
  } catch (error) {
    console.error('Error in getPublishedResults:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Error fetching published results', error: error.message });
  }
};


// Remove a teacher

const removeTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    // Validate teacherId
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    // Check if teacher has any pending results
    const pendingResults = await Result.findOne({ 
      uploadedBy: teacherId, 
      status: 'pending' 
    });

    if (pendingResults) {
      return res.status(400).json({ 
        message: 'Cannot remove teacher with pending results. Please process all pending results first.' 
      });
    }

    

    // Remove the teacher
    const removedTeacher = await User.findByIdAndDelete(teacherId);
    if (!removedTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teacher  removed successfully' });
  } catch (error) {
    console.error('Error removing teacher:', error);
    res.status(500).json({ 
      message: 'Error removing teacher', 
      error: error.message 
    });
  }
};



// Change teacher password
const changeTeacherPassword = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ 
        message: 'Password is required' 
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the teacher's password
    const teacher = await User.findByIdAndUpdate(
      teacherId,
      { password: hashedPassword },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      message: 'Error changing password', 
      error: error.message 
    });
  }
};

module.exports = {
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
  resetPassword,
  sendResetPasswordLink
}; 