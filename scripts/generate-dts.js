const fs = require('fs');
const path = require('path');

const tempDir = 'dist/temp_dts';
const outputFile = 'dist/timeless.umd.d.ts';

function getAllDtsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllDtsFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const dtsFiles = getAllDtsFiles(tempDir);
const declarations = dtsFiles.map(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(tempDir, file);
  return `// From ${relativePath}\n${content}`;
}).join('\n\n');

fs.writeFileSync(outputFile, `declare namespace Timeless {\n${declarations}\n}\nexport as namespace Timeless;`);
fs.rmSync(tempDir, { recursive: true, force: true });

