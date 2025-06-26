# PageEdit 项目架构文档

## 项目整体架构

### 1. **用户交互流程**
```
点击插件图标 → popup页面（暂时不管）
    ↓
悬浮球 → 展开/收起 panel页面
    ↓
Panel页面 → 主要UX界面（提问、修改、管理Eddy等）
```

### 2. **核心组件关系图**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FloatingBall  │    │  FloatingPanel  │    │  ContentManager │
│   (悬浮球)       │───▶│   (面板界面)     │───▶│   (内容管理)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  StyleService   │    │ StorageService  │
                       │  (样式服务)      │    │  (存储服务)      │
                       └─────────────────┘    └─────────────────┘
```

## 各组件详细分析

### 1. **ContentManager（内容管理器）**

**主要职责**：
- **消息处理**：处理来自popup的消息（`MODIFY_PAGE`等）
- **用户输入解析**：使用NLPProcessor解析用户的自然语言输入
- **页面修改协调**：协调StyleService和StorageService完成页面修改
- **事件处理**：处理Panel的各种事件（apply、undo、redo、reset等）

**核心方法**：
```typescript
// 处理页面修改请求
private async handleModifyPage(message: Message, applyId?: string)

// 解析用户输入
private async parseUserInput(text: string): Promise<ParseResult>

// 处理面板事件
public async handlePanelEvent(event: PanelEvent)

// 撤销/重做操作
private async undoLastModification()
private async redoLastModification()
```

### 2. **StyleService（样式服务）**

**主要职责**：
- **样式元素管理**：管理页面上的样式元素快照
- **状态管理**：维护全局样式状态（currentSnapshot、undoStack、redoStack）
- **样式应用**：将样式修改应用到页面DOM
- **快照管理**：创建、保存、恢复样式快照

**核心方法**：
```typescript
// 应用样式修改
static applyModification(modification: Modification)

// 保存快照
static saveSnapshot(userQuery?: string)

// 撤销/重做
static undo()
static redo()

// Eddy状态管理
static restoreFromEddy(eddy: Eddy)
static saveToEddy(eddy: Eddy)
```

### 3. **StorageService（存储服务）**

**主要职责**：
- **Eddy持久化**：保存和加载Eddy对象到Chrome存储
- **域名管理**：按域名组织和管理Eddy
- **数据查询**：提供Eddy的查询和检索功能

**核心方法**：
```typescript
// Eddy CRUD操作
static async createEddy(name: string, domain: string, data?: any)
static async updateEddy(eddy: Eddy)
static async deleteEddy(eddyId: string)
static async getEddysByDomain(domain: string)

// 获取最近使用的Eddy
static async getLastUsedEddy(domain: string)
```

## 数据流转关系

### 1. **用户操作流程**
```
用户输入查询 → FloatingPanel → ContentManager.handlePanelEvent()
    ↓
ContentManager.parseUserInput() → NLPProcessor → 返回modifications
    ↓
ContentManager.handleModifyPage() → StyleService.applyModification()
    ↓
StyleService.saveSnapshot() → 保存userQuery和样式快照
    ↓
ContentManager.updateCurrentEddyStyleElements() → StyleService.saveToEddy()
    ↓
StorageService.updateEddy() → 持久化到Chrome存储
```

### 2. **Eddy切换流程**
```
用户点击下拉菜单 → PanelEvents → FloatingPanel.setCurrentEddy()
    ↓
StyleService.restoreFromEddy() → 恢复GlobalState
    ↓
FloatingPanel.loadDraftContent() → 从currentSnapshot加载userQuery
    ↓
更新输入框内容和按钮状态
```

### 3. **撤销/重做流程**
```
用户点击Undo/Redo → ContentManager.handlePanelEvent()
    ↓
StyleService.undo()/redo() → 恢复历史快照
    ↓
ContentManager.updateInputWithSnapshotQuery() → 更新输入框
    ↓
StyleService.saveToEddy() → 保存新状态
    ↓
StorageService.updateEddy() → 持久化
```

## 组件间的依赖关系

### 1. **ContentManager 依赖**
- **StyleService**：处理样式修改和状态管理
- **StorageService**：保存和加载Eddy数据
- **NLPProcessor**：解析用户输入
- **FloatingBall**：UI交互

### 2. **StyleService 依赖**
- **StorageService**：通过Eddy对象间接使用
- **DOM API**：直接操作页面元素

### 3. **StorageService 依赖**
- **Chrome Storage API**：数据持久化
- **无其他业务依赖**

## 关键设计模式

### 1. **分层架构**
- **UI层**：FloatingBall、FloatingPanel
- **业务层**：ContentManager
- **服务层**：StyleService、StorageService
- **工具层**：NLPProcessor

### 2. **事件驱动**
- Panel事件 → ContentManager → 服务层处理
- 状态变更 → 自动保存 → 更新UI

### 3. **状态管理**
- GlobalState统一管理样式状态
- Eddy对象管理项目状态
- 快照机制支持撤销/重做

## 文件结构

```
src/
├── content/
│   ├── content.ts              # ContentManager - 核心业务逻辑
│   ├── floatingBall.ts         # FloatingBall - 悬浮球组件
│   ├── floatingPanel.ts        # FloatingPanel - 面板组件
│   ├── services/
│   │   └── styleService.ts     # StyleService - 样式服务
│   └── panels/                 # 面板相关组件
│       ├── PanelEvents.ts      # 事件处理
│       ├── PanelRenderer.ts    # UI渲染
│       └── ...
├── services/
│   └── storageService.ts       # StorageService - 存储服务
├── utils/
│   └── nlp/
│       └── nlpProcessor.ts     # NLPProcessor - 自然语言处理
└── types/
    ├── index.ts                # 通用类型定义
    └── eddy.ts                 # Eddy相关类型
```

## 技术栈

- **前端框架**：原生JavaScript + TypeScript
- **UI组件**：自定义Web Components + Shadow DOM
- **状态管理**：自定义GlobalState管理
- **存储**：Chrome Extension Storage API
- **NLP处理**：自定义NLPProcessor + LLM集成
- **构建工具**：Webpack + TypeScript

## 扩展性考虑

### 1. **模块化设计**
- 每个服务都是独立的模块
- 通过接口进行通信
- 便于单元测试和维护

### 2. **插件化架构**
- 可以轻松添加新的样式处理方法
- 支持不同的NLP处理器
- 可扩展的存储后端

### 3. **配置化**
- 支持不同的主题配置
- 可配置的UI布局
- 灵活的事件处理机制

这个架构设计清晰，职责分离明确，便于维护和扩展。ContentManager作为核心协调者，StyleService专注于样式处理，StorageService负责数据持久化，三者协同工作实现完整的页面编辑功能。 