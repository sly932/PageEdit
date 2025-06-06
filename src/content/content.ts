import { Message, Modification, UserInput, ElementLocation, ParseResult, ModificationMethod, StyleModification } from '../types';
import { StyleService } from './services/styleService';
import { NLPProcessor } from '../utils/nlp/nlpProcessor';

console.log('[content] PageEdit: Content script loaded at', new Date().toISOString());

/**
 * Content Script的主要类
 * 处理页面修改和与popup的通信
 */
export class ContentManager {
    constructor() {
        console.log('[content] PageEdit: ContentManager initialized');
        // 初始化消息监听
        this.initializeMessageListener();
    }

    /**
     * 初始化消息监听器
     */
    private initializeMessageListener(): void {
        console.log('[content] PageEdit: Initializing message listener');
        chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
            console.log('[content] PageEdit: Received message:', message, 'from:', sender);
            // 不再立即 sendResponse
            switch (message.type) {
                case 'MODIFY_PAGE':
                    console.log('[content] PageEdit: Handling MODIFY_PAGE message');
                    this.handleModifyPage(message)
                        .then(() => {
                            console.log('[content] PageEdit: Modification completed successfully');
                            sendResponse({ success: true });
                        })
                        .catch(error => {
                            console.error('[content] PageEdit: Error handling MODIFY_PAGE:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                    return true; // 保持消息通道开放
            }
        });
    }

    /**
     * 解析用户输入
     * @param text 用户输入的自然语言
     * @returns 解析结果
     */
    private async parseUserInput(text: string): Promise<ParseResult> {
        console.log('[content] PageEdit: Parsing user input:', text);
        try {
            // 获取当前页面的HTML内容
            const htmlContext = document.documentElement.outerHTML;
            console.log('[content] PageEdit: HTML context:', htmlContext);

            // 使用 NLPProcessor 处理用户输入
            const result = await NLPProcessor.processInput(text, htmlContext, {
                preferLLM: true,  // 优先使用 LLM
                minConfidence: 0.6 // 最小置信度
            });

            console.log('[content] PageEdit: Processed result:', result);
            return result;
        } catch (error) {
            console.error('[content] PageEdit: Error parsing user input:', error);
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
}

// 初始化ContentManager
new ContentManager(); 