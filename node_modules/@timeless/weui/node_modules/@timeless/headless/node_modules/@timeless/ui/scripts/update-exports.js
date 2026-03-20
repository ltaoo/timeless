const fs = require('fs');
const path = require('path');

const uiPackagePath = path.resolve(__dirname, '..');
const srcPath = path.join(uiPackagePath, 'src');
const pkgPath = path.join(uiPackagePath, 'package.json');

const pkg = require(pkgPath);

const components = fs.readdirSync(srcPath).filter(name => {
  const componentPath = path.join(srcPath, name);
  return fs.statSync(componentPath).isDirectory() &&
         fs.existsSync(path.join(componentPath, 'index.ts'));
});

const exportsConfig = {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.esm.js",
    "require": "./dist/index.js"
  }
};

components.forEach(name => {
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
console.log('Updated package.json exports for components:', components.length);
