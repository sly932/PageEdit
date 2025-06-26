# Eddy 工作流程 - 基于全局状态与快照的完整流程

## 概述

本文档详细描述了 PageEdit 扩展中基于 `GlobalState` 和样式快照的新架构，从用户输入查询到最终保存 Eddy 的完整工作流程。该架构提供了精确的撤销/重做功能和更优的数据一致性。

## 核心概念

### Eddy
- **定义**: PageEdit 中的核心数据结构，代表一个在特定域名下的完整样式修改项目。
- **分类**:
  - **永久 Eddy**: 已保存到存储中，拥有固定ID和用户定义（或自动生成）的名称。
  - **临时 Eddy (temp_eddy)**: 当用户在一个没有现存 Eddy 的页面上开始编辑时，在内存中创建的临时对象。ID 以 `temp_` 开头。在第一次成功应用修改后，会自动转换为一个永久 Eddy。
- **结构**: 包含 `currentStyleElements` (当前样式快照)，以及 `undoStack` 和 `redoStack` 用于版本控制。

### GlobalState
- **定义**: 由 `StyleService` 管理的全局单例状态，存储当前页面的所有样式修改。
- **组成**: `currentSnapshot` (当前状态快照), `undoStack` (撤销栈), `redoStack` (重做栈)。
- **作用**: 与当前活动的 `Eddy` 解耦，`StyleService` 只操作 `GlobalState`。`ContentManager` 负责在操作完成后将 `GlobalState` 同步回 `currentEddy`。

## 工作流程详解

### 1. 用户输入与事件触发
```
用户在 FloatingPanel 输入查询文本 → 点击 "Apply" 按钮
    ↓
PanelEvent ('apply') 触发
    ↓
ContentManager.handlePanelEvent() 接收事件
```

### 2. 指令解析与页面修改
```
ContentManager.handlePanelEvent()
    ↓
    a. 若当前无 Eddy，则创建一个【临时 Eddy】
    ↓
    b. 调用 handleModifyPage()
        ↓
        1. parseUserInput() → NLPProcessor → 返回 Modifications
        ↓
        2. StyleService.applyModification() → 遍历应用修改，更新【GlobalState】
        ↓
        3. StyleService.updateSnapshot() → 将用户查询和变更存入一个新的快照，推入 undoStack
    ↓
    c. 调用 saveCurrentEddyToStorage()
```
**关键点**: `StyleService` 的所有操作（应用、撤销、重做）都只针对内部的 `GlobalState`，不直接关心当前的 Eddy 是哪个。

### 3. Eddy 保存与转换【核心变更】
此阶段由 `ContentManager.saveCurrentEddyToStorage()` 方法处理。

```mermaid
graph TD
    A(saveCurrentEddyToStorage) --> B{当前 Eddy 是临时 Eddy?};
    B -- 是 --> C[从 StyleService 获取当前快照];
    C --> D[从快照中提取用户查询作为新 Eddy 的名字];
    D --> E[调用 StorageService.createEddy 创建【永久 Eddy】];
    E --> F[将临时 Eddy 的版本历史 (undo/redo) 复制到新创建的永久 Eddy];
    F --> G[用返回的永久 Eddy 替换内存中的临时 Eddy];
    G --> I(更新UI和内部状态);
    
    B -- 否 --> H[调用 StorageService.updateEddy 更新现有 Eddy];
    H --> I;
```

**流程详解**:
1.  **同步状态**: 首先，调用 `StyleService.updateGlobalStateToEddy(this.currentEddy)`，将 `StyleService` 中最新的 `GlobalState` (包括 `undoStack` 等) 同步到 `ContentManager` 当前持有的 Eddy 对象上。
2.  **判断类型**: 检查 `currentEddy.id` 是否以 `temp_` 开头。
3.  **如果是临时 Eddy (转换流程)**:
    - **自动命名**: 从 `StyleService` 的当前快照中获取 `userQuery`，并将其处理后作为新 Eddy 的名字。
    - **创建新 Eddy**: 调用 `StorageService.createEddy()`，传入新名字和从临时 Eddy 中获取的样式数据，创建一个新的、拥有永久 ID 的 Eddy。
    - **迁移历史**: 将临时 Eddy 上的 `undoStack` 和 `redoStack` 复制到新创建的永久 Eddy 对象上。
    - **更新引用**: 将 `ContentManager` 的 `this.currentEddy` 更新为这个新的永久 Eddy 对象。
    - **持久化**: 再次调用 `StorageService.updateEddy()`，将包含版本历史的完整永久 Eddy 保存到 Chrome Storage。
4.  **如果是永久 Eddy (更新流程)**:
    - 直接调用 `StorageService.updateEddy()`，将同步了最新 `GlobalState` 的 Eddy 对象保存到 Chrome Storage。
5.  **UI 更新**: 最后，更新 `FloatingPanel` 的显示，包括标题、下拉列表等。

### 4. Eddy 切换与撤销/重做

- **切换 Eddy**:
  1. 用户从下拉菜单选择一个新的 Eddy。
  2. `ContentManager.handleSwitchEddy()` 被调用。
  3. `StyleService.clearState()` 清空当前的 `GlobalState`。
  4. `StyleService.restoreFromEddy(selectedEddy)` 将选中 Eddy 的状态恢复到 `GlobalState`。
  5. `StyleService` 根据恢复的 `GlobalState` 重新在页面上应用样式。
- **撤销/重做**:
  1. 用户点击 Undo/Redo 按钮。
  2. `ContentManager` 调用 `StyleService.undo()` 或 `StyleService.redo()`。
  3. `StyleService` 在其内部的 `GlobalState` 中移动快照指针，并重新应用当前快照的样式。
  4. 操作完成后，`ContentManager` 调用 `saveCurrentEddyToStorage()` 将变更后的 `GlobalState` (主要是 `undoStack` 和 `redoStack` 的变化) 保存到当前的永久 Eddy 中。

## 总结
新架构通过将**样式操作 (`StyleService`)**与**数据持久化 (`ContentManager` + `StorageService`)**分离，实现了更清晰的职责划分。核心是 `GlobalState` 作为中介，所有修改先在它上面发生，再由 `ContentManager` 决定何时以及如何将这个状态同步到具体的 Eddy 对象并持久化。特别是**临时 Eddy 自动转换和命名**的流程，极大地改善了用户首次使用的体验。 