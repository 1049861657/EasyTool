const fs = require('fs');
const path = require('path');

// 读取命令行参数，格式如：node update-version.js 1.0.1
const newVersion = process.argv[2];

if (!newVersion) {
    console.error('请提供新的版本号，例如：node update-version.js 1.0.1');
    process.exit(1);
}

// 更新 package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = require(packagePath);
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

// 更新 index.html
const indexPath = path.join(__dirname, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
indexHtml = indexHtml.replace(
    /<div class="version-info">v[^<]+<\/div>/,
    `<div class="version-info">v${newVersion}</div>`
);
fs.writeFileSync(indexPath, indexHtml);

console.log(`版本已更新到 v${newVersion}`); 