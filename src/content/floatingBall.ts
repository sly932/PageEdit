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
                width: 48px !important;
                height: 48px !important;
                min-width: 48px !important;
                min-height: 48px !important;
                max-width: 48px !important;
                max-height: 48px !important;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(8px);
                border-radius: 14px;
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

            /* 自定义 Tooltip 样式 */
            .custom-tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                transform: translateY(4px);
                transition: all 0.1s ease;
                z-index: 2147483647;
                font-family: inherit;
                backdrop-filter: blur(4px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .custom-tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }

            /* 深色模式下的 Tooltip */
            @media (prefers-color-scheme: dark) {
                .custom-tooltip {
                    background: rgba(255, 255, 255, 0.9);
                    color: rgb(17, 24, 39);
                    border-color: rgba(0, 0, 0, 0.1);
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
            // 设置安全的初始位置
            const safePosition = this.calculateSafePosition();
            this.ball.style.right = safePosition.right;
            this.ball.style.bottom = safePosition.bottom;
            
            // 添加事件监听
            this.ball.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.ball.addEventListener('click', this.handleClick.bind(this));
            
            // 添加 Tooltip 事件监听器
            this.addTooltipEvents(this.ball, 'EDIT');
            
            console.log('[PageEdit][FloatingBall] Event listeners added successfully');
        } catch (error) {
            console.error('[PageEdit][FloatingBall] Error initializing ball:', error);
        }

        // 添加到Shadow DOM
        this.shadowRoot.appendChild(this.ball);
        
        // 监听系统主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // 如果当前有显示的tooltip，更新其样式
            const currentTooltip = (this as any).currentTooltip;
            if (currentTooltip) {
                if (e.matches) {
                    currentTooltip.style.background = 'rgba(255, 255, 255, 0.9)';
                    currentTooltip.style.color = 'rgb(17, 24, 39)';
                    currentTooltip.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                } else {
                    currentTooltip.style.background = 'rgba(0, 0, 0, 0.8)';
                    currentTooltip.style.color = 'white';
                    currentTooltip.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
            }
        });
        
        // 监听视口变化，当开发者工具栏打开/关闭时自动调整位置
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                // 检查悬浮球是否使用left/top定位（表示已被拖动过）
                if (this.ball.style.left !== 'auto' && this.ball.style.top !== 'auto') {
                    // 如果悬浮球已被拖动过，调整位置以保持相对于可视区域的位置
                    this.adjustBallPositionForViewportChange();
                } else {
                    // 如果悬浮球未被拖动过，使用预设的安全位置
                    const safePosition = this.calculateSafePosition();
                    this.ball.style.right = safePosition.right;
                    this.ball.style.bottom = safePosition.bottom;
                }
            });
        }
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
            
            // 获取可视区域的实际尺寸
            const visualViewport = window.visualViewport;
            const viewportWidth = visualViewport ? visualViewport.width : window.innerWidth;
            const viewportHeight = visualViewport ? visualViewport.height : window.innerHeight;
            
            // 限制在可视区域范围内
            const maxX = viewportWidth - this.ball.offsetWidth;
            const maxY = viewportHeight - this.ball.offsetHeight;
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

    // 计算安全的初始位置，考虑开发者工具栏
    private calculateSafePosition(): { right: string; bottom: string } {
        // 获取可视区域的实际高度
        const visualViewport = window.visualViewport;
        const viewportHeight = visualViewport ? visualViewport.height : window.innerHeight;
        
        // 计算底部安全距离，确保不被开发者工具栏遮挡
        const safeBottom = Math.max(20, window.innerHeight - viewportHeight + 20);
        
        return {
            right: '1.25rem',
            bottom: `${safeBottom}px`
        };
    }

    // 调整已拖动悬浮球的位置以保持相对于可视区域的位置
    private adjustBallPositionForViewportChange(): void {
        const visualViewport = window.visualViewport;
        if (!visualViewport) return;

        // 获取当前悬浮球位置
        const rect = this.ball.getBoundingClientRect();
        const currentLeft = rect.left;
        const currentTop = rect.top;

        // 获取可视区域尺寸
        const viewportWidth = visualViewport.width;
        const viewportHeight = visualViewport.height;
        
        // 计算新的位置，确保不超出可视区域边界
        const maxX = viewportWidth - this.ball.offsetWidth;
        const maxY = viewportHeight - this.ball.offsetHeight;
        
        const newLeft = Math.min(Math.max(0, currentLeft), maxX);
        const newTop = Math.min(Math.max(0, currentTop), maxY);
        
        this.ball.style.left = `${newLeft}px`;
        this.ball.style.top = `${newTop}px`;
    }

    // 创建 Tooltip
    private createTooltip(text: string): HTMLDivElement {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;
        return tooltip;
    }

    // 显示 Tooltip
    private showTooltip(element: HTMLElement, text: string): void {
        // 移除现有的 tooltip
        this.hideTooltip();
        
        const tooltip = this.createTooltip(text);
        
        // 根据系统主题状态设置样式
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkMode) {
            tooltip.style.background = 'rgba(255, 255, 255, 0.9)';
            tooltip.style.color = 'rgb(17, 24, 39)';
            tooltip.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        } else {
            tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
        
        this.shadowRoot.appendChild(tooltip);
        
        // 计算位置 - 使用相对于根元素的位置
        const rootRect = this.rootElement.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // 计算元素相对于根元素的位置
        const relativeLeft = elementRect.left - rootRect.left;
        const relativeTop = elementRect.top - rootRect.top;
        
        // 先设置为右下角位置
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${relativeLeft + elementRect.width}px`;
        tooltip.style.top = `${relativeTop + elementRect.height}px`;
        tooltip.style.transform = 'translateX(4px) translateY(4px)';
        
        // 立即显示 tooltip 以获取其尺寸
        tooltip.classList.add('show');
        
        // 获取tooltip的尺寸和视口信息
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 检查是否超出右边界
        if (tooltipRect.right > viewportWidth) {
            // 如果超出右边界，改为显示在左侧
            tooltip.style.left = `${relativeLeft}px`;
            tooltip.style.transform = 'translateX(-4px) translateY(4px)';
        }
        
        // 检查是否超出下边界
        if (tooltipRect.bottom > viewportHeight) {
            // 如果超出下边界，改为显示在上方
            tooltip.style.top = `${relativeTop}px`;
            tooltip.style.transform = tooltip.style.transform.replace('translateY(4px)', 'translateY(-4px)');
        }
        
        // 存储当前 tooltip 引用
        (this as any).currentTooltip = tooltip;
    }

    // 隐藏 Tooltip
    private hideTooltip(): void {
        const currentTooltip = (this as any).currentTooltip;
        if (currentTooltip) {
            currentTooltip.remove();
            (this as any).currentTooltip = null;
        }
    }

    // 添加 Tooltip 事件监听器
    private addTooltipEvents(element: HTMLElement, text: string): void {
        element.addEventListener('mouseenter', () => this.showTooltip(element, text));
        element.addEventListener('mouseleave', () => this.hideTooltip());
    }

    public destroy(): void {
        this.rootElement.remove();
        this.panel.destroy();
    }
}
