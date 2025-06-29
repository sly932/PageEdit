import { NLPResult } from './types';
import { LLMFactory } from '../llm/LLMFactory';
import { LLMRequest } from '../llm/types';
import { LLMRequestConfig } from '../llm/services/ILLMService';

/**
 * LLM提供商类型
 */
export type LLMProvider = 'openai' | 'claude' | 'deepseek' | 'siliconflow' | 'qwen';

/**
 * LLM服务配置接口
 */
export interface LLMConfig {
    provider: LLMProvider;
    apiKey: string;
    model: string;
    baseUrl?: string;
}

/**
 * LLM响应接口
 */
interface LLMResponse {
    target: string;
    property: string;
    value: string;
    confidence: number;
    explanation?: string;
}

/**
 * LLM服务类
 * 处理与LLM API的交互
 * 现已重构为使用新架构的服务实现
 */
export class LLMService {
    private static instance: LLMService;
    private config: LLMConfig;
    private readonly defaultConfig: LLMConfig = {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4.1',
        baseUrl: 'https://api.openai.com/v1'
    };

    private constructor(config: Partial<LLMConfig>) {
        this.config = { ...this.defaultConfig, ...config };
    }

    /**
     * 获取LLMService实例
     * @param config 配置对象
     * @returns LLMService实例
     */
    public static getInstance(config: Partial<LLMConfig> = {}): LLMService {
        if (!LLMService.instance) {
            LLMService.instance = new LLMService(config);
        }
        return LLMService.instance;
    }

    /**
     * 处理自然语言输入
     * @param input 用户输入
     * @param htmlContext 当前页面的HTML内容
     * @returns API响应内容
     */
    public async processInput(input: string, htmlContext: string): Promise<string> {
        try {
            // 构建系统提示词
            const systemPrompt = this.buildSystemPrompt(input);
            
            // 构建LLM请求
            const request: LLMRequest = {
                messages: [
                    {
                        role: 'user',
                        content: input
                    }
                ],
                systemMessage: systemPrompt
            };

            // 构建请求配置
            const requestConfig: LLMRequestConfig = {
                model: this.config.model,
                maxTokens: 8192,
                temperature: 0.7
            };

            // 获取对应的LLM服务并调用
            const llmService = LLMFactory.getService(this.config.provider);
            console.log("[llmService][processInput] llmService", llmService);
            console.log("[llmService][processInput] request", request);
            console.log("[llmService][processInput] requestConfig", requestConfig);
            return await llmService.chat(request, requestConfig);
            
        } catch (error) {
            console.error('Error processing input:', error);
            throw error;
        }
    }

    /**
     * 构建系统提示词
     * @param input 用户输入
     * @returns 系统提示词
     */
    private buildSystemPrompt(input: string): string {
        return `
请根据用户指令，生成相应的CSS样式修改操作：

用户指令: "${input}"

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
        `;
    }
} 