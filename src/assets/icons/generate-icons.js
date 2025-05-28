const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function generateIcons() {
    // 读取 SVG 文件
    const svg = fs.readFileSync('./icon.svg', 'utf8');
    
    // 创建不同尺寸的图标
    const sizes = [16, 48, 128];
    
    for (const size of sizes) {
        // 创建画布
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        
        // 绘制背景
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, size * 0.15);
        ctx.fill();
        
        // 绘制加号
        ctx.strokeStyle = 'white';
        ctx.lineWidth = size * 0.06;
        ctx.lineCap = 'round';
        
        // 横线
        ctx.beginPath();
        ctx.moveTo(size * 0.3, size * 0.5);
        ctx.lineTo(size * 0.7, size * 0.5);
        ctx.stroke();
        
        // 竖线
        ctx.beginPath();
        ctx.moveTo(size * 0.5, size * 0.3);
        ctx.lineTo(size * 0.5, size * 0.7);
        ctx.stroke();
        
        // 保存为 PNG
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(`icon${size}.png`, buffer);
    }
}

generateIcons().catch(console.error); 