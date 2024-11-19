import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取 __dirname (在 ES 模块中需要特殊处理)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取命令行参数，格式如：node update-version.js 1.0.1
const newVersion = process.argv[2];

if (!newVersion) {
    console.error('请提供新的版本号，例如：node update-version.js 1.0.1');
    process.exit(1);
}

// 更新 package.json
const packagePath = join(__dirname, 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
packageJson.version = newVersion;
writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

// 更新 index.html
const indexPath = join(__dirname, 'index.html');
let indexHtml = readFileSync(indexPath, 'utf8');
indexHtml = indexHtml.replace(
    /<div class="version-info">v[^<]+<\/div>/,
    `<div class="version-info">v${newVersion}</div>`
);
writeFileSync(indexPath, indexHtml);

console.log(`版本已更新到 v${newVersion}`); 