# PageEdit 功能调用链条分析

## 1. 页面内容处理系统 (Page Content Processing System)

```
ContentManager (src/content/content.ts)
├── 初始化流程
│   ├── 构造函数
│   │   └── initializeMessageListener()
│   └── initializeFloatingBall()
│
├── 消息处理流程
│   ├── MODIFY_PAGE
│   │   ├── parseUserInput()
│   │   │   └── NLPProcessor.processInput() (src/utils/nlp/nlpProcessor.ts)
│   │   └── handleModifyPage()
│   │       └── StyleService.applyModification() (src/content/services/styleService.ts)
│   │
│   └── INITIALIZE_FLOATING_BALL
│       └── initializeFloatingBall()
│
└── 面板事件处理
    └── handlePanelEvent()
        ├── apply (应用修改)
        │   └── handleModifyPage()
        └── undo (撤销修改)
            └── undoLastModification()
```

## 2. 浮动球系统 (Floating Ball System)

```
FloatingBall (src/content/floatingBall.ts)
├── 初始化流程
│   ├── 构造函数
│   │   ├── 创建 Shadow DOM
│   │   ├── injectStyles()
│   │   ├── createBall()
│   │   └── 创建 FloatingPanel (src/content/floatingPanel.ts)
│   │
│   └── initialize()
│       ├── 事件监听器设置
│       └── 拖拽功能初始化
│
├── 交互功能
│   ├── 拖拽处理
│   │   ├── handleMouseDown()
│   │   ├── handleMouseMove()
│   │   └── handleMouseUp()
│   │
│   └── 点击处理
│       └── handleClick()
│
└── 面板控制
    ├── setPanelEventCallback()
    ├── showFeedback()
    ├── resetApplyButton()
    └── clearInput()
```

## 3. 样式处理系统 (Style Processing System)

```
StyleService (src/content/services/styleService.ts)
├── 样式应用
│   └── applyModification()
│       ├── 处理普通选择器
│       │   └── document.querySelectorAll()
│       │
│       └── 处理伪类/伪元素
│           └── 直接应用样式规则
│
└── 样式撤销
    └── undoLastModification()
```

## 4. 数据流 (Data Flow)

```
用户输入
└── FloatingPanel (src/content/floatingPanel.ts)
    └── PanelEvent
        └── ContentManager.handlePanelEvent() (src/content/content.ts)
            ├── 应用修改
            │   └── handleModifyPage()
            │       ├── parseUserInput()
            │       └── StyleService.applyModification() (src/content/services/styleService.ts)
            │
            └── 撤销修改
                └── undoLastModification()
```

## 5. 事件处理链 (Event Handling Chain)

```
用户交互
├── 浮动球拖拽
│   └── FloatingBall (src/content/floatingBall.ts)
│       ├── handleMouseDown()
│       ├── handleMouseMove()
│       └── handleMouseUp()
│
├── 面板操作
│   └── FloatingPanel (src/content/floatingPanel.ts)
│       └── PanelEvent
│           └── ContentManager.handlePanelEvent() (src/content/content.ts)
│
└── 页面修改
    └── ContentManager (src/content/content.ts)
        └── handleModifyPage()
            └── StyleService (src/content/services/styleService.ts)
```

## 关键流程说明 (Key Process Descriptions)

### 1. 页面修改流程
1. 用户通过浮动面板输入修改指令 (src/content/floatingPanel.ts)
2. 触发 PanelEvent 事件
3. ContentManager 处理事件并解析用户输入 (src/content/content.ts)
4. 应用样式修改 (src/content/services/styleService.ts)
5. 提供用户反馈

### 2. 浮动球交互流程
1. 用户与浮动球交互（拖拽/点击）(src/content/floatingBall.ts)
2. 触发相应的事件处理函数
3. 更新浮动球位置或显示/隐藏面板
4. 处理面板相关操作 (src/content/floatingPanel.ts)

### 3. 样式应用流程
1. 接收样式修改请求 (src/content/services/styleService.ts)
2. 解析选择器
3. 查找目标元素
4. 应用样式修改
5. 记录修改历史（用于撤销） 