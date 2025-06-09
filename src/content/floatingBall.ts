import { FloatingPanel } from './floatingPanel';

export class FloatingBall {
    private ball: HTMLDivElement;
    private panel: FloatingPanel;
    private isDragging: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private dragThreshold: number = 5; // 拖拽阈值，避免点击时误触发拖拽

    constructor() {
        this.injectStyles();
        this.ball = this.createBall();
        this.panel = new FloatingPanel();
        this.initialize();
    }

    private injectStyles(): void {
        // 检查是否已经注入过样式
        if (document.getElementById('pageedit-styles')) return;

        const style = document.createElement('style');
        style.id = 'pageedit-styles';
        style.textContent = `
/* CSS Variables - CSS变量定义 */
:root {
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
    :root {
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
    width: 48px !important;
    height: 48px !important;
    min-width: 48px !important;
    min-height: 48px !important;
    max-width: 48px !important;
    max-height: 48px !important;
    position: fixed !important;
    right: 20px !important;
    bottom: 20px !important;
    background: var(--bg-card) !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18), 0 1.5px 4px rgba(0,0,0,0.08) !important;
    cursor: grab !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 999999 !important;
    transition: transform 0.18s cubic-bezier(.4,1.3,.6,1), box-shadow 0.18s !important;
    user-select: none !important;
    border: 2px solid var(--border) !important;
    overflow: hidden !important;
}

#pageedit-floating-ball:active {
    cursor: grabbing !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
}

#pageedit-floating-ball:hover {
    transform: scale(1.12) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.22) !important;
}

#pageedit-floating-ball svg {
    width: 28px !important;
    height: 28px !important;
    display: block !important;
    margin: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
    stroke: var(--text) !important;
    fill: none !important;
    stroke-width: 2 !important;
}

/* Floating Panel - 悬浮面板 */
#pageedit-floating-panel {
    position: fixed !important;
    right: 20px !important;
    bottom: 80px !important;
    width: 300px !important;
    background: var(--bg-card) !important;
    border-radius: 12px !important;
    box-shadow: var(--shadow) !important;
    z-index: 999999 !important;
    display: none !important;
    font-family: 'JetBrains Mono', 'Fira Mono', 'Courier New', monospace !important;
    border: 1.5px solid var(--border-card) !important;
}

/* Panel Header - 面板头部 */
.pageedit-panel-header {
    padding: 12px !important;
    border-bottom: 1px solid var(--border) !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    background: var(--bg-top) !important;
}

.pageedit-panel-header span {
    font-weight: bold !important;
    color: var(--text-title) !important;
}

.pageedit-close-btn {
    border: none !important;
    background: none !important;
    font-size: 20px !important;
    cursor: pointer !important;
    padding: 0 !important;
    color: var(--text-secondary) !important;
}

/* Panel Content - 面板内容 */
.pageedit-panel-content {
    padding: 16px 14px 10px 14px !important;
}

/* Input Card - 输入卡片 */
.pageedit-input-card {
    background: var(--bg-card) !important;
    border-radius: 8px !important;
    padding: 12px !important;
    margin-bottom: 12px !important;
    border: 1px solid var(--border-card) !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
}

.pageedit-input-card .prompt {
    color: var(--text-secondary) !important;
    font-size: 18px !important;
    margin-right: 8px !important;
    font-weight: bold !important;
}

.pageedit-input {
    flex: 1 !important;
    border: none !important;
    outline: none !important;
    font-size: 15px !important;
    font-family: inherit !important;
    background: transparent !important;
    color: var(--text) !important;
    resize: vertical !important;
    min-height: 60px !important;
    padding: 8px !important;
    border-radius: 6px !important;
    border: 1px solid var(--border) !important;
}

/* Button Row - 按钮行 */
.pageedit-button-row {
    display: flex !important;
    gap: 14px !important;
}

/* Main Button - 主按钮 */
.pageedit-main-btn {
    flex: 1 !important;
    padding: 10px 0 !important;
    border-radius: 10px !important;
    border: 2px solid var(--btn-border) !important;
    background: var(--btn-bg) !important;
    color: var(--btn-text) !important;
    font-size: 15px !important;
    font-family: inherit !important;
    font-weight: bold !important;
    cursor: pointer !important;
    box-shadow: 0 1px 4px rgba(191,167,122,0.08) !important;
    transition: background 0.2s, color 0.2s, border 0.2s !important;
}

.pageedit-main-btn:hover {
    background: var(--btn-bg-hover) !important;
    color: var(--btn-hover-text) !important;
    border-color: var(--btn-hover-border) !important;
}

.pageedit-main-btn:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
}

/* Feedback Message - 反馈消息 */
.pageedit-feedback {
    position: fixed !important;
    top: 12px !important;
    right: 18px !important;
    padding: 12px 24px !important;
    border-radius: 8px !important;
    color: #fff !important;
    font-size: 14px !important;
    opacity: 0 !important;
    transition: opacity 0.3s !important;
    font-family: inherit !important;
    box-shadow: 2px 2px 8px rgba(0,0,0,0.12) !important;
    z-index: 9999 !important;
}

.pageedit-feedback.success {
    background-color: #28a745 !important;
}

.pageedit-feedback.error {
    background-color: #d7263d !important;
}

.pageedit-feedback.show {
    opacity: 1 !important;
}
        `;
        document.head.appendChild(style);
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

        // 添加到页面
        document.body.appendChild(this.ball);
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
        this.ball.remove();
        this.panel.destroy();
    }
}
