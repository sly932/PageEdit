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
        
        // 监听来自content script的消息
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
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

    /**
     * 处理来自content script的消息
     * @param message 消息内容
     * @param sender 发送者信息
     * @param sendResponse 响应函数
     */
    private handleMessage(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ): void {
        console.log('[background] Received message:', message, 'from:', sender);
        
        switch (message.type) {
            case 'GET_TAB_ID':
                // 返回当前tab ID
                if (sender.tab) {
                    sendResponse({ tabId: sender.tab.id });
                } else {
                    sendResponse({ error: 'No tab information available' });
                }
                break;
                
            case 'EXECUTE_SCRIPT':
                // 执行脚本
                this.handleExecuteScript(message.data, sendResponse);
                break;
                
            case 'REMOVE_SCRIPT':
                // 移除脚本
                this.handleRemoveScript(message.data, sendResponse);
                break;
                
            default:
                console.warn('[background] Unknown message type:', message.type);
                sendResponse({ error: 'Unknown message type' });
                break;
        }
    }

    /**
     * 处理执行脚本的消息
     * @param data 脚本数据
     * @param sendResponse 响应函数
     */
    private async handleExecuteScript(data: any, sendResponse: (response?: any) => void): Promise<void> {
        try {
            console.log('[background] Executing script in tab:', data.tabId);
            
            // 使用chrome.scripting.executeScript执行代码
            const results = await chrome.scripting.executeScript({
                target: { tabId: data.tabId },
                func: (code: string, scriptId: string) => {
                    // 创建script元素并注入到页面，避免CSP限制
                    try {
                        const script = document.createElement('script');
                        script.id = scriptId;
                        script.textContent = code;
                        script.setAttribute('data-pageedit', 'true'); // 标记为PageEdit脚本
                        document.head.appendChild(script);
                        
                        // 标记已执行的脚本
                        (window as any).__pageEditExecutedScripts = (window as any).__pageEditExecutedScripts || {};
                        (window as any).__pageEditExecutedScripts[scriptId] = script;
                        
                        console.log('[PageEdit] Script injected successfully:', scriptId);
                        return { success: true, scriptId };
                    } catch (error) {
                        console.error('[PageEdit] Script injection failed:', error);
                        return { success: false, error: (error as Error).message };
                    }
                },
                args: [data.code, data.scriptId]
            });
            
            if (results && results.length > 0) {
                const result = results[0].result;
                sendResponse(result);
            } else {
                sendResponse({ success: false, error: 'No execution results' });
            }
        } catch (error) {
            console.error('[background] Failed to execute script:', error);
            sendResponse({ success: false, error: (error as Error).message });
        }
    }

    /**
     * 处理移除脚本的消息
     * @param data 脚本数据
     * @param sendResponse 响应函数
     */
    private async handleRemoveScript(data: any, sendResponse: (response?: any) => void): Promise<void> {
        try {
            console.log('[background] Removing script from tab:', data.tabId);
            
            // 在目标标签页中标记脚本为已移除
            const results = await chrome.scripting.executeScript({
                target: { tabId: data.tabId },
                func: (scriptId: string) => {
                    // 移除script元素
                    const script = document.getElementById(scriptId) as HTMLScriptElement;
                    if (script && script.getAttribute('data-pageedit') === 'true') {
                        script.remove();
                        console.log('[PageEdit] Script element removed:', scriptId);
                        
                        // 清理跟踪记录
                        if ((window as any).__pageEditExecutedScripts) {
                            delete (window as any).__pageEditExecutedScripts[scriptId];
                        }
                        
                        return { success: true, scriptId };
                    } else {
                        console.log('[PageEdit] Script element not found or not a PageEdit script:', scriptId);
                        return { success: false, error: 'Script element not found' };
                    }
                },
                args: [data.scriptId]
            });
            
            if (results && results.length > 0) {
                const result = results[0].result;
                sendResponse(result);
            } else {
                sendResponse({ success: false, error: 'No removal results' });
            }
        } catch (error) {
            console.error('[background] Failed to remove script:', error);
            sendResponse({ success: false, error: (error as Error).message });
        }
    }
}

// 初始化BackgroundManager
new BackgroundManager(); 