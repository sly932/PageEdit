import { Message, Modification, UserInput, ElementLocation, ParseResult } from '../types';
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
class ContentManager {
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
                    this.handleModifyPage(message.data)
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
     * 应用样式修改
     * @param element 目标元素
     * @param modification 修改对象
     * @returns 是否修改成功
     */
    private async applyStyleModification(element: HTMLElement, modification: Modification): Promise<boolean> {
        console.log('[content] PageEdit: Applying style modification:', modification);
        
        // 保存原始值
        modification.originalValue = element.style[modification.property as any] || '';
        
        // 尝试多种样式修改方式
        const success = StyleModifier.modifyStyle({
            element,
            property: modification.property,
            value: modification.value
        }) || StyleModifier.modifyByClass(element, modification.value) ||
             StyleModifier.modifyByCSSRule(modification.target, {
                 [modification.property]: modification.value
             });

        if (!success) {
            console.error('[content] PageEdit: All style modification attempts failed');
        }
        
        return success;
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
     * @param data 修改数据
     */
    private async handleModifyPage(data: { text: string }): Promise<void> {
        console.log('[content] PageEdit: Handling modify page request:', data);
        try {
            // 解析用户输入
            const result = await this.parseUserInput(data.text);
            console.log('[content] PageEdit: Parsed result:', result);
            
            if (!result.success || result.modifications.length === 0) {
                console.log('[content] PageEdit: No modifications generated');
                return;
            }

            // 应用所有修改
            for (const modification of result.modifications) {
                // 查找目标元素
                const { element, location } = await this.findElement(
                    modification.target,
                    modification.location
                );
                
                if (!element) {
                    console.error('[content] PageEdit: Target element not found:', modification.target);
                    continue;
                }

                // 根据修改类型应用不同的修改
                let success = false;
                switch (modification.type) {
                    case 'style':
                        console.log('[content] PageEdit: Applying style modification');
                        success = await this.applyStyleModification(element, modification);
                        break;
                    case 'layout':
                        console.log('[content] PageEdit: Applying layout modification');
                        success = this.applyLayoutModification(element, modification);
                        break;
                }

                console.log('[content] PageEdit: Modification success:', success);
                if (success) {
                    // 保存修改历史
                    await HistoryManager.saveModification({
                        ...modification,
                        location // 添加定位信息到历史记录
                    });
                    console.log('[content] PageEdit: Modification saved to history');
                }
            }
        } catch (error) {
            console.error('[content] PageEdit: Failed to modify page:', error);
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
            // 获取最后一次修改
            const lastModification = await HistoryManager.undoLastModification();
            if (!lastModification) {
                console.log('[content] PageEdit: No modification to undo');
                return;
            }

            // 使用保存的定位信息查找元素
            const { element, location } = await this.findElement(
                lastModification.target,
                lastModification.location
            );
            
            if (!element) {
                console.error('[content] PageEdit: Target element not found for undo:', lastModification.target);
                return;
            }

            // 根据修改类型撤销
            let success = false;
            switch (lastModification.type) {
                case 'style':
                    success = StyleModifier.restoreStyle(
                        element,
                        lastModification.property,
                        lastModification.originalValue || ''
                    );
                    break;
                case 'layout':
                    success = this.undoLayoutModification(element, lastModification);
                    break;
            }

            if (success) {
                console.log('[content] PageEdit: Successfully undone modification with location:', location);
            } else {
                console.error('[content] PageEdit: Failed to undo modification');
            }
        } catch (error) {
            console.error('[content] PageEdit: Failed to undo modification:', error);
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
}

// 初始化ContentManager
new ContentManager(); 