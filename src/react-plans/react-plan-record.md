# PageEdit 最终架构方案记录

## 核心理念

本方案旨在平衡强大的功能、操作的灵活性与实现的简洁性。核心思想是：
1.  **数据记录保持简单线性**：用户的每一步操作都作为独立的"状态"记录在流水账（`Stack`）中。
2.  **把复杂性留给渲染和撤销逻辑**：系统负责处理状态叠加、替换和回退的复杂计算。
3.  **用户体验分层**：为普通用户提供极简的线性操作（输入、撤销、重做），为专业用户提供强大的非线性历史编辑能力。

---

## 1. 核心数据结构

系统由三大核心部分驱动：`Stack`、`State` 和一个指向当前状态的指针 `currentSnapshotId`。

### `State` (状态单元)
代表一次用户指令产生的原子化结果。

```typescript
// State 的类型定义
enum StateType {
  NATIVE_STYLE_MODIFICATION = 'native_style_modification', // 对原生元素的样式修改
  SCRIPTED_COMPONENT = 'scripted_component'             // 通过脚本创建的新组件
}

// State 的数据结构
interface State {
  id: string; // 唯一ID, e.g., 'state_1678886400000'
  type: StateType;
  userInput: string; // 用户的原始自然语言输入
  payload: NativeStylePayload | ScriptedComponentPayload;
}

// 原生样式修改的载荷
interface NativeStylePayload {
  selector: string; // 目标元素的CSS选择器
  newStyles: Record<string, string>; // 本次操作应用的新样式
  oldStyles: Record<string, string | null>; // 操作前，被修改属性的旧值 (null表示原先没有此属性)
}

// 脚本化组件的载荷
interface ScriptedComponentPayload {
  scriptText: string; // 执行的脚本内容
  targetId?: string; // (可选) 如果是修改，则指定目标脚本State的ID
  createdElementIds: string[]; // 本脚本在DOM中创建的根元素的ID列表
  createdStyleIds: string[]; // 本脚本在DOM中创建的<style>标签的ID列表
}
```

### `Stack` (状态栈)
一个 `State[]` 数组，作为所有操作的不可变事实来源。

```typescript
type Stack = State[];
```

### `currentSnapshotId` (当前状态指针)
一个字符串，存储当前生效的最后一个 `State` 的 `id`。视图永远与从 `Stack` 开头到此 `id` 的状态保持一致。

---

## 2. 核心工作流程

### A. Apply (应用新指令)

1.  **清理未来分支**: 如果 `currentSnapshotId` 不在 `Stack` 末尾（即用户撤销后又产生新操作），则从 `Stack` 中移除 `currentSnapshotId` 之后的所有 `State`。
2.  **生成 State**: LLM 根据用户输入生成 `State` 的 `payload`。
3.  **记录 Old Values (仅对 Style)**: 如果是 `NATIVE_STYLE_MODIFICATION`，在应用新样式 **之前**，系统会查询 DOM，将被修改的属性的当前值记录在 `oldStyles` 中。
4.  **应用变更到 DOM**:
    *   **Style**: 创建新的 `<style>` 标签或直接修改 `element.style` 来应用 `newStyles`。
    *   **Script**: 执行 `scriptText`。脚本需要有能力将自己创建的元素和样式ID返回，存入 `createdElementIds` 和 `createdStyleIds`。
5.  **更新数据**:
    *   将新生成的 `State` 对象 `push` 到 `Stack` 中。
    *   将 `currentSnapshotId` 更新为这个新 `State` 的 `id`。

### B. Undo (撤销)

**此过程不涉及全量重渲染，追求高性能。**

1.  找到 `currentSnapshotId` 对应的 `stateToUndo`。如果找不到或已在起点，则不执行。
2.  **精确逆向操作**:
    *   **若为 Style**: 遍历 `stateToUndo.payload.oldStyles`，将旧值精确地应用回对应的元素。如果旧值为 `null`，则表示该属性为新增，应从元素样式中移除。
    *   **若为 Script**: 遍历 `stateToUndo.payload.createdElementIds` 和 `createdStyleIds`，在 DOM 中找到并移除这些ID对应的元素和 `<style>` 标签。
3.  **更新指针**: 将 `currentSnapshotId` 向左移动一位（即指向 `Stack` 中的前一个 `State` 的 `id`）。

### C. Redo (重做)

**此过程同样不涉及全量重渲染。**

1.  在 `Stack` 中找到 `currentSnapshotId` 的下一个 `State`，称之为 `stateToRedo`。如果找不到，则不执行。
2.  **更新指针**: 将 `currentSnapshotId` 更新为 `stateToRedo` 的 `id`。
3.  **精确正向操作**:
    *   **若为 Style**: 将 `stateToRedo.payload.newStyles` 应用到 DOM。
    *   **若为 Script**: 重新执行 `stateToRedo.payload.scriptText`。

### D. Render (全量渲染)

**此函数只在必要时（如历史编辑）调用，以保证状态的最终一致性。**

1.  **清空**: 移除所有由本插件注入的元素和样式（通过 `data-eddy-id` 等属性识别）。
2.  **计算最终列表**:
    *   创建一个临时的 `finalRenderList`。
    *   遍历 `Stack` **从开头到 `currentSnapshotId`**。
    *   对 `script` 类型的 `State` 进行合并：如果一个 `script` 声明了 `targetId`，它将在 `finalRenderList` 中替换掉那个 `targetId` 对应的 `script`，实现修改效果。
    *   `style` 类型的 `State` 直接放入列表。
3.  **执行渲染**:
    *   合并所有 `style`，生成最终的CSS并注入。
    *   按顺序执行 `finalRenderList` 中的所有 `script`。

---

## 3. 专业用户功能 (历史编辑)

当专业用户进行非线性操作时，为了保证健壮性，我们采用 `Render` 函数。

*   **删除 State**:
    1.  用户从 `Stack` 列表中删除一个或多个 `State`。
    2.  系统从 `Stack` 数组中移除这些项。
    3.  **调用 `Render()` 函数**，根据被修改后的 `Stack` 和当前的 `currentSnapshotId`，对页面进行一次完整的重渲染，确保视图的最终一致性。
*   **重排 State**:
    1.  用户在 `Stack` 列表中拖拽 `State` 改变顺序。
    2.  系统更新 `Stack` 数组的顺序。
    3.  **调用 `Render()` 函数**，进行全量重渲染。

这个混合模型，在保证了普通用户高频操作（Undo/Redo）性能的同时，也为专业用户提供了强大的历史编辑能力，并通过在必要时回退到全量渲染的策略，确保了系统的稳定性和可维护性。


## 需要新提供的函数
- 重建完整render cache
- undo/redo 函数，更新render cache
- 删除某一个id的state
- 