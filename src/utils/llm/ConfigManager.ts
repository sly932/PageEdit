import { CustomConfig } from './types';

/**
 * LLM配置接口
 */
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'deepseek' | 'google' | 'self-define';
  model: string;
  maxTokens: number;
  temperature: number;
  // 自定义提供商额外配置
  customConfig?: CustomConfig;
}

/**
 * 提供商配置映射
 */
const PROVIDER_CONFIGS = {
  openai: {
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    maxTokens: {
      'gpt-4': 4096,
      'gpt-4-turbo': 4096,
      'gpt-3.5-turbo': 4096
    }
  },
  anthropic: {
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    maxTokens: {
      'claude-3-opus': 4096,
      'claude-3-sonnet': 4096,
      'claude-3-haiku': 4096
    }
  },
  deepseek: {
    models: ['deepseek-chat', 'deepseek-coder'],
    maxTokens: {
      'deepseek-chat': 4096,
      'deepseek-coder': 4096
    }
  },
  google: {
    models: ['gemini-pro', 'gemini-pro-vision'],
    maxTokens: {
      'gemini-pro': 4096,
      'gemini-pro-vision': 4096
    }
  }
};

/**
 * 默认配置
 */
const DEFAULT_CONFIG: LLMConfig = {
  provider: 'openai',
  model: 'gpt-4',
  maxTokens: 4096,
  temperature: 0.7
};

/**
 * 配置管理器
 * 负责管理LLM相关的所有配置
 */
export class ConfigManager {
  private static readonly STORAGE_KEY = 'llmConfig';

  /**
   * 获取LLM配置
   * @returns LLM配置对象
   */
  public static async getLLMConfig(): Promise<LLMConfig> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      if (result[this.STORAGE_KEY]) {
        return { ...DEFAULT_CONFIG, ...result[this.STORAGE_KEY] };
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.error('Failed to get LLM config:', error);
      return DEFAULT_CONFIG;
    }
  }

  /**
   * 保存LLM配置
   * @param config LLM配置对象
   */
  public static async saveLLMConfig(config: LLMConfig): Promise<void> {
    try {
      await chrome.storage.local.set({ [this.STORAGE_KEY]: config });
    } catch (error) {
      console.error('Failed to save LLM config:', error);
      throw error;
    }
  }

  /**
   * 获取指定提供商的可用模型列表
   * @param provider 提供商名称
   * @param customConfig 自定义配置（仅当provider为self-define时需要）
   * @returns 模型名称数组
   */
  public static getAvailableModels(provider: string, customConfig?: CustomConfig): string[] {
    if (provider === 'self-define') {
      return customConfig?.customModels || [];
    }
    
    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    return config ? config.models : [];
  }

  /**
   * 获取指定模型的最大Token数
   * @param provider 提供商名称
   * @param model 模型名称
   * @returns 最大Token数
   */
  public static getMaxTokensForModel(provider: string, model: string): number {
    if (provider === 'self-define') {
      return 4096; // 自定义提供商默认值
    }
    
    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    if (config && config.maxTokens[model as keyof typeof config.maxTokens]) {
      return config.maxTokens[model as keyof typeof config.maxTokens];
    }
    return 4096; // 默认值
  }

  /**
   * 获取所有支持的提供商列表
   * @returns 提供商名称数组
   */
  public static getSupportedProviders(): string[] {
    return [...Object.keys(PROVIDER_CONFIGS), 'self-define'];
  }

  /**
   * 验证配置是否有效
   * @param config 要验证的配置
   * @returns 是否有效
   */
  public static validateConfig(config: Partial<LLMConfig>): boolean {
    if (!config.provider || !this.getSupportedProviders().includes(config.provider)) {
      return false;
    }
    
    if (!config.model || !this.getAvailableModels(config.provider).includes(config.model)) {
      return false;
    }
    
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      return false;
    }
    
    return true;
  }
} 