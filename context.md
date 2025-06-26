# 对话上下文摘要 (Context Summary)

这是一个关于浏览器插件内容脚本架构重构的对话摘要。

### 1. 初始目标与架构探索

我们的初始目标是理解并改进现有内容脚本的架构。通过分析，我们确定了以下几点：

- **基本组件**: 项目由内容脚本 (`content`)、背景脚本 (`background`) 和 UI (`panel`) 组成。
- **核心状态模型**:
    - 一个网页域（domain）可以关联一个或多个 **Eddy**。
    - `Panel` (UI面板) 在任意时刻只操作一个激活的 **Eddy**。
    - `Eddy` 对象是核心数据单元，封装了一次编辑会话的状态，其关键属性是 `currentSnapshot` (当前快照), `undoStack` (撤销栈), 和 `redoStack` (重做栈)。

### 2. 发现的核心架构问题

我们共同识别出了两个主要的架构缺陷：

1.  **状态错位 (State Misplacement)**: 最关键的业务状态 `currentEddy` 被错误地存储和管理在 UI 层 (`FloatingPanel`) 中，而不是在逻辑控制层。
2.  **封装被破坏 (Broken Encapsulation)**: `StyleService` 的内部状态 `globalState` 被直接挂载在全局 `window` 对象上，破坏了其作为独立服务引擎的封装性。
3.  **初始化脆弱 (Fragile Initialization)**: 组件的创建和依赖关系依赖于不稳定的 `setTimeout` 和全局 `window` 对象，导致了竞态条件和潜在的 bug。

### 3. 重构计划与最终架构

为了解决这些问题，我们制定并执行了一个详细的重构计划 (`refactor-content-script-architecture.md`)，最终确立了清晰的分层架构：

- **`Main` (启动器)**: 一个单例类，作为程序的入口点。它负责**按正确的顺序实例化** `ContentManager` 和 `FloatingBall`，并通过依赖注入解决它们之间的依赖关系。
- **`ContentManager` (控制器)**: **唯一的业务逻辑和状态所有者**。
    - **持有 `currentEddy` 状态**。
    - 处理所有来自 Panel 的用户事件（如新建、切换、删除、撤销/重做）。
    - 与 `StorageService` 通信进行数据持久化。
- **`StyleService` (执行引擎)**: 一个完全封装的、无状态感知的引擎。
    - **持有内部的 `globalState`**（现已私有化）。
    - 负责所有实际的 DOM 样式操作和版本快照管理（undo/redo）。
- **`FloatingBall` / `FloatingPanel` (视图)**: 纯粹的 UI 组件。
    - **不持有任何业务状态**。
    - 负责渲染 `ContentManager` 传递过来的数据（如 Eddy 的名称）。
    - 将用户的操作作为**事件**发送给 `ContentManager` 处理。
    - **`updatePanelDisplay`** (原 `setCurrentEddy`) 是其核心的 UI 更新方法。

**关键数据流**:
- **用户操作**: `Panel` -> `ContentManager`
- **业务处理**: `ContentManager` -> `StyleService` (执行) / `StorageService` (存取)
- **UI 更新**: `ContentManager` -> `FloatingBall` -> `Panel`

### 4. 关键的重构实现

1.  **状态上移**: 我们成功地将 `currentEddy` 的所有权从 `FloatingPanel` 移至 `ContentManager`。
2.  **依赖注入**: 我们创建了 `Main` 类，并使用 `setFloatingBall` 方法将 `FloatingBall` 的实例注入到 `ContentManager` 中，彻底解决了初始化顺序问题和组件间的耦合。
3.  **事件驱动**: `Panel` 的所有操作都被重构为向 `ContentManager` 发送事件的回调函数，剥离了其内部的业务逻辑。
4.  **清晰命名**: 我们将容易引起误解的 `setCurrentEddy` 方法重命名为 `updatePanelDisplay`，明确了其职责仅仅是更新 UI 显示。
5.  **文档同步**: 所有的最终设计决策都已更新并同步到了 `src/react-plans/refactor-content-script-architecture.md` 文档中。

我们目前的架构是清晰、稳健且易于维护的。 