const Result = require('../models/Result');
const User = require('../models/User');
const csv = require('csv-parse');
const xlsx = require('xlsx');
const FileUpload = require('../models/FileUpload');

const deleteResultBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    console.log("Received batchId:", batchId);

    const sanitizedBatchId = String(batchId).trim();

    const deleteResults = await Result.deleteMany({ batchId: sanitizedBatchId });
    const deleteFile = await FileUpload.findOneAndDelete({ batchId: sanitizedBatchId });

    if (deleteResults.deletedCount === 0 && !deleteFile) {
      return res.status(404).json({ message: 'Batch not found in Result or FileUpload' });
    }

    res.status(200).json({ 
      message: `Deleted ${deleteResults.deletedCount} results successfully`,
      fileDeleted: deleteFile ? deleteFile.fileName : "No file found for this batchId"
    });

  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const uploadResults = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { subject } = req.body;
    if (!subject) {
      return res.status(400).json({ message: 'Subject is required' });
    }

    const batchId = `BATCH-${Date.now()}`;
    const batchName = `${subject} - ${new Date().toISOString().split('T')[0]}`;

    const fileType = req.file.mimetype === 'text/csv' 
      ? 'text/csv'
      : req.file.mimetype.includes('sheet') 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/vnd.ms-excel';

    await FileUpload.create({
      batchId,
      fileName: req.file.originalname,
      fileContent: req.file.buffer,
      fileType,
      uploadedBy: req.user._id
    });

    let results = [];
    try {
      if (req.file.mimetype === 'text/csv') {
        results = await processCSV(req.file.buffer);
      } else if (req.file.mimetype.includes('spreadsheet') || req.file.mimetype.includes('excel')) {
        results = await processExcel(req.file.buffer);
      } else {
        return res.status(400).json({ message: 'Invalid file type' });
      }
    } catch (error) {
      console.error('File processing error:', error);
      return res.status(400).json({ message: 'Error processing file', error: error.message });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'No valid results found in file' });
    }

    const savedResults = await Promise.all(
      results.map(async (result) => {
        try {
          let student = await User.findOne({ 
            email: result.email,
            role: 'student'
          });

          if (!student) {
            // Use date of birth as password (formatted as YYYYMMDD)
            const defaultPassword = result.dateOfBirth ? result.dateOfBirth.replace(/-/g, '') : 'student123';
            
            student = await User.create({
              name: result.candidateNameEnglish || result.email.split('@')[0],
              email: result.email,
              password: defaultPassword,
              role: 'student',
              dateOfBirth: result.dateOfBirth
            });
          }

          return await Result.create({
            student: student._id,
            subject,
            maxMarks: result.maxMarks,
            iaMarks: result.iaMarks,
            meMarks: result.meMarks,
            marksTotal: result.marksTotal,
            iaMaxMarks: result.iaMaxMarks,
            meMaxMarks: result.meMaxMarks,
            iaSubCode: result.iaSubCode,
            meSubCode: result.meSubCode,
            uploadedBy: req.user._id,
            status: 'pending',
            batchId,
            batchName,
            rollNo: result.rollNo,
            enrolmentNo: result.enrolmentNo,
            modeEnglish: result.modeEnglish,
            modeHindi: result.modeHindi,
            resultRemarkEnglish: result.resultRemarkEnglish,
            resultRemarkHindi: result.resultRemarkHindi,
            dateOfResultEnglish: result.dateOfResultEnglish,
            dateOfResultHindi: result.dateOfResultHindi,
            dateOfBirth: result.dateOfBirth,
            courseNameHindi: result.courseNameHindi,
            courseNameEnglish: result.courseNameEnglish,
            courseYearHindi: result.courseYearHindi,
            courseYearEnglish: result.courseYearEnglish,
            fatherNameHindi: result.fatherNameHindi,
            fatherNameEnglish: result.fatherNameEnglish,
            candidateNameHindi: result.candidateNameHindi,
            candidateNameEnglish: result.candidateNameEnglish,
            durationHindi: result.durationHindi,
            durationEnglish: result.durationEnglish,
            academicYear: result.academicYear,
            subjectCode: result.subjectCode,
            courseName: result.courseName,
            examFlag: result.examFlag,
            part: result.part,
            semester: result.semester,
            sNo: result.sNo
          });
        } catch (error) {
          console.error('Error processing result:', error);
          throw error;
        }
      })
    );

    console.log(`New batch uploaded: ${batchName}`);

    res.status(201).json({
      message: 'Results uploaded successfully',
      batchId,
      batchName,
      count: savedResults.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading results', 
      error: error.message 
    });
  }
};

const getTeacherResults = async (req, res) => {
  try {
    const results = await Result.aggregate([
      { $match: { uploadedBy: req.user._id } },
      {
        $group: {
          _id: '$batchId',
          batchName: { 
            $first: {
              $concat: [
                '$subject',
                ' - ',
                { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } }
              ]
            }
          },
          subject: { $first: '$subject' },
          status: { $first: '$status' },
          createdAt: { $first: '$createdAt' },
          studentsCount: { $sum: 1 }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    const formattedResults = results.map(batch => ({
      ...batch,
      batchName: batch.batchName || `${batch.subject} Batch (${new Date(batch.createdAt).toLocaleDateString()})`,
      createdAt: new Date(batch.createdAt).toISOString()
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Error fetching results', error: error.message });
  }
};

// Convert Excel serial date to YYYY-MM-DD
const excelSerialDateToJSDate = (serialDate) => {
  const epochStart = new Date(1900, 0, 1);
  const daysOffset = serialDate < 60 ? 0 : 1;
  const daysSinceEpoch = serialDate - daysOffset;
  const date = new Date(epochStart.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};

// Parse date string in various formats to YYYY-MM-DD
const formatDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split(/[-/]/);
  if (parts.length === 3) {
    if (dateString.includes('/')) {
      let [month, day, year] = parts;
      month = month.padStart(2, '0');
      day = day.padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    const [year, month, day] = parts;
    if (year.length === 4) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      // Assume DD-MM-YYYY
      return `${day.padStart(4, '0')}-${month.padStart(2, '0')}-${year.padStart(2, '0')}`; // This is wrong, let's fix
    }
  }
  return null;
};

// Try to parse a date from any format
const tryParseDate = (val) => {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') return excelSerialDateToJSDate(val);
  const str = val.toString().trim();
  
  // Try to parse as Date object
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Fallback for custom formats
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    let day, month, year;
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else if (parts[2].length === 4) {
      [day, month, year] = parts;
    }
    if (year && month && day) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  return null;
};

// Detect header/blank rows by checking Roll No column (index 2)
const isHeaderRow = (row) => {
  if (!row || row.length === 0) return true;
  const rollVal = row[2];
  if (rollVal === undefined || rollVal === null || rollVal === '') return true;
  if (typeof rollVal === 'string') {
    const lower = rollVal.toLowerCase();
    if (lower.includes('roll') || lower.includes('field') || lower.includes('no.')) return true;
  }
  return false;
};

// Process CSV file
const processCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    csv.parse(buffer.toString(), {
      skip_empty_lines: true,
      from_line: 3 // Skip both header rows (FIELD row + label row)
    })
      .on('data', (row) => {
        // Roll No is index 2, DOB is index 1
        if (!row[2] || !row[1]) {
          console.warn(`Skipping row: Missing ${!row[2] ? 'Roll No' : 'Date of Birth'}`);
          return;
        }

        const dateOfBirth = tryParseDate(row[1].toString());
        if (!dateOfBirth) {
          console.warn(`Skipping row with roll ${row[2]}: Invalid date format`);
          return;
        }

        let maxMarks = parseFloat(row[20]);
        if (isNaN(maxMarks) || maxMarks <= 0) maxMarks = parseFloat(row[19]);
        if (isNaN(maxMarks) || maxMarks <= 0) maxMarks = parseFloat(row[21]);
        if (isNaN(maxMarks) || maxMarks <= 0) {
          console.warn(`Warning: No valid maxMarks for roll ${row[2]}`);
          return;
        }

        results.push({
          sNo:                  row[0] || '',
          dateOfBirth,
          rollNo:               row[2].toString(),
          enrolmentNo:          row[3].toString(),
          courseNameHindi:      row[4]  || '',
          courseNameEnglish:    row[5]  || '',
          courseYearHindi:      row[6]  || '',
          courseYearEnglish:    row[7]  || '',
          candidateNameHindi:   row[8]  || '',
          fatherNameHindi:      row[9]  || '',
          candidateNameEnglish: row[10] || '',
          fatherNameEnglish:    row[11] || '',
          durationHindi:        row[12] || '',
          durationEnglish:      row[13] || '',
          modeHindi:            row[14] || '',
          modeEnglish:          row[15] || '',
          iaSubCode:            row[16] || '',
          meSubCode:            row[17] || '',
          iaMaxMarks:           parseFloat(row[18]) || 0,
          meMaxMarks:           parseFloat(row[19]) || 0,
          maxMarks,
          iaMarks:              isNaN(parseFloat(row[21])) ? 0 : parseFloat(row[21]),
          meMarks:              isNaN(parseFloat(row[22])) ? 0 : parseFloat(row[22]),
          marksTotal:           isNaN(parseFloat(row[23])) ? 0 : parseFloat(row[23]),
          resultRemarkHindi:    row[24] || '',
          resultRemarkEnglish:  row[25] || '',
          dateOfResultHindi:    row[26] || '',
          dateOfResultEnglish:  row[27] || '',
          subjectCode:          row[28]?.toString() || '',
          academicYear:         row[29] || '',
          courseName:           row[30] || '',
          examFlag:             row[31] || '',
          part:                 row[32] || '',
          semester:             row[33] || '',
          email:                `${row[2]}@student.com`
        });
      })
      .on('end', () => {
        const validResults = results.filter(r => r.rollNo && r.enrolmentNo && r.maxMarks > 0);
        resolve(validResults);
      })
      .on('error', reject);
  });
};

// Process Excel file
const processExcel = (buffer) => {
  const workbook = xlsx.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Auto-detect data start by skipping header/blank rows
  let dataStartIndex = 0;
  for (let i = 0; i < Math.min(data.length, 15); i++) {
    if (isHeaderRow(data[i])) {
      console.log(`[processExcel] Skipping row ${i}:`, JSON.stringify(data[i]?.slice(0, 5)));
      dataStartIndex = i + 1;
    } else {
      break;
    }
  }

  console.log(`[processExcel] Data starts at row index: ${dataStartIndex}`);
  console.log(`[processExcel] First data row:`, JSON.stringify(data[dataStartIndex]?.slice(0, 10)));

  if (dataStartIndex >= data.length) {
    throw new Error('No valid results found in file');
  }

  const results = data
    .slice(dataStartIndex)
    .filter(row => row && row.length > 0 && row[2]) // skip blank rows
    .map((row, idx) => {
      try {
        // Roll No is index 2, DOB is index 1
        if (!row[2] || !row[1]) {
          console.warn(`[processExcel] Row ${dataStartIndex + idx}: Missing ${!row[2] ? 'Roll No' : 'Date of Birth'}`);
          return null;
        }

        const dateOfBirth = tryParseDate(row[1]);
        if (!dateOfBirth) {
          console.warn(`[processExcel] Row ${dataStartIndex + idx}: Invalid date format for roll ${row[2]}`);
          return null;
        }

        let maxMarks = parseFloat(row[20]);
        if (isNaN(maxMarks) || maxMarks <= 0) maxMarks = parseFloat(row[19]);
        if (isNaN(maxMarks) || maxMarks <= 0) maxMarks = parseFloat(row[21]);
        if (isNaN(maxMarks) || maxMarks <= 0) {
          console.warn(`[processExcel] Row ${dataStartIndex + idx}: No valid maxMarks, cols 19-21: ${[row[19], row[20], row[21]]}`);
          return null;
        }

        return {
          sNo:                  row[0] || '',
          dateOfBirth,
          rollNo:               row[2].toString(),
          enrolmentNo:          row[3].toString(),
          courseNameHindi:      row[4]  || '',
          courseNameEnglish:    row[5]  || '',
          courseYearHindi:      row[6]  || '',
          courseYearEnglish:    row[7]  || '',
          candidateNameHindi:   row[8]  || '',
          fatherNameHindi:      row[9]  || '',
          candidateNameEnglish: row[10] || '',
          fatherNameEnglish:    row[11] || '',
          durationHindi:        row[12] || '',
          durationEnglish:      row[13] || '',
          modeHindi:            row[14] || '',
          modeEnglish:          row[15] || '',
          iaSubCode:            row[16] || '',
          meSubCode:            row[17] || '',
          iaMaxMarks:           parseFloat(row[18]) || 0,
          meMaxMarks:           parseFloat(row[19]) || 0,
          maxMarks,
          iaMarks:              isNaN(parseFloat(row[21])) ? 0 : parseFloat(row[21]),
          meMarks:              isNaN(parseFloat(row[22])) ? 0 : parseFloat(row[22]),
          marksTotal:           isNaN(parseFloat(row[23])) ? 0 : parseFloat(row[23]),
          resultRemarkHindi:    row[24] || '',
          resultRemarkEnglish:  row[25] || '',
          dateOfResultHindi:    row[26] || '',
          dateOfResultEnglish:  row[27] || '',
          subjectCode:          row[28]?.toString() || '',
          academicYear:         row[29] || '',
          courseName:           row[30] || '',
          examFlag:             row[31] || '',
          part:                 row[32] || '',
          semester:             row[33] || '',
          email:                `${row[2]}@student.com`
        };
      } catch (err) {
        console.error(`[processExcel] Error on row ${dataStartIndex + idx}:`, err.message);
        return null;
      }
    })
    .filter(r => r !== null && r.rollNo && r.enrolmentNo && r.maxMarks > 0);

  console.log(`[processExcel] Successfully parsed ${results.length} valid results`);

  if (results.length === 0) {
    throw new Error('No valid results found in file');
  }

  return results;
};

const getResultFile = async (req, res) => {
  try {
    const { batchId } = req.params;
    const fileUpload = await FileUpload.findOne({ batchId });
    
    if (!fileUpload) {
      return res.status(404).json({ message: 'File not found' });
    }

    const workbook = xlsx.read(fileUpload.fileContent);
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileUpload.fileName}"`,
      'Content-Length': excelBuffer.length
    });

    res.send(excelBuffer);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file', error: error.message });
  }
};

const getPendingBatchPreview = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const results = await Result.find({ 
      batchId,
      uploadedBy: req.user._id 
    })
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

const searchByAcademicYear = async (req, res) => { 
  const { academicYear } = req.body;

  if (!academicYear) {
    return res.status(400).json({ message: 'Academic Year is required' });
  }

  try {
    const results = await Result.aggregate([
      { $match: { academicYear } },
      {
        $group: {
          _id: {
            semester: "$semester",
            subjectCode: "$subjectCode",
            examFlag: "$examFlag",
            part: "$part",
            courseName: "$courseName",
            academicYear: "$academicYear"
          }
        }
      },
      {
        $project: {
          _id: 0,
          semester: "$_id.semester",
          subjectCode: "$_id.subjectCode",
          examFlag: "$_id.examFlag",
          part: "$_id.part",
          courseName: "$_id.courseName",
          academicYear: "$_id.academicYear"
        }
      }
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No results found for the given academic year' });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error searching results by academicYear:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getDistinctAcademicYears = async (req, res) => {
  try {
    const years = await Result.distinct('academicYear');
    res.json(years);
  } catch (error) {
    console.error('Error getting academic years:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  uploadResults,
  getTeacherResults,
  getResultFile,
  getPendingBatchPreview,
  searchByAcademicYear,
  getDistinctAcademicYears,
  deleteResultBatch
};