import { Message, Modification, UserInput } from '../types';
import { ElementLocator } from '../utils/dom/elementLocator';
import { StyleModifier } from '../utils/dom/styleModifier';
import { HistoryManager } from '../utils/storage/historyManager';

/**
 * Content Script的主要类
 * 处理页面修改和与popup的通信
 */
class ContentManager {
    constructor() {
        // 初始化消息监听
        this.initializeMessageListener();
    }

    /**
     * 初始化消息监听器
     */
    private initializeMessageListener(): void {
        chrome.runtime.onMessage.addListener(
            (message: Message, sender, sendResponse) => {
                this.handleMessage(message)
                    .then(sendResponse)
                    .catch(console.error);
                return true; // 保持消息通道开放
            }
        );
    }

    /**
     * 处理接收到的消息
     * @param message 接收到的消息
     */
    private async handleMessage(message: Message): Promise<void> {
        switch (message.type) {
            case 'MODIFY_PAGE':
                await this.handleModifyPage(message.data);
                break;
            case 'UNDO':
                await this.handleUndo();
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    /**
     * 处理页面修改请求
     * @param data 修改数据
     */
    private async handleModifyPage(data: { text: string }): Promise<void> {
        try {
            // 解析用户输入
            const modification = await this.parseUserInput(data.text);
            if (!modification) return;

            // 定位目标元素
            const element = document.querySelector(modification.target) as HTMLElement;
            if (!element) {
                console.error('Target element not found:', modification.target);
                return;
            }

            // 应用样式修改
            const success = StyleModifier.modifyStyle({
                element,
                property: modification.property,
                value: modification.value
            });

            if (success) {
                // 保存修改历史
                await HistoryManager.saveModification(modification);
            }
        } catch (error) {
            console.error('Failed to modify page:', error);
        }
    }

    /**
     * 处理撤销请求
     */
    private async handleUndo(): Promise<void> {
        try {
            // 获取最后一次修改
            const lastModification = await HistoryManager.undoLastModification();
            if (!lastModification) return;

            // 定位目标元素
            const element = document.querySelector(lastModification.target) as HTMLElement;
            if (!element) return;

            // 恢复原始样式
            StyleModifier.restoreStyle(
                element,
                lastModification.property,
                '' // 清空样式值
            );
        } catch (error) {
            console.error('Failed to undo modification:', error);
        }
    }

    /**
     * 解析用户输入
     * @param text 用户输入的自然语言
     * @returns 修改对象
     */
    private async parseUserInput(text: string): Promise<Modification | null> {
        // TODO: 实现自然语言解析
        // 这里先使用简单的硬编码示例
        if (text.includes('背景') && text.includes('蓝色')) {
            return {
                id: Date.now().toString(),
                type: 'style',
                target: 'body',
                property: 'background-color',
                value: 'blue',
                timestamp: Date.now()
            };
        }
        return null;
    }
}

// 初始化ContentManager
new ContentManager(); 