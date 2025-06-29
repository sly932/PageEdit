import { LLMMessage, LLMRequest } from './types';

/**
 * 提示词管理器
 * 统一管理所有LLM服务使用的提示词模板
 */
export class PromptManager {
  /**
   * 获取系统消息
   * @returns 系统消息内容
   */
  public static getSystemMessage(): string {
    return `
请根据用户指令，生成相应的CSS样式修改操作。

请以 JSON 数组格式返回，每个对象包含以下字段：
- target: 目标元素选择器（英文，如 'body', 'h1', 'p', '.class', '#id'）
- property: CSS 属性名（英文，如 'background-color', 'font-size', 'color'）
- value: CSS 属性值（英文，如 'blue', '16px', 'red'）
- confidence: 置信度 (0-1)
- method: 修改方法，值为 "style" 或 "DOM"
  - "style": 适用于通过样式表修改的属性，包括伪类和伪元素
  - "DOM": 适用于需要直接修改DOM元素的属性或特殊样式需求

示例输出:
[
    {
        "target": "body",
        "property": "background-color",
        "value": "blue",
        "confidence": 0.95,
        "method": "style"
    },
    {
        "target": "h1",
        "property": "color",
        "value": "white",
        "confidence": 0.9,
        "method": "style"
    },
    {
        "target": "#special-button",
        "property": "disabled",
        "value": "true",
        "confidence": 0.85,
        "method": "DOM"
    }
]

修改指南:
1. 使用 "style" 方法的情况:
   - 全局样式修改（如整体主题、颜色方案）
   - 涉及伪类/伪元素的修改（如 :hover, ::before）
   - 批量修改多个相同类型的元素
   - 需要使用CSS特性（如媒体查询、动画）
   - 优先级管理（使用 !important）

2. 使用 "DOM" 方法的情况:
   - 针对特定单一元素的修改
   - 需要动态计算的样式值
   - 临时性样式变化
   - 非CSS属性修改（如HTML属性、DOM属性）
   - 需要立即获取计算样式的情况
   - 使用特定DOM API功能（如classList）

注意：
1. 字体大小应该根据实际需求选择合适的值（如 '16px', '20px', '24px' 等）
2. 选择器应该基于提供的HTML内容，选择最精确的目标元素
3. 如果用户没有明确指定具体元素，应该根据上下文选择最合适的元素
4. 如果用户指令包含多个修改，请返回多个修改对象
5. 对于复杂的选择器和伪类/伪元素，务必使用 "style" 方法
    `.trim();
  }

  /**
   * 格式化用户消息
   * @param userQuery 用户查询内容
   * @returns 格式化的用户消息
   */
  public static formatUserMessage(userQuery: string): LLMMessage {
    return {
      role: 'user',
      content: userQuery
    };
  }

  /**
   * 构建LLM请求对象
   * @param userQuery 用户查询内容
   * @param history 历史对话记录（可选）
   * @returns 完整的LLM请求对象
   */
  public static buildRequest(userQuery: string, history?: LLMMessage[]): LLMRequest {
    const userMessage = this.formatUserMessage(userQuery);
    const messages = history ? [...history, userMessage] : [userMessage];
    
    return {
      messages,
      systemMessage: this.getSystemMessage()
    };
  }
} 