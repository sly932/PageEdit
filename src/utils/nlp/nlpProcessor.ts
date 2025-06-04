import { Modification, ModificationMethod, ParseResult } from '../../types/index';
import { LLMService, LLMProvider } from './llmService';

/**
 * 自然语言处理结果接口
 */
interface NLPResult {
    target: string;          // 目标元素选择器
    property: string;        // CSS属性
    value: string;          // 属性值
    confidence: number;     // 置信度 (0-1)
    method: ModificationMethod;
    source: 'rule' | 'llm'; // 处理来源
}

/**
 * 自然语言处理模块
 * 支持规则解析和LLM两种处理方式
 */
export class NLPProcessor {
    private static readonly SIMPLE_PATTERNS = [
        // 颜色修改
        /把(.*?)改成(红色|蓝色|绿色|黄色|黑色|白色)/,
        /把(.*?)改为(红色|蓝色|绿色|黄色|黑色|白色)/,
        /把(.*?)变成(红色|蓝色|绿色|黄色|黑色|白色)/,
        // 字体大小
        /把(.*?)改成(大|中|小)号/,
        /把(.*?)改为(大|中|小)号/,
        /把(.*?)变成(大|中|小)号/
    ];

    /**
     * 处理用户输入
     * @param text 用户输入的自然语言文本
     * @param options 处理选项
     * @returns 解析结果
     */
    public static async processInput(
        text: string,
        htmlContext: string,
        options: {
            preferLLM?: boolean;    // 是否优先使用LLM
            minConfidence?: number; // 最小置信度
        } = {}
    ): Promise<ParseResult> {
        try {
            const { preferLLM = true, minConfidence = 0.6 } = options;
            let results: NLPResult[] = [];

            // 1. 如果优先使用LLM，尝试使用LLM
            if (preferLLM) {
                const llmResults = await this.processWithLLM(text, htmlContext);
                if (llmResults.length > 0) {
                    results = llmResults;
                }
            }

            // 2. 如果失败，返回空结果
            if (results.length === 0) {
                return {
                    modifications: [],
                    success: false,
                    error: 'No valid modifications found'
                };
            }

            // 3. 创建修改对象列表
            const modifications = results.map(result => this.createModification(result));
            return {
                modifications,
                success: true
            };
        } catch (error) {
            console.error('Failed to process input:', error);
            return {
                modifications: [],
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 使用规则处理输入
     * @param text 用户输入文本
     * @returns 处理结果
     */
    private static processWithRules(text: string): NLPResult | null {
        // 检查是否匹配简单模式
        for (const pattern of this.SIMPLE_PATTERNS) {
            const match = text.match(pattern);
            if (match) {
                const [_, target, value] = match;
                const { property, processedValue } = this.mapProperty(target, value);
                return {
                    target: this.locateElement(target),
                    property,
                    value: processedValue,
                    confidence: 0.9, // 规则匹配的置信度较高
                    method: 'style',
                    source: 'rule'
                };
            }
        }
        return null;
    }

    /**
     * 使用LLM处理输入
     * @param text 用户输入文本
     * @returns 处理结果数组
     */
    private static async processWithLLM(text: string, htmlContext: string): Promise<NLPResult[]> {
        try {
            const provider = process.env.LLM_PROVIDER || 'openai';
            const openaiConfig = {
                provider: (process.env.LLM_PROVIDER || 'openai') as LLMProvider,
                apiKey: process.env.OPENAI_API_KEY || '',
                model: process.env.OPENAI_MODEL || 'gpt-4.1',
                baseUrl: process.env.OPENAI_API_BASE_URL
            }
            const claudeConfig = {
                provider: (process.env.LLM_PROVIDER || 'claude') as LLMProvider,
                apiKey: process.env.CLAUDE_API_KEY || '',
                model: process.env.CLAUDE_MODEL || 'anthropic.claude-3-opus',
                baseUrl: process.env.CLAUDE_API_BASE_URL
            }
            const config = provider === 'openai' ? openaiConfig : claudeConfig;
            const llmService = LLMService.getInstance(config);
            console.log('[nlpProcessor] LLM service:', llmService);
            const results = await llmService.processInput(text, htmlContext);
            console.log('[nlpProcessor] LLM results:', results);
            // 解析LLM返回的JSON字符串
            let parsedResults;
            try {
                parsedResults = typeof results === 'string' ? JSON.parse(results) : results;
                console.log('[nlpProcessor] Parsed LLM results:', parsedResults);
            } catch (error) {
                console.error('[nlpProcessor] Failed to parse LLM results:', error);
                return [];
            }
            if (parsedResults && Array.isArray(parsedResults)) {
                return parsedResults.map(result => ({
                    target: result.target,
                    property: result.property,
                    value: result.value,
                    confidence: result.confidence,
                    method: result.method,
                    source: 'llm'
                }));
            }
            return [];
        } catch (error) {
            console.error('Failed to process with LLM:', error);
            return [];
        }
    }

    /**
     * 构建LLM提示词
     * @param text 用户输入
     * @returns 提示词
     */
    private static buildPrompt(text: string): string {
        return `
            请将以下自然语言指令转换为网页样式修改操作：
            输入: "${text}"
            
            请以JSON数组格式返回，每个对象包含以下字段：
            - target: 目标元素选择器
            - property: CSS属性名
            - value: CSS属性值
            - confidence: 置信度(0-1)
            
            示例输出:
            [
                {
                    "target": "body",
                    "property": "background-color",
                    "value": "blue",
                    "confidence": 0.95
                },
                {
                    "target": "h1",
                    "property": "color",
                    "value": "white",
                    "confidence": 0.9
                }
            ]
        `;
    }

    /**
     * 创建修改对象
     * @param result 处理结果
     * @returns 修改对象
     */
    private static createModification(result: NLPResult): Modification {
        return {
            id: Date.now().toString(),
            type: 'style',
            target: result.target,
            property: result.property,
            value: result.value,
            method: result.method,
            timestamp: Date.now()
        };
    }

    /**
     * 定位目标元素
     * @param text 目标描述
     * @returns 元素选择器
     */
    private static locateElement(text: string): string {
        if (text.includes('背景')) return 'body';
        if (text.includes('标题')) return 'h1, h2, h3';
        if (text.includes('段落')) return 'p';
        return 'body'; // 默认选择器
    }

    /**
     * 映射CSS属性
     * @param target 目标元素
     * @param value 修改值
     * @returns 属性名和值
     */
    private static mapProperty(target: string, value: string): { property: string; processedValue: string } {
        // 颜色映射
        const colorMap: { [key: string]: string } = {
            '红色': 'red',
            '蓝色': 'blue',
            '绿色': 'green',
            '黄色': 'yellow',
            '黑色': 'black',
            '白色': 'white'
        };

        // 字体大小映射
        const fontSizeMap: { [key: string]: string } = {
            '大': '20px',
            '中': '16px',
            '小': '12px'
        };

        // 检查颜色
        if (colorMap[value]) {
            return {
                property: target.includes('背景') ? 'background-color' : 'color',
                processedValue: colorMap[value]
            };
        }

        // 检查字体大小
        if (fontSizeMap[value]) {
            return {
                property: 'font-size',
                processedValue: fontSizeMap[value]
            };
        }

        // 默认返回
        return {
            property: 'color',
            processedValue: value
        };
    }
} 