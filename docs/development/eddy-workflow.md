# Eddy 工作流程 - 从用户查询到保存的完整流程

## 概述

本文档详细描述了 PageEdit 扩展中从用户输入查询到最终保存 Eddy 的完整工作流程。这个流程涉及多个组件和服务，确保用户的修改能够正确应用并持久化保存。

## 核心概念

### Eddy
- **定义**：Eddy 是 PageEdit 中的核心数据结构，代表一个页面修改项目
- **结构**：包含多个 `modificationGroups`，每个组代表一次用户操作
- **持久化**：存储在 Chrome 扩展的本地存储中

### ModificationGroup
- **定义**：一组相关的页面修改操作
- **组成**：包含用户查询、时间戳、以及多个具体的修改指令
- **作用**：支持精确的撤销操作（一次撤销整个操作组）

### Modification
- **定义**：单个页面修改指令
- **内容**：包含目标元素、样式属性、新值等
- **来源**：由 LLM 根据用户查询生成

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

#### 3.2 创建修改组
```
StyleService.startModificationGroup() → 创建 groupId 和内存中的修改组
```

**关键代码**：
```typescript
// StyleService.startModificationGroup()
const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

(window as any).__pageEditStyleElementGroups.push({
    groupId,
    styleElements: [],
    timestamp: Date.now(),
    userQuery
});
```

#### 3.3 应用页面修改
```
遍历 modifications → StyleService.applyModification() → 应用到页面样式
```

**关键代码**：
```typescript
// ContentManager.handleModifyPage()
for (const modification of parseResult.modifications) {
    const success = StyleService.applyModification({
        property: modification.property,
        value: modification.value,
        method: modification.method,
        target: modification.target
    }, groupId);
}
```

### 4. Eddy 保存阶段

#### 4.1 保存到内存中的 Eddy
```
saveModificationGroupToEddy() → 添加到 currentEddy.modificationGroups
```

**关键代码**：
```typescript
// ContentManager.saveModificationGroupToEddy()
const modificationGroup = {
    id: groupId,
    timestamp: Date.now(),
    userQuery: userQuery,
    modifications: modifications
};

currentEddy.modificationGroups.push(modificationGroup);
```

#### 4.2 立即保存到存储
```
saveEddyToStorage() → StorageService.updateEddy() → Chrome 本地存储
```

**关键代码**：
```typescript
// ContentManager.saveEddyToStorage()
eddy.updatedAt = Date.now();
await StorageService.updateEddy(eddy);
```

## 数据流转图

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
StyleService.startModificationGroup() → 创建 groupId
    ↓
StyleService.applyModification() → 应用到页面
    ↓
saveModificationGroupToEddy() → 添加到 currentEddy
    ↓
saveEddyToStorage() → 保存到 Chrome 存储
    ↓
完成
```

## 关键数据结构

### Eddy 结构
```typescript
interface Eddy {
    id: string;
    name: string;
    domain: string;
    modificationGroups: ModificationGroup[];
    lastUsed: boolean;
    createdAt: number;
    updatedAt: number;
    draftContent?: string;
}
```

### ModificationGroup 结构
```typescript
interface ModificationGroup {
    id: string;
    timestamp: number;
    userQuery: string;
    modifications: Modification[];
    description?: string;
}
```

### Modification 结构
```typescript
interface Modification {
    id?: string;
    type: ModificationType;
    target: string;
    property: string;
    value: string;
    method: ModificationMethod;
    timestamp?: number;
}
```

## 存储机制

### 内存存储
- **位置**：`FloatingPanel.currentEddy`
- **作用**：当前正在编辑的 Eddy 实例
- **生命周期**：页面会话期间

### 持久化存储
- **位置**：Chrome 扩展本地存储
- **服务**：`StorageService`
- **键名**：`eddy_eddys`
- **格式**：Eddy[] 数组

### 样式元素存储
- **位置**：`(window as any).__pageEditStyleElementGroups`
- **作用**：管理页面上的样式元素，支持撤销操作
- **结构**：按组管理的样式元素数组

## 错误处理

### 1. 解析失败
```typescript
if (!parseResult.success || !parseResult.modifications || parseResult.modifications.length === 0) {
    throw new Error(parseResult.error || 'No valid modifications found');
}
```

### 2. 应用失败
```typescript
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

## 性能优化

### 1. 防抖保存
- 草稿内容使用防抖保存，避免频繁写入存储
- 延迟时间：1000ms

### 2. 批量操作
- 样式元素按组管理，支持批量撤销
- 减少 DOM 操作次数

### 3. 异步处理
- 所有存储操作都是异步的
- 不阻塞用户界面

## 调试信息

### 关键日志点
1. **开始处理**：`[content] Started modification group: ${groupId}`
2. **应用修改**：`[content] Completed modification group: ${groupId}`
3. **保存 Eddy**：`[content] Saved modification group to eddy: ${groupId}`
4. **存储完成**：`[content] Eddy saved to storage: ${eddy.name}`

### 调试技巧
1. 检查 `(window as any).__pageEditFloatingBall.panel.currentEddy`
2. 查看 Chrome 开发者工具的 Storage 面板
3. 监控 `(window as any).__pageEditStyleElementGroups`

## 扩展性考虑

### 1. 支持更多修改类型
- 当前主要支持样式修改
- 可以扩展支持布局、内容等修改

### 2. 支持更复杂的撤销逻辑
- 当前支持按组撤销
- 可以扩展支持选择性撤销

### 3. 支持同步功能
- 当前只支持本地存储
- 可以扩展支持云端同步

## 总结

这个工作流程确保了用户查询能够：
1. **正确解析**：通过 LLM 生成准确的修改指令
2. **立即应用**：实时应用到页面样式
3. **持久保存**：保存到本地存储，支持页面刷新后恢复
4. **精确撤销**：支持按操作组撤销，提供良好的用户体验

整个流程设计考虑了性能、可靠性和用户体验，为 PageEdit 提供了稳定的核心功能。 