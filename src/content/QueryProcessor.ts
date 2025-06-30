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
        let parsedResults: any;
        
        try {
            // 1. 首先尝试直接解析原始响应
            console.log("[QueryProcessor][parseLLMResponse] trying direct JSON parse...");
            parsedResults = JSON.parse(response.trim());
            console.log("[QueryProcessor][parseLLMResponse] direct parse successful");
            
        } catch (directParseError) {
            console.log("[QueryProcessor][parseLLMResponse] direct parse failed, trying markdown extraction...");
            
            try {
                // 2. 如果直接解析失败，尝试从markdown中提取JSON内容
                const jsonContent = this.extractJsonFromMarkdown(response);
                console.log("[QueryProcessor][parseLLMResponse] extracted JSON content:", jsonContent);
                
                parsedResults = JSON.parse(jsonContent);
                console.log("[QueryProcessor][parseLLMResponse] markdown extraction parse successful");
                
            } catch (extractParseError) {
                console.error('[QueryProcessor] Both direct parse and markdown extraction failed:', {
                    directError: directParseError,
                    extractError: extractParseError
                });
                return [];
            }
        }
        
        try {
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
            console.error('[QueryProcessor] Failed to process parsed results:', error);
            return [];
        }
    }

    /**
     * 从markdown格式的响应中提取JSON内容
     * @param response 原始响应
     * @returns 提取的JSON字符串
     */
    private static extractJsonFromMarkdown(response: string): string {
        // 1. 首先尝试提取```json...```代码块
        const jsonCodeBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
        const jsonMatch = response.match(jsonCodeBlockRegex);
        
        if (jsonMatch && jsonMatch[1]) {
            return jsonMatch[1].trim();
        }
        
        // 2. 如果没有json标记，尝试提取普通的```...```代码块
        const codeBlockRegex = /```\s*([\s\S]*?)\s*```/;
        const codeMatch = response.match(codeBlockRegex);
        
        if (codeMatch && codeMatch[1]) {
            const content = codeMatch[1].trim();
            // 检查内容是否看起来像JSON（以[或{开始）
            if (content.startsWith('[') || content.startsWith('{')) {
                return content;
            }
        }
        
        // 3. 如果没有代码块，尝试直接查找JSON结构
        const jsonStructureRegex = /(\[[\s\S]*\]|\{[\s\S]*\})/;
        const structureMatch = response.match(jsonStructureRegex);
        
        if (structureMatch && structureMatch[1]) {
            return structureMatch[1].trim();
        }
        
        // 4. 最后，返回清理后的原始响应
        return response.trim();
    }

    /**
     * 创建修改对象
     * @param result NLP结果
     * @returns 修改对象
     */
    private static createModification(result: NLPResult): Modification {
        return {
            target: result.target,
            property: result.property,
            value: result.value,
            method: result.method,
            timestamp: Date.now()
        };
    }
} 