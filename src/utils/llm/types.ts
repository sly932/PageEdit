/**
 * LLM消息接口
 * 定义统一的消息格式，兼容不同LLM的role定义
 */
export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * LLM请求接口
 * 包含消息列表和可选的系统消息
 */
export interface LLMRequest {
  messages: LLMMessage[];
  systemMessage?: string; // 某些LLM需要单独的系统消息（如Claude）
}

/**
 * 自定义提供商配置接口
 */
export interface CustomConfig {
  baseUrl: string;
  apiKey: string;
  customModels: string[];
} 