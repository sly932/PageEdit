import { Message, Modification, UserInput, ElementLocation, ParseResult, ModificationMethod, StyleModification } from '../types';
import { ElementLocator } from '../utils/dom/elementLocator';
import { StyleModifier } from '../utils/dom/styleModifier';
import { LayoutManager } from '../utils/dom/layoutManager';
import { HistoryManager } from '../utils/storage/historyManager';
import { NLPProcessor } from '../utils/nlp/nlpProcessor';

console.log('[content] PageEdit: Content script loaded at', new Date().toISOString());

/**
 * Content Script的主要类
 * 处理页面修改和与popup的通信
 */
export class ContentManager {
    private undoStack: Array<{
        element: HTMLElement;
        property: string;
        originalValue: string;
        method: ModificationMethod;
    }> = [];

    constructor() {
        console.log('[content] PageEdit: ContentManager initialized');
        // 初始化消息监听
        this.initializeMessageListener();
    }

    /**
     * 初始化消息监听器
     */
    private initializeMessageListener(): void {
        console.log('[content] PageEdit: Initializing message listener');
        chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
            console.log('[content] PageEdit: Received message:', message, 'from:', sender);
            // 不再立即 sendResponse
            switch (message.type) {
                case 'MODIFY_PAGE':
                    console.log('[content] PageEdit: Handling MODIFY_PAGE message');
                    this.handleModifyPage(message)
                        .then(() => {
                            console.log('[content] PageEdit: Modification completed successfully');
                            sendResponse({ success: true });
                        })
                        .catch(error => {
                            console.error('[content] PageEdit: Error handling MODIFY_PAGE:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                    return true; // 保持消息通道开放
                case 'UNDO':
                    console.log('[content] PageEdit: Handling UNDO message');
                    this.handleUndo()
                        .then(() => {
                            console.log('[content] PageEdit: Undo completed successfully');
                            sendResponse({ success: true });
                        })
                        .catch(error => {
                            console.error('[content] PageEdit: Error handling UNDO:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                    return true; // 保持消息通道开放
            }
        });
    }

    /**
     * 查找目标元素
     * @param target 目标元素标识
     * @param savedLocation 保存的定位信息（可选）
     * @returns 找到的元素和定位信息
     */
    private async findElement(target: string, savedLocation?: ElementLocation): Promise<{ element: HTMLElement | null; location: ElementLocation }> {
        console.log('[content] PageEdit: Finding element:', target);
        
        // 1. 优先使用保存的定位信息
        if (savedLocation) {
            console.log('[content] PageEdit: Using saved location:', savedLocation);
            const element = document.querySelector(savedLocation.selector) as HTMLElement;
            if (element) {
                return { element, location: savedLocation };
            }
        }

        // 2. 尝试选择器定位
        const selectorLocation = ElementLocator.findBySelector(target);
        if (selectorLocation.confidence > 0) {
            const element = document.querySelector(selectorLocation.selector) as HTMLElement;
            if (element) {
                return { element, location: selectorLocation };
            }
        }

        // 3. 尝试文本定位
        const textLocation = ElementLocator.findByText(target);
        if (textLocation.confidence > 0) {
            const element = document.querySelector(textLocation.selector) as HTMLElement;
            if (element) {
                return { element, location: textLocation };
            }
        }

        // 4. 如果target看起来像坐标，尝试坐标定位
        if (/^\d+,\d+$/.test(target)) {
            const [x, y] = target.split(',').map(Number);
            const positionLocation = ElementLocator.findByPosition(x, y);
            if (positionLocation.confidence > 0) {
                const element = document.querySelector(positionLocation.selector) as HTMLElement;
                if (element) {
                    return { element, location: positionLocation };
                }
            }
        }

        console.warn('[content] PageEdit: Failed to find element with any method');
        return { element: null, location: { selector: '', method: 'selector', confidence: 0 } };
    }

    /**
     * 解析用户输入
     * @param text 用户输入的自然语言
     * @returns 解析结果
     */
    private async parseUserInput(text: string): Promise<ParseResult> {
        console.log('[content] PageEdit: Parsing user input:', text);
        try {
            // 获取当前页面的HTML内容
            const htmlContext = document.documentElement.outerHTML;
            console.log('[content] PageEdit: HTML context:', htmlContext);

            // 使用 NLPProcessor 处理用户输入
            const result = await NLPProcessor.processInput(text, htmlContext, {
                preferLLM: true,  // 优先使用 LLM
                minConfidence: 0.6 // 最小置信度
            });

            console.log('[content] PageEdit: Processed result:', result);
            return result;
        } catch (error) {
            console.error('[content] PageEdit: Error parsing user input:', error);
            return {
                modifications: [],
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 处理页面修改请求
     * @param message 修改消息
     */
    private async handleModifyPage(message: Message): Promise<void> {
        try {
            // 解析用户输入
            const parseResult = await this.parseUserInput(message.data.text);
            if (!parseResult.success) {
                throw new Error(parseResult.error || 'Failed to parse user input');
            }

            // 应用所有修改
            for (const modification of parseResult.modifications) {
                try {
                    // 检查是否是伪类或伪元素选择器
                    const isPseudoSelector = modification.target.includes(':') || modification.target.includes('::');
                    
                    if (isPseudoSelector) {
                        // 对于伪类/伪元素，直接应用样式规则
                        const success = StyleModifier.applyModification({
                            property: modification.property,
                            value: modification.value,
                            method: 'style',  // 强制使用 style 方法
                            target: modification.target
                        });
                        
                        if (!success) {
                            throw new Error(`Failed to apply modification: ${modification.property}`);
                        }
                    } else {
                        // 对于普通选择器，查找元素并应用修改
                        const elements = Array.from(document.querySelectorAll(modification.target)) as HTMLElement[];
                        
                        if (elements.length === 0) {
                            console.warn('No elements found for selector:', modification.target);
                            continue;
                        }

                        // 应用修改
                        const success = StyleModifier.applyModification({
                            property: modification.property,
                            value: modification.value,
                            method: modification.method,
                            target: modification.target
                        });
                        
                        if (!success) {
                            throw new Error(`Failed to apply modification: ${modification.property}`);
                        }

                        // 保存所有元素的原始值用于撤销
                        elements.forEach(element => {
                            this.undoStack.push({
                                element,
                                property: modification.property,
                                originalValue: element.style[modification.property as any] || '',
                                method: modification.method
                            });
                        });
                    }
                } catch (error) {
                    console.error('Failed to apply modification:', error);
                    throw error;
                }
            }
        } catch (error) {
            console.error('Failed to handle page modification:', error);
            throw error;
        }
    }

    /**
     * 应用布局修改
     * @param element 目标元素
     * @param modification 修改对象
     * @returns 是否修改成功
     */
    private applyLayoutModification(element: HTMLElement, modification: Modification): boolean {
        try {
            switch (modification.property) {
                case 'flex':
                    return LayoutManager.createFlexContainer(`#${element.id}`, {
                        direction: modification.value as 'row' | 'column',
                        justify: modification.options?.justify as any,
                        align: modification.options?.align as any,
                        gap: modification.options?.gap
                    });
                case 'grid':
                    return LayoutManager.createGridContainer(`#${element.id}`, {
                        columns: modification.options?.columns,
                        rows: modification.options?.rows,
                        gap: modification.options?.gap
                    });
                case 'size':
                    return LayoutManager.setElementSize(`#${element.id}`, {
                        width: modification.options?.width,
                        height: modification.options?.height,
                        minWidth: modification.options?.minWidth,
                        maxWidth: modification.options?.maxWidth
                    });
                case 'spacing':
                    return LayoutManager.setElementSpacing(`#${element.id}`, {
                        margin: modification.options?.margin,
                        padding: modification.options?.padding,
                        gap: modification.options?.gap
                    });
                case 'position':
                    return LayoutManager.setElementPosition(`#${element.id}`, {
                        position: modification.value as any,
                        top: modification.options?.top,
                        left: modification.options?.left,
                        zIndex: modification.options?.zIndex
                    });
                default:
                    return false;
            }
        } catch (error) {
            console.error('Layout modification failed:', error);
            return false;
        }
    }

    /**
     * 处理撤销请求
     */
    private async handleUndo(): Promise<void> {
        try {
            const lastModification = this.undoStack.pop();
            if (lastModification) {
                const success = StyleModifier.restoreStyle(
                    lastModification.element,
                    lastModification.property,
                    lastModification.originalValue,
                    lastModification.method
                );
                if (!success) {
                    throw new Error('Failed to restore style');
                }
            }
        } catch (error) {
            console.error('Failed to handle undo:', error);
            throw error;
        }
    }

    /**
     * 撤销布局修改
     * @param element 目标元素
     * @param modification 修改对象
     * @returns 是否撤销成功
     */
    private undoLayoutModification(element: HTMLElement, modification: Modification): boolean {
        try {
            switch (modification.property) {
                case 'flex':
                case 'grid':
                    element.style.display = '';
                    element.style.flexDirection = '';
                    element.style.justifyContent = '';
                    element.style.alignItems = '';
                    element.style.gap = '';
                    return true;
                case 'size':
                    element.style.width = '';
                    element.style.height = '';
                    element.style.minWidth = '';
                    element.style.maxWidth = '';
                    return true;
                case 'spacing':
                    element.style.margin = '';
                    element.style.padding = '';
                    element.style.gap = '';
                    return true;
                case 'position':
                    element.style.position = '';
                    element.style.top = '';
                    element.style.left = '';
                    element.style.zIndex = '';
                    return true;
                default:
                    return false;
            }
        } catch (error) {
            console.error('[content] PageEdit: Failed to undo layout modification:', error);
            return false;
        }
    }

    private undoLastModification(): void {
        const lastModification = this.undoStack.pop();
        if (lastModification) {
            StyleModifier.restoreStyle(
                lastModification.element,
                lastModification.property,
                lastModification.originalValue,
                lastModification.method
            );
        }
    }
}

// 初始化ContentManager
new ContentManager(); 