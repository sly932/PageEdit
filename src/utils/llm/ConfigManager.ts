import { CustomConfig } from './types';

/**
 * LLM配置接口
 */
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'deepseek' | 'google' | 'siliconflow' | 'qwen' | 'self-define';
  model: string;
  maxTokens: number;
  temperature: number;
  // 自定义提供商额外配置
  customConfig?: CustomConfig;
}

/**
 * 模型配置接口
 */
interface ModelConfig {
  displayName: string;
  maxTokens: number;
  inputPrice: number;  // 输入价格 ($/1M tokens)
  outputPrice: number; // 输出价格 ($/1M tokens)
}

/**
 * 提供商配置映射
 * 按输出价格从低到高排序
 */
const PROVIDER_CONFIGS = {
  openai: {
    models: {
      // 按输出价格排序 $0.60 - $66.00
      'gpt-4o-mini': { displayName: 'GPT-4o Mini (最便宜)', maxTokens: 128000, inputPrice: 0.15, outputPrice: 0.60 },
      'gpt-4o-mini-2024-07-18': { displayName: 'GPT-4o Mini (2024-07-18)', maxTokens: 128000, inputPrice: 0.15, outputPrice: 0.60 },
      'gpt-4.1-mini': { displayName: 'GPT-4.1 Mini', maxTokens: 128000, inputPrice: 0.40, outputPrice: 1.60 },
      'gpt-4.1-mini-2025-04-14': { displayName: 'GPT-4.1 Mini (2025-04-14)', maxTokens: 128000, inputPrice: 0.40, outputPrice: 1.60 },
      'o4-mini': { displayName: 'o4 Mini', maxTokens: 128000, inputPrice: 1.10, outputPrice: 4.40 },
      'o3-mini': { displayName: 'o3 Mini', maxTokens: 128000, inputPrice: 1.10, outputPrice: 4.40 },
      'o3-mini-2025-01-31': { displayName: 'o3 Mini (2025-01-31)', maxTokens: 128000, inputPrice: 1.10, outputPrice: 4.40 },
      'gpt-4.1': { displayName: 'GPT-4.1', maxTokens: 128000, inputPrice: 2.00, outputPrice: 8.00 },
      'gpt-4.1-2025-04-14': { displayName: 'GPT-4.1 (2025-04-14)', maxTokens: 128000, inputPrice: 2.00, outputPrice: 8.00 },
      'gpt-4o': { displayName: 'GPT-4o (推荐)', maxTokens: 128000, inputPrice: 2.50, outputPrice: 10.00 },
      'gpt-4o-2024-08-06': { displayName: 'GPT-4o (2024-08-06)', maxTokens: 128000, inputPrice: 2.50, outputPrice: 10.00 },
      'o1-mini': { displayName: 'o1 Mini (推理)', maxTokens: 128000, inputPrice: 3.00, outputPrice: 12.00 },
      'o1-mini-2024-09-12': { displayName: 'o1 Mini (2024-09-12)', maxTokens: 128000, inputPrice: 3.00, outputPrice: 12.00 },
      'gpt-4o-2024-05-13': { displayName: 'GPT-4o (2024-05-13)', maxTokens: 128000, inputPrice: 5.00, outputPrice: 15.00 },
      'chatgpt-4o-latest': { displayName: 'ChatGPT-4o Latest', maxTokens: 128000, inputPrice: 5.00, outputPrice: 15.00 },
      'gpt-4-turbo': { displayName: 'GPT-4 Turbo', maxTokens: 128000, inputPrice: 10.00, outputPrice: 30.00 },
      'gpt-4-turbo-2024-04-09': { displayName: 'GPT-4 Turbo (2024-04-09)', maxTokens: 128000, inputPrice: 10.00, outputPrice: 30.00 },
      'o1-preview': { displayName: 'o1 Preview (推理强)', maxTokens: 128000, inputPrice: 15.00, outputPrice: 60.00 },
      'o1-preview-2024-09-12': { displayName: 'o1 Preview (2024-09-12)', maxTokens: 128000, inputPrice: 15.00, outputPrice: 60.00 },
      'o1': { displayName: 'o1 (最强推理)', maxTokens: 128000, inputPrice: 16.50, outputPrice: 66.00 }
    }
  },
  anthropic: {
    models: {
      // 按输出价格排序 $1.25 - $75.00
      'claude-3-haiku-20240307': { displayName: 'Claude-3 Haiku (最快)', maxTokens: 200000, inputPrice: 0.25, outputPrice: 1.25 },
      'claude-3-5-haiku-20241022': { displayName: 'Claude-3.5 Haiku', maxTokens: 200000, inputPrice: 1.00, outputPrice: 5.00 },
      'claude-3-7-sonnet-20250219': { displayName: 'Claude-3.7 Sonnet (最新)', maxTokens: 200000, inputPrice: 3.00, outputPrice: 15.00 },
      'claude-3-sonnet-20240229': { displayName: 'Claude-3 Sonnet', maxTokens: 200000, inputPrice: 3.00, outputPrice: 15.00 },
      'claude-3-5-sonnet-20240620': { displayName: 'Claude-3.5 Sonnet (20240620)', maxTokens: 200000, inputPrice: 3.00, outputPrice: 15.00 },
      'claude-3-5-sonnet-20241022': { displayName: 'Claude-3.5 Sonnet (推荐)', maxTokens: 200000, inputPrice: 3.00, outputPrice: 15.00 },
      'claude-3-opus-20240229': { displayName: 'Claude-3 Opus (最强)', maxTokens: 200000, inputPrice: 15.00, outputPrice: 75.00 }
    }
  },
  deepseek: {
    models: {
      'deepseek-reasoner': { displayName: 'DeepSeek R1 (推理)', maxTokens: 64000, inputPrice: 4, outputPrice: 16 },
      'deepseek-chat': { displayName: 'DeepSeek Chat', maxTokens: 4096, inputPrice: 2, outputPrice: 8 },
    }
  },
  google: {
    models: {
      // 按输出价格排序 $0.60 - $10.00
      'gemini-2.5-flash-preview': { displayName: 'Gemini 2.5 Flash (快速)', maxTokens: 1000000, inputPrice: 0.15, outputPrice: 0.60 },
      'gemini-2.5-pro-preview-03-25': { displayName: 'Gemini 2.5 Pro (强大)', maxTokens: 1000000, inputPrice: 1.25, outputPrice: 10.00 }
    }
  },
  siliconflow: {
    models: {
      // 按输出价格排序 ¥0.00 - ¥16.00 (免费模型在前，付费模型按价格排序)
      // 免费模型 (¥0.00)
      'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B': { displayName: 'DeepSeek-R1-0528-Qwen3-8B (免费)', maxTokens: 128000, inputPrice: 0, outputPrice: 0 },
      'Qwen/Qwen3-8B': { displayName: 'Qwen3-8B (免费)', maxTokens: 8192, inputPrice: 0, outputPrice: 0 },
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B': { displayName: 'DeepSeek-R1-Distill-Qwen-7B (免费)', maxTokens: 128000, inputPrice: 0, outputPrice: 0 },
      'Qwen/Qwen2.5-7B-Instruct': { displayName: 'Qwen2.5-7B-Instruct (免费)', maxTokens: 32000, inputPrice: 0, outputPrice: 0 },
      'Qwen/Qwen2.5-Coder-7B-Instruct': { displayName: 'Qwen2.5-Coder-7B-Instruct (免费编程)', maxTokens: 32000, inputPrice: 0, outputPrice: 0 },
      'Qwen/Qwen2-7B-Instruct': { displayName: 'Qwen2-7B-Instruct (免费)', maxTokens: 32000, inputPrice: 0, outputPrice: 0 },
      
      // 付费模型 (按输出价格排序)
      'Qwen/Qwen3-Reranker-0.6B': { displayName: 'Qwen3-Reranker-0.6B (重排)', maxTokens: 32000, inputPrice: 0.0175, outputPrice: 0.07 },
      'Qwen/Qwen3-Embedding-0.6B': { displayName: 'Qwen3-Embedding-0.6B (嵌入)', maxTokens: 32000, inputPrice: 0.0175, outputPrice: 0.07 },
      'Qwen/Qwen3-Reranker-4B': { displayName: 'Qwen3-Reranker-4B (重排)', maxTokens: 32000, inputPrice: 0.035, outputPrice: 0.14 },
      'Qwen/Qwen3-Embedding-4B': { displayName: 'Qwen3-Embedding-4B (嵌入)', maxTokens: 32000, inputPrice: 0.035, outputPrice: 0.14 },
      'Qwen/Qwen3-Reranker-8B': { displayName: 'Qwen3-Reranker-8B (重排)', maxTokens: 32000, inputPrice: 0.07, outputPrice: 0.28 },
      'Qwen/Qwen3-Embedding-8B': { displayName: 'Qwen3-Embedding-8B (嵌入)', maxTokens: 32000, inputPrice: 0.07, outputPrice: 0.28 },
      'Pro/Qwen/Qwen2.5-VL-7B-Instruct': { displayName: 'Qwen2.5-VL-7B-Instruct Pro (视觉)', maxTokens: 32000, inputPrice: 0.0875, outputPrice: 0.35 },
      'Pro/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B': { displayName: 'DeepSeek-R1-Distill-Qwen-7B Pro', maxTokens: 128000, inputPrice: 0.0875, outputPrice: 0.35 },
      'Pro/Qwen/Qwen2.5-Coder-7B-Instruct': { displayName: 'Qwen2.5-Coder-7B-Instruct Pro (编程)', maxTokens: 32000, inputPrice: 0.0875, outputPrice: 0.35 },
      'Pro/Qwen/Qwen2.5-7B-Instruct': { displayName: 'Qwen2.5-7B-Instruct Pro', maxTokens: 32000, inputPrice: 0.0875, outputPrice: 0.35 },
      'Pro/Qwen/Qwen2-7B-Instruct': { displayName: 'Qwen2-7B-Instruct Pro', maxTokens: 32000, inputPrice: 0.0875, outputPrice: 0.35 },
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B': { displayName: 'DeepSeek-R1-Distill-Qwen-14B', maxTokens: 128000, inputPrice: 0.175, outputPrice: 0.7 },
      'Qwen/Qwen2.5-14B-Instruct': { displayName: 'Qwen2.5-14B-Instruct', maxTokens: 32000, inputPrice: 0.175, outputPrice: 0.7 },
      'deepseek-ai/deepseek-vl2': { displayName: 'DeepSeek-VL2 (视觉)', maxTokens: 64000, inputPrice: 0.2475, outputPrice: 0.99 },
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B': { displayName: 'DeepSeek-R1-Distill-Qwen-32B', maxTokens: 128000, inputPrice: 0.315, outputPrice: 1.26 },
      'Qwen/QwQ-32B-Preview': { displayName: 'QwQ-32B-Preview (推理)', maxTokens: 32000, inputPrice: 0.315, outputPrice: 1.26 },
      'Qwen/Qwen2.5-Coder-32B-Instruct': { displayName: 'Qwen2.5-Coder-32B-Instruct (编程)', maxTokens: 32000, inputPrice: 0.315, outputPrice: 1.26 },
      'Qwen/Qwen2.5-32B-Instruct': { displayName: 'Qwen2.5-32B-Instruct', maxTokens: 32000, inputPrice: 0.315, outputPrice: 1.26 },
      'deepseek-ai/DeepSeek-V2.5': { displayName: 'DeepSeek-V2.5', maxTokens: 64000, inputPrice: 0.3325, outputPrice: 1.33 },
      'Qwen2.5-VL-32B-Instruct': { displayName: 'Qwen2.5-VL-32B-Instruct (视觉)', maxTokens: 32000, inputPrice: 0.4725, outputPrice: 1.89 },
      'Qwen/Qwen3-14B': { displayName: 'Qwen3-14B', maxTokens: 128000, inputPrice: 0.5, outputPrice: 2.0 },
      'Qwen/Qwen3-30B-A3B': { displayName: 'Qwen3-30B-A3B (MoE)', maxTokens: 128000, inputPrice: 0.7, outputPrice: 2.8 },
      'Tongyi-Zhiwen/QwenLong-L1-32B': { displayName: 'QwenLong-L1-32B (长文本)', maxTokens: 128000, inputPrice: 1.0, outputPrice: 4.0 },
      'Qwen/Qwen3-32B': { displayName: 'Qwen3-32B', maxTokens: 128000, inputPrice: 1.0, outputPrice: 4.0 },
      'Qwen/QwQ-32B': { displayName: 'QwQ-32B (推理)', maxTokens: 32000, inputPrice: 1.0, outputPrice: 4.0 },
      'Qwen/Qwen2.5-VL-72B-Instruct': { displayName: 'Qwen2.5-VL-72B-Instruct (视觉)', maxTokens: 128000, inputPrice: 1.0325, outputPrice: 4.13 },
      'Qwen/Qwen2-VL-72B-Instruct': { displayName: 'Qwen2-VL-72B-Instruct (视觉)', maxTokens: 72000, inputPrice: 1.0325, outputPrice: 4.13 },
      'Qwen/Qwen2.5-72B-Instruct-128K': { displayName: 'Qwen2.5-72B-Instruct-128K', maxTokens: 128000, inputPrice: 1.0325, outputPrice: 4.13 },
      'Qwen/Qwen2.5-72B-Instruct': { displayName: 'Qwen2.5-72B-Instruct', maxTokens: 32000, inputPrice: 1.0325, outputPrice: 4.13 },
      'deepseek-ai/DeepSeek-V3': { displayName: 'DeepSeek-V3 (强大)', maxTokens: 64000, inputPrice: 2.0, outputPrice: 8.0 },
      'Qwen/QVQ-72B-Preview': { displayName: 'QVQ-72B-Preview (视觉推理)', maxTokens: 32000, inputPrice: 2.475, outputPrice: 9.9 },
      'Qwen/Qwen3-235B-A22B': { displayName: 'Qwen3-235B-A22B (MoE)', maxTokens: 128000, inputPrice: 2.5, outputPrice: 10.0 },
      'deepseek-ai/DeepSeek-R1': { displayName: 'DeepSeek-R1 (推理之王)', maxTokens: 128000, inputPrice: 4.0, outputPrice: 16.0 }
    }
  },
  qwen: {
    models: {
      // 按输出价格排序 ¥0.002 - ¥0.12 (阿里云价格)
      'qwen-turbo': { displayName: 'Qwen Turbo (经济快速)', maxTokens: 8192, inputPrice: 0.3, outputPrice: 0.6 },
      'qwen2.5-7b-instruct': { displayName: 'Qwen2.5-7B-Instruct (开源)', maxTokens: 32768, inputPrice: 0.5, outputPrice: 1.0 },
      'qwen2.5-14b-instruct': { displayName: 'Qwen2.5-14B-Instruct (开源)', maxTokens: 32768, inputPrice: 1.0, outputPrice: 2.0 },
      'qwen2.5-32b-instruct': { displayName: 'Qwen2.5-32B-Instruct (开源)', maxTokens: 32768, inputPrice: 2.0, outputPrice: 4.0 },
      'qwen-plus': { displayName: 'Qwen Plus (推荐)', maxTokens: 32768, inputPrice: 4.0, outputPrice: 8.0 },
      'qwen2.5-72b-instruct': { displayName: 'Qwen2.5-72B-Instruct (开源大模型)', maxTokens: 32768, inputPrice: 4.0, outputPrice: 8.0 },
      'qwen-max': { displayName: 'Qwen Max (最强大)', maxTokens: 8192, inputPrice: 20.0, outputPrice: 60.0 }
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
    return config ? Object.keys(config.models) : [];
  }

  /**
   * 获取指定模型的显示名称
   * @param provider 提供商名称
   * @param model 模型名称
   * @returns 显示名称
   */
  public static getModelDisplayName(provider: string, model: string): string {
    if (provider === 'self-define') {
      return model; // 自定义模型直接返回模型名
    }
    
    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    if (config && config.models) {
      const modelConfig = (config.models as Record<string, ModelConfig>)[model];
      if (modelConfig) {
        return modelConfig.displayName;
      }
    }
    return model; // 默认返回模型名
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
    if (config && config.models) {
      const modelConfig = (config.models as Record<string, ModelConfig>)[model];
      if (modelConfig) {
        return modelConfig.maxTokens;
      }
    }
    return 4096; // 默认值
  }

  /**
   * 获取指定模型的价格信息
   * @param provider 提供商名称
   * @param model 模型名称
   * @returns 价格信息 {inputPrice, outputPrice}
   */
  public static getModelPricing(provider: string, model: string): { inputPrice: number; outputPrice: number } {
    if (provider === 'self-define') {
      return { inputPrice: 0, outputPrice: 0 }; // 自定义提供商无价格信息
    }
    
    const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    if (config && config.models) {
      const modelConfig = (config.models as Record<string, ModelConfig>)[model];
      if (modelConfig) {
        return { inputPrice: modelConfig.inputPrice, outputPrice: modelConfig.outputPrice };
      }
    }
    return { inputPrice: 0, outputPrice: 0 }; // 默认值
  }

  /**
   * 格式化价格显示
   * @param inputPrice 输入价格
   * @param outputPrice 输出价格
   * @returns 格式化的价格字符串 "$a(I)/$b(O)"
   */
  public static formatPricing(inputPrice: number, outputPrice: number): string {
    if (inputPrice === 0 && outputPrice === 0) {
      return '';
    }
    return `$${inputPrice.toFixed(2)}(I)/$${outputPrice.toFixed(2)}(O)`;
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