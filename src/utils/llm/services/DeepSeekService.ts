import { ILLMService, LLMRequestConfig } from './ILLMService';
import { LLMRequest } from '../types';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * DeepSeek服务实现
 * 使用OpenAI兼容格式
 */
export class DeepSeekService implements ILLMService {
  private readonly apiKey = 'sk-a34af92e6e764ca391beb02a574c9889'; // TODO: 硬编码，后续需要配置化
  private readonly baseUrl = 'https://api.deepseek.com/v1';

  /**
   * 发送聊天请求到DeepSeek
   */
  public async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is required');
    }

    // DeepSeek使用OpenAI兼容格式，将系统消息放在messages数组中
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
      throw new Error(`DeepSeek API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as DeepSeekResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from DeepSeek');
    }

    return data.choices[0].message.content;
  }

  /**
   * 获取提供商名称
   */
  public getProviderName(): string {
    return 'DeepSeek';
  }
} 