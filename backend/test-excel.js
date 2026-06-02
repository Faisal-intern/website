const xlsx = require('xlsx');

// Helper function to process Excel file
const excelSerialDateToJSDate = (serialDate) => {
  const epochStart = new Date(1900, 0, 1);
  const daysOffset = serialDate < 60 ? 0 : 1;
  const daysSinceEpoch = serialDate - daysOffset;
  const millisSinceEpoch = daysSinceEpoch * 24 * 60 * 60 * 1000;
  const date = new Date(epochStart.getTime() + millisSinceEpoch);
  return date.toISOString().split('T')[0];
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split(/[-/]/);
  if (parts.length === 3) {
    if (dateString.includes('/')) {
      let [month, day, year] = parts;
      month = month.padStart(2, '0');
      day = day.padStart(2, '0');
      return `${day}-${month}-${year}`;
    }
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return null;
};

// Create dummy workbook
const wb = xlsx.utils.book_new();
const wsData = [
  ['S.No', 'DOB', 'Roll No', 'Enrolment No', 'CourseNameH', 'CourseNameE', 'CourseYearH', 'CourseYearE', 'CandNameH', 'FatherNameH', 'CandNameE', 'FatherNameE', 'DurH', 'DurE', 'ModeH', 'ModeE', 'IASub', 'MESub', 'IAMax', 'MEMax', 'MaxMarks', 'IAMarks', 'MEMarks', 'MarksTot', 'RemH', 'RemE', 'DateH', 'DateE', 'SubCode', 'AcadYear', 'CourseName', 'ExamFlag', 'Part', 'Sem'],
  [1, '01-01-2000', 'R001', 'E001', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 20, 80, 100, 15, 60, 75, '', 'Pass', '', '', '', '2023', '', '', '', '']
];

const ws = xlsx.utils.aoa_to_sheet(wsData);
xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

// Simulate processExcel
const workbook = xlsx.read(buffer);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log("Parsed rows:", data.length);
if (data.length > 1) {
  console.log("Row 2 data:", data[1]);
  console.log("Row 2 Max Marks:", data[1][20]);
}

const results = data.slice(1).map(row => {
  try {
    if (!row[2] || !row[3] || !row[1]) {
      console.log('Validation failed: missing row 1, 2, or 3', {r1: row[1], r2: row[2], r3: row[3]});
      return null;
    }

    let dateOfBirth;
    if (typeof row[1] === 'number') {
      dateOfBirth = excelSerialDateToJSDate(row[1]);
    } else {
      dateOfBirth = formatDate(row[1].toString());
    }

    if (!dateOfBirth) {
      console.warn(`Warning: Invalid date format for roll number ${row[2]}`);
      return null;
    }

    const maxMarks = parseFloat(row[20]);
    if (!maxMarks || isNaN(maxMarks)) {
      console.warn(`Warning: Maximum Marks is invalid for roll number ${row[2]}:`, row[20]);
      return null;
    }

    return {
      rollNo: row[2],
      enrolmentNo: row[3],
      maxMarks
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}).filter(result => result !== null && result.rollNo && result.enrolmentNo && result.maxMarks > 0);

console.log("Valid results:", results.length);
