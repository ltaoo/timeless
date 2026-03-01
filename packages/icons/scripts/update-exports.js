import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsPackagePath = path.resolve(__dirname, '..');
const srcPath = path.join(iconsPackagePath, 'src');
const pkgPath = path.join(iconsPackagePath, 'package.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

// Get all .ts files in src except index.ts and d.ts files
const icons = fs.readdirSync(srcPath).filter(name => {
  return name.endsWith('.ts') && 
         name !== 'index.ts' && 
         !name.endsWith('.d.ts');
}).map(name => name.replace('.ts', ''));

const exportsConfig = {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.esm.js",
    "require": "./dist/index.js"
  }
};

icons.forEach(name => {
  exportsConfig[`./${name}`] = {
    "types": `./dist/${name}/index.d.ts`,
    "import": `./dist/${name}/index.esm.js`,
    "require": `./dist/${name}/index.js`
  };
});

// Sort keys to ensure deterministic order
const sortedExports = {};
Object.keys(exportsConfig).sort().forEach(key => {
  sortedExports[key] = exportsConfig[key];
});

pkg.exports = sortedExports;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('Updated package.json exports for icons:', icons.length);
