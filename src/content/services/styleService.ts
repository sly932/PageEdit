import { StyleModification, ModificationMethod, Modification } from '../../types';
import { Eddy, StyleElementSnapshot, GlobalStyleState } from '../../types/eddy';

/**
 * 样式修改服务
 * 处理页面元素的样式修改，基于样式元素快照管理
 */
export class StyleService {
    /**
     * 获取全局样式状态
     */
    private static getGlobalState(): GlobalStyleState {
        return (window as any).__pageEditGlobalStyleState || {
            currentElements: [],
            undoStack: [],
            redoStack: []
        };
    }

    /**
     * 更新全局样式状态
     */
    private static updateGlobalState(state: Partial<GlobalStyleState>): void {
        const currentState = this.getGlobalState();
        (window as any).__pageEditGlobalStyleState = { ...currentState, ...state };
    }

    /**
     * 创建样式元素快照
     */
    private static createStyleElementSnapshot(
        selector: string, 
        cssText: string
    ): StyleElementSnapshot {
        return {
            id: `style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            selector,
            cssText,
            timestamp: Date.now()
        };
    }

    /**
     * 应用样式元素快照到页面
     */
    private static applyStyleElementSnapshot(snapshot: StyleElementSnapshot): HTMLStyleElement {
        const styleElement = document.createElement('style');
        styleElement.id = snapshot.id;
        styleElement.textContent = snapshot.cssText;
        document.head.appendChild(styleElement);
        return styleElement;
    }

    /**
     * 移除样式元素
     */
    private static removeStyleElement(snapshot: StyleElementSnapshot): void {
        const element = document.getElementById(snapshot.id) as HTMLStyleElement;
        if (element && element.parentNode) {
            element.remove();
        }
    }

    /**
     * 根据修改方法应用样式
     * @param modification 样式修改对象
     * @returns 是否修改成功
     */
    static applyModification(
        modification: Pick<Modification, 'target' | 'property' | 'value' | 'method'>
    ): boolean {
        try {
            const state = this.getGlobalState();
            let currentElements = [...state.currentElements];

            switch (modification.method) {
                case 'style':
                    // 查找是否已存在相同选择器的样式
                    const existingIndex = currentElements.findIndex(
                        element => element.selector === modification.target
                    );

                    if (existingIndex >= 0) {
                        // 更新现有样式
                        const existing = currentElements[existingIndex];
                        const updatedCssText = this.mergeCSSProperties(
                            existing.cssText, 
                            modification.property, 
                            modification.value
                        );
                        currentElements[existingIndex] = {
                            ...existing,
                            cssText: updatedCssText,
                            timestamp: Date.now()
                        };
                    } else {
                        // 创建新样式
                        const newCssText = `${modification.target} { ${modification.property}: ${modification.value}; }`;
                        const snapshot = this.createStyleElementSnapshot(
                            modification.target, 
                            newCssText
                        );
                        currentElements.push(snapshot);
                    }
                    break;

                case 'DOM':
                    // DOM方式直接修改元素，不创建样式快照
                    const elements = Array.from(document.querySelectorAll(modification.target)) as HTMLElement[];
                    return elements.every(element => this.modifyStyle(element, modification.property, modification.value));

                default:
                    console.warn('Unknown modification method:', modification.method);
                    return false;
            }

            // 更新全局状态
            this.updateGlobalState({ currentElements });
            
            // 重新应用所有样式元素到页面
            this.applyAllStyleElements(currentElements);

            return true;
        } catch (error) {
            console.error('Modification failed:', error);
            return false;
        }
    }

    /**
     * 直接修改元素的样式
     * @param element 目标元素
     * @param property 样式属性
     * @param value 样式值
     * @returns 是否修改成功
     */
    static modifyStyle(element: HTMLElement, property: string, value: string): boolean {
        try {
            element.style.setProperty(property, value);
            return true;
        } catch (error) {
            console.error('Style modification failed:', error);
            return false;
        }
    }

    /**
     * 合并CSS属性
     */
    private static mergeCSSProperties(
        existingCss: string, 
        property: string, 
        value: string
    ): string {
        // 简单的CSS合并逻辑
        // 移除现有的属性声明
        const propertyRegex = new RegExp(`${property}\\s*:\\s*[^;]+;?`, 'g');
        const cleanedCss = existingCss.replace(propertyRegex, '');
        
        // 添加新属性
        const cssContent = cleanedCss.replace(/}$/, `  ${property}: ${value};\n}`);
        return cssContent;
    }

    /**
     * 应用所有样式元素到页面
     */
    private static applyAllStyleElements(elements: StyleElementSnapshot[]): void {
        // 清除现有样式元素（只清除DOM，不重置全局状态）
        this.clearAllStyleElementsFromDOM();

        console.log('[StyleService] Applying all style elements:', elements);
        
        // 应用新的样式元素
        elements.forEach(snapshot => {
            this.applyStyleElementSnapshot(snapshot);
        });
    }

    /**
     * 清除所有样式元素
     */
    static clearAllStyleElements(): boolean {
        try {
            console.log('[StyleService] Clearing all style elements');
            
            // 清除所有样式元素
            this.clearAllStyleElementsFromDOM();
            
            // 重置全局状态
            this.updateGlobalState({
                currentElements: [],
                undoStack: [],
                redoStack: []
            });

            console.log('[StyleService] All style elements cleared successfully');
            return true;
        } catch (error) {
            console.error('[StyleService] Clear failed:', error);
            return false;
        }
    }

    /**
     * 从DOM中清除所有样式元素
     */
    private static clearAllStyleElementsFromDOM(): void {
        const state = this.getGlobalState();
        state.currentElements.forEach(snapshot => {
            this.removeStyleElement(snapshot);
        });
    }

    /**
     * 保存当前状态快照
     */
    static saveSnapshot(): void {
        const state = this.getGlobalState();
        const currentSnapshot = [...state.currentElements];
        
        // 添加到undo栈
        const newUndoStack = [...state.undoStack, currentSnapshot];
        
        // 清空redo栈（因为有了新的操作）
        this.updateGlobalState({
            undoStack: newUndoStack,
            redoStack: []
        });

        console.log('[StyleService] Snapshot saved, undo stack size:', newUndoStack.length);
    }

    /**
     * 撤销操作
     */
    static undo(): boolean {
        const state = this.getGlobalState();
        
        if (state.undoStack.length === 0) {
            console.log('[StyleService] Undo stack is empty');
            return false;
        }

        const redoSnapshot = state.undoStack.pop()!;
        state.redoStack.push(redoSnapshot);

        // 检查是否还有更多状态可以撤销
        if (state.undoStack.length === 0) {
            // 如果没有更多状态，先清除所有样式元素
            this.clearAllStyleElementsFromDOM();
            
            // 应用空状态
            this.updateGlobalState({
                currentElements: [],
                undoStack: state.undoStack,
                redoStack: state.redoStack
            });
        } else {
            // 应用undo栈顶端的快照
            const currentSnapshot = state.undoStack[state.undoStack.length - 1];
            this.applyAllStyleElements(currentSnapshot);
            this.updateGlobalState({
                currentElements: currentSnapshot,
                undoStack: state.undoStack,
                redoStack: state.redoStack
            });
            
        }

        //打印两个stack
        console.log('[StyleService] Undo stack:', state.undoStack);
        console.log('[StyleService] Redo stack:', state.redoStack);

        return true;
    }

    /**
     * 重做操作
     */
    static redo(): boolean {
        const state = this.getGlobalState();
        
        if (state.redoStack.length === 0) {
            console.log('[StyleService] Redo stack is empty');
            return false;
        }

        const nextSnapshot = state.redoStack.pop()!;
        state.undoStack.push(nextSnapshot);
        this.applyAllStyleElements(nextSnapshot);

        // 更新全局状态
        this.updateGlobalState({
            currentElements: state.undoStack[state.undoStack.length - 1],
            undoStack: state.undoStack,
            redoStack: state.redoStack
        });
        //打印两个stack
        console.log('[StyleService] Undo stack:', state.undoStack);
        console.log('[StyleService] Redo stack:', state.redoStack);

        return true;
    }

    /**
     * 获取当前状态信息
     */
    static getStateInfo(): { canUndo: boolean; canRedo: boolean; elementCount: number } {
        const state = this.getGlobalState();
        return {
            canUndo: state.undoStack.length > 0,
            canRedo: state.redoStack.length > 0,
            elementCount: state.currentElements.length
        };
    }

    /**
     * 获取当前样式元素
     */
    static getCurrentStyleElements(): StyleElementSnapshot[] {
        const state = this.getGlobalState();
        return [...state.currentElements];
    }

    /**
     * 打印状态信息
     */
    static printStateInfo(): void {
        const state = this.getGlobalState();
        console.log('[StyleService] ===== STATE INFO =====');
        console.log('[StyleService] Current elements:', state.currentElements.length);
        console.log('[StyleService] Undo stack size:', state.undoStack.length);
        console.log('[StyleService] Redo stack size:', state.redoStack.length);
        console.log('[StyleService] ======================');
    }

    /**
     * 应用 Eddy 中的所有修改
     * @param eddy Eddy 对象
     * @returns 是否全部修改成功
     */
    static async applyEddy(eddy: Eddy): Promise<boolean> {
        try {
            // 重置当前状态
            this.clearAllStyleElements();

            if (!eddy.currentStyleElements || eddy.currentStyleElements.length === 0) {
                console.log('[StyleService] No style elements to apply for eddy:', eddy.name);
                // 保存空状态的快照
                this.saveSnapshot();
                return true;
            }

            console.log('[StyleService] Applying', eddy.currentStyleElements.length, 'style elements for eddy:', eddy.name);

            // 设置全局状态
            this.updateGlobalState({
                currentElements: [...eddy.currentStyleElements]
            });

            // 应用样式元素到页面
            eddy.currentStyleElements.forEach(snapshot => {
                this.applyStyleElementSnapshot(snapshot);
            });

            // 保存初始状态快照
            this.saveSnapshot();

            console.log('[StyleService] Successfully applied all style elements for eddy:', eddy.name);
            return true;
        } catch (error) {
            console.error('[StyleService] Failed to apply eddy:', error);
            return false;
        }
    }

    /**
     * 清空redo栈
     * 通常在用户进行新的apply操作时调用
     */
    static clearRedoStack(): void {
        this.updateGlobalState({ redoStack: [] });
        console.log('[StyleService] Redo stack cleared');
    }

    /**
     * 获取redo栈状态
     * @returns redo栈是否为空
     */
    static isRedoStackEmpty(): boolean {
        const state = this.getGlobalState();
        return state.redoStack.length === 0;
    }

    /**
     * 获取undo栈状态
     * @returns undo栈是否为空
     */
    static isUndoStackEmpty(): boolean {
        const state = this.getGlobalState();
        return state.undoStack.length === 0;
    }
} 