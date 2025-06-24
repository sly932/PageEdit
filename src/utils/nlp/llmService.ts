import { NLPResult } from './types';
import fetch from 'node-fetch';

/**
 * LLM提供商类型
 */
export type LLMProvider = 'openai' | 'claude';

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
            return await this.callAPI(input, htmlContext);
        } catch (error) {
            console.error('Error processing input:', error);
            throw error;
        }
    }

    /**
     * 调用LLM API
     * @param input 用户输入
     * @param htmlContext 当前页面的HTML内容
     * @returns API响应内容
     */
    private async callAPI(input: string, htmlContext: string): Promise<string> {
        switch (this.config.provider) {
            case 'openai':
                return this.callOpenAI(input, htmlContext);
            case 'claude':
                return this.callClaude(input, htmlContext);
            default:
                throw new Error(`Unsupported provider: ${this.config.provider}`);
        }
    }

    /**
     * 调用OpenAI API
     * @param input 用户输入
     * @param htmlContext 当前页面的HTML内容
     * @returns API响应内容
     */
    private async callOpenAI(input: string, htmlContext: string): Promise<string> {
        if (!this.config.apiKey) {
            throw new Error('OpenAI API key is required');
        }

        const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
        const prompt = `
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

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    {
                        role: 'system',
                        content: prompt
                    },
                    {
                        role: 'user',
                        content: input
                    }
                ],
                max_tokens: 30000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API request failed: ${response.statusText}`);
        }

        const data = await response.json() as {
            choices: Array<{ message: { content: string } }>;
        };
        return data.choices[0].message.content;
    }

    /**
     * 调用Claude API
     * @param input 用户输入
     * @param htmlContext 当前页面的HTML内容
     * @returns API响应内容
     */
    private async callClaude(input: string, htmlContext: string): Promise<string> {
        if (!this.config.apiKey) {
            throw new Error('Claude API key is required');
        }

        const baseUrl = this.config.baseUrl || 'https://api.anthropic.com/v1';
        const systemPrompt = `
请根据以下HTML内容和用户指令，生成相应的CSS样式修改操作：

HTML内容:
${htmlContext}

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

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`,
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    {
                        role: 'user',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: input
                    }
                ],
                system: systemPrompt,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            console.error('Claude API request failed:', response);
            throw new Error(`Claude API request failed: ${response.statusText}`);
        }

        const data = await response.json() as {
            choices: Array<{ message: { content: string } }>;
        };
        return data.choices[0].message.content;
    }
} 