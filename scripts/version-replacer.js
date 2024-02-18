// version-replacer.js
const fs = require('fs');

const version = process.argv[2];

const filesToUpdate = [
  './src/environments/environment.prod.ts',
  './src/environments/environment.ts',
  './src/custom-sw.js'
];

filesToUpdate.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/VERSION_PLACEHOLDER/g, version);
  fs.writeFileSync(filePath, content);
});

console.log(`Updated files with version: ${version}`);
