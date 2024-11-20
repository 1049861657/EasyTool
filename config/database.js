import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置dotenv，指定.env文件路径
dotenv.config({ path: join(__dirname, '..', '.env') });

export const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    dateStrings: true,
    connectTimeout: 60000,
    typeCast: true,
    supportBigNumbers: true,
    bigNumberStrings: true
}; 

// 验证必要的配置是否存在
if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.port || !dbConfig.database) {
    throw new Error('Missing required database configuration');
} 