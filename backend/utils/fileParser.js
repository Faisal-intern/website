const csv = require('csv-parse');
const xlsx = require('xlsx');

const tryParseDate = (dateVal) => {
  if (!dateVal) return '';
  if (dateVal instanceof Date) return dateVal.toISOString().split('T')[0];
  const dateStr = dateVal.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toISOString().split('T')[0];
};

const isHeaderRow = (row) => {
  if (!row || !Array.isArray(row)) return false;
  const combined = row.join(' ').toLowerCase();
  return combined.includes('roll') || combined.includes('enrolment') || combined.includes('name');
};

const processCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    csv.parse(buffer, { columns: false, trim: true }, (err, data) => {
      if (err) return reject(err);
      
      let dataStartIndex = 0;
      for (let i = 0; i < Math.min(data.length, 15); i++) {
        if (isHeaderRow(data[i])) {
          dataStartIndex = i + 1;
        } else if (data[i][2]) {
           // If we find something that looks like a roll no and not a header, stop
           break;
        }
      }

      const results = data.slice(dataStartIndex)
        .filter(row => row && row[2] && row[2].toString().trim() !== '')
        .map(row => mapRowToResult(row));
      
      resolve(results.filter(r => r.rollNo.trim() !== '' && r.enrolmentNo.trim() !== '' && r.candidateNameEnglish.trim() !== ''));
    });
  });
};

const processExcel = (buffer) => {
  const workbook = xlsx.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let dataStartIndex = 0;
  for (let i = 0; i < Math.min(data.length, 15); i++) {
    if (isHeaderRow(data[i])) {
      dataStartIndex = i + 1;
    } else if (data[i][2]) {
      break;
    }
  }

  const results = data.slice(dataStartIndex)
    .filter(row => row && row[2] && row[2].toString().trim() !== '')
    .map(row => mapRowToResult(row));

  return results.filter(r => r.rollNo.trim() !== '' && r.enrolmentNo.trim() !== '' && r.candidateNameEnglish.trim() !== '');
};

const mapRowToResult = (row) => {
  const dateOfBirth = tryParseDate(row[1]);
  let maxMarks = parseFloat(row[20]);
  if (isNaN(maxMarks) || maxMarks <= 0) maxMarks = parseFloat(row[19]);
  if (isNaN(maxMarks) || maxMarks <= 0) maxMarks = parseFloat(row[21]);

  return {
    sNo:                  parseInt(row[0]) || 0,
    dateOfBirth,
    rollNo:               row[2]?.toString().trim() || '',
    enrolmentNo:          row[3]?.toString().trim() || '',
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
    maxMarks:             maxMarks || 0,
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
};

module.exports = { processCSV, processExcel };
