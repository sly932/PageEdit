import { Message, Modification } from '../types';
import { HistoryManager } from '../utils/storage/historyManager';

/**
 * Popup页面的主要类
 * 处理用户输入和与content script的通信
 */
class PopupManager {
    private userInput: HTMLInputElement;
    private applyButton: HTMLButtonElement;
    private undoButton: HTMLButtonElement;
    private historyContainer: HTMLDivElement;

    constructor() {
        // 初始化DOM元素
        this.userInput = document.getElementById('userInput') as HTMLInputElement;
        this.applyButton = document.getElementById('applyButton') as HTMLButtonElement;
        this.undoButton = document.getElementById('undoButton') as HTMLButtonElement;
        this.historyContainer = document.getElementById('historyContainer') as HTMLDivElement;

        // 绑定事件处理器
        this.bindEvents();
        
        // 初始化历史记录显示
        this.loadHistory();

        console.log('[popup] PageEdit: Popup loaded');
    }

    /**
     * 绑定事件处理器
     */
    private bindEvents(): void {
        // 应用修改按钮点击事件
        this.applyButton.addEventListener('click', () => this.handleApply());
        
        // 撤销按钮点击事件
        this.undoButton.addEventListener('click', () => this.handleUndo());
        
        // 输入框回车事件
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleApply();
            }
        });

        console.log('[popup] PageEdit: Popup events bound');
    }

    /**
     * 处理应用修改
     */
    private async handleApply(): Promise<void> {
        const text = this.userInput.value.trim();
        if (!text) {
            console.log('[popup] PageEdit: No input text');
            return;
        }

        try {
            console.log('[popup] PageEdit: Getting current tab');
            // 获取当前标签页
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) {
                const error = 'No tab id found';
                console.error('[popup] PageEdit:', error);
                alert('应用修改失败：' + error);
                return;
            }
            console.log('[popup] PageEdit: Current tab id:', tab.id, 'url:', tab.url);

            // 发送消息到content script（不再注入 content script）
            const message: Message = {
                type: 'MODIFY_PAGE',
                data: { text: '输入：' + text }
            };
            console.log('[popup] PageEdit: Sending message to content script:', message);

            // 使用 Promise 包装消息发送
            const response = await new Promise<{ success?: boolean; error?: string }>((resolve, reject) => {
                chrome.tabs.sendMessage(tab.id!, message, (response) => {
                    if (chrome.runtime.lastError) {
                        const error = chrome.runtime.lastError;
                        const errorMsg = 'Failed to send message: ' + error.message;
                        console.error('[popup] PageEdit:', errorMsg);
                        reject(new Error(errorMsg));
                    } else {
                        console.log('[popup] PageEdit: Message sent successfully, response:', response);
                        resolve(response);
                    }
                });
            });
            
            console.log('[popup] PageEdit: Response:', response);

            if (response?.success) {
                // 清空输入框
                this.userInput.value = '';
                // 重新加载历史记录
                await this.loadHistory();
            } else {
                const errorMsg = response?.error || '未知错误';
                console.error('[popup] PageEdit: Modification failed:', errorMsg);
                alert('应用修改失败：' + errorMsg);
            }
        } catch (error: any) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('[popup] PageEdit: Failed to apply modification:', errorMsg);
            alert('应用修改失败：' + errorMsg);
        }
    }

    /**
     * 处理撤销操作
     */
    private async handleUndo(): Promise<void> {
        try {
            // 获取当前标签页
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab.id) return;

            // 发送撤销消息到content script（不再注入 content script）
            const message: Message = {
                type: 'UNDO'
            };

            await chrome.tabs.sendMessage(tab.id, message);
            // 重新加载历史记录
            await this.loadHistory();
        } catch (error) {
            console.error('[popup] Failed to undo modification:', error);
        }
    }

    /**
     * 加载并显示历史记录
     */
    private async loadHistory(): Promise<void> {
        try {
            const history = await HistoryManager.getHistory();
            this.displayHistory(history);
        } catch (error) {
            console.error('[popup] Failed to load history:', error);
        }
    }

    /**
     * 显示历史记录
     * @param history 修改历史记录数组
     */
    private displayHistory(history: Modification[]): void {
        // 清空历史记录容器
        this.historyContainer.innerHTML = '';

        // 如果没有历史记录，显示提示信息
        if (history.length === 0) {
            this.historyContainer.innerHTML = '<p>暂无修改历史</p>';
            return;
        }

        // 创建历史记录列表
        const historyList = document.createElement('ul');
        historyList.style.listStyle = 'none';
        historyList.style.padding = '0';
        historyList.style.margin = '0';

        // 添加历史记录项
        history.forEach((modification) => {
            const item = document.createElement('li');
            item.style.padding = '5px 0';
            item.style.borderBottom = '1px solid #eee';
            
            const time = new Date(modification.timestamp).toLocaleTimeString();
            item.textContent = `${time}: ${modification.property} = ${modification.value}`;
            
            historyList.appendChild(item);
        });

        this.historyContainer.appendChild(historyList);
    }
}

// 当DOM加载完成后初始化PopupManager
console.log('PageEdit: Script loaded');

// 立即执行初始化
function initialize() {
    console.log('PageEdit: DOMContentLoaded event fired');
    try {
        new PopupManager();
        console.log('PageEdit: PopupManager initialized successfully');
    } catch (error) {
        console.error('PageEdit: Failed to initialize PopupManager:', error);
    }
}

// 如果 DOM 已经加载完成，立即初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initialize();
} else {
    // 否则等待 DOMContentLoaded 事件
    document.addEventListener('DOMContentLoaded', initialize);
} 