const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('https://results-api.vminstitute.in')) {
        // Only import API_URL if not already imported or defined
        if (!content.includes('const API_URL')) {
           // Insert it after imports
           const lastImportIndex = content.lastIndexOf('import ');
           const endOfLastImport = content.indexOf('\n', lastImportIndex);
           content = content.slice(0, endOfLastImport + 1) + 
                     '\nconst API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";\n' + 
                     content.slice(endOfLastImport + 1);
        }
        
        // Replace all occurrences
        content = content.replace(/'https:\/\/results-api\.vminstitute\.in/g, '`${API_URL}');
        content = content.replace(/"https:\/\/results-api\.vminstitute\.in/g, '`${API_URL}');
        
        // Fix any cases where we had 'https://.../api/something' -> `${API_URL}/api/something'` which is invalid template literal.
        // If it was single quotes, the end quote is still a single quote, we need to change it to backtick.
        // Actually, let's use a regex that matches the whole string and replaces it with a template literal.
        content = content.replace(/['"]https:\/\/results-api\.vminstitute\.in([^'"]*)['"]/g, '`${API_URL}$1`');

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src', 'components'));
