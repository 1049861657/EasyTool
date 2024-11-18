import cloudinary from 'cloudinary';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mysql from 'mysql2/promise';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保上传目录存在
const uploadDir = path.join(dirname(__dirname), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 数据库连接配置
const dbConfig = {
    host: 'autorack.proxy.rlwy.net',
    user: 'root',
    password: 'FOWyrfWGiiyoHzcWmeatLHPvptbqsnPw',
    port: 24415,
    database: 'railway'
};

// 修改路由处理，添加更多日志
router.post('/', upload.array('images'), async (req, res) => {
    let connection;
    try {
        console.log('开始处理上传请求...');
        
        if (!req.files || req.files.length === 0) {
            console.log('没有接收到文件');
            return res.status(400).json({
                success: false,
                message: '没有接收到文件'
            });
        }

        console.log(`接收到 ${req.files.length} 个文件`);

        // 创建数据库连接
        console.log('尝试连接数据库...');
        connection = await mysql.createConnection(dbConfig);
        console.log('数据库连接成功');
        
        // 确保表存在
        console.log('检查并创建表...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS uploaded_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                url VARCHAR(255) NOT NULL,
                public_id VARCHAR(100) NOT NULL,
                upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('表创建/确认成功');

        const results = [];
        for (const file of req.files) {
            try {
                console.log(`处理文件: ${file.originalname}`);
                
                // 上传到 Cloudinary
                console.log('开始上传到 Cloudinary...');
                const cloudinaryResult = await new Promise((resolve, reject) => {
                    cloudinary.v2.uploader.upload(file.path, (error, result) => {
                        if (error) {
                            console.error('Cloudinary 上传失败:', error);
                            reject(error);
                        } else {
                            console.log('Cloudinary 上传成功:', result.secure_url);
                            resolve(result);
                        }
                    });
                });

                // 删除临时文件
                fs.unlink(file.path, (err) => {
                    if (err) console.error('删除临时文件失败:', err);
                    else console.log('临时文件删除成功');
                });

                // 保存到数据库
                console.log('保存到数据库...');
                const [dbResult] = await connection.execute(
                    'INSERT INTO uploaded_images (url, public_id) VALUES (?, ?)',
                    [cloudinaryResult.secure_url, cloudinaryResult.public_id]
                );
                console.log('数据库保存成功, ID:', dbResult.insertId);

                results.push({
                    url: cloudinaryResult.secure_url,
                    public_id: cloudinaryResult.public_id,
                    id: dbResult.insertId
                });

            } catch (error) {
                console.error('处理文件时出错:', error);
                throw error;
            }
        }

        console.log('所有文件处理完成');
        res.json({
            success: true,
            message: '文件上传成功',
            files: results
        });

    } catch (error) {
        console.error('上传处理错误:', error);
        res.status(500).json({
            success: false,
            message: '文件上传失败: ' + error.message
        });
    } finally {
        if (connection) {
            console.log('关闭数据库连接...');
            await connection.end();
            console.log('数据库连接已关闭');
        }
    }
});

// 添加获取图片列表的路由
router.get('/images', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM uploaded_images ORDER BY upload_time DESC'
        );

        res.json({
            success: true,
            images: rows
        });
    } catch (error) {
        console.error('获取图片列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取图片列表失败: ' + error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});


// 修改删除图片路由
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { public_id } = req.body;

        console.log('开始删除图片, ID:', id, 'Public ID:', public_id);

        if (!public_id) {
            throw new Error('缺少 public_id 参数');
        }

        // 从 Cloudinary 删除图片
        console.log('从 Cloudinary 删除图片...');
        const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.destroy(public_id, (error, result) => {
                if (error) {
                    console.error('Cloudinary 删除失败:', error);
                    reject(error);
                } else {
                    console.log('Cloudinary 删除成功:', result);
                    resolve(result);
                }
            });
        });

        // 从数据库删除记录
        console.log('从数据库删除记录...');
        connection = await mysql.createConnection(dbConfig);
        const [deleteResult] = await connection.execute(
            'DELETE FROM uploaded_images WHERE id = ?',
            [id]
        );

        if (deleteResult.affectedRows === 0) {
            throw new Error('数据库中未找到该记录');
        }

        console.log('删除成功');
        res.json({
            success: true,
            message: '图片删除成功'
        });

    } catch (error) {
        console.error('删除图片失败:', error);
        res.status(500).json({
            success: false,
            message: '删除图片失败: ' + error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

export default router; 