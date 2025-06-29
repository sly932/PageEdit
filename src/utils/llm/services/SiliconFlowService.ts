import { ILLMService, LLMRequestConfig } from './ILLMService';
import { LLMRequest } from '../types';

interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * SiliconFlow服务实现
 */
export class SiliconFlowService implements ILLMService {
  private readonly apiKey = 'sk-bobcetbxglmfupyagbdzcwknbakuxqbmfkhmokmzvaweekpd'; // TODO: 硬编码，后续需要配置化
  private readonly baseUrl = 'https://api.siliconflow.cn/v1';

  /**
   * 发送聊天请求到SiliconFlow
   */
  public async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
    if (!this.apiKey) {
      throw new Error('SiliconFlow API key is required');
    }

    // SiliconFlow采用OpenAI兼容格式，将系统消息放在messages数组中
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
      throw new Error(`SiliconFlow API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as SiliconFlowResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from SiliconFlow');
    }

    return data.choices[0].message.content;
  }

  /**
   * 获取提供商名称
   */
  public getProviderName(): string {
    return 'SiliconFlow';
  }
} 