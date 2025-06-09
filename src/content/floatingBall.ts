import { FloatingPanel, PanelEvent } from './floatingPanel';

export class FloatingBall {
    private ball: HTMLDivElement;
    private panel: FloatingPanel;
    private isDragging: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private dragThreshold: number = 5; // 拖拽阈值，避免点击时误触发拖拽
    private rootElement: HTMLDivElement; // 根元素
    private shadowRoot: ShadowRoot; // Shadow DOM 根节点
    private panelEventCallback: ((event: PanelEvent) => void) | null = null;

    constructor() {
        // 创建根元素
        this.rootElement = document.createElement('div');
        this.rootElement.id = 'pageedit-root-element';
        this.rootElement.className = 'pageedit-root-element';
        this.rootElement.style.position = 'absolute';
        this.rootElement.style.top = '0px';
        this.rootElement.style.left = '0px';
        this.rootElement.style.zIndex = '2147483647';

        // 创建Shadow DOM
        this.shadowRoot = this.rootElement.attachShadow({ mode: 'open' });

        // 注入样式到Shadow DOM
        this.injectStyles();

        // 创建悬浮球
        this.ball = this.createBall();

        // 创建面板
        this.panel = new FloatingPanel(this.shadowRoot);

        // 初始化
        this.initialize();

        // 添加根元素到页面
        document.body.appendChild(this.rootElement);
    }

    // 设置面板事件回调
    public setPanelEventCallback(callback: (event: PanelEvent) => void): void {
        this.panelEventCallback = callback;
        this.panel.setEventCallback(callback);
    }

    // 显示反馈消息
    public showFeedback(message: string, type: 'success' | 'error'): void {
        this.panel.showFeedback(message, type);
    }

    // 重置应用按钮
    public resetApplyButton(): void {
        this.panel.resetApplyButton();
    }

    // 清空输入框
    public clearInput(): void {
        this.panel.clearInput();
    }

    private injectStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
/* CSS Variables - CSS变量定义 */
:host {
    --bg-card: #ffffff;
    --border: #e1e5e9;
    --border-card: #e1e5e9;
    --text: #24292f;
    --text-title: #1f2328;
    --text-secondary: #656d76;
    --bg-top: #f6f8fa;
    --btn-bg: #f6f8fa;
    --btn-border: #d0d7de;
    --btn-text: #24292f;
    --btn-bg-hover: #f3f4f6;
    --btn-hover-text: #24292f;
    --btn-hover-border: #d0d7de;
    --shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    :host {
        --bg-card: #0d1117;
        --border: #30363d;
        --border-card: #21262d;
        --text: #e6edf3;
        --text-title: #f0f6fc;
        --text-secondary: #7d8590;
        --bg-top: #161b22;
        --btn-bg: #21262d;
        --btn-border: #30363d;
        --btn-text: #f0f6fc;
        --btn-bg-hover: #30363d;
        --btn-hover-text: #f0f6fc;
        --btn-hover-border: #8b949e;
        --shadow: 0 8px 24px rgba(1, 4, 9, 0.8);
    }
}

/* Floating Ball - 悬浮球 */
#pageedit-floating-ball {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    max-width: 48px;
    max-height: 48px;
    position: fixed;
    right: 20px;
    bottom: 20px;
    background: var(--bg-card);
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18), 0 1.5px 4px rgba(0,0,0,0.08);
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    transition: transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s;
    user-select: none;
    border: 2px solid var(--border);
    overflow: hidden;
}

#pageedit-floating-ball:active {
    cursor: grabbing;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

#pageedit-floating-ball:hover {
    transform: scale(1.12);
    box-shadow: 0 8px 24px rgba(0,0,0,0.22);
}

#pageedit-floating-ball svg {
    width: 28px;
    height: 28px;
    display: block;
    margin: auto;
    max-width: 100%;
    max-height: 100%;
    stroke: var(--text);
    fill: none;
    stroke-width: 2;
}

/* Floating Panel - 悬浮面板 */
#pageedit-floating-panel {
    position: fixed;
    right: 20px;
    bottom: 80px;
    width: 300px;
    background: var(--bg-card);
    border-radius: 12px;
    box-shadow: var(--shadow);
    z-index: 999999;
    display: none;
    font-family: 'JetBrains Mono', 'Fira Mono', 'Courier New', monospace;
    border: 1.5px solid var(--border-card);
}

/* Panel Header - 面板头部 */
.pageedit-panel-header {
    padding: 12px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-top);
}

.pageedit-panel-header span {
    font-weight: bold;
    color: var(--text-title);
}

.pageedit-close-btn {
    border: none;
    background: none;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    color: var(--text-secondary);
}

/* Panel Content - 面板内容 */
.pageedit-panel-content {
    padding: 16px 14px 10px 14px;
}

/* Input Card - 输入卡片 */
.pageedit-input-card {
    background: var(--bg-card);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid var(--border-card);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.pageedit-input-card .prompt {
    color: var(--text-secondary);
    font-size: 18px;
    margin-right: 8px;
    font-weight: bold;
}

.pageedit-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    font-family: inherit;
    background: transparent;
    color: var(--text);
    resize: vertical;
    min-height: 60px;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
}

/* Button Row - 按钮行 */
.pageedit-button-row {
    display: flex;
    gap: 14px;
}

/* Main Button - 主按钮 */
.pageedit-main-btn {
    flex: 1;
    padding: 10px 0;
    border-radius: 10px;
    border: 2px solid var(--btn-border);
    background: var(--btn-bg);
    color: var(--btn-text);
    font-size: 15px;
    font-family: inherit;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(191,167,122,0.08);
    transition: background 0.2s, color 0.2s, border 0.2s;
}

.pageedit-main-btn:hover {
    background: var(--btn-bg-hover);
    color: var(--btn-hover-text);
    border-color: var(--btn-hover-border);
}

.pageedit-main-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Feedback Message - 反馈消息 */
.pageedit-feedback {
    position: fixed;
    top: 12px;
    right: 18px;
    padding: 12px 24px;
    border-radius: 8px;
    color: #fff;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s;
    font-family: inherit;
    box-shadow: 2px 2px 8px rgba(0,0,0,0.12);
    z-index: 9999;
}

.pageedit-feedback.success {
    background-color: #28a745;
}

.pageedit-feedback.error {
    background-color: #d7263d;
}

.pageedit-feedback.show {
    opacity: 1;
}
        `;
        this.shadowRoot.appendChild(style);
    }

    private createBall(): HTMLDivElement {
        const ball = document.createElement('div');
        ball.id = 'pageedit-floating-ball';
        ball.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
        `;
        return ball;
    }

    private initialize(): void {
        // 添加事件监听
        this.ball.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.ball.addEventListener('click', this.handleClick.bind(this));

        // 添加到Shadow DOM
        this.shadowRoot.appendChild(this.ball);
    }

    private handleMouseDown(e: MouseEvent): void {
        e.preventDefault();
        this.isDragging = false;
        this.startX = e.clientX - this.ball.offsetLeft;
        this.startY = e.clientY - this.ball.offsetTop;

        const initialX = e.clientX;
        const initialY = e.clientY;

        const handleMouseMove = (e: MouseEvent) => {
            // 检查是否超过拖拽阈值
            const deltaX = Math.abs(e.clientX - initialX);
            const deltaY = Math.abs(e.clientY - initialY);

            if (!this.isDragging && (deltaX > this.dragThreshold || deltaY > this.dragThreshold)) {
                this.isDragging = true;
                this.ball.style.transition = 'none';
            }

            if (!this.isDragging) return;

            const x = e.clientX - this.startX;
            const y = e.clientY - this.startY;
            // 限制在窗口范围内
            const maxX = window.innerWidth - this.ball.offsetWidth;
            const maxY = window.innerHeight - this.ball.offsetHeight;
            this.ball.style.left = `${Math.min(Math.max(0, x), maxX)}px`;
            this.ball.style.top = `${Math.min(Math.max(0, y), maxY)}px`;
            this.ball.style.right = 'auto';
            this.ball.style.bottom = 'auto';
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            if (this.isDragging) {
                this.ball.style.transition = '';
                // 延迟重置拖拽状态，避免点击事件被误触发
                setTimeout(() => {
                    this.isDragging = false;
                }, 100);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    private handleClick(e: MouseEvent): void {
        // 如果正在拖拽，不触发点击事件
        if (this.isDragging) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        this.panel.toggle();
    }

    public destroy(): void {
        this.rootElement.remove();
        this.panel.destroy();
    }
}
