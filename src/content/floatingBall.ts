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
        console.log('[PageEdit][FloatingBall] Initializing FloatingBall...');
        // 创建根元素
        this.rootElement = document.createElement('div');
        this.rootElement.id = 'pageedit-root-element';
        console.log('[PageEdit][FloatingBall] Root element created:', this.rootElement);
        this.rootElement.style.position = 'fixed';
        this.rootElement.style.top = '0';
        this.rootElement.style.left = '0';
        this.rootElement.style.width = '100%';
        this.rootElement.style.height = '100%';
        this.rootElement.style.pointerEvents = 'none';
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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
            
            * {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
            }

            /* 导入 Tailwind 样式 */
            @import url('${chrome.runtime.getURL('styles/main.css')}');

            @media (prefers-color-scheme: dark) {
                :host {
                    color-scheme: dark;
                }
            }

            /* 自定义动画 */
            @keyframes float {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-5px);
                }
            }

            #pageedit-floating-ball:hover {
                animation: float 2s ease-in-out infinite;
            }

            /* 确保 Shadow DOM 中的样式正确应用 */
            #pageedit-floating-ball {
                position: fixed;
                right: 1.25rem;
                bottom: 1.25rem;
                width: 48px !important;
                height: 48px !important;
                min-width: 48px !important;
                min-height: 48px !important;
                max-width: 48px !important;
                max-height: 48px !important;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(8px);
                border-radius: 9999px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                cursor: grab;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                transition: all 0.2s ease-out;
                border: 1px solid rgba(255, 255, 255, 0.2);
                overflow: hidden;
                pointer-events: auto;
            }

            @media (prefers-color-scheme: dark) {
                #pageedit-floating-ball {
                    background: rgba(31, 41, 55, 0.8);
                    border-color: rgba(55, 65, 81, 0.3);
                }
            }

            #pageedit-floating-ball:hover {
                transform: scale(1.1);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }

            #pageedit-floating-ball:active {
                cursor: grabbing;
            }

            #pageedit-floating-ball svg {
                width: 1.5rem !important;
                height: 1.5rem !important;
                color: rgb(55, 65, 81);
            }

            @media (prefers-color-scheme: dark) {
                #pageedit-floating-ball svg {
                    color: rgb(229, 231, 235);
                }
            }
        `;
        this.shadowRoot.appendChild(style);
    }

    private createBall(): HTMLDivElement {
        console.log('[PageEdit][FloatingBall] Creating floating ball...');
        const ball = document.createElement('div');
        ball.id = 'pageedit-floating-ball';
        console.log('[PageEdit][FloatingBall] Ball element created with classes:', ball.className);
        
        // 更现代的图标设计
        ball.innerHTML = `
            <svg class="w-6 h-6 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
        `;
        return ball;
    }

    private initialize(): void {
        console.log('[PageEdit][FloatingBall] Initializing ball events and styles...');
        try {
            // 添加事件监听
            this.ball.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.ball.addEventListener('click', this.handleClick.bind(this));
            console.log('[PageEdit][FloatingBall] Event listeners added successfully');
        } catch (error) {
            console.error('[PageEdit][FloatingBall] Error initializing ball:', error);
        }

        // 添加到Shadow DOM
        this.shadowRoot.appendChild(this.ball);
    }

    private handleMouseDown(e: MouseEvent): void {
        console.log('[PageEdit][FloatingBall] Mouse down event triggered');
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
        console.log('[PageEdit][FloatingBall] Click event triggered');
        // 如果正在拖拽，不触发点击事件
        if (this.isDragging) {
            console.log('[PageEdit][FloatingBall] Click event ignored due to dragging');
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
