import { Message, Modification } from '../types';
import { ConfigManager, LLMConfig } from '../utils/llm/ConfigManager';
import { CustomConfig } from '../utils/llm/types';

/**
 * Popup页面的主要类
 * 处理用户输入和与content script的通信
 */
class PopupManager {
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
        
        // 初始化LLM Settings
        this.initializeLLMSettings();

        console.log('[popup] PageEdit: Popup loaded');
    }

    /**
     * 绑定事件处理器
     */
    private bindEvents(): void {
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
        console.log('Toggling settings visibility...');
        // 直接切换控制高度和旋转的Tailwind类
        this.settingsContent.classList.toggle('max-h-0');
        this.settingsContent.classList.toggle('max-h-96'); // 使用一个足够大的值
        this.settingsToggle.classList.toggle('rotate-180');
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
        
        // 使用'hidden'类来切换显示
        if (isCustom) {
            this.customConfig.classList.remove('hidden');
        } else {
            this.customConfig.classList.add('hidden');
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