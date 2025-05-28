import { Message, Modification, UserInput } from '../types';
import { ElementLocator } from '../utils/dom/elementLocator';
import { StyleModifier } from '../utils/dom/styleModifier';
import { LayoutManager } from '../utils/dom/layoutManager';
import { HistoryManager } from '../utils/storage/historyManager';

console.log('PageEdit: Content script loaded');

/**
 * Content Script的主要类
 * 处理页面修改和与popup的通信
 */
class ContentManager {
    constructor() {
        // 初始化消息监听
        this.initializeMessageListener();
    }

    /**
     * 初始化消息监听器
     */
    private initializeMessageListener(): void {
        console.log('PageEdit: Initializing message listener');
        chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
            console.log('PageEdit: Received message:', message);
            switch (message.type) {
                case 'MODIFY_PAGE':
                    console.log('PageEdit: Handling MODIFY_PAGE message');
                    this.handleModifyPage(message.data);
                    break;
                case 'UNDO':
                    console.log('PageEdit: Handling UNDO message');
                    this.handleUndo();
                    break;
            }
        });
    }

    /**
     * 处理页面修改请求
     * @param data 修改数据
     */
    private async handleModifyPage(data: { text: string }): Promise<void> {
        console.log('PageEdit: Handling modify page request:', data);
        try {
            // 解析用户输入
            const modification = await this.parseUserInput(data.text);
            console.log('PageEdit: Parsed modification:', modification);
            if (!modification) {
                console.log('PageEdit: No modification generated');
                return;
            }

            // 定位目标元素
            const element = document.querySelector(modification.target) as HTMLElement;
            console.log('PageEdit: Target element:', element);
            if (!element) {
                console.error('PageEdit: Target element not found:', modification.target);
                return;
            }

            // 根据修改类型应用不同的修改
            let success = false;
            switch (modification.type) {
                case 'style':
                    console.log('PageEdit: Applying style modification');
                    success = StyleModifier.modifyStyle({
                        element,
                        property: modification.property,
                        value: modification.value
                    });
                    break;
                case 'layout':
                    console.log('PageEdit: Applying layout modification');
                    success = this.applyLayoutModification(element, modification);
                    break;
            }

            console.log('PageEdit: Modification success:', success);
            if (success) {
                // 保存修改历史
                await HistoryManager.saveModification(modification);
                console.log('PageEdit: Modification saved to history');
            }
        } catch (error) {
            console.error('PageEdit: Failed to modify page:', error);
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
            if (!lastModification) return;

            // 定位目标元素
            const element = document.querySelector(lastModification.target) as HTMLElement;
            if (!element) return;

            // 根据修改类型撤销
            switch (lastModification.type) {
                case 'style':
                    StyleModifier.restoreStyle(
                        element,
                        lastModification.property,
                        '' // 清空样式值
                    );
                    break;
                case 'layout':
                    // 撤销布局修改
                    this.undoLayoutModification(element, lastModification);
                    break;
            }
        } catch (error) {
            console.error('Failed to undo modification:', error);
        }
    }

    /**
     * 撤销布局修改
     * @param element 目标元素
     * @param modification 修改对象
     */
    private undoLayoutModification(element: HTMLElement, modification: Modification): void {
        try {
            switch (modification.property) {
                case 'flex':
                case 'grid':
                    element.style.display = '';
                    element.style.flexDirection = '';
                    element.style.justifyContent = '';
                    element.style.alignItems = '';
                    element.style.gap = '';
                    break;
                case 'size':
                    element.style.width = '';
                    element.style.height = '';
                    element.style.minWidth = '';
                    element.style.maxWidth = '';
                    break;
                case 'spacing':
                    element.style.margin = '';
                    element.style.padding = '';
                    element.style.gap = '';
                    break;
                case 'position':
                    element.style.position = '';
                    element.style.top = '';
                    element.style.left = '';
                    element.style.zIndex = '';
                    break;
            }
        } catch (error) {
            console.error('Failed to undo layout modification:', error);
        }
    }

    /**
     * 解析用户输入
     * @param text 用户输入的自然语言
     * @returns 修改对象
     */
    private async parseUserInput(text: string): Promise<Modification | null> {
        // TODO: 实现自然语言解析
        // 这里先使用简单的硬编码示例
        if (text.includes('背景') && text.includes('蓝色')) {
            return {
                id: Date.now().toString(),
                type: 'style',
                target: 'body',
                property: 'background-color',
                value: 'blue',
                timestamp: Date.now()
            };
        }
        if (text.includes('弹性布局')) {
            return {
                id: Date.now().toString(),
                type: 'layout',
                target: '#container',
                property: 'flex',
                value: 'row',
                options: {
                    justify: 'center',
                    align: 'center',
                    gap: '10px'
                },
                timestamp: Date.now()
            };
        }
        return null;
    }
}

// 初始化ContentManager
new ContentManager(); 