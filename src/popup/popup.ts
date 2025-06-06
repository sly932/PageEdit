import { Message, Modification } from '../types';

/**
 * Popup页面的主要类
 * 处理用户输入和与content script的通信
 */
class PopupManager {
    private userInput: HTMLInputElement;
    private applyButton: HTMLButtonElement;
    private themeToggleBtn: HTMLButtonElement;
    private themeIcon: HTMLElement;
    private styleSelect: HTMLSelectElement;

    constructor() {
        // 初始化DOM元素
        this.userInput = document.getElementById('userInput') as HTMLInputElement;
        this.applyButton = document.getElementById('applyButton') as HTMLButtonElement;
        this.themeToggleBtn = document.getElementById('themeToggleBtn') as HTMLButtonElement;
        this.themeIcon = document.getElementById('themeIcon') as HTMLElement;
        this.styleSelect = document.getElementById('styleSelect') as HTMLSelectElement;

        // 绑定事件处理器
        this.bindEvents();
        
        // 初始化主题
        this.initializeTheme();

        console.log('[popup] PageEdit: Popup loaded');
    }

    /**
     * 绑定事件处理器
     */
    private bindEvents(): void {
        // 应用修改按钮点击事件
        this.applyButton.addEventListener('click', () => this.handleApply());
        
        // 输入框回车事件
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleApply();
            }
        });

        // 主题切换按钮点击事件
        this.themeToggleBtn.addEventListener('click', () => this.handleThemeToggle());

        // 样式选择变更事件
        this.styleSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            this.setTheme(target.value);
        });

        console.log('[popup] PageEdit: Popup events bound');
    }

    /**
     * 初始化主题
     */
    private initializeTheme(): void {
        const savedTheme = localStorage.getItem('pageedit-theme') || 'retro';
        console.log('[Theme] Initializing with saved theme:', savedTheme);
        this.setTheme(savedTheme);
    }

    /**
     * 处理主题切换
     */
    private handleThemeToggle(): void {
        const current = document.body.getAttribute('data-theme') || 'retro';
        console.log('[Theme] Current theme:', current);
        let newTheme;
        if (current === 'night') {
            newTheme = 'day';
        } else if (current === 'day') {
            newTheme = 'retro';
        } else {
            newTheme = 'night';
        }
        console.log('[Theme] Switching to new theme:', newTheme);
        this.setTheme(newTheme);
    }

    /**
     * 设置主题
     */
    private setTheme(theme: string): void {
        console.log('[Theme] Setting theme to:', theme);
        // Remove data-theme for retro mode - 复古模式时移除 data-theme
        if (theme === 'retro') {
            console.log('[Theme] Removing data-theme attribute');
            document.body.removeAttribute('data-theme');
        } else {
            console.log('[Theme] Setting data-theme to:', theme);
            document.body.setAttribute('data-theme', theme);
        }
        // Update icon based on theme - 根据主题更新图标
        if (theme === 'night') {
            console.log('[Theme] Updating icon to night mode');
            this.themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z" stroke="currentColor" stroke-width="2" fill="none"/>';
            this.themeToggleBtn.classList.remove('theme-day');
            this.themeToggleBtn.classList.add('theme-night');
        } else if (theme === 'day') {
            console.log('[Theme] Updating icon to day mode');
            this.themeIcon.innerHTML = '<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/>' +
                '<g stroke="currentColor" stroke-width="2">' +
                '<line x1="12" y1="1" x2="12" y2="3"/>' +
                '<line x1="12" y1="21" x2="12" y2="23"/>' +
                '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>' +
                '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>' +
                '<line x1="1" y1="12" x2="3" y2="12"/>' +
                '<line x1="21" y1="12" x2="23" y2="12"/>' +
                '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>' +
                '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' +
                '</g>';
            this.themeToggleBtn.classList.remove('theme-night');
            this.themeToggleBtn.classList.add('theme-day');
        } else {
            // Retro theme - 复古主题
            console.log('[Theme] Updating icon to retro mode');
            this.themeIcon.innerHTML = '<circle cx="12" cy="12" r="8" stroke="#bfa77a" stroke-width="2" fill="none"/>';
            this.themeToggleBtn.classList.remove('theme-night', 'theme-day');
        }
        // Save theme to localStorage - 保存主题到localStorage
        console.log('[Theme] Saving theme to localStorage:', theme);
        localStorage.setItem('pageedit-theme', theme);
        this.styleSelect.value = theme;
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