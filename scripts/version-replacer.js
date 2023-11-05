// version-replacer.js
const fs = require('fs');
const path = require('path');

// The version number should be passed as the first argument
const version = process.argv[2];

// Specify the path to the environment files
const filesToUpdate = [
  path.join(__dirname, 'src/environments/environment.prod.ts'),
  path.join(__dirname, 'src/environments/environment.ts')
];

filesToUpdate.forEach(filePath => {
  // Read the content of the environment file
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the placeholder with the actual version
  content = content.replace(/VERSION_PLACEHOLDER/g, version);

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
});

console.log(`Updated environment files with version: ${version}`);
