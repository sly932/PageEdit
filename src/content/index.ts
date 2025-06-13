import { StorageService } from '../services/storageService';
import { StyleService } from './services/styleService';

async function initializePage() {
    const domain = window.location.hostname;
    
    // 获取最近使用的 Eddy
    const lastUsedEddy = await StorageService.getLastUsedEddy(domain);
    
    if (lastUsedEddy) {
        // 应用 Eddy
        await StyleService.applyEddy(lastUsedEddy);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage); 