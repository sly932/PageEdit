import { ensureIIFE } from '../utils/scriptUtils';
console.log('PageEdit: Background script loaded');

/**
 * 脚本执行服务
 * 负责通过扩展API执行脚本，绕过CSP限制
 */
class ScriptExecutionService {
    private executedScripts: Map<string, { tabId: number, code: string }> = new Map();

    /**
     * 执行单个脚本
     * @param tabId 标签页ID
     * @param scriptId 脚本ID
     * @param code 脚本代码
     * @returns 执行结果
     */
    async executeScriptByDebuggerAPI(tabId: number, scriptId: string, code: string): Promise<any> {
        const safeCode = ensureIIFE(code);
        try {
            console.log('[ScriptExecutionService] Executing script', scriptId, 'in tab:', tabId);
            
            // 使用Chrome Debugger API执行脚本，完全绕过CSP限制
            await chrome.debugger.attach({ tabId: tabId }, "1.3");
            
            const result = await chrome.debugger.sendCommand(
                { tabId: tabId },
                "Runtime.evaluate",
                {
                    expression: safeCode,
                    returnByValue: true
                }
            ) as any;
            
            if (result.exceptionDetails) {
                console.error('[ScriptExecutionService] Script execution failed with exception:', {
                    scriptId,
                    exception: result.exceptionDetails.exception?.description,
                    details: result.exceptionDetails,
                });
                await chrome.debugger.detach({ tabId: tabId });
                return { 
                    success: false, 
                    error: result.exceptionDetails.exception?.description || 'Script execution failed', 
                    details: result.exceptionDetails 
                };
            }
            
            await chrome.debugger.detach({ tabId: tabId });
            
            console.log('[PageEdit] Script executed successfully via debugger:',{
                'scriptId': scriptId,
                'code': safeCode
            });
            return { success: true, scriptId, result: result?.result?.value };
            
        } catch (error) {
            console.error('[ScriptExecutionService] Failed to execute script:', error);
            // 确保在出错时也分离debugger
            try {
                await chrome.debugger.detach({ tabId: tabId });
            } catch (detachError) {
                console.error('[ScriptExecutionService] Failed to detach debugger:', detachError);
            }
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * 使用 chrome.scripting API 执行脚本
     * @param tabId 标签页ID
     * @param scriptId 脚本ID
     * @param code 脚本代码
     * @returns 执行结果
     */
    async executeScriptByScriptingAPI(tabId: number, scriptId: string, code: string): Promise<any> {
        const safeCode = ensureIIFE(code);
        try {
            console.log('[ScriptExecutionService] Executing script via scripting API in MAIN world', scriptId, 'in tab:', tabId);
            
            const injectionResults = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                world: 'ISOLATED', // 在隔离环境中执行，以利用扩展的权限注入脚本
                func: (scriptToRun, id) => {
                    // 这个函数现在在页面的主JS环境中运行
                    // 它可以创建一个script标签并注入，这将绕过页面的CSP
                    try {
                        const scriptElement = document.createElement('script');
                        scriptElement.id = id;
                        scriptElement.textContent = scriptToRun;
                        document.head.appendChild(scriptElement);
                        // 脚本是自包含的，执行后可以自行清理
                        scriptElement.remove(); 
                    } catch (e) {
                        // 这里的console.error会打印在页面的控制台
                        console.error(`PageEdit - Error executing script ${id}:`, e);
                    }
                },
                args: [safeCode, scriptId],
            });

            if (injectionResults) {
                for (const frameResult of injectionResults) {
                    const resultWithError = frameResult as any;
                    if (resultWithError.error) {
                        console.error(`[ScriptExecutionService] Script injection failed in frame ${frameResult.frameId}:`, resultWithError.error);
                        return { success: false, error: resultWithError.error.message || 'Script execution failed' };
                    }
                }
            }

            console.log('[PageEdit] Script injected successfully via scripting API:', {
                'scriptId': scriptId,
                'code': safeCode
            });
            
            return { success: true, scriptId, result: injectionResults?.[0]?.result };

        } catch (error) {
            console.error('[ScriptExecutionService] Failed to inject script via scripting API:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * 移除脚本
     * @param tabId 标签页ID
     * @param scriptId 脚本ID
     * @returns 移除结果
     */
    async removeScript(tabId: number, scriptId: string): Promise<any> {
        try {
            console.log('[ScriptExecutionService] Removing script:', scriptId, 'from tab:', tabId);
            
            // 从记录中移除
            this.executedScripts.delete(scriptId);
            
            console.log('[PageEdit] Script record removed:', scriptId);
            return { success: true, scriptId };
            
        } catch (error) {
            console.error('[ScriptExecutionService] Failed to remove script:', error);
            return { success: false, error: (error as Error).message };
        }
    }

    /**
     * 批量执行脚本
     * @param tabId 标签页ID
     * @param scripts 脚本数组
     * @returns 执行结果数组
     */
    async executeBatch(tabId: number, scripts: Array<{id: string, code: string}>): Promise<any[]> {
        const results: any[] = [];
        
        for (const script of scripts) {
            const result = await this.executeScriptByDebuggerAPI(tabId, script.id, script.code);
            results.push(result);
            
            // 每个脚本执行间隔100ms，避免冲突
            if (scripts.indexOf(script) < scripts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        return results;
    }

    /**
     * 获取已执行的脚本信息
     * @param scriptId 脚本ID
     * @returns 脚本信息
     */
    getExecutedScript(scriptId: string): { tabId: number, code: string } | undefined {
        return this.executedScripts.get(scriptId);
    }

    /**
     * 清理所有脚本记录
     */
    clearExecutedScripts(): void {
        this.executedScripts.clear();
    }
}

// 创建全局脚本执行服务实例
const scriptExecutionService = new ScriptExecutionService();

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
            await chrome.storage.local.set({ 
                modifications: [],
            });
            console.log('[background] PageEdit: Storage initialized');
        } catch (error) {
            console.error('[background] PageEdit: Failed to initialize storage:', error);
        }
    }

    /**
     * 处理插件更新
     * @param previousVersion 之前的版本
     */
    private async handleUpdate(previousVersion: string | undefined): Promise<void> {
        console.log(`[background] PageEdit: Updated from version ${previousVersion}`);
        
        // 可以在这里添加基于旧版本的数据迁移逻辑
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
     * @returns 是否保持消息通道开放
     */
    private handleMessage(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ): boolean | void {
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
                // 执行脚本 - 使用ScriptExecutionService
                this.handleExecuteScriptWithService(message.data, sendResponse);
                return true; // 保持消息通道开放，等待异步响应
                
            case 'REMOVE_SCRIPT':
                // 移除脚本 - 使用ScriptExecutionService
                this.handleRemoveScriptWithService(message.data, sendResponse);
                return true; // 保持消息通道开放，等待异步响应
                
            case 'EXECUTE_SCRIPT_BATCH':
                // 批量执行脚本 - 使用ScriptExecutionService
                this.handleExecuteScriptBatch(message.data, sendResponse);
                return true; // 保持消息通道开放，等待异步响应
                
            default:
                console.warn('[background] Unknown message type:', message.type);
                sendResponse({ error: 'Unknown message type' });
                break;
        }
    }

    /**
     * 使用ScriptExecutionService处理执行脚本的消息
     * @param data 脚本数据
     * @param sendResponse 响应函数
     */
    private async handleExecuteScriptWithService(data: any, sendResponse: (response?: any) => void): Promise<void> {
        try {
            const result = await scriptExecutionService.executeScriptByDebuggerAPI(data.tabId, data.scriptId, data.code);
            sendResponse(result);
        } catch (error) {
            console.error('[background] Failed to execute script with service:', error);
            sendResponse({ success: false, error: (error as Error).message });
        }
    }

    /**
     * 使用ScriptExecutionService处理移除脚本的消息
     * @param data 脚本数据
     * @param sendResponse 响应函数
     */
    private async handleRemoveScriptWithService(data: any, sendResponse: (response?: any) => void): Promise<void> {
        try {
            const result = await scriptExecutionService.removeScript(data.tabId, data.scriptId);
            sendResponse(result);
        } catch (error) {
            console.error('[background] Failed to remove script with service:', error);
            sendResponse({ success: false, error: (error as Error).message });
        }
    }

    /**
     * 使用ScriptExecutionService处理批量执行脚本的消息
     * @param data 脚本数据
     * @param sendResponse 响应函数
     */
    private async handleExecuteScriptBatch(data: any, sendResponse: (response?: any) => void): Promise<void> {
        try {
            const results = await scriptExecutionService.executeBatch(data.tabId, data.scripts);
            sendResponse({ success: true, results });
        } catch (error) {
            console.error('[background] Failed to execute script batch with service:', error);
            sendResponse({ success: false, error: (error as Error).message });
        }
    }
}

// 初始化BackgroundManager
new BackgroundManager(); 