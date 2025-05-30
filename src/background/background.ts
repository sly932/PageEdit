console.log('PageEdit: Background script loaded');

/**
 * Background Script的主要类
 * 处理插件的后台任务
 */
class BackgroundManager {
    constructor() {
        // 初始化事件监听
        this.initializeListeners();
    }

    /**
     * 初始化事件监听器
     */
    private initializeListeners(): void {
        // 监听插件安装事件
        chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));

        // 监听标签页更新事件
        chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    }

    /**
     * 处理插件安装事件
     * @param details 安装详情
     */
    private handleInstall(details: chrome.runtime.InstalledDetails): void {
        if (details.reason === 'install') {
            // 首次安装时的初始化
            console.log('[background] PageEdit: First install');
            this.initializeStorage();
        } else if (details.reason === 'update') {
            // 更新时的处理
            console.log('[background] PageEdit: Update');
            this.handleUpdate(details.previousVersion);
        }
    }

    /**
     * 处理标签页更新事件
     * @param tabId 标签页ID
     * @param changeInfo 变更信息
     * @param tab 标签页信息
     */
    private handleTabUpdate(
        tabId: number,
        changeInfo: chrome.tabs.TabChangeInfo,
        tab: chrome.tabs.Tab
    ): void {
        // 当页面加载完成时
        if (changeInfo.status === 'complete' && tab.url) {
            // 检查是否是受支持的页面
            this.checkSupportedPage(tab);
        }
    }

    /**
     * 初始化存储
     */
    private async initializeStorage(): Promise<void> {
        try {
            // 初始化修改历史
            await chrome.storage.local.set({ modificationHistory: [] });
            
            // 初始化用户设置
            await chrome.storage.local.set({
                settings: {
                    enabled: true,
                    autoSave: true,
                    maxHistoryLength: 50
                }
            });
        } catch (error) {
            console.error('Failed to initialize storage:', error);
        }
    }

    /**
     * 处理插件更新
     * @param previousVersion 之前的版本
     */
    private async handleUpdate(previousVersion: string | undefined): Promise<void> {
        console.log('Extension updated from', previousVersion, 'to', chrome.runtime.getManifest().version);
        
        // TODO: 处理版本更新逻辑
        // 例如：迁移数据、更新设置等
    }

    /**
     * 检查是否是受支持的页面
     * @param tab 标签页信息
     */
    private async checkSupportedPage(tab: chrome.tabs.Tab): Promise<void> {
        try {
            // 获取用户设置
            const { settings } = await chrome.storage.local.get('settings');
            
            // 如果插件被禁用，则不处理
            if (!settings?.enabled) return;

            // 检查URL是否受支持
            const url = new URL(tab.url!);
            const isSupported = !url.protocol.startsWith('chrome') && 
                              !url.protocol.startsWith('edge') &&
                              !url.protocol.startsWith('about');

            // 更新插件图标状态
            await chrome.action.setIcon({
                path: isSupported ? {
                    16: chrome.runtime.getURL('assets/icons/icon16.png'),
                    48: chrome.runtime.getURL('assets/icons/icon48.png'),
                    128: chrome.runtime.getURL('assets/icons/icon128.png')
                } : {
                    16: chrome.runtime.getURL('assets/icons/icon16-disabled.png'),
                    48: chrome.runtime.getURL('assets/icons/icon48-disabled.png'),
                    128: chrome.runtime.getURL('assets/icons/icon128-disabled.png')
                }
            });
        } catch (error) {
            console.error('Failed to check supported page:', error);
        }
    }
}

// 初始化BackgroundManager
new BackgroundManager(); 