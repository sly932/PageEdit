# PageEdit 项目结构文档

## 项目整体架构 (Project Architecture)

### 1. 核心功能模块 (Core Modules)

#### 1.1 服务层 (Services)
- `src/services/` - 核心服务层
  - `storageService.ts` - 数据存储服务

#### 1.2 内容处理 (Content Processing)
- `src/content/` - 页面内容处理
  - `content.ts` - 主要内容处理逻辑
  - `floatingBall.ts` - 浮动球组件
  - `floatingPanel.ts` - 浮动面板组件
  - `handlers/` - 事件处理器
  - `services/` - 内容相关服务

#### 1.3 其他核心模块
- `src/background/` - 后台服务
- `src/popup/` - 弹出窗口相关
- `src/utils/` - 工具函数
- `src/types/` - TypeScript 类型定义
- `src/styles/` - 样式文件
- `src/assets/` - 静态资源

### 2. 技术栈 (Tech Stack)
- TypeScript
- Webpack (构建工具)
- Jest (测试框架)

## 主要功能模块说明 (Main Function Modules)

### 1. 浮动球系统 (Floating Ball System)
- `floatingBall.ts` - 实现浮动球UI和交互
- `floatingPanel.ts` - 实现浮动面板功能

### 2. 内容处理系统 (Content Processing System)
- `content.ts` - 处理页面内容的主要逻辑
- `handlers/` - 处理各种用户交互事件

### 3. 存储系统 (Storage System)
- `storageService.ts` - 管理数据持久化

### 4. 后台服务 (Background Services)
- 处理扩展的后台任务和生命周期

## 项目特点 (Project Features)

1. **模块化设计**
   - 每个功能模块都有清晰的职责划分
   - 使用 TypeScript 类型系统确保类型安全

2. **事件驱动架构**
   - 基于消息传递的通信机制
   - 使用事件回调处理用户交互

3. **Shadow DOM 隔离**
   - 使用 Shadow DOM 确保样式隔离
   - 防止与页面样式冲突

4. **异步处理**
   - 使用 Promise 处理异步操作
   - 支持复杂的页面修改操作 