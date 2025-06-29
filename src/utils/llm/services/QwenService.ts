import { ILLMService, LLMRequestConfig } from './ILLMService';
import { LLMRequest } from '../types';

interface QwenResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Qwen服务实现
 * 使用阿里云Dashscope API，采用OpenAI兼容格式
 */
export class QwenService implements ILLMService {
  private readonly apiKey = 'sk-09e598f975304955965b81742ee8ec3c'; // TODO: 硬编码，后续需要配置化
  private readonly baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

  /**
   * 发送聊天请求到Qwen
   */
  public async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Qwen API key is required');
    }

    // Qwen使用OpenAI兼容格式，将系统消息放在messages数组中
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
      throw new Error(`Qwen API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as QwenResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Qwen');
    }

    return data.choices[0].message.content;
  }

  /**
   * 获取提供商名称
   */
  public getProviderName(): string {
    return 'Qwen';
  }
} 