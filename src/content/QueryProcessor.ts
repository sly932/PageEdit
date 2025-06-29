import { Modification, ModificationMethod, ParseResult } from '../types/index';
import { ConfigManager } from '../utils/llm/ConfigManager';
import { PromptManager } from '../utils/llm/PromptManager';
import { LLMFactory } from '../utils/llm/LLMFactory';

/**
 * 自然语言处理结果接口
 */
interface NLPResult {
    target: string;          // 目标元素选择器
    property: string;        // CSS属性
    value: string;          // 属性值
    confidence: number;     // 置信度 (0-1)
    method: ModificationMethod;
    source: 'llm';          // 处理来源 (移除rule，只保留llm)
}

/**
 * 查询处理器
 * 负责协调整个处理流程
 */
export class QueryProcessor {
    /**
     * 处理用户输入
     * @param text 用户输入的自然语言文本
     * @param htmlContext 页面HTML上下文（暂不使用）
     * @param options 处理选项
     * @returns 解析结果
     */
    public static async processInput(
        text: string,
        htmlContext: string,
        options: {
            minConfidence?: number; // 最小置信度
        } = {}
    ): Promise<ParseResult> {
        try {
            const { minConfidence = 0.6 } = options;
            
            // 1. 获取LLM配置
            const config = await ConfigManager.getLLMConfig();
            console.log('[QueryProcessor] Using LLM config:', config);

            // 2. 构建LLM请求
            const request = PromptManager.buildRequest(text);
            
            // 3. 获取LLM服务
            const llmService = LLMFactory.getService(config.provider, config.customConfig);
            
            // 4. 调用LLM服务
            console.log('[QueryProcessor] Calling LLM service...');
            const startTime = Date.now();
            
            const response = await llmService.chat(request, {
                model: config.model,
                maxTokens: config.maxTokens,
                temperature: config.temperature
            });
            
            const endTime = Date.now();
            console.log(`[QueryProcessor] LLM response time: ${endTime - startTime}ms`);
            console.log('[QueryProcessor] Raw LLM response:', response);

            // 5. 解析LLM响应
            const results = this.parseLLMResponse(response);
            console.log('[QueryProcessor] Parsed results:', results);

            // 6. 过滤低置信度结果
            const filteredResults = results.filter(result => result.confidence >= minConfidence);

            if (filteredResults.length === 0) {
                return {
                    modifications: [],
                    success: false,
                    error: 'No valid modifications found with sufficient confidence'
                };
            }

            // 7. 创建修改对象列表
            const modifications = filteredResults.map(result => this.createModification(result));
            
            return {
                modifications,
                success: true
            };

        } catch (error) {
            console.error('[QueryProcessor] Failed to process input:', error);
            return {
                modifications: [],
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 解析LLM响应
     * @param response LLM原始响应
     * @returns NLP结果数组
     */
    private static parseLLMResponse(response: string): NLPResult[] {
        try {
            // 清理响应文本，移除可能的markdown代码块标记
            let cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // 解析JSON
            const parsedResults = JSON.parse(cleanedResponse);
            
            if (!Array.isArray(parsedResults)) {
                console.warn('[QueryProcessor] LLM response is not an array');
                return [];
            }

            return parsedResults.map((result: any) => ({
                target: result.target || '',
                property: result.property || '',
                value: result.value || '',
                confidence: result.confidence || 0,
                method: result.method || 'style',
                source: 'llm'
            }));

        } catch (error) {
            console.error('[QueryProcessor] Failed to parse LLM response:', error);
            return [];
        }
    }

    /**
     * 创建修改对象
     * @param result NLP结果
     * @returns 修改对象
     */
    private static createModification(result: NLPResult): Modification {
        return {
            type: 'style', // 默认类型
            target: result.target,
            property: result.property,
            value: result.value,
            method: result.method,
            location: {
                selector: result.target,
                method: 'selector',
                confidence: result.confidence
            }
        };
    }
} 