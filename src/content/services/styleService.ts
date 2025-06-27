import { StyleModification, ModificationMethod, Modification } from '../../types';
import { Eddy, StyleElementSnapshot, GlobalStyleState, Snapshot } from '../../types/eddy';

/**
 * 样式修改服务
 * 处理页面元素的样式修改，基于样式元素快照管理
 */
export class StyleService {
    private static globalState: GlobalStyleState = {
        currentSnapshot: null,
        undoStack: [],
        redoStack: []
    };

    /**
     * 获取全局样式状态
     */
    private static getGlobalState(): GlobalStyleState {
        return this.globalState;
    }

    /**
     * 更新全局样式状态
     */
    private static updateGlobalState(state: Partial<GlobalStyleState>): void {
        const currentState = this.getGlobalState();
        this.globalState = { ...currentState, ...state };
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
     * 创建Snapshot
     */
    private static createSnapshot(
        elements: StyleElementSnapshot[], 
        userQuery?: string
    ): Snapshot {
        return {
            id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            elements: [...elements],
            userQuery: userQuery || "",
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
        
        console.log('[StyleService] Applied style element:', {
            id: snapshot.id,
            selector: snapshot.selector,
            cssText: snapshot.cssText
        });
        
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
            let currentElements = state.currentSnapshot ? [...state.currentSnapshot.elements] : [];

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
                        const styleElementsnapshot = this.createStyleElementSnapshot(
                            modification.target, 
                            newCssText
                        );
                        currentElements.push(styleElementsnapshot);
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

            // 创建新的Snapshot，保持当前快照的userQuery
            const currentUserQuery = state.currentSnapshot ? state.currentSnapshot.userQuery : undefined;
            const newSnapshot = this.createSnapshot(currentElements, currentUserQuery);
            
            // 更新全局状态
            this.updateGlobalState({ currentSnapshot: newSnapshot });
            
            // 重新应用所有样式元素到页面
            this.applyAllStyleElements(currentElements);

            console.log('[StyleService] Modification applied successfully:', {
                elementsCount: currentElements.length,
                snapshotId: newSnapshot.id,
                userQuery: newSnapshot.userQuery
            });

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
     * 重置状态：清空当前快照，并将undo栈移动到redo栈
     */
    static resetState(): boolean {
        try {
            console.log('[StyleService] Resetting state');
            
            // 清除所有样式元素
            this.clearAllStyleElementsFromDOM();
            
            const state = this.getGlobalState();
            
            // 1. 创建一个 undoStack 的副本并将其反转。
            //    这确保了最后发生的操作 (undoStack的末尾) 会被最先重做。
            const reversedUndoStack = [...state.undoStack].reverse();

            // 2. 将反转后的 undoStack 与现有的 redoStack 合并。
            //    现有的 redo 项应该被保留，并且更早被重做。
            const newRedoStack = [...state.redoStack, ...reversedUndoStack];
            
            // 更新全局状态
            this.updateGlobalState({
                currentSnapshot: null,
                undoStack: [],
                redoStack: newRedoStack
            });

            console.log('[StyleService] All elements cleared. Undo stack moved to redo stack.');
            return true;
        } catch (error) {
            console.error('[StyleService] Reset failed:', error);
            return false;
        }
    }

    /**
     * 从DOM中清除所有样式元素
     */
    static clearAllStyleElementsFromDOM(): void {
        const state = this.getGlobalState();
        if (state.currentSnapshot) {
            state.currentSnapshot.elements.forEach(snapshot => {
                this.removeStyleElement(snapshot);
            });
        }
    }

    /**
     * 保存当前状态快照
     */
    static updateSnapshot(userQuery?: string): void {
        var state = this.getGlobalState();
        
        // 如果当前没有快照，创建一个空的
        if (!state.currentSnapshot) {
            const emptySnapshot = this.createSnapshot([], userQuery);
            this.updateGlobalState({ currentSnapshot: emptySnapshot });
        } else if (userQuery) {
            // 如果有用户查询，总是更新用户查询（不管当前快照是否已有userQuery）
            const updatedSnapshot = {
                ...state.currentSnapshot,
                userQuery: userQuery
            };
            this.updateGlobalState({ currentSnapshot: updatedSnapshot });
        }
        // 保存当前快照到undo栈
        state = this.getGlobalState();
        const currentSnapshot = state.currentSnapshot!;
        state.undoStack.push(currentSnapshot);
        
        // 清空redo栈（因为有了新的操作）
        this.updateGlobalState({
            redoStack: []
        });

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
                currentSnapshot: null,
                undoStack: state.undoStack,
                redoStack: state.redoStack
            });
        } else {
            // 应用undo栈顶端的快照
            const currentSnapshot = state.undoStack[state.undoStack.length - 1];
            this.applyAllStyleElements(currentSnapshot.elements);
            this.updateGlobalState({
                currentSnapshot: currentSnapshot,
                undoStack: state.undoStack,
                redoStack: state.redoStack
            });
        }

        //打印两个stack
        console.log('[StyleService][undo] Undo stack:', state.undoStack);
        console.log('[StyleService][undo] Redo stack:', state.redoStack);

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
        this.applyAllStyleElements(nextSnapshot.elements);

        // 更新全局状态
        this.updateGlobalState({
            currentSnapshot: nextSnapshot,
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
            elementCount: state.currentSnapshot ? state.currentSnapshot.elements.length : 0
        };
    }

    /**
     * 获取当前样式元素
     */
    static getCurrentStyleElements(): StyleElementSnapshot[] {
        const state = this.getGlobalState();
        return state.currentSnapshot ? [...state.currentSnapshot.elements] : [];
    }

    /**
     * 获取当前快照
     */
    static getCurrentSnapshot(): Snapshot | null {
        const state = this.getGlobalState();
        return state.currentSnapshot;
    }

    /**
     * 获取快照历史信息
     */
    static getSnapshotHistory(): { undoStack: Snapshot[]; redoStack: Snapshot[] } {
        const state = this.getGlobalState();
        return {
            undoStack: [...state.undoStack],
            redoStack: [...state.redoStack]
        };
    }

    /**
     * 打印状态信息
     */
    static printStateInfo(): void {
        const state = this.getGlobalState();
        console.log('[StyleService][printStateInfo] ===== STATE INFO =====');
        //打印currenteddy
        const floatingBall = (window as any).__pageEditFloatingBall;
        if (floatingBall && floatingBall.panel && floatingBall.panel.currentEddy) {
            console.log('[StyleService][printStateInfo] Current eddy:', floatingBall.panel.currentEddy);
        }
        console.log('[StyleService][printStateInfo] Current snapshot:', state.currentSnapshot);
        console.log('[StyleService][printStateInfo] Undo stack:', state.undoStack);
        console.log('[StyleService][printStateInfo] Redo stack:', state.redoStack);
        console.log('[StyleService] ======================');
    }

    /**
     * 应用 Eddy 中的所有修改
     * @param eddy Eddy 对象
     * @returns 是否全部修改成功
     */
    static async applyEddy(eddy: Eddy): Promise<boolean> {
        try {
            // 清空当前页面的所有样式元素
            this.clearAllStyleElementsFromDOM();
            
            // 重置GlobalState为新eddy的状态
            const globalState: GlobalStyleState = {
                currentSnapshot: eddy.currentSnapshot || null,
                undoStack: eddy.undoStack || [],
                redoStack: eddy.redoStack || []
            };
            
            // 更新全局状态
            this.updateGlobalState(globalState);

            if (!eddy.currentStyleElements || eddy.currentStyleElements.length === 0) {
                console.log('[StyleService] No style elements to apply for eddy:', eddy.name);
                return true;
            }

            console.log('[StyleService] Applying', eddy.currentStyleElements.length, 'style elements for eddy:', eddy.name);

            // 如果有当前快照，应用其样式元素到页面
            if (globalState.currentSnapshot) {
                this.applyAllStyleElements(globalState.currentSnapshot.elements);
                console.log('[StyleService] Applied current snapshot with', globalState.currentSnapshot.elements.length, 'elements');
            } else {
                // 如果没有快照但有currentStyleElements（向后兼容），创建快照并应用
                const snapshot = this.createSnapshot(eddy.currentStyleElements);
                this.updateGlobalState({ currentSnapshot: snapshot });
                this.applyAllStyleElements(eddy.currentStyleElements);
                console.log('[StyleService] Created snapshot from currentStyleElements with', eddy.currentStyleElements.length, 'elements');
            }

            console.log('[StyleService] Successfully applied all style elements for eddy:', eddy.name);
            return true;
        } catch (error) {
            console.error('[StyleService] Failed to apply eddy:', error);
            return false;
        }
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

    /**
     * 从Eddy恢复GlobalState
     * @param eddy Eddy对象
     * @returns 是否恢复成功
     */
    static restoreFromEddy(eddy: Eddy): boolean {
        try {
            console.log('[StyleService] Restoring GlobalState from eddy:', eddy.name);
            
            // 先清空当前页面的所有样式元素
            this.clearAllStyleElementsFromDOM();
            console.log('[StyleService] Cleared current style elements from DOM');
            
            // 构建GlobalState
            const globalState: GlobalStyleState = {
                currentSnapshot: eddy.currentSnapshot || null,
                undoStack: eddy.undoStack || [],
                redoStack: eddy.redoStack || []
            };
            
            // 更新全局状态
            this.updateGlobalState(globalState);
            
            // 如果有当前快照，应用其样式元素到页面
            if (globalState.currentSnapshot) {
                this.applyAllStyleElements(globalState.currentSnapshot.elements);
                console.log('[StyleService] Applied current snapshot with', globalState.currentSnapshot.elements.length, 'elements');
            } else {
                // 如果没有快照但有currentStyleElements（向后兼容），创建快照并应用
                if (eddy.currentStyleElements && eddy.currentStyleElements.length > 0) {
                    const snapshot = this.createSnapshot(eddy.currentStyleElements);
                    this.updateGlobalState({ currentSnapshot: snapshot });
                    this.applyAllStyleElements(eddy.currentStyleElements);
                    console.log('[StyleService] Created snapshot from currentStyleElements with', eddy.currentStyleElements.length, 'elements');
                } else {
                    // 页面已经是清空状态，不需要额外操作
                    console.log('[StyleService] No style elements to apply, page is already cleared');
                }
            }
            
            console.log('[StyleService] GlobalState restored successfully from eddy:', {
                currentSnapshot: globalState.currentSnapshot ? globalState.currentSnapshot.id : null,
                undoStackSize: globalState.undoStack.length,
                redoStackSize: globalState.redoStack.length
            });
            
            return true;
        } catch (error) {
            console.error('[StyleService] Failed to restore GlobalState from eddy:', error);
            return false;
        }
    }

    /**
     * 保存当前GlobalState到Eddy
     * @param eddy Eddy对象
     * @returns 更新后的Eddy对象
     */
    static updateGlobalStateToEddy(eddy: Eddy): Eddy {
        try {
            const state = this.getGlobalState();
            
            console.log('[StyleService] Saving GlobalState to eddy:', eddy.name);
            
            // 更新Eddy的GlobalState字段
            const updatedEddy: Eddy = {
                ...eddy,
                currentSnapshot: state.currentSnapshot,
                undoStack: state.undoStack,
                redoStack: state.redoStack,
                updatedAt: Date.now()
            };
            
            // 保持向后兼容：同步更新currentStyleElements
            if (state.currentSnapshot) {
                updatedEddy.currentStyleElements = state.currentSnapshot.elements;
            } else {
                updatedEddy.currentStyleElements = [];
            }
            
            console.log('[StyleService] GlobalState saved to eddy:', {
                currentSnapshot: state.currentSnapshot ? state.currentSnapshot.id : null,
                undoStackSize: state.undoStack.length,
                redoStackSize: state.redoStack.length,
                elementsCount: updatedEddy.currentStyleElements.length
            });
            
            return updatedEddy;
        } catch (error) {
            console.error('[StyleService] Failed to save GlobalState to eddy:', error);
            return eddy;
        }
    }

    /**
     * 彻底清除状态：清空所有栈和快照
     */
    static clearState(): void {
        this.updateGlobalState({
            currentSnapshot: null,
            undoStack: [],
            redoStack: []
        });
        this.clearAllStyleElementsFromDOM();
    }

    /**
     * Clears all applied styles from the DOM without affecting the state history.
     * This is used for temporarily viewing the original page.
     */
    public static clearAllAppliedStyles(): void {
        console.log('[StyleService] Temporarily clearing all applied styles from DOM.');
        this.clearAllStyleElementsFromDOM();
    }

    /**
     * Re-applies all styles from the current snapshot to the DOM.
     * This is used to restore styles after temporarily viewing the original page.
     */
    public static reapplyAllAppliedStyles(): void {
        const state = this.getGlobalState();
        if (state.currentSnapshot && state.currentSnapshot.elements.length > 0) {
            console.log('[StyleService] Re-applying all styles from current snapshot.');
            this.applyAllStyleElements(state.currentSnapshot.elements);
        } else {
            console.log('[StyleService] No styles in current snapshot to re-apply.');
        }
    }
} 