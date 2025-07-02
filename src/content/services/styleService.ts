import { StyleModification, ModificationMethod, Modification } from '../../types';
import { Eddy, StyleElementSnapshot, ScriptSnapshot, GlobalStyleState, Snapshot } from '../../types/eddy';
import { ensureIIFE } from '../../utils/scriptUtils';

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
        cssPropertyMap?: Record<string, string>
    ): StyleElementSnapshot {
        // 如果没有提供cssPropertyMap，从cssText解析
        let propertyMap: Record<string, string> = {};
        if (cssPropertyMap) {
            propertyMap = cssPropertyMap;
        } else {
            propertyMap = {};
        }

        return {
            id: `style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            selector,
            cssPropertyMap: propertyMap,
            timestamp: Date.now()
        };
    }

    /**
     * 创建script快照
     */
    private static createScriptSnapshot(
        code: string
    ): ScriptSnapshot {
        const snapshotId = `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 用真实的快照ID替换代码中的占位符
        const finalizedCode = code.replace(/{{{SCRIPT_ID}}}/g, snapshotId);

        const wrappedCode = ensureIIFE(finalizedCode);
        const blob = new Blob([wrappedCode], { type: 'text/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        return {
            id: snapshotId,
            code: wrappedCode,
            timestamp: Date.now(),
            blobUrl: blobUrl
        };
    }

    /**
     * 创建Snapshot
     */
    private static createSnapshot(
        elements: StyleElementSnapshot[], 
        scripts: ScriptSnapshot[],
        userQuery?: string
    ): Snapshot {
        return {
            id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            elements: [...elements],
            scripts: [...scripts],
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
        
        // 使用cssPropertyMap生成CSS文本
        const cssText = `${snapshot.selector} {\n${Object.entries(snapshot.cssPropertyMap).map(([prop, val]) => `  ${prop}: ${val};`).join('\n')}\n}`;
        styleElement.textContent = cssText;
        
        document.head.appendChild(styleElement);
        
        return styleElement;
    }

    /**
     * 应用script快照到页面
     * 抽取了不同的方法，方便切换
     */
    private static async applyScriptSnapshot(snapshot: ScriptSnapshot): Promise<void> {
        await this.applyScriptSnapshotByBackgroundExecution(snapshot);
        console.log('[StyleService][applyScriptSnapshot] Applied scriptSnapshot:', snapshot);
    }

    /**
     * 获取当前标签页ID
     */
    private static async getCurrentTabId(): Promise<number> {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'GET_TAB_ID' });
            if (response.tabId) {
                return response.tabId;
            } else {
                throw new Error('Failed to get tab ID');
            }
        } catch (error) {
            console.error('[StyleService] Failed to get tab ID:', error);
            throw error;
        }
    }

    /**
     * 应用script快照到页面(通过background script执行)
     */
    private static async applyScriptSnapshotByBackgroundExecution(snapshot: ScriptSnapshot): Promise<void> {
        try {
            const tabId = await this.getCurrentTabId();
            
            // 通过background script执行，绕过CSP
            const response = await chrome.runtime.sendMessage({
                type: 'EXECUTE_SCRIPT',
                data: {
                    tabId: tabId,
                    scriptId: snapshot.id,
                    code: snapshot.code
                }
            });
            
            if (!response.success) {
                throw new Error(`Script execution failed: ${response.error}`);
            }

            console.log('[StyleService] Applied scriptSnapshot via background:', snapshot);
        } catch (error) {
            console.error('[StyleService] Failed to execute script via background:', error);
            throw error;
        }
    }

    /**
     * 应用script快照到页面(直接执行)
     */
    private static applyScriptSnapshotByDirectExecution(snapshot: ScriptSnapshot): void {
        try {
            // 直接创建script元素并添加到页面
            const script = document.createElement('script');
            script.id = snapshot.id;
            script.textContent = snapshot.code;
            script.setAttribute('data-pageedit', 'true');
            document.head.appendChild(script);

            console.log('[StyleService] Applied script directly:', {
                id: snapshot.id,
                code: snapshot.code
            });
        } catch (error) {
            console.error('[StyleService] Failed to execute script:', error);
        }
    }

    /**
     * 移除样式元素
     */
    private static removeStyleElement(snapshot: StyleElementSnapshot): void {
        console.log('[StyleService][removeStyleElement] Removing style element:', snapshot.id);
        const element = document.querySelector(`style#${snapshot.id}`) as HTMLStyleElement;
        //const element = document.getElementById(snapshot.id) as HTMLStyleElement;
        console.log('[StyleService][removeStyleElement] find and remove element:', element);
        if (element && element.parentNode) {
            element.remove();
        }
    }

    /**
     * 移除script
     */
    private static removeScript(snapshot: ScriptSnapshot): void {
        try {
            // 派发清理事件，让脚本自行清理副作用
            console.log(`[StyleService][removeScript] Dispatching cleanup event for script: ${snapshot.id}:`, `cleanup-${snapshot.id}`);
            document.dispatchEvent(new CustomEvent(`cleanup-${snapshot.id}`));
            
            // 直接移除script元素
            const script = document.querySelector(`script#${snapshot.id}`) as HTMLScriptElement;
            //const script = document.getElementById(snapshot.id) as HTMLScriptElement;
            console.log('[StyleService][removeScript] find and remove element:', script);
            if (script) {
                script.remove();
                console.log('[StyleService] Script removed successfully:', snapshot.id);
            } else {
                console.log('[StyleService] Script element not found or not a PageEdit script:', snapshot.id);
            }

            // 移除由该脚本创建的关联样式元素
            //todo
            if (snapshot.createdElementIds && snapshot.createdElementIds.length > 0) {
                console.log(`[StyleService][removeScript] Removing ${snapshot.createdElementIds.length} style elements created by script ${snapshot.id}`);
                snapshot.createdElementIds.forEach(styleId => {
                    const styleElement = document.getElementById(styleId);
                    if (styleElement) {
                        styleElement.remove();
                        console.log(`[StyleService][removeScript] Removed associated style element: `, styleElement);
                    }
                });
            }

        } catch (error) {
            console.error('[StyleService] Failed to remove script:', error);
        }
        
        // 清理blob URL（如果存在）
        if (snapshot.blobUrl) {
            URL.revokeObjectURL(snapshot.blobUrl);
        }
    }

    /**
     * 根据修改方法应用样式
     * @param modification 样式修改对象
     * @returns 是否修改成功
     */
    static async applyModification(
        modification: Modification
    ): Promise<boolean> {
        try {
            const state = this.getGlobalState();
            const oldSnapshot = state.currentSnapshot;

            let currentElements = state.currentSnapshot ? [...state.currentSnapshot.elements] : [];
            let currentScripts = state.currentSnapshot ? [...state.currentSnapshot.scripts] : [];

            switch (modification.method) {
                case 'style':
                    // 查找是否已存在相同选择器的样式
                    const existingIndex = currentElements.findIndex(
                        element => element.selector === modification.target
                    );

                    if (existingIndex >= 0) {
                        // 更新现有样式
                        console.log('[StyleService] detect existing style for modification:', modification);
                        console.log('[StyleService] Updating existing style:', currentElements[existingIndex]);
                        const existing = currentElements[existingIndex];
                        
                        // 更新属性映射
                        const updatedPropertyMap = { ...existing.cssPropertyMap };
                        updatedPropertyMap[modification.property] = modification.value;
                        
                        currentElements[existingIndex] = {
                            ...existing,
                            cssPropertyMap: updatedPropertyMap,
                            timestamp: Date.now()
                        };
                        console.log('[StyleService] Updated existing style:', currentElements[existingIndex]);
                    } else {
                        // 创建新样式
                        const propertyMap = { [modification.property]: modification.value };
                        const styleElementsnapshot = this.createStyleElementSnapshot(
                            modification.target, 
                            propertyMap
                        );
                        currentElements.push(styleElementsnapshot);
                    }
                    break;

                case 'script':
                    // 查看是否已存在相同target的script
                    // 判断是否存在newTargets（新的cssElement），如果存在，则先创建cssElement，再创建script
                    if (modification.newIds) {
                        const newElementIds: string[] = [];
                        // 创建新的cssElement
                        for (const id of modification.newIds) {
                            // 创建新的cssElement
                            const cssElementSnapshot = this.createStyleElementSnapshot(
                                'cssByScript', 
                                {}
                            );
                            
                            //todo
                            currentElements.push(cssElementSnapshot);
                            newElementIds.push(cssElementSnapshot.id);

                            // 把code中所有的id替换为newId（使用正则表达式替换所有匹配项）
                            const hasSpecialChars = /[.*+?^${}()|[\]\\]/.test(id);
                            const regex = hasSpecialChars 
                                ? new RegExp(id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
                                : new RegExp(id, 'g');
                            const newId = cssElementSnapshot.id;
                            const modifiedCode = modification.code.replace(regex, newId);
                            modification.code = modifiedCode;
                        }
                        // 创建新的script
                        const scriptSnapshot = this.createScriptSnapshot(
                            modification.code
                        );
                        // 关联创建的样式元素ID
                        scriptSnapshot.createdElementIds = newElementIds;
                        currentScripts.push(scriptSnapshot);
                    }
                    break;
                default:
                    console.warn('Unknown modification method:', modification.method);
                    return false;
            }

            // 创建新的Snapshot，保持当前快照的userQuery
            const currentUserQuery = state.currentSnapshot ? state.currentSnapshot.userQuery : undefined;
            const newSnapshot = this.createSnapshot(currentElements, currentScripts, currentUserQuery);
            
            // 1. 从DOM中清除旧的状态
            if (oldSnapshot) {
                this.clearSnapshotFromDOM(oldSnapshot);
            }
            
            // 2. 更新全局状态
            this.updateGlobalState({ currentSnapshot: newSnapshot});
            
            // 3. 应用新的状态到DOM
            await this.applySnapshotToDOM(newSnapshot);

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
     * 应用所有样式和script到页面
     */
    private static async applySnapshotToDOM(snapshot: Snapshot): Promise<void> {
        this.applyAllStyleElements(snapshot.elements);
        await this.applyAllScripts(snapshot.scripts);
    }

    /**
     * 应用所有样式元素到页面
     */
    private static applyAllStyleElements(elements: StyleElementSnapshot[]): void {
        // 不再清除现有样式，只负责应用
        console.log('[StyleService] Applying all style elements:', elements);
        
        // 应用新的样式元素
        elements.forEach(snapshot => {
            this.applyStyleElementSnapshot(snapshot);
            console.log('[StyleService] Applied style element:', snapshot);
        });
    }

    /**
     * 应用所有script到页面
     */
    private static async applyAllScripts(scripts: ScriptSnapshot[]): Promise<void> {
        console.log('[StyleService][applyAllScripts] Applying all scripts:', scripts);
        for (const script of scripts) {
            await this.applyScriptSnapshot(script);
        }
    }

    /**
     * 重置状态：清空当前快照，并将undo栈移动到redo栈
     */
    static resetState(): boolean {
        try {
            console.log('[StyleService] Resetting state');
            const state = this.getGlobalState();

            // 1. 从DOM中清除当前样式
            const currentSnapshot = state.undoStack.pop();
            if (currentSnapshot) {
                this.clearSnapshotFromDOM(currentSnapshot);
                state.redoStack.push(currentSnapshot);
            }
            
            // 2. 创建一个 undoStack 的副本并将其反转。
            //    这确保了最后发生的操作 (undoStack的末尾) 会被最先重做。
            const reversedUndoStack = [...state.undoStack].reverse();

            // 3. 将反转后的 undoStack 与现有的 redoStack 合并。
            //    现有的 redo 项应该被保留，并且更早被重做。
            const newRedoStack = [...state.redoStack, ...reversedUndoStack];
            
            // 4. 更新全局状态
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
     * 从DOM中清除指定快照的script和style
     */
    static clearSnapshotFromDOM(snapshot: Snapshot): void {
        console.log('[StyleService][clearSnapshotFromDOM] clear current snapshot:', snapshot);
        this.clearStyleElementsFromDOM(snapshot.elements);
        this.clearScriptsFromDOM(snapshot.scripts);
    }

    /**
     * 从DOM中清除指定的样式元素
     */
    static clearStyleElementsFromDOM(elements: StyleElementSnapshot[]): void {
        elements.forEach(snapshot => {
            this.removeStyleElement(snapshot);
        });
    }   

    /**
     * 从DOM中清除指定的script
     */
    static clearScriptsFromDOM(scripts: ScriptSnapshot[]): void {
        scripts.forEach(snapshot => { 
            this.removeScript(snapshot);
        });
    }

    /**
     * 保存当前状态快照
     */
    static updateSnapshot(userQuery?: string): void {
        var state = this.getGlobalState();
        
        // 如果当前没有快照，创建一个空的
        if (!state.currentSnapshot) {
            const emptySnapshot = this.createSnapshot([], [], userQuery);
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
    static async undo(): Promise<boolean> {
        const state = this.getGlobalState();
        
        if (state.undoStack.length === 0) {
            console.log('[StyleService] Undo stack is empty');
            return false;
        }

        // 1. 获取要撤销的快照（即当前状态），并将其移至redo栈
        const snapshotToUndo = state.undoStack.pop()!;
        state.redoStack.push(snapshotToUndo);

        // 2. 从DOM中清除该快照的效果
        this.clearSnapshotFromDOM(snapshotToUndo);

        // 3. 新的当前快照是undo栈的新栈顶（如果栈不为空）
        const newCurrentSnapshot = state.undoStack.length > 0 ? state.undoStack[state.undoStack.length - 1] : null;

        // 4. 如果存在新的当前快照，则将其应用到DOM
        if (newCurrentSnapshot) {
            await this.applySnapshotToDOM(newCurrentSnapshot);
        }

        // 5. 更新全局状态
        this.updateGlobalState({
            currentSnapshot: newCurrentSnapshot,
            undoStack: state.undoStack,
            redoStack: state.redoStack
        });

        //打印state
        this.printStateInfo();

        return true;
    }

    /**
     * 重做操作
     */
    static async redo(): Promise<boolean> {
        const state = this.getGlobalState();
        
        if (state.redoStack.length === 0) {
            console.log('[StyleService] Redo stack is empty');
            return false;
        }

        // 1. 从DOM中清除当前快照的效果
        if (state.currentSnapshot) {
            this.clearSnapshotFromDOM(state.currentSnapshot);
        }

        // 2. 从redo栈中获取要恢复的快照
        const snapshotToRedo = state.redoStack.pop()!;
        
        // 3. 将快照应用到DOM
        await this.applySnapshotToDOM(snapshotToRedo);

        // 4. 将快照推入undo栈，并更新全局状态
        state.undoStack.push(snapshotToRedo);
        this.updateGlobalState({
            currentSnapshot: snapshotToRedo,
            undoStack: state.undoStack,
            redoStack: state.redoStack
        });

        //打印state
        this.printStateInfo();

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
     * @param options Options for the restoration, e.g., whether to apply styles to the DOM.
     * applyToDOM: 是否应用修改（style和script）到DOM
     */
    static async restoreFromEddy(eddy: Eddy, options: { applyToDOM: boolean } = { applyToDOM: true }): Promise<boolean> {
        try {
            console.log(`[StyleService] Restoring from eddy: ${eddy.name}, applyToDOM: ${options.applyToDOM}`);
            
            // 1. 清除当前DOM状态和内存中的状态
            this.clearState();
            
            // 2. 从eddy设置全局状态
            this.updateGlobalState({
                currentSnapshot: eddy.currentSnapshot || null,
                undoStack: eddy.undoStack || [],
                redoStack: eddy.redoStack || []
            });

            // 3. 如果需要，将新状态应用到DOM
            if (options.applyToDOM && this.globalState.currentSnapshot) {
                await this.applySnapshotToDOM(this.globalState.currentSnapshot);
                console.log('[StyleService] Applied', this.globalState.currentSnapshot.elements.length, 'style elements from restored eddy.');
            }

            return true;
        } catch (error) {
            console.error('[StyleService] Failed to restore from eddy:', error);
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
            
            console.log('[StyleService] GlobalState saved to eddy:', {
                currentSnapshot: state.currentSnapshot ? state.currentSnapshot.id : null,
                undoStackSize: state.undoStack.length,
                redoStackSize: state.redoStack.length,
                elementsCount: updatedEddy.currentSnapshot?.elements.length || 0
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
        const state = this.getGlobalState();
        if(state.currentSnapshot) {
            this.clearSnapshotFromDOM(state.currentSnapshot);
        }
        this.updateGlobalState({
            currentSnapshot: null,
            undoStack: [],
            redoStack: []
        });
    }

    /**
     * Clears all applied styles from the DOM without affecting the state history.
     * This is used for temporarily viewing the original page.
     */
    public static clearAllAppliedStyles(): void {
        const state = this.getGlobalState();
        if (state.currentSnapshot) {
            console.log('[StyleService] Temporarily clearing all applied styles from DOM.');
            // this.clearStyleElementsFromDOM(state.currentSnapshot.elements);
            this.clearSnapshotFromDOM(state.currentSnapshot);
        }
    }

    /**
     * Re-applies all styles & scripts from the current snapshot to the DOM.
     * This is used to restore styles after temporarily viewing the original page.
     */
    public static async reapplyAllAppliedStyles(): Promise<void> {
        const state = this.getGlobalState();
        if (state.currentSnapshot) {
            console.log('[StyleService] Re-applying all styles from current snapshot.');
            await this.applySnapshotToDOM(state.currentSnapshot);
        } else {
            console.log('[StyleService] No styles in current snapshot to re-apply.');
        }
    }
} 