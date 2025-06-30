import { ILLMService, LLMRequestConfig } from './ILLMService';
import { LLMRequest, LLMMessage } from '../types';

interface GoogleOriginalResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Google AI服务实现
 * 使用Gemini API，格式与OpenAI/Anthropic不同
 */
export class GoogleServiceOriginal implements ILLMService {
  private readonly apiKey = 'sk-DGg062ba2abd660cc4f6c6602d49343a00f24a78ed5g9lPH'; // TODO: 硬编码，后续需要配置化
  private readonly baseUrl = 'https://api.gptsapi.net/v1';

  /**
   * 发送聊天请求到Google AI Gemini
   */
  public async chat(request: LLMRequest, config: LLMRequestConfig): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google AI API key is required');
    }

    // 转换消息格式为Gemini所需格式
    const contents = this.convertMessages(request.messages, request.systemMessage);

    const requestBody = {
      contents: contents,
      generationConfig: {
        maxOutputTokens: config.maxTokens,
        temperature: config.temperature
      }
    };

    const response = await fetch(`${this.baseUrl}/models/${config.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Google AI API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as GoogleOriginalResponse;
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Google AI');
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('No text content in Google AI response');
    }

    return candidate.content.parts[0].text;
  }

  /**
   * 转换LLM标准消息格式为Gemini API格式
   */
  private convertMessages(messages: LLMMessage[], systemMessage?: string): any[] {
    const contents: any[] = [];

    // 如果有系统消息，作为第一条user消息的一部分
    if (systemMessage) {
      contents.push({
        role: 'user',
        parts: [{ text: systemMessage }]
      });
      // 添加一个简单的model回复来建立对话格式
      contents.push({
        role: 'model',
        parts: [{ text: 'I understand. I will follow these instructions.' }]
      });
    }

    // 转换每条消息
    for (const message of messages) {
      const geminiRole = this.convertRole(message.role);
      contents.push({
        role: geminiRole,
        parts: [{ text: message.content }]
      });
    }

    return contents;
  }

  /**
   * 转换消息角色为Gemini格式
   */
  private convertRole(role: string): string {
    switch (role) {
      case 'user':
        return 'user';
      case 'assistant':
        return 'model';
      case 'system':
        return 'user'; // Gemini没有system角色，转为user
      default:
        return 'user';
    }
  }

  /**
   * 获取提供商名称
   */
  public getProviderName(): string {
    return 'Google';
  }
} 