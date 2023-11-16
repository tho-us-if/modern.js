const fs = require('fs');
const path = require('path');

// 打印目录路径
function printTargetDir(directoryPath, indent = '') {
  const files = fs.readdirSync(directoryPath);

  files.forEach(file => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      printTargetDir(filePath, `${indent}  `);
    } else {
      console.log(`${indent}${file}`);
    }
  });
}

module.exports = {
  printTargetDir,
};
