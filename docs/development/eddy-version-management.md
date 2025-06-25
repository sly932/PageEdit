# Eddy 多版本管理功能实现

## 概述

本文档详细描述了PageEdit扩展中Eddy多版本管理功能的实现。该功能允许Eddy保存完整的GlobalState，包括当前快照、撤销栈和重做栈，实现精确的版本管理和状态恢复。

## 功能特性

### 1. 多版本数据结构
Eddy现在包含以下多版本管理字段：
- `currentSnapshot`: 当前快照，包含样式元素和用户查询
- `undoStack`: 撤销栈，存储历史快照
- `redoStack`: 重做栈，存储被撤销的快照

### 2. 现场恢复
- 打开网页时自动寻找domain对应的最近使用的eddy
- 从eddy恢复完整的GlobalState到内存
- 应用当前快照的样式元素到页面
- 恢复输入框内容为当前快照的用户查询

### 3. 现场保存
- 每次undo/redo操作后自动保存GlobalState到eddy
- 新的apply操作后清空redo栈并保存到eddy
- 所有状态变更都会及时持久化

### 4. 智能Reset功能
- Reset操作不再清空所有状态，而是创建空白快照
- 用户可以通过undo操作回退到reset前的状态
- 避免误操作导致的数据丢失

### 5. 查询内容管理
- 使用currentSnapshot中的userQuery替代draftContent
- 自动保存用户查询到快照中
- 支持查询内容的版本管理

## 实现细节

### 1. 数据结构更新

#### Eddy接口扩展
```typescript
export interface Eddy {
    id: string;
    name: string;
    domain: string;
    currentStyleElements: StyleElementSnapshot[]; // 保持向后兼容
    lastUsed: boolean;
    createdAt: number;
    updatedAt: number;
    draftContent?: string; // 保留向后兼容，但不再使用
    
    // 新增：多版本管理字段
    currentSnapshot?: Snapshot | null; // 当前快照
    undoStack?: Snapshot[]; // 撤销栈
    redoStack?: Snapshot[]; // 重做栈
}
```

#### Snapshot结构
```typescript
export interface Snapshot {
    id: string; // 唯一标识符
    elements: StyleElementSnapshot[]; // 样式元素快照数组
    userQuery?: string; // 对应的用户查询（可选）
    timestamp: number; // 创建时间
}
```

### 2. StyleService新增方法

#### restoreFromEddy
```typescript
static restoreFromEddy(eddy: Eddy): boolean
```
- 从Eddy恢复GlobalState到内存
- 应用当前快照的样式元素到页面
- 支持向后兼容（从currentStyleElements创建快照）

#### saveToEddy
```typescript
static saveToEddy(eddy: Eddy): Eddy
```
- 保存当前GlobalState到Eddy
- 同步更新currentStyleElements（向后兼容）
- 返回更新后的Eddy对象

#### clearRedoStackAndSave
```typescript
static clearRedoStackAndSave(eddy: Eddy): Eddy
```
- 清空redo栈并保存到Eddy
- 用于新的apply操作

#### clearAllStyleElements（改进版）
```typescript
static clearAllStyleElements(): boolean
```
- 创建空白快照而不是清空所有状态
- 保存当前状态到undo栈
- 用户可以通过undo回退到之前的状态

### 3. 关键流程实现

#### 页面加载/Eddy切换
```typescript
// FloatingPanel.setCurrentEddy()
const restoreSuccess = StyleService.restoreFromEddy(eddy);
if (restoreSuccess) {
    // 更新输入框内容为当前快照的用户查询
    this.updateInputWithSnapshotQuery();
} else {
    // 向后兼容处理
}
```

#### Eddy切换时的样式清空
```typescript
// StyleService.restoreFromEddy()
// 先清空当前页面的所有样式元素
this.clearAllStyleElementsFromDOM();
// 构建新eddy的GlobalState
const globalState: GlobalStyleState = {
    currentSnapshot: eddy.currentSnapshot || null,
    undoStack: eddy.undoStack || [],
    redoStack: eddy.redoStack || []
};
// 更新全局状态
this.updateGlobalState(globalState);
// 应用新eddy的样式元素
```

#### 保存操作
```typescript
// ContentManager.saveCurrentEddy()
this.currentEddy = StyleService.saveToEddy(this.currentEddy);
```

#### Undo/Redo操作
```typescript
// ContentManager.undoLastModification()
const success = StyleService.undo();
if (success) {
    const updatedEddy = StyleService.saveToEddy(floatingBall.panel.currentEddy);
    await this.saveEddyToStorage(updatedEddy);
    this.updateInputWithSnapshotQuery();
}
```

#### 新的Apply操作
```typescript
// ContentManager.handleModifyPage()
StyleService.clearRedoStack();
const updatedEddy = StyleService.clearRedoStackAndSave(floatingBall.panel.currentEddy);
// ... 应用修改 ...
StyleService.saveSnapshot(message.data.text);
await this.updateCurrentEddyStyleElements();
```

#### Reset操作（改进版）
```typescript
// StyleService.clearAllStyleElements()
const emptySnapshot = this.createSnapshot([], "clear eddy");
// 保存当前状态到undo栈
if (state.currentSnapshot) {
    state.undoStack.push(state.currentSnapshot);
}
// 更新为空白快照
this.updateGlobalState({
    currentSnapshot: emptySnapshot,
    undoStack: state.undoStack,
    redoStack: []
});
```

#### applyEddy操作（改进版）
```typescript
// StyleService.applyEddy()
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
// 应用新eddy的样式元素
```

### 4. 查询内容管理

#### 加载查询内容
```typescript
// FloatingPanel.loadDraftContent()
const currentSnapshot = StyleService.getCurrentSnapshot();
if (currentSnapshot && currentSnapshot.userQuery) {
    // 优先使用currentSnapshot中的userQuery
    this.input.value = currentSnapshot.userQuery;
} else if (eddy.draftContent) {
    // 向后兼容：使用draftContent
    this.input.value = eddy.draftContent;
}
```

#### 保存查询内容
```typescript
// StyleService.saveSnapshot()
StyleService.saveSnapshot(message.data.text);
// 查询内容自动保存到快照的userQuery字段
```

## 数据流转

### 1. 页面加载流程
```
页面加载 → 查找最近使用的eddy → restoreFromEddy() → 恢复GlobalState → 应用样式 → 更新输入框
```

### 2. 用户操作流程
```
用户操作 → 更新GlobalState → saveToEddy() → 保存到存储 → 完成
```

### 3. Eddy切换流程
```
切换Eddy → restoreFromEddy() → 恢复状态 → 应用样式 → 更新输入框 → 完成
```

### 4. Reset流程（改进版）
```
点击Reset → 保存当前状态到undo栈 → 创建空白快照 → 清空页面 → 可以undo回退
```

### 5. Eddy切换流程（改进版）
```
切换Eddy → 清空当前样式 → 重置GlobalState → 应用新eddy样式 → 更新输入框 → 完成
```

### 6. 按钮状态更新流程
```
状态变更 → 更新GlobalState → 更新按钮状态 → 用户界面同步
```

## 向后兼容性

### 1. 旧Eddy处理
- 如果Eddy没有多版本管理字段，使用原有的currentStyleElements
- 自动创建快照并应用样式元素
- 保持现有功能正常工作

### 2. 查询内容兼容
- 优先使用currentSnapshot中的userQuery
- 如果没有快照查询，回退到draftContent
- 确保旧数据正常工作

### 3. 数据迁移
- 不需要特殊的数据迁移逻辑
- 新创建的Eddy自动包含多版本管理字段
- 旧Eddy在首次使用时自动升级

## 测试要点

### 1. 基本功能测试
- [ ] 页面加载时正确恢复eddy状态
- [ ] 样式元素正确应用到页面
- [ ] 输入框内容正确恢复

### 2. 版本管理测试
- [ ] undo/redo操作正确保存状态
- [ ] 新的apply操作正确清空redo栈
- [ ] 状态变更及时持久化

### 3. Reset功能测试
- [ ] Reset操作创建空白快照而不是清空状态
- [ ] 可以通过undo回退到reset前的状态
- [ ] Reset后输入框显示"clear eddy"

### 4. 查询内容测试
- [ ] 查询内容正确保存到快照中
- [ ] 切换eddy时查询内容正确恢复
- [ ] 向后兼容draftContent

### 5. 兼容性测试
- [ ] 旧格式eddy正常工作
- [ ] 新创建的eddy包含多版本字段
- [ ] 切换eddy时状态正确恢复

## 注意事项

1. **性能考虑**: 多版本管理会增加存储空间，但提供了更好的用户体验
2. **数据一致性**: 确保GlobalState和Eddy数据始终保持同步
3. **错误处理**: 所有操作都有适当的错误处理和回退机制
4. **日志记录**: 详细的操作日志便于调试和问题排查
5. **用户安全**: Reset操作不再丢失数据，用户可以通过undo恢复

## 未来优化方向

1. **版本压缩**: 实现快照压缩以减少存储空间
2. **选择性保存**: 允许用户选择保存哪些版本
3. **版本比较**: 提供版本间的差异比较功能
4. **自动清理**: 自动清理过期的历史版本
5. **查询历史**: 提供查询历史记录功能

## Eddy切换时的状态管理

### 1. 样式清空机制
当用户切换Eddy时，系统会：
1. **清空当前样式**: 先清空页面上所有当前的样式元素
2. **重置GlobalState**: 将GlobalState完全重置为新eddy的状态
3. **应用新样式**: 应用新eddy的样式元素到页面
4. **更新输入框**: 恢复新eddy的查询内容
5. **更新按钮状态**: 根据新eddy的undo/redo栈更新按钮可点击状态

### 2. 实现细节
```typescript
// StyleService.restoreFromEddy()
// 1. 清空当前样式
this.clearAllStyleElementsFromDOM();

// 2. 重置GlobalState
const globalState: GlobalStyleState = {
    currentSnapshot: eddy.currentSnapshot || null,
    undoStack: eddy.undoStack || [],
    redoStack: eddy.redoStack || []
};
this.updateGlobalState(globalState);

// 3. 应用新样式
if (globalState.currentSnapshot) {
    this.applyAllStyleElements(globalState.currentSnapshot.elements);
}

// 4. 更新按钮状态
this.updateUndoRedoButtonStates();
```

### 3. 向后兼容处理
如果eddy没有多版本管理字段：
1. 直接清空DOM样式元素
2. 使用原有的currentStyleElements创建快照
3. 应用样式元素到页面
4. 更新按钮状态

### 4. 状态隔离
每个Eddy都有完全独立的状态：
- 不同的currentSnapshot
- 不同的undoStack
- 不同的redoStack
- 不同的查询内容

这确保了Eddy之间的完全隔离，切换时不会相互影响。

## 按钮状态管理

### 1. 状态更新时机
按钮状态会在以下时机自动更新：
- **切换Eddy时**: 根据新eddy的undo/redo栈状态
- **第一次打开panel时**: 根据当前eddy的状态
- **执行undo/redo操作后**: 根据操作后的栈状态
- **执行apply操作后**: 根据新的栈状态
- **执行reset操作后**: 根据reset后的栈状态

### 2. 状态判断逻辑
```typescript
// StyleService.getStateInfo()
const stateInfo = {
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    elementCount: state.currentSnapshot ? state.currentSnapshot.elements.length : 0
};
```

### 3. 按钮更新实现
```typescript
// FloatingPanel.updateUndoRedoButtonStates()
const stateInfo = StyleService.getStateInfo();
this.undoButton.disabled = !stateInfo.canUndo;
this.redoButton.disabled = !stateInfo.canRedo;
this.undoButton.style.opacity = stateInfo.canUndo ? '1' : '0.5';
this.redoButton.style.opacity = stateInfo.canRedo ? '1' : '0.5';
```

### 4. 用户体验
- **视觉反馈**: 按钮透明度变化，清晰显示可点击状态
- **功能反馈**: 按钮禁用状态，防止无效操作
- **实时更新**: 状态变更后立即更新按钮状态
- **一致性**: 按钮状态始终与GlobalState保持一致 