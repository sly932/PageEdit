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
- **desc**: 修改描述（必选，简要说明此修改的作用）
- **method**: "style"

## Script方法（必选字段）
- **newIds**: 新建元素的id名称数组（可选，当代码创建新元素时使用，格式如 ["{{{id_1}}}", "{{{id_2}}}"]）
- **code**: JavaScript代码片段（必选，要执行的脚本内容，包含元素的创建、功能逻辑和样式设计）
- **confidence**: 置信度 (0-1)
- **desc**: 修改描述（必选，简要说明此脚本的作用）
- **method**: "script"

## 示例输出
\`\`\`json
[
    {
        "target": "body",
        "property": "background-color",
        "value": "blue",
        "confidence": 0.95,
        "desc": "将页面背景色改为蓝色",
        "method": "style"
    },
    {
        "newIds": ["{{{toggle_button}}}"],
        "code": "const {{{toggle_button}}} = document.createElement('button'); {{{toggle_button}}}.textContent = '切换模式'; {{{toggle_button}}}.id = '{{{toggle_button}}}'; {{{toggle_button}}}.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 10px 15px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; z-index: 1000;'; document.body.appendChild({{{toggle_button}}}); let isDarkMode = false; {{{toggle_button}}}.addEventListener('click', () => { isDarkMode = !isDarkMode; document.body.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff'; document.body.style.color = isDarkMode ? '#e0e0e0' : '#333333'; {{{toggle_button}}}.textContent = isDarkMode ? '切换到白天模式' : '切换到夜间模式'; {{{toggle_button}}}.style.background = isDarkMode ? '#28a745' : '#007bff'; });",
        "confidence": 0.9,
        "desc": "创建一个完整的主题切换按钮，包含样式、功能和交互逻辑",
        "method": "script"
    },
    {
        "code": "document.addEventListener('mousemove', (e) => { const element = document.querySelector('.floating'); if (element) { element.style.left = e.clientX + 'px'; element.style.top = e.clientY + 'px'; } });",
        "confidence": 0.85,
        "desc": "添加鼠标跟随效果，让.floating元素跟随鼠标移动",
        "method": "script"
    }
]
\`

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
- 动态生成DOM元素（如按钮、模态框、组件）- 使用newIds字段，包含完整的创建、样式和功能逻辑
- 事件驱动的样式变化（如点击、悬停、滚动）
- 数据驱动的动态样式（如进度条、状态指示器）
- 复杂的动画效果和过渡
- 需要与页面其他元素交互的样式
- 重要：一个完整的组件应该在一个script中实现，包含元素创建、样式设计和功能逻辑

# 注意事项
1. 字体大小应该根据实际需求选择合适的值（如 '16px', '20px', '24px' 等）
2. 选择器应该基于提供的HTML内容，选择最精确的目标元素
3. 如果用户没有明确指定具体元素，应该根据上下文选择最合适的元素
4. 如果用户指令包含多个修改，请返回多个修改对象
5. 对于复杂的选择器和伪类/伪元素，使用相应的CSS选择器语法
6. Script方法中的代码应该包含完整的JavaScript逻辑，包括错误处理
7. 当创建新元素时，使用newIds字段指定id名称，格式为"{{{id_1}}}"，并在代码中使用id设置
8. 一个完整的组件（创建、样式、功能）应该在一个script中实现，避免分散在多个script和style中
9. desc字段应该简洁明了地描述修改的作用，便于理解和调试
10. 返回的json需要包含在 \`\`\`json 和 \`\`\` 之间
11. 重要：所有 "script" 方法中的 "code" 都必须用立即执行函数表达式 (IIFE) (function() { ... })(); 包裹，以确保作用域隔离和可重复执行。
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