import { LLMRequest } from '../types';

/**
 * LLM请求配置接口
 */
export interface LLMRequestConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

/**
 * 统一的LLM服务接口
 * 所有LLM提供商必须实现此接口
 */
export interface ILLMService {
  /**
   * 发送聊天请求到LLM
   * @param request 包含消息列表和系统消息的请求对象
   * @param config 请求配置
   * @returns 返回LLM的响应文本
   */
  chat(request: LLMRequest, config: LLMRequestConfig): Promise<string>;

  /**
   * 获取提供商名称
   * @returns 提供商名称
   */
  getProviderName(): string;
} 