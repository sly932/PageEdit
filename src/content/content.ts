import { Message, Modification, UserInput, ElementLocation, ParseResult, ModificationMethod, StyleModification } from '../types';
import { StyleService } from './services/styleService';
import { StorageService } from '../services/storageService';
import { NLPProcessor } from '../utils/nlp/nlpProcessor';
import { FloatingBall } from './floatingBall';
import { PanelEvent } from './floatingPanel';

console.log('[content] Content script loaded at', new Date().toISOString());

let floatingBall: FloatingBall | null = null;

/**
 * Content Script的主要类
 * 处理页面修改和与popup的通信
 */
export class ContentManager {
    constructor() {
        console.log('[content] ContentManager initialized');
        // 初始化消息监听
        this.initializeMessageListener();
        // 初始化页面（应用保存的 Eddy）
        this.initializePage();
    }

    /**
     * 初始化页面，应用保存的 Eddy
     */
    private async initializePage(): Promise<void> {
        try {
            const domain = window.location.hostname;
            console.log('[content] Initializing page for domain:', domain);
            
            // 获取最近使用的 Eddy
            const lastUsedEddy = await StorageService.getLastUsedEddy(domain);
            
            if (lastUsedEddy) {
                console.log('[content] Found last used Eddy:', lastUsedEddy.name);
                // 应用 Eddy
                await StyleService.applyEddy(lastUsedEddy);
                console.log('[content] Successfully applied Eddy:', lastUsedEddy.name);
            } else {
                console.log('[content] No saved Eddy found for domain:', domain);
            }
        } catch (error) {
            console.error('[content] Error initializing page:', error);
        }
    }

    /**
     * 初始化消息监听器
     */
    private initializeMessageListener(): void {
        console.log('[content] Initializing message listener');
        chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
            console.log('[content] Received message:', message, 'from:', sender);
            // 不再立即 sendResponse
            switch (message.type) {
                case 'MODIFY_PAGE':
                    console.log('[content] Handling MODIFY_PAGE message');
                    this.handleModifyPage(message)
                        .then(() => {
                            console.log('[content] Modification completed successfully');
                            sendResponse({ success: true });
                        })
                        .catch(error => {
                            console.error('[content] Error handling MODIFY_PAGE:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                    return true; // 保持消息通道开放
                default:
                    console.warn('[content] Unknown message type:', message.type);
                    sendResponse({ success: false, error: 'Unknown message type' });
                    return true;
            }
        });
    }

    /**
     * 解析用户输入
     * @param text 用户输入的自然语言
     * @returns 解析结果
     */
    private async parseUserInput(text: string): Promise<ParseResult> {
        console.log('[content] Parsing user input:', text);
        try {
            // 获取当前页面的HTML内容
            const htmlContext = document.documentElement.outerHTML;
            // console.log('[content] HTML context:', htmlContext);

            // 使用 NLPProcessor 处理用户输入
            const result = await NLPProcessor.processInput(text, htmlContext, {
                preferLLM: true,  // 优先使用 LLM
                minConfidence: 0.6 // 最小置信度
            });

            console.log('[content] Processed result:', result);
            return result;
        } catch (error) {
            console.error('[content] Error parsing user input:', error);
            return {
                modifications: [],
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 处理页面修改请求
     * @param message 修改消息
     */
    private async handleModifyPage(message: Message): Promise<void> {
        try {
            // 解析用户输入
            const parseResult = await this.parseUserInput(message.data.text);
            if (!parseResult.success) {
                throw new Error(parseResult.error || 'Failed to parse user input');
            }

            // 应用所有修改
            for (const modification of parseResult.modifications) {
                try {
                    // 检查是否是伪类或伪元素选择器
                    const isPseudoSelector = modification.target.includes(':') || modification.target.includes('::');
                    
                    if (isPseudoSelector) {
                        // 对于伪类/伪元素，直接应用样式规则
                        const success = StyleService.applyModification({
                            property: modification.property,
                            value: modification.value,
                            method: 'style',  // 强制使用 style 方法
                            target: modification.target
                        });
                        
                        if (!success) {
                            throw new Error(`Failed to apply modification: ${modification.property}`);
                        }
                    } else {
                        // 对于普通选择器，查找元素并应用修改
                        const elements = Array.from(document.querySelectorAll(modification.target)) as HTMLElement[];
                        
                        if (elements.length === 0) {
                            console.warn('No elements found for selector:', modification.target);
                            continue;
                        }

                        // 应用修改
                        const success = StyleService.applyModification({
                            property: modification.property,
                            value: modification.value,
                            method: modification.method,
                            target: modification.target
                        });
                        
                        if (!success) {
                            throw new Error(`Failed to apply modification: ${modification.property}`);
                        }
                    }
                } catch (error) {
                    console.error('Failed to apply modification:', error);
                    throw error;
                }
            }
        } catch (error) {
            console.error('Failed to handle page modification:', error);
            throw error;
        }
    }

    /**
     * 处理面板事件
     * @param event 面板事件
     */
    public async handlePanelEvent(event: PanelEvent): Promise<void> {
        console.log('[content] Handling panel event:', event);

        if (!floatingBall) {
            console.error('[content] FloatingBall not initialized');
            return;
        }

        try {
            switch (event.type) {
                case 'apply':
                    if (event.data?.text) {
                        // 创建一个类似于消息的对象
                        const message: Message = {
                            type: 'MODIFY_PAGE',
                            data: { text: event.data.text }
                        };

                        // 处理修改
                        await this.handleModifyPage(message);

                        // 显示成功反馈
                        floatingBall.showFeedback('修改已应用', 'success');
                        floatingBall.clearInput();
                    }
                    break;

                case 'undo':
                    // 撤销最后一次修改
                    const success = this.undoLastModification();

                    if (success) {
                        floatingBall.showFeedback('已撤销上次修改', 'success');
                    } else {
                        floatingBall.showFeedback('没有可撤销的修改', 'error');
                    }
                    break;

                default:
                    console.warn('[content] Unknown panel event type:', event.type);
            }
        } catch (error) {
            console.error('[content] Error handling panel event:', error);
            floatingBall.showFeedback('处理指令时出错', 'error');
        } finally {
            // 重置按钮状态
            floatingBall.resetApplyButton();
        }
    }

    /**
     * 撤销最后一次修改
     * @returns 是否成功撤销
     */
    private undoLastModification(): boolean {
        try {
            // 获取最后一个样式元素
            const styleElements = (window as any).__pageEditStyleElements || [];
            if (styleElements.length > 0) {
                // 移除最后一个样式元素
                const lastStyleElement = styleElements.pop();
                lastStyleElement.remove();
                return true;
            }
            return false;
        } catch (error) {
            console.error('[content] Error undoing modification:', error);
            return false;
        }
    }
}

// 初始化悬浮球
function initializeFloatingBall() {
    if (!floatingBall) {
        const contentManager = new ContentManager();
        floatingBall = new FloatingBall();

        // 设置面板事件回调
        floatingBall.setPanelEventCallback(
            contentManager.handlePanelEvent.bind(contentManager)
        );
    }
}

// 页面加载完成后初始化悬浮球
window.addEventListener('load', () => {
    console.log('[content] Page loaded, initializing floating ball');
    initializeFloatingBall();
});

// 初始化ContentManager
new ContentManager(); 