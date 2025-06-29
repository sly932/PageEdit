import { ILLMService, LLMRequestConfig } from './ILLMService';
import { LLMRequest } from '../types';

interface AnthropicResponse {
  content: Array<{
    text: string;
    type: string;
  }>;
}

/**
 * Anthropic服务实现
 * 使用Claude API，格式与OpenAI有显著差异
 */
export class AnthropicService implements ILLMService {
  private readonly apiKey = 'sk-DGg062ba2abd660cc4f6c6602d49343a00f24a78ed5g9lPH'; // TODO: 硬编码，后续需要配置化
  private readonly baseUrl = 'https://api.gptsapi.net/v1';

  /**
   * 发送聊天请求到Anthropic Claude
   */
  public async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    // Claude API要求将系统消息单独处理，不放在messages数组中
    const requestBody = {
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: request.messages,
      // Claude需要单独的system字段处理系统消息
      ...(request.systemMessage && { system: request.systemMessage })
    };

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'anthropic-version': '2023-06-01' // Claude API需要版本头
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as AnthropicResponse;
    
    if (!data.content || data.content.length === 0) {
      throw new Error('No response from Anthropic');
    }

    // Claude返回的是content数组，取第一个text内容
    const textContent = data.content.find(item => item.type === 'text');
    if (!textContent) {
      throw new Error('No text content in Anthropic response');
    }

    return textContent.text;
  }

  /**
   * 获取提供商名称
   */
  public getProviderName(): string {
    return 'Anthropic';
  }
} 