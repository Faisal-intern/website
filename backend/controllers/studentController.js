const Result = require('../models/Result');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');



const verifyStudent = async (req, res) => {
  try {
    const { rollNo, dateOfBirth } = req.body;

    console.log('Searching for student with:', { rollNo, dateOfBirth });

    // Find student result with matching credentials
    const studentResult = await Result.findOne({ rollNo: rollNo }).select("status rollNo enrolmentNo candidateNameEnglish dateOfBirth");


    console.log('Raw student result:', studentResult); // Debug log

    if (!studentResult) {
      return res.status(401).json({ 
        message: 'No results found for these credentials' 
      });
    }

    console.log('Comparing dates:', {
      input: dateOfBirth,
      stored: studentResult.dateOfBirth
    });

    if (dateOfBirth !== studentResult.dateOfBirth) {
      return res.status(401).json({ 
        message: 'Invalid date of birth' 
      });
    }

    // Generate token for student
    const token = jwt.sign(
      { 
        id: studentResult._id,
        rollNo: studentResult.rollNo,
        enrolmentNo: studentResult.enrolmentNo,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log("status:", studentResult.status);

    res.json({
      token,
      student: {
        rollNo: studentResult.rollNo,
        enrolmentNo: studentResult.enrolmentNo,
        name: studentResult.candidateNameEnglish,
        status: studentResult.status || "pending", // Added status field
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};


// Get student results
const getStudentResults = async (req, res) => {
  try {
    const { rollNo, enrolmentNo } = req.student;

    const results = await Result.find({
      rollNo,
      enrolmentNo,
      status: 'approved'
    }).select(`
      subject batchName
      iaMarks meMarks marksTotal
      maxMarks iaMaxMarks meMaxMarks
      iaSubCode meSubCode
      resultRemarkEnglish
      dateOfResultEnglish
      candidateNameEnglish fatherNameEnglish
      courseNameEnglish courseYearEnglish
      certificateURL
      certificateNo issuedAt
    `);

    if (!results.length) {
      return res.status(404).json({ message: 'No approved results found' });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
};

// Generate result certificate








const generateCertificate = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { rollNo, enrolmentNo } = req.student;

    const result = await Result.findOne({
      _id: resultId,
      rollNo,
      enrolmentNo,
      status: 'approved'
    });

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Generate certificate number and issuance date if they don't exist
    if (!result.certificateNo) {
      result.certificateNo = `VMI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      result.issuedAt = new Date();
      await result.save();
    }

    // Format the data to match the CertificateTemplate structure
    const certificateData = {
      rollNo: result.rollNo,
      enrolmentNo: result.enrolmentNo,
      courseNameHindi: result.courseNameHindi,
      courseNameEnglish: result.courseNameEnglish,
      courseYearHindi: result.courseYearHindi,
      courseYearEnglish: result.courseYearEnglish,
      candidateNameHindi: result.candidateNameHindi,
      fatherNameHindi: result.fatherNameHindi,
      candidateNameEnglish: result.candidateNameEnglish,
      fatherNameEnglish: result.fatherNameEnglish,
      durationHindi: result.durationHindi,
      durationEnglish: result.durationEnglish,
      modeHindi: result.modeHindi,
      modeEnglish: result.modeEnglish,
      iaSubCode: result.iaSubCode,
      meSubCode: result.meSubCode,
      iaMaxMarks: result.iaMaxMarks,
      meMaxMarks: result.meMaxMarks,
      maxMarks: result.maxMarks,
      iaMarks: result.iaMarks,
      meMarks: result.meMarks,
      marksTotal: result.marksTotal,
      resultRemarkHindi: result.resultRemarkHindi,
      resultRemarkEnglish: result.resultRemarkEnglish,
      dateOfResultHindi: result.dateOfResultHindi,
      dateOfResultEnglish: result.dateOfResultEnglish,
      certificateNo: result.certificateNo,
      issuedAt: result.issuedAt
    };

    res.json(certificateData);
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Error generating certificate', error: error.message });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const { certificateNo } = req.params;

    if (!certificateNo) {
      return res.status(400).json({ message: 'Certificate number is required' });
    }

    const result = await Result.findOne({ 
      certificateNo,
      status: 'approved' 
    });

    if (!result) {
      return res.status(404).json({ message: 'Invalid certificate number' });
    }

    res.json({
      studentName: result.candidateNameEnglish,
      rollNo: result.rollNo,
      enrolmentNo: result.enrolmentNo,
      subject: result.subject,
      courseName: result.courseNameEnglish,
      issuedAt: result.issuedAt,
      status: 'Verified'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  verifyStudent,
  getStudentResults,
  generateCertificate,
  verifyCertificate
}; 
 