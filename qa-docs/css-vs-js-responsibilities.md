这是一个非常核心的前端开发问题。掌握它们的分工是写出清晰、高效、可维护代码的关键。

简单来说，记住这个**黄金法则**：

*   **CSS (`<style>`) 负责“长什么样”（外观和样式）。**
*   **JavaScript (`document...`) 负责“做什么事”（行为和逻辑）。**

它们的分工就像建筑里的：
*   **CSS** 是油漆、墙纸、瓷砖和装饰，决定了房子的视觉风格。
*   **JavaScript** 是电线、水管、门锁和开关，决定了房子的功能和交互。

下面我们详细拆解，告诉你具体的判断标准。

---

### 什么时候必须使用 CSS (`<style>`)

你应该**优先**使用CSS来处理所有和**视觉表现**相关的事情。

**使用场景:**

1.  **静态样式**: 颜色、字体、大小、边距、背景、边框等。这是CSS最基本的工作。
    *   **例子**: `h1 { color: blue; font-size: 24px; }`

2.  **布局 (Layout)**: 元素的位置、排列和对齐。现代CSS的Flexbox和Grid让布局变得非常强大和简单。
    *   **例子**: `div { display: flex; justify-content: center; }`

3.  **响应式设计**: 根据屏幕大小、方向或分辨率改变样式。这是CSS的独有功能，JS做起来会非常笨拙。
    *   **例子**: `@media (max-width: 600px) { .sidebar { display: none; } }`

4.  **状态变化**: 元素在交互中的不同状态，如鼠标悬停、点击、禁用、选中等。CSS通过**伪类 (pseudo-classes)** 来优雅地处理。
    *   **例子**: `button:hover { background-color: #eee; }`, `input:focus { border-color: blue; }`

5.  **装饰性内容**: 添加非关键性的、纯粹为了装饰的图标或文本。这就是我们之前讨论的 `::before` 和 `::after` **伪元素**。
    *   **例子**: `a.external::after { content: ' ↗'; }`

**判断标准：** 如果你能用一个**“规则”**来描述你的修改（“所有class为`error`的文本都应该是红色的”、“当鼠标悬停在按钮上时，它应该变亮”），那么就用CSS。

---

### 什么时候必须使用 JavaScript (`document...`)

你应该使用JavaScript来处理所有和**逻辑、行为、内容与结构变更**相关的事情。

**使用场景:**

1.  **修改内容 (Content)**: 改变元素显示的文本或HTML。这是JS的核心能力，CSS完全做不到。
    *   **例子**: `document.querySelector('#username').textContent = '张三';`

2.  **修改结构 (Structure)**: 在DOM中**创建、添加、移动或删除**元素。CSS也完全做不到。
    *   **例子**: `const newDiv = document.createElement('div'); document.body.appendChild(newDiv);`

3.  **响应复杂的事件**: 响应那些CSS伪类无法覆盖的事件。
    *   **例子**:
        *   用户从服务器**获取数据后**更新列表。
        *   用户**拖拽**一个元素。
        *   一个**定时器**结束后显示一个通知。
        *   用户**滚动**到页面底部时加载更多内容。

4.  **修改元素的属性 (Attributes)**: 改变 `src`, `href`, `value` 或自定义的 `data-*` 属性。
    *   **例子**: `document.querySelector('img').src = 'new-image.png';`

5.  **计算动态样式**: 当一个样式的值需要通过计算得出时。
    *   **例子**: 根据鼠标的位置 `event.clientX` 来设置一个提示框的 `left` 和 `top` 样式。
    *   `tooltip.style.left = event.clientX + 'px';`

**判断标准：** 如果你的修改需要**“做一件事”**（“从服务器拿数据”、“创建一个新元素”、“计算一个位置”），或者需要改变元素的**内容或结构**，那么就必须用JavaScript。

---

### 最佳实践：JS 和 CSS 协同工作（混合模式）

在真实项目中，最常见、也是最好的方法是让它们协同工作：**用 JavaScript 来管理状态，用 CSS 来响应状态。**

这个模式通常通过**切换CSS类名**来实现。

**工作流程：**

1.  **CSS**: 你预先定义好不同状态的样式规则。
    ```css
    /* 默认样式 */
    .panel {
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    /* “激活”状态的样式 */
    .panel.is-active {
      display: block;
      opacity: 1;
    }
    ```

2.  **JavaScript**: 你的JS代码不直接去修改 `style.display` 或 `style.opacity`。它只做一件事：在需要的时候，**添加或移除那个 `is-active` 类**。
    ```typescript
    const button = document.querySelector('#show-panel-btn');
    const panel = document.querySelector('.panel');

    button.addEventListener('click', () => {
      // JS只负责切换状态类，不关心具体样式
      panel.classList.toggle('is-active');
    });
    ```

**为什么这是最佳实践？**

*   **关注点分离 (Separation of Concerns)**: JS负责逻辑（*何时*显示面板），CSS负责表现（面板*如何*显示）。代码更清晰，更容易维护。
*   **性能更好**: 浏览器可以非常高效地处理CSS类名的变化和重绘。
*   **可维护性**: 如果将来想改变面板出现的动画效果，你只需要修改CSS文件，完全不用动JS代码。

### 总结表格

| 任务 | 使用 CSS (`<style>`) | 使用 JavaScript (`document...`) | 最佳实践 |
| :--- | :---: | :---: | :--- |
| **改变颜色/字体/边距** | ✅ | ❌ (不推荐) | CSS |
| **页面布局 (Flex/Grid)** | ✅ | ❌ (不推荐) | CSS |
| **响应鼠标悬停/点击** | ✅ | ✅ | CSS (`:hover`) |
| **替换元素内的文本** | ❌ | ✅ | JavaScript |
| **创建或删除元素** | ❌ | ✅ | JavaScript |
| **从API获取数据并显示** | ❌ | ✅ | JavaScript |
| **显示/隐藏一个面板** | ❌ | ✅ | **JS切换Class，CSS定义样式** |
| **根据屏幕大小调整布局** | ✅ (`@media`) | ❌ (非常不推荐) | CSS |
| **添加装饰性图标** | ✅ (`::before`) | ❌ (不推荐) | CSS |

希望这个详细的解释能帮你建立起清晰的判断标准！