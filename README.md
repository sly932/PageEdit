# PageEdit - 自然语言网页布局修改工具

## 项目概述
PageEdit 是一个创新的浏览器工具，允许用户通过自然语言描述来实时修改网页的布局和样式。用户可以简单地说"把背景改成蓝色"或"让这个按钮更大一些"，工具就会自动应用相应的CSS修改。

## 核心功能
- 🗣️ **自然语言解析** - 理解用户的样式修改意图
- 🎨 **实时样式修改** - 即时应用CSS变更到网页
- 🔍 **智能元素识别** - 自动识别用户想要修改的页面元素
- 💾 **样式持久化** - 保存用户的自定义样式
- 🔄 **撤销/重做** - 支持操作历史管理

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
└── assets/              # 静态资源
    └── icons/          # 图标资源
```

### 技术栈
- **前端**: Chrome Extension (原生JavaScript/TypeScript)
- **AI模型**: 自然语言处理 + CSS生成
- **存储**: Chrome Storage API
- **开发工具**: VS Code, Chrome DevTools
- **版本控制**: Git

### 组件职责
1. **Popup组件**
   - 用户输入界面
   - 显示当前页面信息
   - 提供编辑选项
   - 显示修改历史

2. **Content Script**
   - 监听页面DOM变化
   - 执行样式修改
   - 处理元素定位
   - 注入自定义样式

3. **Background Script**
   - 管理插件状态
   - 处理数据存储
   - 处理跨域请求
   - 管理插件生命周期

### 数据流
```
用户输入 → Popup → Content Script → 页面修改
                    ↓
              Background Script
                    ↓
              Chrome Storage
```

## 使用场景
1. **个性化浏览体验** - 用户可以根据喜好调整任何网站的外观
2. **无障碍访问** - 帮助视觉障碍用户调整页面以提高可读性
3. **设计原型** - 设计师可以快速测试不同的样式方案
4. **学习工具** - 帮助学习者理解CSS和网页设计

## 开发计划
- [ ] 基础浏览器扩展框架
  - [ ] 创建manifest.json
  - [ ] 设置基本图标
  - [ ] 配置popup页面
- [ ] 用户界面
  - [ ] 设计popup界面
  - [ ] 实现用户输入
  - [ ] 添加基本样式
- [ ] 核心功能
  - [ ] 实现DOM操作
  - [ ] 添加样式修改
  - [ ] 实现元素定位
- [ ] 高级功能
  - [ ] 自然语言处理
  - [ ] 修改历史
  - [ ] 用户设置

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
```

## 安全考虑
- 内容安全策略(CSP)
- 跨域请求处理
- 数据验证
- 错误处理

## 性能优化
- 延迟加载
- 缓存机制
- 批量DOM操作
- 防抖和节流

## 贡献
欢迎提交 Issues 和 Pull Requests！

## 许可证
MIT License 