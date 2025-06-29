import { ILLMService } from './services/ILLMService';
import { OpenAIService } from './services/OpenAIService';
import { SelfDefineService } from './services/SelfDefineService';
import { CustomConfig } from './types';

/**
 * LLM服务工厂
 * 根据提供商名称返回相应的服务实例
 */
export class LLMFactory {
  private static serviceInstances: Map<string, ILLMService> = new Map();

  /**
   * 获取LLM服务实例
   * @param provider 提供商名称
   * @param customConfig 自定义配置（仅当provider为self-define时需要）
   * @returns LLM服务实例
   */
  public static getService(provider: string, customConfig?: CustomConfig): ILLMService {
    // 对于自定义服务，每次都创建新实例，因为配置可能不同
    if (provider === 'self-define') {
      if (!customConfig) {
        throw new Error('Custom config is required for self-define provider');
      }
      return new SelfDefineService(customConfig);
    }

    // 如果已经有缓存的实例，直接返回
    if (this.serviceInstances.has(provider)) {
      return this.serviceInstances.get(provider)!;
    }

    // 根据提供商创建相应的服务实例
    let service: ILLMService;
    
    switch (provider.toLowerCase()) {
      case 'openai':
        service = new OpenAIService();
        break;
      
      case 'anthropic':
        // TODO: 实现AnthropicService
        throw new Error('Anthropic service not implemented yet');
      
      case 'deepseek':
        // TODO: 实现DeepSeekService
        throw new Error('DeepSeek service not implemented yet');
      
      case 'google':
        // TODO: 实现GoogleService
        throw new Error('Google service not implemented yet');
      
      default:
        // 默认返回OpenAI服务
        console.warn(`Unknown provider: ${provider}, falling back to OpenAI`);
        service = new OpenAIService();
    }

    // 缓存服务实例
    this.serviceInstances.set(provider, service);
    
    return service;
  }

  /**
   * 获取所有支持的提供商列表
   * @returns 提供商名称数组
   */
  public static getSupportedProviders(): string[] {
    return ['openai', 'anthropic', 'deepseek', 'google', 'self-define'];
  }

  /**
   * 检查提供商是否受支持
   * @param provider 提供商名称
   * @returns 是否支持
   */
  public static isProviderSupported(provider: string): boolean {
    return this.getSupportedProviders().includes(provider.toLowerCase());
  }

  /**
   * 清除缓存的服务实例（用于测试或重置）
   */
  public static clearCache(): void {
    this.serviceInstances.clear();
  }
} 