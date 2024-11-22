import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CardService {
    static async getCards() {
        try {
            const imagesDir = path.join(dirname(__dirname), 'public/drawCards');
            console.log(imagesDir);
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