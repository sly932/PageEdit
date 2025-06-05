# Chrome 扩展配置文件说明

本文档详细说明了 `manifest.json` 中各个配置项的作用。

## 基本信息

```json
{
  "manifest_version": 3,
  "name": "PageEdit",
  "version": "1.0.4",
  "description": "通过自然语言修改网页布局和样式"
}
```

- `manifest_version`: 清单版本
  - Chrome 扩展必须指定使用的清单版本
  - 目前最新版本是 3
  - 版本 3 提供了更好的安全性和性能

- `name`: 扩展名称
  - 显示在 Chrome 扩展管理页面和商店中的名称
  - 用户看到的扩展名称

- `version`: 扩展版本
  - 遵循语义化版本规范：主版本.次版本.修订号
  - 用于版本控制和更新管理

- `description`: 扩展描述
  - 简短描述扩展的功能
  - 显示在扩展管理页面和商店中

## 权限设置

```json
{
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "tabs"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

### permissions（扩展权限）
- `storage`: 存储权限
  - 允许使用 chrome.storage API 存储数据
  - 用于保存用户设置和历史记录

- `activeTab`: 当前标签页权限
  - 允许访问当前活动标签页
  - 用于读取和修改当前页面内容

- `scripting`: 脚本执行权限
  - 允许注入和执行脚本
  - 用于动态修改页面内容

- `tabs`: 标签页权限
  - 允许访问标签页信息
  - 用于获取和操作标签页

### host_permissions（主机权限）
- `"<all_urls>"`: 允许访问所有网站
  - 指定扩展可以访问的网站范围
  - 这里设置为所有网站

## 界面配置

```json
{
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "assets/icons/icon16.png",
      "48": "assets/icons/icon48.png",
      "128": "assets/icons/icon128.png"
    }
  }
}
```

### action（浏览器操作）
- `default_popup`: 弹出页面
  - 点击扩展图标时显示的页面
  - 用于用户交互界面

- `default_icon`: 扩展图标
  - 不同尺寸的图标用于不同场景
  - 16px: 扩展管理页面和工具栏使用
  - 48px: 扩展管理页面使用
  - 128px: Chrome 网上应用店使用

## 功能实现

```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content.js"],
      "css": ["content/content.css"]
    }
  ],
  "background": {
    "service_worker": "background/background.js"
  }
}
```

### content_scripts（内容脚本）
- `matches`: 匹配规则
  - 指定在哪些网页上注入脚本
  - `"<all_urls>"` 表示所有网站

- `js`: JavaScript 文件
  - 要注入到网页中的脚本文件
  - 用于与网页交互

- `css`: 样式文件
  - 要注入到网页中的样式文件
  - 用于自定义界面样式

### background（后台脚本）
- `service_worker`: 服务工作线程
  - 扩展的后台服务
  - 在扩展安装后持续运行
  - 用于处理后台任务

## 资源管理

```json
{
  "icons": {
    "16": "assets/icons/icon16.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  },
  "web_accessible_resources": [{
    "resources": ["assets/icons/*"],
    "matches": ["<all_urls>"]
  }]
}
```

### icons（扩展图标）
- 用于扩展管理页面和 Chrome 网上应用店
- 不同尺寸用于不同场景
- 16px: 小图标
- 48px: 中图标
- 128px: 大图标

### web_accessible_resources（可访问资源）
- `resources`: 可访问的资源路径
  - 指定扩展中可以被网页访问的资源
  - 这里允许访问所有图标文件

- `matches`: 匹配规则
  - 指定哪些网站可以访问这些资源
  - `"<all_urls>"` 表示所有网站 