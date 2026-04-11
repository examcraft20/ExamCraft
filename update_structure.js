const fs = require('fs');
const path = require('path');

function generateTree(dir, exclude = [], prefix = '') {
  let result = '';
  const items = fs.readdirSync(dir).filter(i => !exclude.includes(i));
  items.sort((a, b) => {
      const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
  });
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemPath = path.join(dir, item);
    const isDir = fs.statSync(itemPath).isDirectory();
    const isLast = i === items.length - 1;
    
    // Simplification for deep or noisy directories
    if (isDir && item === 'ui' && dir.includes('packages')) {
        result += prefix + (isLast ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 ') + item + '/ (Shared UI package)\n';
        continue;
    }

    result += prefix + (isLast ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 ') + item + (isDir ? '/' : '') + '\n';
    
    if (isDir) {
        if (dir.includes('migrations')) continue;
        if (dir.includes('ui/components')) continue;
      const newPrefix = prefix + (isLast ? '    ' : '\u2502   ');
      result += generateTree(itemPath, exclude, newPrefix);
    }
  }
  return result;
}

const structure = 'ExamCraft/\n' + generateTree('C:/Projects/ExamCraft', ['.git', 'node_modules', 'dist', '.next', '.next-build', '.turbo', '.branches', '.temp', 'tree_api.txt', 'tree_web_app.txt', 'tree_web_components.txt', 'tree_packages.txt']);

// Make it look like the standard string but updated
let fileContent = fs.readFileSync('C:/Projects/ExamCraft/FILE_STRUCTURE.md', 'utf-8');

const regex = /`[\s\S]*?ExamCraft\/[\s\S]*?`/;
fileContent = fileContent.replace(regex, '`\n' + structure + '\n`');

fs.writeFileSync('C:/Projects/ExamCraft/FILE_STRUCTURE.md', fileContent);
console.log('Successfully updated FILE_STRUCTURE.md');
