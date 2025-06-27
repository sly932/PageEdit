import { FloatingPanel, PanelEvent } from './floatingPanel';
import { StorageService } from '../services/storageService';
import { PanelTooltip } from './panels/PanelTooltip';

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
        console.log('[FloatingBall] Initializing FloatingBall...');
        // 创建根元素
        this.rootElement = document.createElement('div');
        this.rootElement.id = 'pageedit-root-element';
        console.log('[FloatingBall] Root element created:', this.rootElement);
        this.rootElement.style.position = 'fixed';
        this.rootElement.style.top = '0';
        this.rootElement.style.left = '0';
        this.rootElement.style.width = '100%';
        this.rootElement.style.height = '100%';
        this.rootElement.style.pointerEvents = 'none';
        this.rootElement.style.zIndex = '2147483646';

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

        // 将实例暴露到全局，以便 ContentManager 可以访问
        (window as any).__pageEditFloatingBall = this;
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

    // 更新undo/redo按钮状态
    public updateUndoRedoButtonStates(): void {
        this.panel.updateUndoRedoButtonStates();
    }

    // 清空输入框
    public clearInput(): void {
        this.panel.clearInput();
    }

    // 设置未保存更改状态
    public setHasUnsavedChanges(hasChanges: boolean): void {
        this.panel.setHasUnsavedChanges(hasChanges);
    }

    public updatePanelDisplay(name: string, id: string, isNew: boolean, isEnabled: boolean = true): void {
        if (this.panel) {
            this.panel.updatePanelDisplay(name, id, isNew, isEnabled);
        }
    }

    public updateInputContent(content: string): void {
        this.panel.updateInputContent(content);
    }

    public updateEddyList(eddys: import('../types/eddy').Eddy[], activeEddyId?: string): void {
        this.panel.updateEddyList(eddys, activeEddyId);
    }

    public updateEddyToggleState(isEnabled: boolean): void {
        if (this.panel) {
            this.panel.updateEddyToggleState(isEnabled);
        }
    }

    public updateViewOriginalButtonState(isEnabled: boolean): void {
        if (this.panel) {
            this.panel.updateViewOriginalButtonState(isEnabled);
        }
    }

    private injectStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
            
            * {
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
            }

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
                background: rgba(255, 255, 255, 0.6);
                backdrop-filter: blur(25px) saturate(190%) contrast(1.1);
                -webkit-backdrop-filter: blur(25px) saturate(190%) contrast(1.1);
                border-radius: 14px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                cursor: grab;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                border: 1px solid rgba(255, 255, 255, 0.4);
                overflow: hidden;
                pointer-events: auto;
            }

            @media (prefers-color-scheme: dark) {
                #pageedit-floating-ball {
                    background: rgba(31, 41, 55, 0.6);
                    border-color: rgba(55, 65, 81, 0.4);
                    backdrop-filter: blur(25px) saturate(190%) contrast(1.1);
                    -webkit-backdrop-filter: blur(25px) saturate(190%) contrast(1.1);
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
                color: rgb(0, 0, 0);
            }

            @media (prefers-color-scheme: dark) {
                #pageedit-floating-ball svg {
                    color: rgb(255, 255, 255);
                }
            }
        `;
        this.shadowRoot.appendChild(style);
    }

    private createBall(): HTMLDivElement {
        console.log('[FloatingBall] Creating floating ball...');
        const ball = document.createElement('div');
        ball.id = 'pageedit-floating-ball';
        console.log('[FloatingBall] Ball element created with classes:', ball.className);
        
        // 更现代的图标设计
        ball.innerHTML = `
            <svg style="width: 1.5rem; height: 1.5rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
        `;
        return ball;
    }

    private initialize(): void {
        console.log('[FloatingBall] Initializing ball events and styles...');
        try {
            // 设置安全的初始位置
            const safePosition = this.calculateSafePosition();
            this.ball.style.right = safePosition.right;
            this.ball.style.bottom = safePosition.bottom;
            
            // 添加事件监听
            this.ball.addEventListener('mousedown', this.handleMouseDown.bind(this));
            this.ball.addEventListener('click', this.handleClick.bind(this));
            
            // 添加 Tooltip 事件监听器
            PanelTooltip.addTooltipEvents(this.ball, 'EDIT');
            
            console.log('[FloatingBall] Event listeners added successfully');
        } catch (error) {
            console.error('[FloatingBall] Error initializing ball:', error);
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
                    currentTooltip.style.background = 'rgba(31, 41, 55, 0.95)';
                    currentTooltip.style.color = 'rgb(229, 231, 235)';
                    currentTooltip.style.borderColor = 'rgba(75, 85, 99, 0.3)';
                } else {
                    currentTooltip.style.background = 'rgba(255, 255, 255, 0.95)';
                    currentTooltip.style.color = 'rgb(17, 24, 39)';
                    currentTooltip.style.borderColor = 'rgba(0, 0, 0, 0.1)';
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
        console.log('[FloatingBall] Mouse down event triggered');
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
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }

        // The only responsibility of the click is to toggle the panel.
        // The ContentManager has already handled the initialization.
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

    public destroy(): void {
        if (this.ball && this.ball.parentNode) {
            this.ball.remove();
        }
        if (this.rootElement && this.rootElement.parentNode) {
            this.rootElement.remove();
        }
        this.panel.destroy();
    }
}
