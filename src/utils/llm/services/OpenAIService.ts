import { ILLMService, LLMRequestConfig } from './ILLMService';
import { LLMRequest } from '../types';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * OpenAI服务实现
 */
export class OpenAIService implements ILLMService {
  private readonly apiKey = 'sk-your-openai-api-key'; // TODO: 硬编码，后续需要配置化
  private readonly baseUrl = 'https://api.openai.com/v1';

  /**
   * 发送聊天请求到OpenAI
   */
  public async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // OpenAI将系统消息放在messages数组中
    const messages = request.systemMessage 
      ? [{ role: 'system', content: request.systemMessage }, ...request.messages]
      : request.messages;

    const requestBody = {
      model: config.model,
      messages: messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as OpenAIResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    return data.choices[0].message.content;
  }

  /**
   * 获取提供商名称
   */
  public getProviderName(): string {
    return 'OpenAI';
  }

  /**
   * 获取支持的模型列表
   */
  public getSupportedModels(): string[] {
    return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }

  /**
   * 获取指定模型的最大Token数
   */
  public getMaxTokensForModel(model: string): number {
    const maxTokens: Record<string, number> = {
      'gpt-4': 4096,
      'gpt-4-turbo': 4096,
      'gpt-3.5-turbo': 4096
    };
    
    return maxTokens[model] || 4096;
  }
} 