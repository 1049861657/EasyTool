import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CardService {
    static async getCards() {
        try {
             // 根据环境使用不同的路径
             const imagesDir = process.env.PLATFORM == 'vercel'
             ? path.join(dirname(__dirname), 'drawCards')  // Vercel 环境
             : path.join(dirname(__dirname), 'public/drawCards');  // 其余
            const files = await fs.readdir(imagesDir);
            
            // 过滤并解析卡片文件
            const cards = files
                .filter(file => /^.+-\d+\.(jpg|png)$/i.test(file))
                .map(filename => {
                    const match = filename.match(/(.+)-(\d+)\.(jpg|png)$/i);
                    if (!match) return null;
                    
                    return {
                        name: match[1],
                        rarity: parseInt(match[2]),
                        image: filename
                    };
                })
                .filter(card => card !== null);

            return {
                success: true,
                cards: cards
            };
        } catch (error) {
            console.error('读取卡片失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default CardService; 
