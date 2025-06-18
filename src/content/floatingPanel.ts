import { StyleService } from './services/styleService';

// 定义自定义事件类型
export interface PanelEvent {
    type: 'apply' | 'undo';
    data?: {
        text?: string;
    };
}

// 定义事件回调类型
export type PanelEventCallback = (event: PanelEvent) => void;

export class FloatingPanel {
    private panel: HTMLDivElement;
    private input!: HTMLTextAreaElement;
    private applyButton!: HTMLButtonElement;
    private undoButton!: HTMLButtonElement;
    private feedback!: HTMLDivElement;
    private shadowRoot: ShadowRoot;
    private eventCallback: PanelEventCallback | null = null;

    constructor(shadowRoot: ShadowRoot) {
        console.log('[PageEdit][FloatingPanel] Constructor called');
        this.shadowRoot = shadowRoot;
        this.injectStyles();  // 先注入样式
        this.panel = this.createPanel();
        this.initialize();
    }

    private injectStyles(): void {
        console.log('[PageEdit][FloatingPanel] Injecting styles...');
        const style = document.createElement('style');
        style.textContent = `
            /* 重置样式 */
            #pageedit-floating-panel * {
                box-sizing: border-box !important;
                margin: 0 !important;
                padding: 0 !important;
                font-size: 16px !important;
                line-height: 1.5 !important;
                transform-origin: center center !important;
                transform: scale(1) !important;
                zoom: 1 !important;
            }

            /* Panel 基础样式 */
            #pageedit-floating-panel {
                all: initial;
                position: fixed !important;
                right: 6rem !important;
                bottom: 6rem !important;
                width: 320px !important;
                max-width: 320px !important;
                min-width: 320px !important;
                height: auto !important;
                max-height: 80vh !important;
                background: rgba(255, 255, 255, 0.9) !important;
                border-radius: 0.75rem !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                backdrop-filter: blur(8px) !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                overflow: hidden !important;
                transition: all 0.2s ease-out !important;
                pointer-events: auto !important;
                display: none !important;
                z-index: 2147483647 !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                user-select: none !important;
                box-sizing: border-box !important;
                transform: scale(1) !important;
                zoom: 1 !important;
                -webkit-text-size-adjust: 100% !important;
            }

            /* 深色模式 */
            #pageedit-floating-panel.dark-mode {
                background: rgba(31, 41, 55, 0.9);
                border-color: rgba(75, 85, 99, 0.3);
            }

            /* 面板头部 */
            .panel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem 1rem;
                background: rgba(243, 244, 246, 0.5);
                border-bottom: 1px solid rgba(229, 231, 235, 0.5);
                position: relative;
                z-index: 2;
                cursor: move;
            }

            #pageedit-floating-panel.dark-mode .panel-header {
                background: rgba(17, 24, 39, 0.5);
                border-bottom-color: rgba(55, 65, 81, 0.5);
            }

            .panel-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, 
                    rgba(59, 130, 246, 0) 0%,
                    rgba(59, 130, 246, 0.1) 50%,
                    rgba(59, 130, 246, 0) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            #pageedit-floating-panel.dark-mode .panel-header::before {
                background: linear-gradient(45deg, 
                    rgba(96, 165, 250, 0) 0%,
                    rgba(96, 165, 250, 0.1) 50%,
                    rgba(96, 165, 250, 0) 100%);
            }

            .panel-header:hover::before {
                opacity: 1;
            }

            .panel-header.dragging {
                cursor: grabbing;
            }

            .panel-header.dragging::before {
                opacity: 1;
                background: linear-gradient(45deg, 
                    rgba(59, 130, 246, 0.1) 0%,
                    rgba(59, 130, 246, 0.2) 50%,
                    rgba(59, 130, 246, 0.1) 100%);
            }

            #pageedit-floating-panel.dark-mode .panel-header.dragging::before {
                background: linear-gradient(45deg, 
                    rgba(96, 165, 250, 0.1) 0%,
                    rgba(96, 165, 250, 0.2) 50%,
                    rgba(96, 165, 250, 0.1) 100%);
            }

            .panel-header span {
                color: rgb(55, 65, 81);
                font-weight: 500;
                font-size: 0.9375rem;
                position: relative;
                z-index: 1;
            }

            #pageedit-floating-panel.dark-mode .panel-header span {
                color: rgb(229, 231, 235);
            }

            /* 关闭按钮容器 */
            .close-button-container {
                width: 32px;
                height: 32px;
                margin: -6px -6px -6px 0;
                position: relative;
                z-index: 3;
            }

            /* 关闭按钮 */
            .close-button {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s ease;
                color: rgb(156, 163, 175);
                padding: 0;
            }

            .close-button:hover {
                background: rgba(0, 0, 0, 0.05);
                color: rgb(75, 85, 99);
            }

            #pageedit-floating-panel.dark-mode .close-button:hover {
                background: rgba(255, 255, 255, 0.1);
                color: rgb(209, 213, 219);
            }

            .close-button svg {
                width: 20px;
                height: 20px;
                pointer-events: none;
            }

            /* 面板内容 */
            .panel-content {
                padding: 1rem !important;
                position: relative !important;
                z-index: 1 !important;
                box-sizing: border-box !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            /* 文本区域 */
            .panel-textarea {
                width: 100% !important;
                min-height: 96px !important;
                max-height: 200px !important;
                padding: 0.75rem !important;
                border: 1px solid rgba(209, 213, 219, 0.5) !important;
                border-radius: 0.5rem !important;
                background: rgba(255, 255, 255, 0.5) !important;
                color: rgb(17, 24, 39) !important;
                font-size: 0.875rem !important;
                line-height: 1.5 !important;
                resize: vertical !important;
                transition: all 0.2s !important;
                margin-bottom: 0.75rem !important;
                box-sizing: border-box !important;
                font-family: inherit !important;
                transform: scale(1) !important;
                zoom: 1 !important;
            }

            .panel-textarea:focus {
                outline: none;
                border-color: rgb(59, 130, 246);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            }

            .panel-textarea::placeholder {
                color: rgb(156, 163, 175);
            }

            #pageedit-floating-panel.dark-mode .panel-textarea {
                background: rgba(31, 41, 55, 0.5);
                border-color: rgba(75, 85, 99, 0.5);
                color: rgb(229, 231, 235);
            }

            #pageedit-floating-panel.dark-mode .panel-textarea:focus {
                border-color: rgb(96, 165, 250);
                box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
            }

            #pageedit-floating-panel.dark-mode .panel-textarea::placeholder {
                color: rgb(107, 114, 128);
            }

            /* 按钮行 */
            .button-row {
                display: flex;
                gap: 0.5rem;
            }

            /* 按钮样式 */
            .panel-button {
                flex: 1;
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 0.375rem;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
            }

            .apply-button {
                background: rgb(59, 130, 246);
                color: white;
            }

            .apply-button:hover {
                background: rgb(37, 99, 235);
            }

            .undo-button {
                background: rgb(243, 244, 246);
                color: rgb(55, 65, 81);
            }

            .undo-button:hover {
                background: rgb(229, 231, 235);
            }

            #pageedit-floating-panel.dark-mode .undo-button {
                background: rgb(55, 65, 81);
                color: rgb(229, 231, 235);
            }

            #pageedit-floating-panel.dark-mode .undo-button:hover {
                background: rgb(75, 85, 99);
            }

            /* 反馈信息 */
            .pageedit-feedback {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.875rem;
                color: rgb(55, 65, 81);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
                z-index: 1;
                font-family: inherit;
            }

            #pageedit-floating-panel.dark-mode .pageedit-feedback {
                background: rgba(31, 41, 55, 0.9);
                color: rgb(229, 231, 235);
            }

            .pageedit-feedback.show {
                opacity: 1;
                pointer-events: auto;
            }

            /* 主题切换按钮 */
            .theme-toggle {
                position: absolute;
                right: 3rem;
                top: 0.75rem;
                width: 24px;
                height: 24px;
                padding: 0;
                border: none;
                background: transparent;
                cursor: pointer;
                color: rgb(156, 163, 175);
                transition: all 0.2s;
                z-index: 3;
            }

            .theme-toggle:hover {
                color: rgb(75, 85, 99);
            }

            #pageedit-floating-panel.dark-mode .theme-toggle:hover {
                color: rgb(209, 213, 219);
            }

            .theme-toggle svg {
                width: 20px;
                height: 20px;
            }
        `;
        this.shadowRoot.appendChild(style);
        console.log('[PageEdit][FloatingPanel] Styles injected');
    }

    private createPanel(): HTMLDivElement {
        console.log('[PageEdit][FloatingPanel] Creating panel...');
        const panel = document.createElement('div');
        panel.id = 'pageedit-floating-panel';
        
        // 检查系统主题
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            panel.classList.add('dark-mode');
        }

        // 添加调试代码
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                console.log('[PageEdit][FloatingPanel] Panel size:', {
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                    devicePixelRatio: window.devicePixelRatio,
                    zoom: window.visualViewport?.scale || 1
                });
            }
        });
        
        panel.innerHTML = `
            <div class="panel-header">
                <span>PageEdit</span>
                <button class="theme-toggle" aria-label="切换主题">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                </button>
                <div class="close-button-container">
                    <button class="close-button" aria-label="关闭">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <textarea 
                    class="panel-textarea"
                    placeholder="输入你的修改指令..."></textarea>
                <div class="button-row">
                    <button class="panel-button apply-button">应用</button>
                    <button class="panel-button undo-button">撤销</button>
                </div>
            </div>
            <div class="pageedit-feedback"></div>
        `;

        // 添加拖动功能
        const header = panel.querySelector('.panel-header') as HTMLElement;
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialX = 0;
        let initialY = 0;

        const onMouseDown = (e: MouseEvent) => {
            if (e.target instanceof HTMLElement && 
                (e.target.closest('.close-button') || e.target.closest('.theme-toggle'))) {
                return;
            }
            isDragging = true;
            header.classList.add('dragging');
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = panel.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            panel.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            header.classList.remove('dragging');
            
            const rect = panel.getBoundingClientRect();
            const finalX = rect.left;
            const finalY = rect.top;
            
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.left = `${finalX}px`;
            panel.style.top = `${finalY}px`;
            panel.style.transform = 'none';
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', onMouseDown);

        // 添加主题切换功能
        const themeToggle = panel.querySelector('.theme-toggle') as HTMLButtonElement;
        themeToggle.addEventListener('click', () => {
            panel.classList.toggle('dark-mode');
        });

        // 在返回 panel 之前添加以下代码
        requestAnimationFrame(() => {
            // 强制设置尺寸
            panel.style.setProperty('width', '320px', 'important');
            panel.style.setProperty('max-width', '320px', 'important');
            panel.style.setProperty('min-width', '320px', 'important');
            // 启动观察
            observer.observe(panel);
        });

        return panel;
    }

    private initialize(): void {
        console.log('[PageEdit][FloatingPanel] Initializing panel...');
        try {
            // 获取元素引用
            const textarea = this.panel.querySelector('textarea') as HTMLTextAreaElement;
            const applyButton = this.panel.querySelector('.apply-button') as HTMLButtonElement;
            const undoButton = this.panel.querySelector('.undo-button') as HTMLButtonElement;
            const closeButton = this.panel.querySelector('.close-button') as HTMLButtonElement;
            const feedback = this.panel.querySelector('.pageedit-feedback') as HTMLDivElement;

            console.log('[PageEdit][FloatingPanel] Found elements:', {
                textarea: !!textarea,
                applyButton: !!applyButton,
                undoButton: !!undoButton,
                closeButton: !!closeButton,
                feedback: !!feedback
            });

            if (!textarea || !applyButton || !undoButton || !closeButton || !feedback) {
                throw new Error('Failed to find required elements');
            }

            this.input = textarea;
            this.applyButton = applyButton;
            this.undoButton = undoButton;
            this.feedback = feedback;

            // 添加事件监听
            closeButton.addEventListener('click', (e) => {
                console.log('[PageEdit][FloatingPanel] Close button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.hide();
            });

            this.applyButton.addEventListener('click', () => {
                console.log('[PageEdit][FloatingPanel] Apply button clicked');
                this.handleApply();
            });

            this.undoButton.addEventListener('click', () => {
                console.log('[PageEdit][FloatingPanel] Undo button clicked');
                this.handleUndo();
            });

            // 添加键盘快捷键支持
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    console.log('[PageEdit][FloatingPanel] Ctrl/Cmd + Enter pressed');
                    e.preventDefault();
                    this.handleApply();
                }
                if (e.key === 'Escape') {
                    console.log('[PageEdit][FloatingPanel] Escape pressed');
                    this.hide();
                }
            });

            // 添加到Shadow DOM
            this.shadowRoot.appendChild(this.panel);
            console.log('[PageEdit][FloatingPanel] Panel initialized successfully');
        } catch (error) {
            console.error('[PageEdit][FloatingPanel] Error initializing panel:', error);
            throw error;
        }
    }

    // 设置事件回调
    public setEventCallback(callback: PanelEventCallback): void {
        this.eventCallback = callback;
    }

    private handleApply(): void {
        const userInput = this.input.value.trim();
        if (!userInput) {
            this.showFeedback('请输入修改指令', 'error');
            return;
        }

        // 显示加载状态
        this.applyButton.disabled = true;
        this.applyButton.textContent = '处理中...';

        // 触发应用事件
        if (this.eventCallback) {
            this.eventCallback({
                type: 'apply',
                data: { text: userInput }
            });
        }
    }

    private handleUndo(): void {
        // 触发撤销事件
        if (this.eventCallback) {
            this.eventCallback({ type: 'undo' });
        }
    }

    // 重置按钮状态
    public resetApplyButton(): void {
        this.applyButton.disabled = false;
        this.applyButton.textContent = '应用';
    }

    // 清空输入框
    public clearInput(): void {
        this.input.value = '';
    }

    public showFeedback(message: string, type: 'success' | 'error'): void {
        this.feedback.textContent = message;
        this.feedback.className = `
            pageedit-feedback fixed top-4 right-4 px-4 py-2 rounded-lg text-white
            ${type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'}
            opacity-100 transition-opacity duration-300
        `;

        // 自动隐藏反馈消息
        setTimeout(() => {
            this.feedback.className = this.feedback.className.replace('opacity-100', 'opacity-0');
            setTimeout(() => {
                this.feedback.textContent = '';
            }, 300);
        }, 3000);
    }

    public toggle(): void {
        console.log('[PageEdit][FloatingPanel] Toggling panel visibility');
        if (this.panel.style.display === 'none' || !this.panel.style.display) {
            this.show();
        } else {
            this.hide();
        }
    }

    public show(): void {
        console.log('[PageEdit][FloatingPanel] Showing panel');
        this.panel.style.display = 'block';
        // 延迟聚焦，确保面板已显示
        setTimeout(() => {
            this.input.focus();
        }, 100);
    }

    public hide(): void {
        console.log('[PageEdit][FloatingPanel] Hiding panel');
        this.panel.style.display = 'none';
    }

    public destroy(): void {
        this.panel.remove();
    }
}
