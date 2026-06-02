// Debug script: reads the sample template and shows column layout
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const templatePath = path.join(__dirname, '..', 'frontend', 'public', 'sample-result-template.xlsx');

if (!fs.existsSync(templatePath)) {
  console.log('Template not found at:', templatePath);
  process.exit(1);
}

const buffer = fs.readFileSync(templatePath);
const workbook = xlsx.read(buffer);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('=== Sheet name:', workbook.SheetNames[0]);
console.log('=== Total rows (including header):', data.length);
console.log('');

// Show header row with column indices
if (data.length > 0) {
  console.log('=== HEADER ROW (row 0) - Column mapping ===');
  data[0].forEach((val, idx) => {
    const col = String.fromCharCode(65 + (idx > 25 ? Math.floor(idx/26) + 64 : 0)) + 
                (idx > 25 ? String.fromCharCode(65 + idx % 26) : String.fromCharCode(65 + idx));
    const colLetter = idx < 26 ? String.fromCharCode(65 + idx) : String.fromCharCode(64 + Math.floor(idx/26)) + String.fromCharCode(65 + idx % 26);
    console.log(`  [${idx}] (Col ${colLetter}): "${val}"`);
  });
}

// Show first 3 data rows
console.log('');
for (let i = 1; i < Math.min(4, data.length); i++) {
  console.log(`=== DATA ROW ${i} ===`);
  if (data[i]) {
    data[i].forEach((val, idx) => {
      if (val !== undefined && val !== null && val !== '') {
        console.log(`  [${idx}]: ${JSON.stringify(val)} (type: ${typeof val})`);
      }
    });
  }
}

// Check specific required indices
console.log('');
console.log('=== REQUIRED FIELD CHECK (for row 1) ===');
if (data.length > 1) {
  const row = data[1];
  console.log(`  row[1] (DOB):          ${JSON.stringify(row[1])} -> type: ${typeof row[1]}`);
  console.log(`  row[2] (Roll No):      ${JSON.stringify(row[2])} -> type: ${typeof row[2]}`);
  console.log(`  row[3] (Enrolment No): ${JSON.stringify(row[3])} -> type: ${typeof row[3]}`);
  console.log(`  row[20] (Max Marks):   ${JSON.stringify(row[20])} -> type: ${typeof row[20]}`);
}
