const fs = require('fs');
const path = require('path');

const directory = 'c:/Projects/ExamCraft/apps/web/app/(app)/dashboard';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalStartContent = content;
      
      // Fix imports missing one level of depth
      // In page.tsx and layout.tsx that were moved 1 level deeper
      // Instead of relying on depth, let's just use alias for components and lib and hooks
      content = content.replace(/(\.\.\/)+components\//g, '@/components/');
      content = content.replace(/(\.\.\/)+lib\//g, '@/lib/');
      content = content.replace(/(\.\.\/)+hooks\//g, '@/hooks/');

      if (content !== originalStartContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);

const superAdminDir = 'c:/Projects/ExamCraft/apps/web/app/(app)/(super-admin)';
if (fs.existsSync(superAdminDir)) {
    processDirectory(superAdminDir);
}
console.log('Done.');
