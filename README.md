# Eddy - 网页样式编辑器

一个强大的浏览器扩展，允许用户自定义任何网页的样式。

## 项目结构

```
src/
├── assets/          # 静态资源文件
├── background/      # 后台脚本
├── content/         # 内容脚本
│   ├── handlers/    # 事件处理器
│   ├── services/    # 内容脚本服务
│   ├── index.ts     # 内容脚本入口
│   ├── content.ts   # 主要内容逻辑
│   ├── floatingBall.ts    # 悬浮球组件
│   └── floatingPanel.ts   # 悬浮面板组件
├── popup/          # 扩展弹出窗口
├── services/       # 核心服务
│   └── storageService.ts  # 存储服务
├── styles/         # 样式文件
├── types/          # 类型定义
│   ├── eddy.ts     # Eddy 相关类型
│   ├── index.ts    # 通用类型定义
│   └── chrome.d.ts # Chrome API 类型
└── utils/          # 工具函数
```

## 核心功能

### 1. 样式编辑
- 支持直接修改 DOM 样式
- 支持通过 CSS 规则修改
- 支持在 Shadow DOM 中修改样式

### 2. Eddy 系统
- 支持创建多个样式预设（Eddy）
- 每个域名可以保存多个 Eddy
- 自动应用最近使用的 Eddy
- 支持 Eddy 的创建、编辑、删除

### 3. 用户界面
- 悬浮球：快速访问编辑功能
- 悬浮面板：样式编辑界面
- 支持实时预览

## 主要组件

### 1. 存储服务 (StorageService)
- 管理 Eddy 的存储和检索
- 支持按域名组织 Eddy
- 维护最近使用的 Eddy

### 2. 样式服务 (StyleService)
- 处理样式修改
- 支持多种修改方法
- 提供样式恢复功能

### 3. 悬浮球 (FloatingBall)
- 提供快速访问入口
- 可拖拽定位
- 展开/收起功能

### 4. 悬浮面板 (FloatingPanel)
- 样式编辑界面
- 实时预览
- Eddy 管理

## 技术栈

- TypeScript
- Chrome Extension API
- CSS
- HTML

## 开发

1. 安装依赖
```bash
npm install
```

2. 开发模式
```bash
npm run dev
```

3. 构建
```bash
npm run build
```

## 使用流程

1. 点击悬浮球打开编辑面板
2. 输入样式修改需求
3. 应用修改
4. 保存为 Eddy
5. 下次访问自动应用

## 未来计划

- [ ] 样式模板系统
- [ ] 样式导入/导出
- [ ] 样式版本控制
- [ ] 样式冲突检测
- [ ] 更多自定义选项

## 项目概述
PageEdit 是一个创新的浏览器工具，允许用户通过自然语言描述来实时修改网页的布局和样式。用户可以简单地说"把背景改成蓝色"或"让这个按钮更大一些"，工具就会自动应用相应的CSS修改。

## 核心功能
- 🗣️ **自然语言解析** - 理解用户的样式修改意图
- 🎨 **实时样式修改** - 即时应用CSS变更到网页
- 🔍 **智能元素识别** - 自动识别用户想要修改的页面元素
- 💾 **样式持久化** - 保存用户的自定义样式
- 🔄 **撤销/重做** - 支持操作历史管理
- 🎯 **多元素修改** - 支持同时修改多个元素
- 🔒 **安全验证** - 确保修改的安全性
- 📊 **修改历史** - 记录所有修改操作

## 技术架构

### 核心组件
```
PageEdit/
├── manifest.json           # 插件配置文件
├── popup/                  # 弹出窗口
│   ├── popup.html         # 用户界面
│   ├── popup.css          # 样式
│   └── popup.js           # 弹出窗口逻辑
├── content/               # 内容脚本
│   ├── content.js        # 与网页交互
│   └── content.css       # 注入样式
├── background/           # 后台脚本
│   └── background.js    # 后台逻辑
├── utils/               # 工具类
│   ├── dom/            # DOM 操作工具
│   │   ├── elementLocator.ts    # 元素定位工具
│   │   ├── styleModifier.ts     # 样式修改工具
│   │   └── elementFinder.ts     # 元素查找工具
│   ├── storage/        # 存储相关工具
│   │   └── storageManager.ts    # 存储管理工具
│   ├── nlp/            # 自然语言处理工具
│   │   └── llmService.ts        # LLM 服务工具
│   └── validation/     # 数据验证工具
│       └── validator.ts         # 数据验证工具
└── assets/              # 静态资源
    └── icons/          # 图标资源
```

### 技术栈
- **前端**: Chrome Extension (原生JavaScript/TypeScript)
- **AI模型**: 自然语言处理 + CSS生成
- **存储**: Chrome Storage API
- **开发工具**: VS Code, Chrome DevTools
- **版本控制**: Git
- **构建工具**: Webpack
- **代码规范**: ESLint + Prettier
- **测试框架**: Jest

### 组件职责
1. **Popup组件**
   - 用户输入界面
   - 显示当前页面信息
   - 提供编辑选项
   - 显示修改历史
   - 管理用户设置
   - 提供操作反馈

2. **Content Script**
   - 监听页面DOM变化
   - 执行样式修改
   - 处理元素定位
   - 注入自定义样式
   - 管理修改历史
   - 处理页面交互

3. **Background Script**
   - 管理插件状态
   - 处理数据存储
   - 处理跨域请求
   - 管理插件生命周期
   - 处理消息通信
   - 管理权限

4. **Utils 工具类**
   - DOM 操作工具：元素定位、样式修改、元素查找
   - 存储工具：数据持久化、状态管理
   - NLP 工具：自然语言处理、LLM 服务
   - 验证工具：数据验证、安全检查

### 数据流
```
用户输入 → Popup → Content Script → Utils工具类 → 页面修改
                    ↓
              Background Script
                    ↓
              Chrome Storage
```

### 详细数据流说明
1. **用户交互流程**
   ```
   用户输入 → Popup界面
   ↓
   Content Script接收指令
   ↓
   Utils工具类处理
   ├── DOM工具：元素定位和样式修改
   ├── NLP工具：自然语言处理
   ├── 验证工具：安全检查
   └── 存储工具：状态管理
   ↓
   应用修改到页面
   ```

2. **数据存储流程**
   ```
   Background Script
   ↓
   存储工具(Utils/storage)
   ↓
   Chrome Storage
   ```

3. **状态同步流程**
   ```
   Content Script ←→ Background Script
        ↓              ↓
   Utils工具类 ←→ Chrome Storage
   ```

## 使用场景
1. **个性化浏览体验** - 用户可以根据喜好调整任何网站的外观
2. **无障碍访问** - 帮助视觉障碍用户调整页面以提高可读性
3. **设计原型** - 设计师可以快速测试不同的样式方案
4. **学习工具** - 帮助学习者理解CSS和网页设计
5. **开发调试** - 开发者可以快速测试不同的样式效果
6. **内容定制** - 用户可以自定义网站内容的展示方式

## 开发计划
- [ ] 基础浏览器扩展框架
  - [ ] 创建manifest.json
  - [ ] 设置基本图标
  - [ ] 配置popup页面
  - [ ] 配置权限
- [ ] 用户界面
  - [ ] 设计popup界面
  - [ ] 实现用户输入
  - [ ] 添加基本样式
  - [ ] 实现响应式设计
- [ ] 核心功能
  - [ ] 实现DOM操作
  - [ ] 添加样式修改
  - [ ] 实现元素定位
  - [ ] 实现多元素修改
- [ ] 高级功能
  - [ ] 自然语言处理
  - [ ] 修改历史
  - [ ] 用户设置
  - [ ] 导入导出

## 快速开始
```bash
# 克隆项目
git clone <repository-url>

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建扩展
npm run build

# 运行测试
npm test

# 代码检查
npm run lint
```

## 安全考虑
- 内容安全策略(CSP)
- 跨域请求处理
- 数据验证
- 错误处理
- 权限管理
- 输入验证
- XSS防护
- 数据加密

## 性能优化
- 延迟加载
- 缓存机制
- 批量DOM操作
- 防抖和节流
- 资源压缩
- 代码分割
- 按需加载
- 性能监控

## 贡献
欢迎提交 Issues 和 Pull Requests！

### 贡献指南
1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 开发规范
- 遵循 TypeScript 规范
- 使用 ESLint 进行代码检查
- 编写单元测试
- 保持代码文档更新

## 许可证
MIT License

## 联系方式
- 项目主页：[GitHub Repository]
- 问题反馈：[Issues]
- 邮件联系：[Email] 