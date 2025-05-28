# PageEdit 页面修改实现机制

## 1. 修改页面的核心机制
```
用户输入自然语言 → 解析指令 → 定位元素 → 应用样式
```

## 2. 具体实现流程

### A. 内容脚本 (Content Script) 注入
```javascript
// content.js
// 1. 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'MODIFY_PAGE') {
        // 处理页面修改请求
    }
});

// 2. 注入自定义样式
function injectStyles(styles) {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}
```

### B. 元素定位方式
```javascript
// 1. 通过选择器定位
function findElement(selector) {
    return document.querySelector(selector);
}

// 2. 通过相对位置定位
function findElementByPosition(x, y) {
    return document.elementFromPoint(x, y);
}

// 3. 通过文本内容定位
function findElementByText(text) {
    // 遍历所有元素查找匹配文本
}
```

### C. 样式修改方式
```javascript
// 1. 直接修改元素样式
function modifyElementStyle(element, styles) {
    Object.assign(element.style, styles);
}

// 2. 添加/修改类名
function modifyElementClass(element, className) {
    element.classList.add(className);
}

// 3. 动态生成CSS
function generateCSS(selector, styles) {
    return `${selector} { ${styles} }`;
}
```

## 3. 实际应用示例

```javascript
// 处理"把背景改成蓝色"的指令
async function handleBackgroundColorChange() {
    // 1. 解析指令
    const target = 'body';  // 目标元素
    const property = 'background-color';  // 要修改的属性
    const value = 'blue';   // 新的值

    // 2. 定位元素
    const element = document.querySelector(target);

    // 3. 应用修改
    if (element) {
        element.style[property] = value;
        
        // 4. 保存修改历史
        saveModificationHistory({
            type: 'style',
            target,
            property,
            value
        });
    }
}
```

## 4. 修改的持久化

```javascript
// 使用Chrome Storage保存修改
function saveModificationHistory(modification) {
    chrome.storage.local.get(['modificationHistory'], (result) => {
        const history = result.modificationHistory || [];
        history.push({
            ...modification,
            timestamp: Date.now()
        });
        
        chrome.storage.local.set({ modificationHistory: history });
    });
}
```

## 5. 撤销/重做机制

```javascript
// 撤销最后一次修改
function undoLastModification() {
    chrome.storage.local.get(['modificationHistory'], (result) => {
        const history = result.modificationHistory || [];
        const lastModification = history.pop();
        
        if (lastModification) {
            // 恢复原始样式
            const element = document.querySelector(lastModification.target);
            if (element) {
                element.style[lastModification.property] = '';
            }
            
            // 更新历史记录
            chrome.storage.local.set({ modificationHistory: history });
        }
    });
}
```

## 6. 安全考虑

```javascript
// 1. 验证修改是否安全
function isSafeModification(property, value) {
    // 检查是否包含危险的CSS属性
    const dangerousProperties = ['expression', 'javascript:', 'data:'];
    return !dangerousProperties.some(danger => 
        value.includes(danger)
    );
}

// 2. 限制修改范围
function isAllowedTarget(target) {
    // 检查是否允许修改该元素
    const allowedTargets = ['body', 'div', 'span', 'p'];
    return allowedTargets.includes(target);
}
```

## 实现方式的优点
1. 直接操作DOM，响应快速
2. 可以精确控制修改范围
3. 支持撤销/重做
4. 可以保存修改历史
5. 有基本的安全保护

## 注意事项
1. 需要处理跨域问题
2. 注意性能优化
3. 考虑浏览器兼容性
4. 保护用户数据安全
5. 提供友好的错误提示 