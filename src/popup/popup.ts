import { Message, Modification } from '../types';
import { ConfigManager, LLMConfig } from '../utils/llm/ConfigManager';
import { CustomConfig } from '../utils/llm/types';

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
    
    // LLM Settings DOM Elements
    private settingsHeader: HTMLElement;
    private settingsToggle: HTMLElement;
    private settingsContent: HTMLElement;
    private providerSelect: HTMLSelectElement;
    private modelSelect: HTMLSelectElement;
    private maxTokensDisplay: HTMLInputElement;
    private temperatureInput: HTMLInputElement;
    private priceDisplay: HTMLInputElement;
    private customConfig: HTMLElement;
    private baseUrlInput: HTMLInputElement;
    private apiKeyInput: HTMLInputElement;
    private customModelsContainer: HTMLElement;
    private addModelInput: HTMLInputElement;
    private addModelBtn: HTMLButtonElement;

    constructor() {
        // 初始化DOM元素
        this.userInput = document.getElementById('userInput') as HTMLInputElement;
        this.applyButton = document.getElementById('applyButton') as HTMLButtonElement;
        this.themeToggleBtn = document.getElementById('themeToggleBtn') as HTMLButtonElement;
        this.themeIcon = document.getElementById('themeIcon') as HTMLElement;
        this.styleSelect = document.getElementById('styleSelect') as HTMLSelectElement;
        
        // 初始化LLM Settings DOM元素
        this.settingsHeader = document.getElementById('settingsHeader') as HTMLElement;
        this.settingsToggle = document.getElementById('settingsToggle') as HTMLElement;
        this.settingsContent = document.getElementById('settingsContent') as HTMLElement;
        this.providerSelect = document.getElementById('providerSelect') as HTMLSelectElement;
        this.modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
        this.maxTokensDisplay = document.getElementById('maxTokensDisplay') as HTMLInputElement;
        this.temperatureInput = document.getElementById('temperatureInput') as HTMLInputElement;
        this.priceDisplay = document.getElementById('priceDisplay') as HTMLInputElement;
        this.customConfig = document.getElementById('customConfig') as HTMLElement;
        this.baseUrlInput = document.getElementById('baseUrlInput') as HTMLInputElement;
        this.apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement;
        this.customModelsContainer = document.getElementById('customModelsContainer') as HTMLElement;
        this.addModelInput = document.getElementById('addModelInput') as HTMLInputElement;
        this.addModelBtn = document.getElementById('addModelBtn') as HTMLButtonElement;

        // 绑定事件处理器
        this.bindEvents();
        
        // 初始化主题
        this.initializeTheme();
        
        // 初始化LLM Settings
        this.initializeLLMSettings();

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

        // LLM Settings事件
        this.bindLLMSettingsEvents();

        console.log('[popup] PageEdit: Popup events bound');
    }

    /**
     * 绑定LLM Settings事件处理器
     */
    private bindLLMSettingsEvents(): void {
        // Settings折叠/展开
        this.settingsHeader.addEventListener('click', () => this.toggleSettings());
        
        // Provider选择变更
        this.providerSelect.addEventListener('change', () => this.handleProviderChange());
        
        // Model选择变更
        this.modelSelect.addEventListener('change', () => this.handleModelChange());
        
        // Temperature变更
        this.temperatureInput.addEventListener('change', () => this.saveCurrentConfig());
        
        // 自定义配置输入变更
        this.baseUrlInput.addEventListener('change', () => this.saveCurrentConfig());
        this.apiKeyInput.addEventListener('change', () => this.saveCurrentConfig());
        
        // 添加自定义模型
        this.addModelBtn.addEventListener('click', () => this.addCustomModel());
        this.addModelInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCustomModel();
            }
        });
    }

    /**
     * 初始化LLM Settings
     */
    private async initializeLLMSettings(): Promise<void> {
        try {
            const config = await ConfigManager.getLLMConfig();
            
            // 设置provider
            this.providerSelect.value = config.provider;
            
            // 更新模型列表
            await this.updateModelList();
            
            // 设置model
            this.modelSelect.value = config.model;
            
            // 设置temperature
            this.temperatureInput.value = config.temperature.toString();
            
            // 更新模型信息显示
            this.updateModelInfo();
            
            // 显示/隐藏配置区域
            this.toggleCustomConfig();
            
            // 如果是自定义配置，加载自定义值
            if (config.provider === 'self-define' && config.customConfig) {
                this.baseUrlInput.value = config.customConfig.baseUrl || '';
                this.apiKeyInput.value = config.customConfig.apiKey || '';
                this.renderCustomModels(config.customConfig.customModels || []);
            }
            
            console.log('[popup] LLM Settings initialized:', config);
        } catch (error) {
            console.error('[popup] Failed to initialize LLM Settings:', error);
        }
    }

    /**
     * 切换Settings展开/折叠状态
     */
    private toggleSettings(): void {
        const isExpanded = this.settingsContent.classList.contains('expanded');
        
        if (isExpanded) {
            this.settingsContent.classList.remove('expanded');
            this.settingsToggle.classList.remove('expanded');
        } else {
            this.settingsContent.classList.add('expanded');
            this.settingsToggle.classList.add('expanded');
        }
    }

    /**
     * 处理Provider变更
     */
    private async handleProviderChange(): Promise<void> {
        try {
            await this.updateModelList();
            this.updateModelInfo();
            this.toggleCustomConfig();
            await this.saveCurrentConfig();
            
            console.log('[popup] Provider changed to:', this.providerSelect.value);
        } catch (error) {
            console.error('[popup] Failed to handle provider change:', error);
        }
    }

    /**
     * 处理Model变更
     */
    private handleModelChange(): void {
        this.updateModelInfo();
        this.saveCurrentConfig();
        console.log('[popup] Model changed to:', this.modelSelect.value);
    }

    /**
     * 更新模型列表
     */
    private async updateModelList(): Promise<void> {
        const provider = this.providerSelect.value;
        
        // 清空现有选项
        this.modelSelect.innerHTML = '';
        
        let models: string[] = [];
        
        if (provider === 'self-define') {
            // 获取当前配置中的自定义模型
            const config = await ConfigManager.getLLMConfig();
            models = config.customConfig?.customModels || ['custom-model'];
        } else {
            models = ConfigManager.getAvailableModels(provider);
        }
        
        // 添加模型选项
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model; // 使用真实模型名作为value
            
            // 获取显示名称，如果是自定义提供商则直接使用模型名
            if (provider === 'self-define') {
                option.textContent = model;
            } else {
                const displayName = ConfigManager.getModelDisplayName(provider, model);
                const pricing = ConfigManager.getModelPricing(provider, model);
                const priceStr = ConfigManager.formatPricing(pricing.inputPrice, pricing.outputPrice);
                
                // 在显示名称后面拼接价格信息
                option.textContent = priceStr ? `${displayName} - ${priceStr}` : displayName;
            }
            
            this.modelSelect.appendChild(option);
        });
        
        // 设置默认选择
        if (models.length > 0) {
            this.modelSelect.value = models[0];
        }
    }

    /**
     * 更新模型信息显示（Max Tokens和价格）
     */
    private updateModelInfo(): void {
        const provider = this.providerSelect.value;
        const model = this.modelSelect.value;
        
        // 更新Max Tokens
        const maxTokens = ConfigManager.getMaxTokensForModel(provider, model);
        this.maxTokensDisplay.value = maxTokens.toString();
        
        // 更新价格显示
        const pricing = ConfigManager.getModelPricing(provider, model);
        const priceStr = ConfigManager.formatPricing(pricing.inputPrice, pricing.outputPrice);
        this.priceDisplay.value = priceStr || 'N/A';
    }

    /**
     * 切换自定义配置显示
     */
    private toggleCustomConfig(): void {
        const provider = this.providerSelect.value;
        const isCustom = provider === 'self-define';
        
        // 显示/隐藏自定义配置
        if (isCustom) {
            this.customConfig.classList.add('show');
        } else {
            this.customConfig.classList.remove('show');
        }
    }

    /**
     * 渲染自定义模型标签
     */
    private renderCustomModels(models: string[]): void {
        this.customModelsContainer.innerHTML = '';
        
        models.forEach(model => {
            const tag = document.createElement('div');
            tag.className = 'model-tag';
            tag.innerHTML = `
                <span>${model}</span>
                <span class="remove" data-model="${model}">×</span>
            `;
            
            // 绑定删除事件
            const removeBtn = tag.querySelector('.remove') as HTMLElement;
            removeBtn.addEventListener('click', () => this.removeCustomModel(model));
            
            this.customModelsContainer.appendChild(tag);
        });
    }

    /**
     * 添加自定义模型
     */
    private async addCustomModel(): Promise<void> {
        const modelName = this.addModelInput.value.trim();
        if (!modelName) return;
        
        try {
            const config = await ConfigManager.getLLMConfig();
            const customConfig = config.customConfig || { baseUrl: '', apiKey: '', customModels: [] };
            const models = customConfig.customModels || [];
            
            if (!models.includes(modelName)) {
                models.push(modelName);
                const updatedConfig: LLMConfig = {
                    ...config,
                    customConfig: {
                        ...customConfig,
                        customModels: models
                    }
                };
                
                await ConfigManager.saveLLMConfig(updatedConfig);
                
                this.renderCustomModels(models);
                await this.updateModelList();
                this.addModelInput.value = '';
                
                console.log('[popup] Added custom model:', modelName);
            }
        } catch (error) {
            console.error('[popup] Failed to add custom model:', error);
        }
    }

    /**
     * 删除自定义模型
     */
    private async removeCustomModel(modelName: string): Promise<void> {
        try {
            const config = await ConfigManager.getLLMConfig();
            const customConfig = config.customConfig || { baseUrl: '', apiKey: '', customModels: [] };
            const models = customConfig.customModels || [];
            const filteredModels = models.filter((m: string) => m !== modelName);
            
            const updatedConfig: LLMConfig = {
                ...config,
                customConfig: {
                    ...customConfig,
                    customModels: filteredModels
                }
            };
            
            await ConfigManager.saveLLMConfig(updatedConfig);
            
            this.renderCustomModels(filteredModels);
            await this.updateModelList();
            
            console.log('[popup] Removed custom model:', modelName);
        } catch (error) {
            console.error('[popup] Failed to remove custom model:', error);
        }
    }

    /**
     * 保存当前配置
     */
    private async saveCurrentConfig(): Promise<void> {
        try {
            const config: LLMConfig = {
                provider: this.providerSelect.value as any,
                model: this.modelSelect.value,
                maxTokens: parseInt(this.maxTokensDisplay.value),
                temperature: parseFloat(this.temperatureInput.value),
            };
            
            // 如果是自定义配置，也保存自定义配置
            if (config.provider === 'self-define') {
                const customConfig: CustomConfig = {
                    baseUrl: this.baseUrlInput.value.trim(),
                    apiKey: this.apiKeyInput.value.trim(),
                    customModels: Array.from(this.customModelsContainer.querySelectorAll('.model-tag span:first-child'))
                        .map(span => span.textContent || '')
                        .filter(model => model)
                };
                
                config.customConfig = customConfig;
            }
            
            await ConfigManager.saveLLMConfig(config);
            
            console.log('[popup] Config saved:', config);
        } catch (error) {
            console.error('[popup] Failed to save config:', error);
        }
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