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
        // if (!LLMService.instance) {
        //     LLMService.instance = new LLMService(config);
        // }
        LLMService.instance = new LLMService(config);
        return LLMService.instance;
    }

    /**
     * 处理自然语言输入
     * @param input 用户输入
     * @param htmlContext 当前页面的HTML内容
     * @returns 处理结果
     */
    public async processInput(input: string, htmlContext: string): Promise<NLPResult | null> {
        try {
            return await this.callAPI(input, htmlContext);
        } catch (error) {
            console.error('Error processing input:', error);
            return null;
        }
    }

    /**
     * 调用LLM API
     * @param input 用户输入
     * @param htmlContext 当前页面的HTML内容
     * @returns API响应
     */
    private async callAPI(input: string, htmlContext: string): Promise<NLPResult | null> {
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
     * @returns API响应
     */
    private async callOpenAI(input: string, htmlContext: string): Promise<NLPResult | null> {
        if (!this.config.apiKey) {
            throw new Error('OpenAI API key is required');
        }

        const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
        const prompt = `
            请根据以下HTML内容和用户指令，生成相应的CSS样式修改操作：

            HTML内容:
            ${htmlContext}

            用户指令: "${input}"
            
            请以 JSON 格式返回，包含以下字段：
            - target: 目标元素选择器（英文，如 'body', 'h1', 'p', '.class', '#id'）
            - property: CSS 属性名（英文，如 'background-color', 'font-size', 'color'）
            - value: CSS 属性值（英文，如 'blue', '16px', 'red'）
            - confidence: 置信度 (0-1)
            
            示例输出:
            {
                "target": "body",
                "property": "background-color",
                "value": "blue",
                "confidence": 0.95
            }
            
            注意：
            1. 字体大小应该根据实际需求选择合适的值（如 '16px', '20px', '24px' 等）
            2. 选择器应该基于提供的HTML内容，选择最精确的目标元素
            3. 如果用户没有明确指定具体元素，应该根据上下文选择最合适的元素
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
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API request failed: ${response.statusText}`);
        }

        const data = await response.json() as {
            choices: Array<{ message: { content: string } }>;
        };
        const content = data.choices[0].message.content;
        
        try {
            const result = JSON.parse(content);
            return {
                target: result.target,
                property: result.property,
                value: result.value,
                confidence: result.confidence || 0.8,
                explanation: result.explanation || 'Processed by OpenAI'
            };
        } catch (error) {
            console.error('Error parsing OpenAI response:', error);
            return null;
        }
    }

    /**
     * 调用Claude API
     * @param input 用户输入
     * @param htmlContext 当前页面的HTML内容
     * @returns API响应
     */
    private async callClaude(input: string, htmlContext: string): Promise<NLPResult | null> {
        if (!this.config.apiKey) {
            throw new Error('Claude API key is required');
        }

        const baseUrl = this.config.baseUrl || 'https://api.anthropic.com/v1';
        const systemPrompt = `
            # 角色
            你是一个专业的网页样式助手。请根据以下HTML内容和用户指令，生成相应的CSS样式修改操作。
            你必须以JSON格式返回结果，不要添加任何其他解释或对话。

            # HTML内容:
            ${htmlContext}

            # 用户指令
            ${input}
            
            请以 JSON 格式返回，包含以下字段：
            - target: 目标元素选择器（英文，如 'body', 'h1', 'p', '.class', '#id'）
            - property: CSS 属性名（英文，如 'background-color', 'font-size', 'color'）
            - value: CSS 属性值（英文，如 'blue', '16px', 'red'）
            - confidence: 置信度 (0-1)
            
            示例输出:
            {
                "target": "body",
                "property": "background-color",
                "value": "blue",
                "confidence": 0.95
            }
            
            注意：
            1. 字体大小应该根据实际需求选择合适的值（如 '16px', '20px', '24px' 等）
            2. 选择器应该基于提供的HTML内容，选择最精确的目标元素
            3. 如果用户没有明确指定具体元素，应该根据上下文选择最合适的元素
            4. 必须返回JSON格式，不要添加任何其他文本
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

        // const data = await response.json() as {
        //     content: Array<{ text: string }>;
        // };

        
        // const content = data.content[0].text;
        const data = await response.json() as {
            choices: Array<{ message: { content: string } }>;
        };
        const content = data.choices[0].message.content;
        // console.log('Claude response:', data);
        // console.log('Claude content:', content);
        
        try {
            // 尝试从响应中提取JSON部分
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            
            const result = JSON.parse(jsonMatch[0]);
            return {
                target: result.target,
                property: result.property,
                value: result.value,
                confidence: result.confidence || 0.8,
                explanation: result.explanation || 'Processed by Claude'
            };
        } catch (error) {
            console.error('Error parsing Claude response:', error);
            return null;
        }
    }
} 