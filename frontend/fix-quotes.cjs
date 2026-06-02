const fs = require('fs');
const path = require('path');

function fixSyntaxInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixSyntaxInDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/`\$\{API_URL\}([^`'"]*)',/g, '`${API_URL}$1`,');
      content = content.replace(/`\$\{API_URL\}([^`'"]*)",/g, '`${API_URL}$1`,');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Checked ${file}`);
    }
  }
}

fixSyntaxInDir(path.join(__dirname, 'src', 'components'));
