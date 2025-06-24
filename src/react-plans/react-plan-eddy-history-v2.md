# Eddy History Management Plan V2 - 基于Style Elements快照的历史记录改造

## 问题分析

### 当前问题
1. **数据冗余**: 当前保存modifications，但实际应用的是style elements，存在数据不一致
2. **状态管理复杂**: modifications和style elements需要同步维护
3. **undo/redo不够精确**: 基于modifications的撤销可能不准确

### 新方案优势
1. **数据一致性**: 直接保存style elements，避免数据不一致
2. **状态简化**: 只需要维护一套数据（style elements）
3. **精确的undo/redo**: 基于快照的完整状态恢复

## 改造计划

### 1. 数据结构改造

#### 1.1 Eddy类型定义更新
```typescript
// 新的Eddy结构
interface Eddy {
    id: string;
    name: string;
    domain: string;
    currentStyleElements: StyleElementSnapshot[]; // 当前应用的样式元素快照
    lastUsed: boolean;
    createdAt: number;
    updatedAt: number;
    draftContent?: string;
}

// 样式元素快照
interface StyleElementSnapshot {
    id: string; // 唯一标识符
    selector: string; // CSS选择器
    cssText: string; // 完整的CSS文本
    timestamp: number; // 创建时间
}

// 全局状态管理
interface GlobalStyleState {
    currentElements: StyleElementSnapshot[]; // 当前应用的样式元素
    undoStack: StyleElementSnapshot[][]; // undo栈，每个元素是一个完整的快照
    redoStack: StyleElementSnapshot[][]; // redo栈，每个元素是一个完整的快照
}
```

#### 1.2 全局变量定义
```typescript
// 全局样式状态管理
(window as any).__pageEditGlobalStyleState = {
    currentElements: [],
    undoStack: [],
    redoStack: []
};

// 当前Eddy引用
(window as any).__pageEditCurrentEddy = null;
```

### 2. StyleService改造

#### 2.1 核心方法更新
```typescript
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
     * 应用修改并合并样式
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
        // 清除现有样式元素
        this.clearAllStyleElements();
        
        // 应用新的样式元素
        elements.forEach(snapshot => {
            this.applyStyleElementSnapshot(snapshot);
        });
    }

    /**
     * 清除所有样式元素
     */
    private static clearAllStyleElements(): void {
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

        // 将当前状态添加到redo栈
        const currentSnapshot = [...state.currentElements];
        const newRedoStack = [...state.redoStack, currentSnapshot];

        // 从undo栈获取上一个状态
        const newUndoStack = [...state.undoStack];
        const previousSnapshot = newUndoStack.pop()!;

        // 更新全局状态
        this.updateGlobalState({
            currentElements: previousSnapshot,
            undoStack: newUndoStack,
            redoStack: newRedoStack
        });

        // 应用上一个状态到页面
        this.applyAllStyleElements(previousSnapshot);

        console.log('[StyleService] Undo completed, undo stack size:', newUndoStack.length);
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

        // 将当前状态添加到undo栈
        const currentSnapshot = [...state.currentElements];
        const newUndoStack = [...state.undoStack, currentSnapshot];

        // 从redo栈获取下一个状态
        const newRedoStack = [...state.redoStack];
        const nextSnapshot = newRedoStack.pop()!;

        // 更新全局状态
        this.updateGlobalState({
            currentElements: nextSnapshot,
            undoStack: newUndoStack,
            redoStack: newRedoStack
        });

        // 应用下一个状态到页面
        this.applyAllStyleElements(nextSnapshot);

        console.log('[StyleService] Redo completed, redo stack size:', newRedoStack.length);
        return true;
    }

    /**
     * 重置所有修改
     */
    static resetAllModifications(): boolean {
        try {
            console.log('[StyleService] Resetting all modifications');
            
            // 清除所有样式元素
            this.clearAllStyleElements();
            
            // 重置全局状态
            this.updateGlobalState({
                currentElements: [],
                undoStack: [],
                redoStack: []
            });

            console.log('[StyleService] All modifications reset successfully');
            return true;
        } catch (error) {
            console.error('[StyleService] Reset failed:', error);
            return false;
        }
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
}
```

### 3. ContentManager改造

#### 3.1 handleModifyPage方法更新
```typescript
private async handleModifyPage(message: Message, applyId?: string): Promise<void> {
    try {
        // 清空redo栈，因为用户进行了新的操作
        const state = StyleService.getGlobalState();
        StyleService.updateGlobalState({ redoStack: [] });

        // 解析用户输入
        const parseResult = await this.parseUserInput(message.data.text);
        
        // 检查applyId是否仍然有效
        if (applyId && this.currentApplyId !== applyId) {
            console.log('[content] Apply已被取消，本次结果丢弃');
            return;
        }
        
        if (!parseResult.success || !parseResult.modifications || parseResult.modifications.length === 0) {
            throw new Error(parseResult.error || 'No valid modifications found');
        }

        // 应用所有修改
        for (const modification of parseResult.modifications) {
            try {
                const success = StyleService.applyModification(modification);
                if (!success) {
                    throw new Error(`Failed to apply modification: ${modification.property}`);
                }
            } catch (error) {
                console.error('Failed to apply modification:', error);
                throw error;
            }
        }

        // 保存快照
        StyleService.saveSnapshot();

        // 更新当前Eddy的样式元素
        await this.updateCurrentEddyStyleElements();

        console.log('[content] Modification completed successfully');
        StyleService.printStateInfo();

    } catch (error) {
        console.error('Failed to handle page modification:', error);
        throw error;
    }
}

/**
 * 更新当前Eddy的样式元素
 */
private async updateCurrentEddyStyleElements(): Promise<void> {
    try {
        const floatingBall = (window as any).__pageEditFloatingBall;
        if (!floatingBall || !floatingBall.panel || !floatingBall.panel.currentEddy) {
            console.warn('[content] No current eddy found, skipping style elements update');
            return;
        }

        const currentEddy = floatingBall.panel.currentEddy;
        const state = StyleService.getGlobalState();
        
        // 更新Eddy的样式元素
        currentEddy.currentStyleElements = [...state.currentElements];
        
        // 标记有未保存更改
        if (floatingBall.panel.setHasUnsavedChanges) {
            floatingBall.panel.setHasUnsavedChanges(true);
        }

        // 立即保存到存储
        await this.saveEddyToStorage(currentEddy);

        console.log('[content] Updated eddy style elements:', currentEddy.currentStyleElements.length);
    } catch (error) {
        console.error('[content] Error updating eddy style elements:', error);
    }
}
```

#### 3.2 undo/redo方法更新
```typescript
/**
 * 撤销最后一次修改
 */
private async undoLastModification(): Promise<boolean> {
    try {
        console.log('[content] === UNDO OPERATION START ===');
        
        const success = StyleService.undo();
        if (success) {
            // 更新当前Eddy的样式元素
            await this.updateCurrentEddyStyleElements();
            console.log('[content] === UNDO OPERATION SUCCESS ===');
        } else {
            console.log('[content] === UNDO OPERATION FAILED ===');
        }
        return success;
    } catch (error) {
        console.error('[content] Error undoing modification:', error);
        return false;
    }
}

/**
 * 重做最后一次撤销的修改
 */
private async redoLastModification(): Promise<boolean> {
    try {
        console.log('[content] === REDO OPERATION START ===');
        
        const success = StyleService.redo();
        if (success) {
            // 更新当前Eddy的样式元素
            await this.updateCurrentEddyStyleElements();
            console.log('[content] === REDO OPERATION SUCCESS ===');
        } else {
            console.log('[content] === REDO OPERATION FAILED ===');
        }
        return success;
    } catch (error) {
        console.error('[content] Error redoing modification:', error);
        return false;
    }
}
```

### 4. FloatingPanel改造

#### 4.1 应用Eddy样式元素
```typescript
/**
 * 应用 Eddy 的样式元素到页面
 */
private async applyEddyStyleElements(eddy: Eddy): Promise<void> {
    try {
        if (!eddy.currentStyleElements || eddy.currentStyleElements.length === 0) {
            console.log('[FloatingPanel] No style elements to apply for eddy:', eddy.name);
            return;
        }

        console.log('[FloatingPanel] Applying', eddy.currentStyleElements.length, 'style elements for eddy:', eddy.name);

        // 重置当前状态
        StyleService.resetAllModifications();

        // 设置全局状态
        StyleService.updateGlobalState({
            currentElements: [...eddy.currentStyleElements]
        });

        // 应用样式元素到页面
        eddy.currentStyleElements.forEach(snapshot => {
            StyleService.applyStyleElementSnapshot(snapshot);
        });

        console.log('[FloatingPanel] Successfully applied all style elements for eddy:', eddy.name);
    } catch (error) {
        console.error('[FloatingPanel] Error applying eddy style elements:', error);
    }
}
```

#### 4.2 更新按钮状态
```typescript
// 更新undo/redo按钮状态
public updateUndoRedoButtonStates(): void {
    const stateInfo = StyleService.getStateInfo();
    
    this.undoButton.disabled = !stateInfo.canUndo;
    this.redoButton.disabled = !stateInfo.canRedo;
    
    // 更新按钮样式
    this.undoButton.style.opacity = stateInfo.canUndo ? '1' : '0.5';
    this.redoButton.style.opacity = stateInfo.canRedo ? '1' : '0.5';
}
```

### 5. 数据迁移策略

#### 5.1 向后兼容处理
```typescript
// 迁移函数：将旧版本的Eddy转换为新格式
function migrateEddyToNewFormat(eddy: Eddy): Eddy {
    // 如果已经是新格式，直接返回
    if (eddy.currentStyleElements !== undefined) {
        return eddy;
    }

    // 处理旧版本的modifications
    if (eddy.modifications && eddy.modifications.length > 0) {
        // 将modifications转换为样式元素快照
        const styleElements: StyleElementSnapshot[] = [];
        const groupedModifications = groupModificationsBySelector(eddy.modifications);
        
        for (const [selector, modifications] of Object.entries(groupedModifications)) {
            const cssText = generateCSSText(selector, modifications);
            const snapshot = {
                id: `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                selector,
                cssText,
                timestamp: eddy.createdAt
            };
            styleElements.push(snapshot);
        }

        return {
            ...eddy,
            currentStyleElements: styleElements,
            modifications: undefined // 清除旧字段
        };
    }

    // 空Eddy
    return {
        ...eddy,
        currentStyleElements: []
    };
}

// 按选择器分组modifications
function groupModificationsBySelector(modifications: Modification[]): Record<string, Modification[]> {
    const grouped: Record<string, Modification[]> = {};
    
    modifications.forEach(mod => {
        if (!grouped[mod.target]) {
            grouped[mod.target] = [];
        }
        grouped[mod.target].push(mod);
    });
    
    return grouped;
}

// 生成CSS文本
function generateCSSText(selector: string, modifications: Modification[]): string {
    const properties = modifications.map(mod => `${mod.property}: ${mod.value};`).join(' ');
    return `${selector} { ${properties} }`;
}
```

### 6. 实施步骤

#### 阶段1：基础架构改造
1. 更新Eddy类型定义
2. 实现StyleElementSnapshot接口
3. 设置全局状态管理变量

#### 阶段2：StyleService核心改造
1. 实现样式元素快照管理
2. 实现CSS合并逻辑
3. 实现undo/redo栈管理
4. 实现快照保存和恢复

#### 阶段3：ContentManager改造
1. 更新handleModifyPage方法
2. 实现Eddy样式元素同步
3. 更新undo/redo方法

#### 阶段4：FloatingPanel改造
1. 更新Eddy应用逻辑
2. 实现样式元素加载
3. 更新按钮状态管理

#### 阶段5：数据迁移和测试
1. 实现数据迁移函数
2. 测试向后兼容性
3. 全面功能测试

### 7. 预期效果

1. **数据一致性**: 直接保存样式元素，避免数据不一致
2. **精确的undo/redo**: 基于快照的完整状态恢复
3. **性能优化**: 减少DOM操作，提高样式应用效率
4. **简化维护**: 只需要维护一套数据（样式元素快照）

### 8. 风险考虑

1. **数据迁移风险**: 需要确保旧数据正确迁移
2. **CSS合并复杂性**: 需要处理CSS属性冲突和优先级
3. **内存使用**: 快照可能占用更多内存
4. **兼容性**: 需要确保与现有功能的兼容性

### 9. 后续优化方向

1. **CSS优化**: 实现更智能的CSS合并和压缩
2. **性能监控**: 添加性能监控和优化
3. **可视化调试**: 提供样式元素的可视化调试工具
4. **增量更新**: 实现增量样式更新机制 