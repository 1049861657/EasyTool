import cloudinary from 'cloudinary';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createConnection } from '../utils/db.js';

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
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(originalName));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, true);
    }
});

// 修改路由处理，添加更多日志
router.post('/pic', upload.array('images'), async (req, res) => {
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

        connection = await createConnection();
        console.log('数据库连接成功');
        
        const results = [];
        for (const file of req.files) {
            try {
                console.log(`处理文件: ${file.originalname}`);
                
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

                fs.unlink(file.path, (err) => {
                    if (err) console.error('删除临时文件失败:', err);
                    else console.log('临时文件删除成功');
                });

                // 使用 CONVERT_TZ 函数在插入时转换时区
                const [dbResult] = await connection.execute(
                    'INSERT INTO uploaded_images (url, public_id, upload_time) VALUES (?, ?, CONVERT_TZ(NOW(), @@session.time_zone, "+08:00"))',
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

// 修改获取图片列表的路由，添加表创建逻辑
router.get('/pic', async (req, res) => {
    let connection;
    try {
        connection = await createConnection();

        // 确保图片表存在
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS uploaded_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                url VARCHAR(255) NOT NULL,
                public_id VARCHAR(100) NOT NULL,
                upload_time DATETIME NOT NULL
            )
        `);

        const [rows] = await connection.execute(`
            SELECT 
                id, 
                url, 
                public_id,
                DATE_FORMAT(upload_time, '%Y-%m-%d %H:%i:%s') as upload_time 
            FROM uploaded_images 
            ORDER BY upload_time DESC
        `);

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

// 修改删除图片的路由
router.delete('/pic/:id', async (req, res) => {
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
                    console.log('Cloudinary 删除功:', result);
                    resolve(result);
                }
            });
        });

        // 从数据库删除记录
        console.log('从数据库删除记录...');
        connection = await createConnection();
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

// 修改文件上传的路由
router.post('/files', upload.array('files'), async (req, res) => {
    let connection;
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有接收到文件'
            });
        }

        connection = await createConnection();
        const results = [];

        for (const file of req.files) {
            // 检查是否是压缩文
            const ext = path.extname(file.originalname).toLowerCase();
            const isCompressed = ['.rar', '.zip', '.7z', '.tar', '.gz'].includes(ext);
            
            // 生成 public_id
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            const public_id = `file_${timestamp}_${randomStr}`;

            // 如果是压缩文件，在文件名后添加 .1
            const uploadFileName = isCompressed ? `${file.originalname}.1` : file.originalname;

            const cloudinaryResult = await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload(file.path, {
                    resource_type: 'raw',
                    use_filename: true,
                    public_id: public_id,
                    filename_override: uploadFileName  // 使用修改后的文件名
                }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });

            fs.unlink(file.path, err => {
                if (err) console.error('删除临时文件失败:', err);
            });

            // 在数据库中保存记录，保存原始文件名
            const [dbResult] = await connection.execute(
                'INSERT INTO uploaded_files (name, url, public_id, size, upload_time) VALUES (?, ?, ?, ?, CONVERT_TZ(NOW(), @@session.time_zone, "+08:00"))',
                [file.originalname, cloudinaryResult.url, cloudinaryResult.public_id, file.size]
            );

            results.push({
                id: dbResult.insertId,
                name: file.originalname,
                url: cloudinaryResult.url,
                public_id: cloudinaryResult.public_id,
                size: file.size
            });
        }

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
        if (connection) await connection.end();
    }
});

// 修改获取文件列表的路由，添加表创建逻辑
router.get('/files', async (req, res) => {
    let connection;
    try {
        connection = await createConnection();

        // 确保文件表存在
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS uploaded_files (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                public_id VARCHAR(100) NOT NULL,
                size BIGINT NOT NULL,
                upload_time DATETIME NOT NULL
            )
        `);

        const [rows] = await connection.execute(`
            SELECT 
                id, 
                name,
                url, 
                public_id,
                size,
                DATE_FORMAT(upload_time, '%Y-%m-%d %H:%i:%s') as upload_time 
            FROM uploaded_files 
            ORDER BY upload_time DESC
        `);

        res.json({
            success: true,
            files: rows
        });
    } catch (error) {
        console.error('获取文件列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取文件列表失败: ' + error.message
        });
    } finally {
        if (connection) await connection.end();
    }
});

// 修改删除文件的路由
router.delete('/files/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await createConnection();

        // 获取文件信息
        const [files] = await connection.execute(
            'SELECT public_id FROM uploaded_files WHERE id = ?',
            [id]
        );

        if (files.length === 0) {
            throw new Error('文件不存在');
        }

        // 从 Cloudinary 删除文件，使用 'raw' 而不是 'auto'
        await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.destroy(files[0].public_id, {
                resource_type: 'raw'  // 修改这里，使用 'raw'
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        // 从数据库删除记录
        await connection.execute(
            'DELETE FROM uploaded_files WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: '文件删除成功'
        });

    } catch (error) {
        console.error('删除文件失败:', error);
        res.status(500).json({
            success: false,
            message: '删除文件失败: ' + error.message
        });
    } finally {
        if (connection) await connection.end();
    }
});

// 修改文件下载路由
router.post('/download', async (req, res) => {
    try {
        const { public_id, file_name } = req.body;
        console.log('开始下载处理, public_id:', public_id, 'file_name:', file_name);

        // 获取文件扩展名
        const ext = path.extname(file_name).toLowerCase();
        
        // 获取 Cloudinary 资源信息
        console.log('获取 Cloudinary 资源信息...');
        const result = await new Promise((resolve, reject) => {
            cloudinary.v2.api.resource(public_id, {
                resource_type: 'raw'
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        console.log('Cloudinary 资源信息:', result);

        // 对于 txt 文件使用 axios 下载
        if (ext === '.txt') {
            const axios = (await import('axios')).default;
            const response = await axios({
                method: 'get',
                url: result.secure_url,
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br'
                }
            });

            // 设置响应头
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file_name)}`);
            res.setHeader('Content-Length', response.data.length);

            // 发送文件内容
            res.send(response.data);
        } else {
            // 对于其他文件类型，返回 URL
            res.json({
                success: true,
                url: result.secure_url
            });
        }

    } catch (error) {
        console.error('下载处理错误:', error);
        res.status(500).json({
            success: false,
            message: '下载失败: ' + error.message
        });
    }
});

export default router; 