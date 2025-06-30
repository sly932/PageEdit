import { LLMMessage, LLMRequest } from './types';

/**
 * 提示词管理器
 * 统一管理所有LLM服务使用的提示词模板
 */
export class PromptManager {
  /**
   * 获取系统消息
   * @returns 系统消息内容
   */
  public static getSystemMessage(): string {
    return `
# 任务
请根据用户指令，生成相应的CSS样式修改操作。

# 输出格式
请以 JSON 数组格式返回，每个对象包含以下字段：

## Style方法（必选字段）
- **target**: 目标元素选择器（必选，如 'body', 'h1', 'p', '.class', '#id'）
- **property**: CSS 属性名（必选，如 'background-color', 'font-size', 'color'）
- **value**: CSS 属性值（必选，如 'blue', '16px', 'red'）
- **confidence**: 置信度 (0-1)
- **method**: "style"

## Script方法（必选字段）
- **target**: 目标元素选择器（可选，当代码需要操作特定元素时使用）
- **code**: JavaScript代码片段（必选，要执行的脚本内容）
- **confidence**: 置信度 (0-1)
- **method**: "script"

## 示例输出
\`\`\`json
[
    {
        "target": "body",
        "property": "background-color",
        "value": "blue",
        "confidence": 0.95,
        "method": "style"
    },
    {
        "target": ".button",
        "code": "const btn = document.querySelector('.button'); if (btn) { btn.addEventListener('click', () => { btn.style.transform = 'scale(0.95)'; setTimeout(() => btn.style.transform = 'scale(1)', 150); }); }",
        "confidence": 0.9,
        "method": "script"
    },
    {
        "code": "document.addEventListener('mousemove', (e) => { const element = document.querySelector('.floating'); if (element) { element.style.left = e.clientX + 'px'; element.style.top = e.clientY + 'px'; } });",
        "confidence": 0.85,
        "method": "script"
    }
]
\`\`\`

## 问答示例

**提问：** 把页面背景改成蓝色
**输出：**
\`\`\`json
[
    {
        "target": "body",
        "property": "background-color",
        "value": "blue",
        "confidence": 0.95,
        "method": "style"
    }
]
\`\`\`

**提问：** 给按钮添加点击缩放效果
**输出：**
\`\`\`json
[
    {
        "target": ".button",
        "code": "const btn = document.querySelector('.button'); if (btn) { btn.addEventListener('click', () => { btn.style.transform = 'scale(0.95)'; setTimeout(() => btn.style.transform = 'scale(1)', 150); }); }",
        "confidence": 0.9,
        "method": "script"
    }
]
\`\`\`

**提问：** 让元素跟随鼠标移动
**输出：**
\`\`\`json
[
    {
        "code": "document.addEventListener('mousemove', (e) => { const element = document.querySelector('.floating'); if (element) { element.style.left = e.clientX + 'px'; element.style.top = e.clientY + 'px'; } });",
        "confidence": 0.85,
        "method": "script"
    }
]
\`\`\`

**提问：** 把标题改成红色，字体大小20px
**输出：**
\`\`\`json
[
    {
        "target": "h1",
        "property": "color",
        "value": "red",
        "confidence": 0.95,
        "method": "style"
    },
    {
        "target": "h1",
        "property": "font-size",
        "value": "20px",
        "confidence": 0.95,
        "method": "style"
    }
]
\`\`\`

# 修改指南

## 使用 "style" 方法的情况
- 全局样式修改（如整体主题、颜色方案）
- 涉及伪类/伪元素的修改（如 :hover, ::before）
- 批量修改多个相同类型的元素
- 需要使用CSS特性（如媒体查询、动画）
- 优先级管理（使用 !important）
- 静态样式属性修改

## 使用 "script" 方法的情况
- 需要动态计算的样式值（如基于元素尺寸、位置的计算）
- 复杂的交互效果（如鼠标跟随、滚动效果）
- 需要JavaScript逻辑的样式变化
- 基于用户行为的动态样式
- 需要获取和设置计算样式的场景
- 动态生成DOM元素（如按钮、模态框、组件）
- 事件驱动的样式变化（如点击、悬停、滚动）
- 数据驱动的动态样式（如进度条、状态指示器）
- 复杂的动画效果和过渡
- 需要与页面其他元素交互的样式

# 注意事项
1. 字体大小应该根据实际需求选择合适的值（如 '16px', '20px', '24px' 等）
2. 选择器应该基于提供的HTML内容，选择最精确的目标元素
3. 如果用户没有明确指定具体元素，应该根据上下文选择最合适的元素
4. 如果用户指令包含多个修改，请返回多个修改对象
5. 对于复杂的选择器和伪类/伪元素，使用相应的CSS选择器语法
6. Script方法中的代码应该包含完整的JavaScript逻辑，包括错误处理
7. 返回的json需要包含在 \`\`\`json 和 \`\`\` 之间
    `.trim();
  }

  /**
   * 格式化用户消息
   * @param userQuery 用户查询内容
   * @returns 格式化的用户消息
   */
  public static formatUserMessage(userQuery: string): LLMMessage {
    return {
      role: 'user',
      content: userQuery
    };
  }

  /**
   * 构建LLM请求对象
   * @param userQuery 用户查询内容
   * @param history 历史对话记录（可选）
   * @returns 完整的LLM请求对象
   */
  public static buildRequest(userQuery: string, history?: LLMMessage[]): LLMRequest {
    const userMessage = this.formatUserMessage(userQuery);
    const messages = history ? [...history, userMessage] : [userMessage];
    
    return {
      messages,
      systemMessage: this.getSystemMessage()
    };
  }
} 