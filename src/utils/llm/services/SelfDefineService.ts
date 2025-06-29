import { ILLMService, LLMRequestConfig } from './ILLMService';
import { LLMRequest, CustomConfig } from '../types';

interface SelfDefineResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * 自定义服务实现
 * 支持用户自定义的LLM服务配置
 */
export class SelfDefineService implements ILLMService {
  constructor(private customConfig: CustomConfig) {}

  /**
   * 发送聊天请求到自定义LLM服务
   */
  public async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
    if (!this.customConfig.apiKey) {
      throw new Error('Custom API key is required');
    }

    if (!this.customConfig.baseUrl) {
      throw new Error('Custom base URL is required');
    }

    // 假设使用OpenAI兼容格式（大多数自定义LLM服务都兼容此格式）
    const messages = request.systemMessage 
      ? [{ role: 'system', content: request.systemMessage }, ...request.messages]
      : request.messages;

    const requestBody = {
      model: config.model,
      messages: messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature
    };

    const response = await fetch(`${this.customConfig.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.customConfig.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Custom LLM API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as SelfDefineResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from custom LLM service');
    }

    return data.choices[0].message.content;
  }

  /**
   * 获取提供商名称
   */
  public getProviderName(): string {
    return 'Self Define';
  }

} 