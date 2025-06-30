import { ILLMService, LLMRequestConfig } from './ILLMService';
import { LLMRequest } from '../types';

interface GoogleResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Google服务实现
 */
export class GoogleService implements ILLMService {
  private readonly apiKey = 'sk-DGg062ba2abd660cc4f6c6602d49343a00f24a78ed5g9lPH'; // TODO: 硬编码，后续需要配置化
  private readonly baseUrl = 'https://api.gptsapi.net/v1';

  /**
   * 发送聊天请求到Google
   */
  public async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google API key is required');
    }

    // Google将系统消息放在messages数组中
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
      throw new Error(`Google API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as GoogleResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Google');
    }

    return data.choices[0].message.content;
  }

  /**
   * 获取提供商名称
   */
  public getProviderName(): string {
    return 'Google';
  }


} 