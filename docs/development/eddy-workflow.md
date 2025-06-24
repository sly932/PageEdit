# Eddy 工作流程 - 基于样式元素快照的完整流程

## 概述

本文档详细描述了 PageEdit 扩展中基于样式元素快照的新架构，从用户输入查询到最终保存 Eddy 的完整工作流程。新架构采用样式元素快照管理，提供更好的数据一致性、精确的撤销/重做功能和性能优化。

## 核心概念

### Eddy
- **定义**：Eddy 是 PageEdit 中的核心数据结构，代表一个页面修改项目
- **结构**：包含 `currentStyleElements` 数组，存储样式元素快照
- **持久化**：存储在 Chrome 扩展的本地存储中

### StyleElementSnapshot
- **定义**：样式元素的快照，包含选择器、CSS文本和元数据
- **结构**：包含 id、selector、cssText、timestamp
- **作用**：支持精确的样式状态管理和恢复

### GlobalStyleState
- **定义**：全局样式状态管理
- **组成**：currentElements、undoStack、redoStack
- **作用**：管理当前应用的样式元素和撤销/重做栈

## 新架构设计

### 1. 样式元素快照管理
```
用户查询 → LLM 返回 modifications → 合并为样式元素 → 创建快照 → 应用到页面
```

### 2. 全局状态管理
```typescript
interface GlobalStyleState {
    currentElements: StyleElementSnapshot[];  // 当前应用的样式元素
    undoStack: StyleElementSnapshot[][];      // 撤销栈
    redoStack: StyleElementSnapshot[][];      // 重做栈
}
```

### 3. 样式合并策略
- 相同选择器的样式会被合并到同一个样式元素中
- 支持属性级别的更新和替换
- 自动生成唯一的样式元素ID

## 完整工作流程

### 1. 用户输入阶段

```
用户点击悬浮球 → 展开面板 → 输入查询文本 → 点击 Apply 按钮
```

**涉及组件**：
- `FloatingBall`：悬浮球 UI
- `FloatingPanel`：面板 UI
- `PanelEvents`：事件处理

**关键代码**：
```typescript
// FloatingPanel.handleApply()
private handleApply(): void {
    const text = this.input.value.trim();
    if (text && this.eventCallback) {
        this.eventCallback({
            type: 'apply',
            data: { text }
        });
    }
}
```

### 2. 事件传递阶段

```
PanelEvent → ContentManager.handlePanelEvent() → handleModifyPage()
```

**涉及组件**：
- `ContentManager`：内容脚本管理器
- `PanelEvent`：面板事件接口

**关键代码**：
```typescript
// ContentManager.handlePanelEvent()
case 'apply':
    if (event.data?.text) {
        const applyId = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        this.currentApplyId = applyId;
        const message: Message = {
            type: 'MODIFY_PAGE',
            data: { text: event.data.text }
        };
        await this.handleModifyPage(message, applyId);
    }
    break;
```

### 3. 页面修改处理阶段

#### 3.1 解析用户输入
```
parseUserInput() → NLPProcessor.processInput() → LLM 返回 modifications
```

**涉及组件**：
- `NLPProcessor`：自然语言处理器
- LLM 服务：生成修改指令

**关键代码**：
```typescript
// ContentManager.parseUserInput()
const result = await NLPProcessor.processInput(text, htmlContext, {
    preferLLM: true,
    minConfidence: 0.6
});
```

#### 3.2 应用样式修改
```
遍历 modifications → StyleService.applyModification() → 合并样式元素 → 应用到页面
```

**关键代码**：
```typescript
// ContentManager.handleModifyPage()
for (const modification of parseResult.modifications) {
    const success = StyleService.applyModification(modification);
    if (!success) {
        throw new Error(`Failed to apply modification: ${modification.property}`);
    }
}

// 保存快照
StyleService.saveSnapshot();

// 更新当前Eddy的样式元素
await this.updateCurrentEddyStyleElements();
```

#### 3.3 样式元素合并逻辑
```
StyleService.applyModification() → 检查现有样式 → 合并或创建新样式 → 更新全局状态
```

**关键代码**：
```typescript
// StyleService.applyModification()
switch (modification.method) {
    case 'style':
        // 查找是否已存在相同选择器的样式
        const existingIndex = currentElements.findIndex(
            element => element.selector === modification.target
        );

        if (existingIndex >= 0) {
            // 更新现有样式
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
}
```

### 4. Eddy 保存阶段

#### 4.1 更新当前Eddy的样式元素
```
updateCurrentEddyStyleElements() → 获取当前样式元素 → 更新Eddy → 保存到存储
```

**关键代码**：
```typescript
// ContentManager.updateCurrentEddyStyleElements()
const currentElements = StyleService.getCurrentStyleElements();
currentEddy.currentStyleElements = [...currentElements];

// 标记有未保存更改
if (floatingBall.panel.setHasUnsavedChanges) {
    floatingBall.panel.setHasUnsavedChanges(true);
}

// 立即保存到存储
await this.saveEddyToStorage(currentEddy);
```

#### 4.2 保存到存储
```
saveEddyToStorage() → StorageService.updateEddy() → Chrome 本地存储
```

**关键代码**：
```typescript
// ContentManager.saveEddyToStorage()
eddy.updatedAt = Date.now();
await StorageService.updateEddy(eddy);
```

### 5. Eddy 切换和新建阶段

#### 5.1 页面加载时自动应用
```
页面加载 → ContentManager.initializePage() → 获取 lastUsedEddy → StyleService.applyEddy()
```

**关键代码**：
```typescript
// ContentManager.initializePage()
const lastUsedEddy = await StorageService.getLastUsedEddy(domain);
if (lastUsedEddy) {
    await StyleService.applyEddy(lastUsedEddy);
}
```

#### 5.2 切换 Eddy 时自动应用
```
用户点击下拉菜单 → PanelEvents.onSwitchEddy() → setCurrentEddy() → applyEddyStyleElements()
```

**关键代码**：
```typescript
// FloatingPanel.setCurrentEddy()
if (eddy.currentStyleElements && eddy.currentStyleElements.length > 0) {
    this.applyEddyStyleElements(eddy);
} else {
    StyleService.clearAllStyleElements();
}
```

#### 5.3 新建 Eddy 时清空页面
```
用户点击新建按钮 → createNewEddy() → 清空当前修改 → 创建新 Eddy
```

**关键代码**：
```typescript
// FloatingPanel.createNewEddy()
StyleService.clearAllStyleElements();
const newEddy: Eddy = {
    id: `temp_${Date.now()}`,
    name: newEddyName,
    domain: currentDomain,
    currentStyleElements: [],
    lastUsed: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
};
```

#### 5.4 应用 Eddy 样式元素的核心逻辑
```
applyEddyStyleElements() → StyleService.applyEddy() → 重置状态 → 应用样式元素
```

**关键代码**：
```typescript
// FloatingPanel.applyEddyStyleElements()
const success = await StyleService.applyEddy(eddy);
if (success) {
    console.log('[FloatingPanel] Successfully applied all style elements for eddy:', eddy.name);
} else {
    console.error('[FloatingPanel] Failed to apply style elements for eddy:', eddy.name);
}
```

## 撤销/重做机制

### 1. 撤销操作
```
StyleService.undo() → 获取上一个快照 → 更新全局状态 → 应用到页面
```

**关键代码**：
```typescript
// StyleService.undo()
const previousSnapshot = newUndoStack.pop()!;
this.updateGlobalState({
    currentElements: previousSnapshot,
    undoStack: newUndoStack,
    redoStack: newRedoStack
});
this.applyAllStyleElements(previousSnapshot);
```

### 2. 重做操作
```
StyleService.redo() → 获取下一个快照 → 更新全局状态 → 应用到页面
```

**关键代码**：
```typescript
// StyleService.redo()
const nextSnapshot = newRedoStack.pop()!;
this.updateGlobalState({
    currentElements: nextSnapshot,
    undoStack: newUndoStack,
    redoStack: newRedoStack
});
this.applyAllStyleElements(nextSnapshot);
```

### 3. 快照保存
```
StyleService.saveSnapshot() → 保存当前状态到撤销栈 → 清空重做栈
```

**关键代码**：
```typescript
// StyleService.saveSnapshot()
const currentSnapshot = [...state.currentElements];
const newUndoStack = [...state.undoStack, currentSnapshot];
this.updateGlobalState({
    undoStack: newUndoStack,
    redoStack: []
});
```

## 数据流转图

### 主要工作流程
```
用户输入
    ↓
FloatingPanel.handleApply()
    ↓
PanelEvent (type: 'apply')
    ↓
ContentManager.handlePanelEvent()
    ↓
ContentManager.handleModifyPage()
    ↓
parseUserInput() → LLM 返回 modifications
    ↓
StyleService.applyModification() → 合并样式元素
    ↓
StyleService.saveSnapshot() → 保存到撤销栈
    ↓
updateCurrentEddyStyleElements() → 更新Eddy
    ↓
saveEddyToStorage() → 保存到 Chrome 存储
    ↓
完成
```

### Eddy 切换和新建流程
```
页面加载/切换 Eddy/新建 Eddy
    ↓
setCurrentEddy(eddy)
    ↓
检查是否有 currentStyleElements
    ↓
有样式元素 → applyEddyStyleElements(eddy)
    ↓
StyleService.applyEddy() → 重置并应用样式
    ↓
完成应用
    ↓
无样式元素 → StyleService.clearAllStyleElements() → 清空页面
```

### 撤销/重做流程
```
用户点击 Undo/Redo
    ↓
StyleService.undo()/redo()
    ↓
获取快照
    ↓
更新全局状态
    ↓
applyAllStyleElements() → 应用到页面
    ↓
updateCurrentEddyStyleElements() → 更新Eddy
    ↓
saveEddyToStorage() → 保存到存储
```

## 关键数据结构

### Eddy 结构
```typescript
interface Eddy {
    id: string;
    name: string;
    domain: string;
    currentStyleElements: StyleElementSnapshot[];  // 样式元素快照数组
    lastUsed: boolean;
    createdAt: number;
    updatedAt: number;
    draftContent?: string;
}
```

### StyleElementSnapshot 结构
```typescript
interface StyleElementSnapshot {
    id: string;           // 唯一标识符
    selector: string;     // CSS 选择器
    cssText: string;      // CSS 文本内容
    timestamp: number;    // 创建时间戳
}
```

### GlobalStyleState 结构
```typescript
interface GlobalStyleState {
    currentElements: StyleElementSnapshot[];  // 当前应用的样式元素
    undoStack: StyleElementSnapshot[][];      // 撤销栈
    redoStack: StyleElementSnapshot[][];      // 重做栈
}
```

### Modification 结构
```typescript
interface Modification {
    target: string;       // 目标选择器
    property: string;     // 样式属性
    value: string;        // 样式值
    method: ModificationMethod;  // 修改方法 ('style' | 'DOM')
}
```

## 存储机制

### 内存存储
- **位置**：`(window as any).__pageEditGlobalStyleState`
- **作用**：管理当前样式状态和撤销/重做栈
- **生命周期**：页面会话期间

### 持久化存储
- **位置**：Chrome 扩展本地存储
- **服务**：`StorageService`
- **键名**：`eddy_eddys`
- **格式**：Eddy[] 数组

### 样式元素存储
- **位置**：`document.head` 中的 `<style>` 元素
- **作用**：实际应用到页面的样式
- **管理**：通过 StyleService 统一管理

## 错误处理

### 1. 解析失败
```typescript
if (!parseResult.success || !parseResult.modifications || parseResult.modifications.length === 0) {
    throw new Error(parseResult.error || 'No valid modifications found');
}
```

### 2. 应用失败
```typescript
const success = StyleService.applyModification(modification);
if (!success) {
    throw new Error(`Failed to apply modification: ${modification.property}`);
}
```

### 3. 保存失败
```typescript
try {
    await this.saveEddyToStorage(currentEddy);
} catch (error) {
    console.error('[content] Error saving eddy to storage:', error);
}
```

### 4. 状态不一致处理
```typescript
// 检查FloatingBall是否已经初始化了currentEddy
const floatingBall = (window as any).__pageEditFloatingBall;
if (floatingBall && floatingBall.panel && floatingBall.panel.currentEddy) {
    console.log('[content] FloatingBall already has currentEddy, skipping initialization');
    return;
}
```

## 性能优化

### 1. 样式元素合并
- 相同选择器的样式合并到同一个元素中
- 减少 DOM 中的样式元素数量
- 提高样式应用效率

### 2. 快照管理
- 使用快照数组管理样式状态
- 支持精确的撤销/重做操作
- 避免重复计算样式

### 3. 异步处理
- 所有存储操作都是异步的
- 不阻塞用户界面
- 提供良好的用户体验

### 4. 延迟初始化
- ContentManager 延迟初始化页面
- 避免与 FloatingBall 初始化冲突
- 确保状态一致性

## 调试信息

### 关键日志点
1. **开始处理**：`[content] Handling MODIFY_PAGE message`
2. **应用修改**：`[content] Modification completed successfully`
3. **保存快照**：`[StyleService] Snapshot saved, undo stack size: ${size}`
4. **更新Eddy**：`[content] Updated eddy style elements: ${count}`
5. **存储完成**：`[content] Eddy saved to storage: ${eddy.name}`

### 调试技巧
1. 检查 `(window as any).__pageEditGlobalStyleState`
2. 查看 `StyleService.getStateInfo()` 返回的状态信息
3. 监控 `document.head` 中的样式元素
4. 使用 `StyleService.printStateInfo()` 打印详细状态

## 扩展性考虑

### 1. 支持更多修改类型
- 当前主要支持样式修改
- 可以扩展支持布局、内容等修改
- 保持快照架构的一致性

### 2. 支持更复杂的撤销逻辑
- 当前支持完整的撤销/重做栈
- 可以扩展支持选择性撤销
- 支持撤销到特定时间点

### 3. 支持同步功能
- 当前只支持本地存储
- 可以扩展支持云端同步
- 保持快照数据的完整性

### 4. 支持样式优化
- 自动合并重复的样式规则
- 优化 CSS 选择器性能
- 支持样式压缩和优化

## 迁移和兼容性

### 1. 数据迁移
- 提供迁移工具将旧格式转换为新格式
- 保持向后兼容性
- 自动处理数据格式升级

### 2. 版本兼容
- 支持多版本数据格式
- 自动检测和升级数据
- 提供降级兼容性

## 总结

新的基于样式元素快照的架构提供了：

1. **更好的数据一致性**：通过快照管理确保状态一致性
2. **精确的撤销/重做**：支持完整的操作历史管理
3. **性能优化**：样式元素合并和快照管理提高效率
4. **向后兼容**：提供数据迁移工具保持兼容性
5. **扩展性**：架构设计支持未来功能扩展

整个流程设计考虑了性能、可靠性和用户体验，为 PageEdit 提供了稳定、高效的核心功能。 