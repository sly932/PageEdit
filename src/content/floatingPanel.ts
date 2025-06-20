import { StyleService } from './services/styleService';

// 定义自定义事件类型
export interface PanelEvent {
    type: 'apply' | 'undo' | 'cancel';
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
    private isProcessing: boolean = false; // 添加处理状态标记

    constructor(shadowRoot: ShadowRoot) {
        console.log('[PageEdit][FloatingPanel] Constructor called');
        this.shadowRoot = shadowRoot;
        this.injectStyles();  // 先注入样式
        this.panel = this.createPanel();
        this.initialize();
    }

    private injectStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            /* Panel 基础样式 */
            #pageedit-floating-panel {
                position: fixed;
                right: 96px;
                bottom: 96px;
                width: 320px !important;
                max-width: 320px !important;
                min-width: 320px !important;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 12px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                overflow: hidden;
                transition: all 0.2s ease-out;
                pointer-events: auto;
                display: none;
                z-index: 2147483647;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Noto Sans CJK SC", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                user-select: none;
                box-sizing: border-box;
            }

            /* 面板内容 */
            .panel-content {
                padding: 16px;
                position: relative;
                z-index: 1;
                box-sizing: border-box;
            }

            .input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }

            /* 文本区域 */
            .panel-textarea {
                width: 100%;
                min-height: 54px !important;
                max-height: 200px !important;
                padding: 16px 20px 48px 20px;
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 27px;
                background: rgba(255, 255, 255, 0.8);
                color: rgb(17, 24, 39);
                font-size: 14px;
                line-height: 1.5;
                resize: none;
                overflow: hidden;
                transition: all 0.2s;
                box-sizing: border-box;
                font-family: inherit;
            }

            .panel-textarea::placeholder {
                color: #A0A0A0;
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
                padding: 12px 16px;
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
                font-size: 15px;
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

            /* 按钮行 */
            .button-row {
                display: none;
            }

            /* 按钮样式 */
            .panel-button {
                flex: 1;
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
            }

            .apply-button {
                position: absolute;
                right: 8px;
                bottom: 8px;
                width: 34px;
                height: 34px;
                border: none;
                border-radius: 50%;
                background: #f3f4f6;
                color: #9ca3af;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                padding: 0;
                z-index: 10;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            }

            .apply-button:hover {
                background: #e5e7eb;
            }

            /* 应用状态下的圆环效果 */
            .apply-button.active {
                background: #1f2937;
                color: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .apply-button.active:hover {
                background: #111827;
            }

            .apply-button svg {
                width: 20px;
                height: 20px;
                color: #333; /* Arrow color */
            }

            .undo-button {
                background: transparent;
                color: rgb(156, 163, 175);
            }

            .undo-button:hover {
                background: rgba(0, 0, 0, 0.05);
                color: rgb(75, 85, 99);
            }

            #pageedit-floating-panel.dark-mode .undo-button {
                background: transparent;
                color: rgb(209, 213, 219);
            }

            #pageedit-floating-panel.dark-mode .undo-button:hover {
                background: rgba(255, 255, 255, 0.1);
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
                right: 48px;
                top: 12px;
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

            /* 头部按钮 (Undo) */
            .header-button {
                width: 32px;
                height: 32px;
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
                margin-left: 4px;
            }

            .header-button:hover {
                background: rgba(0, 0, 0, 0.05);
                color: rgb(75, 85, 99);
            }

            #pageedit-floating-panel.dark-mode .header-button:hover {
                background: rgba(255, 255, 255, 0.1);
                color: rgb(209, 213, 219);
            }

            .header-button svg {
                width: 20px;
                height: 20px;
            }
        `;
        this.shadowRoot.appendChild(style);
        console.log('[PageEdit][FloatingPanel] Styles injected');
    }

    private createPanel(): HTMLDivElement {
        const panel = document.createElement('div');
        panel.id = 'pageedit-floating-panel';

        // 创建面板头部
        const header = document.createElement('div');
        header.className = 'panel-header';

        const title = document.createElement('span');
        title.textContent = 'PageEdit';

        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';

        this.undoButton = document.createElement('button');
        this.undoButton.className = 'header-button undo-button'; // Use header-button style
        this.undoButton.title = '撤销';
        this.undoButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>`;

        const closeButtonContainer = document.createElement('div');
        closeButtonContainer.className = 'close-button-container';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.title = '关闭';
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>`;
        
        closeButtonContainer.appendChild(closeButton);

        controlsContainer.appendChild(this.undoButton);
        controlsContainer.appendChild(closeButtonContainer);

        header.appendChild(title);
        header.appendChild(controlsContainer);

        // 创建面板内容
        const content = document.createElement('div');
        content.className = 'panel-content';

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';

        // 创建文本区域
        this.input = document.createElement('textarea');
        this.input.className = 'panel-textarea';
        this.input.placeholder = 'Make your edit...';
        this.input.rows = 1;

        // 创建应用按钮
        this.applyButton = document.createElement('button');
        this.applyButton.className = 'apply-button';
        this.applyButton.title = '应用';
        this.applyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;

        inputWrapper.appendChild(this.input);
        inputWrapper.appendChild(this.applyButton);

        content.appendChild(inputWrapper);

        // 创建反馈消息区域
        this.feedback = document.createElement('div');
        this.feedback.className = 'feedback-message';
        content.appendChild(this.feedback);

        panel.appendChild(header);
        panel.appendChild(content);

        // Drag functionality
        let isDragging = false;
        let startX: number, startY: number, initialX: number, initialY: number;
        let panelWidth: number, panelHeight: number; // 存储面板尺寸
        let lastMoveTime = 0; // 用于节流

        const onMouseDown = (e: MouseEvent) => {
            // 只在头部触发拖动
            if (e.target !== header) return;
            
            isDragging = true;
            header.classList.add('dragging');
            
            startX = e.clientX;
            startY = e.clientY;

            const rect = panel.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;
            
            // 在拖动开始时获取面板尺寸
            panelWidth = rect.width;
            panelHeight = rect.height;

            // 将面板从右下角定位改为绝对定位，并启用GPU加速
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
            panel.style.left = `${initialX}px`;
            panel.style.top = `${initialY}px`;
            panel.style.transform = 'translate3d(0, 0, 0)'; // 启用GPU加速

            // 使用 passive: false 来确保可以调用 preventDefault
            document.addEventListener('mousemove', onMouseMove, { passive: false });
            document.addEventListener('mouseup', onMouseUp, { passive: false });
            
            // 防止文本选择
            e.preventDefault();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            
            // 节流：限制更新频率
            const now = Date.now();
            if (now - lastMoveTime < 16) return; // 约60fps
            lastMoveTime = now;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // 计算新位置
            let newX = initialX + dx;
            let newY = initialY + dy;

            // 获取窗口尺寸（缓存，避免频繁获取）
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // 边界检查 - 确保面板不会完全移出窗口
            const minX = 0;
            const maxX = windowWidth - panelWidth;
            const minY = 0;
            const maxY = windowHeight - panelHeight;

            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));

            // 计算相对于初始位置的偏移量
            const offsetX = newX - initialX;
            const offsetY = newY - initialY;

            // 使用 transform3d 来利用GPU加速
            panel.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
            
            // 防止默认行为
            e.preventDefault();
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            header.classList.remove('dragging');
            
            // 获取最终位置并应用
            const transform = panel.style.transform;
            const match = transform.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
            if (match) {
                const offsetX = parseFloat(match[1]);
                const offsetY = parseFloat(match[2]);
                const finalX = initialX + offsetX;
                const finalY = initialY + offsetY;
                
                // 使用 requestAnimationFrame 确保平滑过渡
                requestAnimationFrame(() => {
                    // 设置最终位置，保持GPU加速
                    panel.style.left = `${finalX}px`;
                    panel.style.top = `${finalY}px`;
                    panel.style.transform = 'translate3d(0, 0, 0)'; // 保持GPU加速层
                });
            }
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', onMouseDown);

        // Close button functionality
        closeButton.addEventListener('click', () => this.hide());
        
        this.shadowRoot.appendChild(panel);
        return panel;
    }

    private initialize(): void {
        console.log('[PageEdit][FloatingPanel] Initializing panel');
        
        if (!this.input || !this.applyButton || !this.undoButton) {
            console.error('[PageEdit][FloatingPanel] Panel elements not found');
            return;
        }

        // Add event listeners
        this.applyButton.addEventListener('click', () => this.handleApply());
        this.undoButton.addEventListener('click', () => this.handleUndo());

        // Auto-resize textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = `${this.input.scrollHeight}px`;
            
            // 检查输入内容，启用/禁用按钮
            this.updateButtonState();
        });

        // Apply on Enter
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleApply();
            }
            // Shift+Enter 允许换行，不需要特殊处理
        });

        // 初始化按钮状态
        this.updateButtonState();

        // Detect dark mode from the page and apply it to the panel
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.panel.classList.add('dark-mode');
        }
    }

    // 更新按钮状态
    private updateButtonState(): void {
        const hasContent = this.input.value.trim().length > 0;
        
        // 如果正在处理中，不改变按钮状态
        if (this.isProcessing) {
            return;
        }
        
        if (hasContent) {
            // 有内容时，启用按钮并显示提示
            this.applyButton.disabled = false;
            this.applyButton.style.opacity = '1';
            this.applyButton.style.cursor = 'pointer';
            this.applyButton.style.transform = 'scale(1.1)';
            this.applyButton.style.transition = 'all 0.2s ease';
            this.applyButton.classList.add('active');
            
            // 显示提示文字
            this.showHint();
        } else {
            // 无内容时，禁用按钮并隐藏提示
            this.applyButton.disabled = true;
            this.applyButton.style.opacity = '0.5';
            this.applyButton.style.cursor = 'default';
            this.applyButton.style.transform = 'scale(1)';
            this.applyButton.classList.remove('active');
            
            // 隐藏提示文字
            this.hideHint();
        }
    }

    // 显示提示文字
    private showHint(): void {
        // 检查是否已经有提示元素
        let hintElement = this.shadowRoot.querySelector('.input-hint') as HTMLDivElement;
        
        if (!hintElement) {
            // 创建提示元素
            hintElement = document.createElement('div');
            hintElement.className = 'input-hint';
            hintElement.textContent = 'Shift + Enter to new line';
            hintElement.style.cssText = `
                position: absolute;
                bottom: 8px;
                left: 20px;
                font-size: 11px;
                color: #999;
                pointer-events: none;
                z-index: 5;
                font-family: inherit;
            `;
            
            // 将提示元素添加到输入框容器中
            const inputWrapper = this.shadowRoot.querySelector('.input-wrapper');
            if (inputWrapper) {
                inputWrapper.appendChild(hintElement);
            }
        }
        
        // 显示提示
        hintElement.style.opacity = '1';
    }

    // 隐藏提示文字
    private hideHint(): void {
        const hintElement = this.shadowRoot.querySelector('.input-hint') as HTMLDivElement;
        if (hintElement) {
            hintElement.style.opacity = '0';
        }
    }

    // 设置事件回调
    public setEventCallback(callback: PanelEventCallback): void {
        this.eventCallback = callback;
    }

    private handleApply(): void {
        if (this.isProcessing) {
            // 如果正在处理，点击按钮表示终止
            this.cancelProcessing();
            return;
        }

        const userInput = this.input.value.trim();
        if (!userInput) {
            this.showFeedback('请输入修改指令', 'error');
            return;
        }

        // 开始处理状态
        this.isProcessing = true;
        this.applyButton.title = '终止';
        this.applyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <rect x="8" y="8" width="8" height="8" rx="1"/>
        </svg>`;
        
        // 禁用输入框
        this.input.disabled = true;
        this.input.style.opacity = '0.7';
        this.input.style.cursor = 'default';

        // 触发应用事件
        if (this.eventCallback) {
            this.eventCallback({
                type: 'apply',
                data: { text: userInput }
            });
        }
    }

    // 取消处理
    private cancelProcessing(): void {
        this.isProcessing = false;
        this.applyButton.title = '应用';
        this.applyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
        
        // 重新启用输入框
        this.input.disabled = false;
        this.input.style.opacity = '1';
        this.input.style.cursor = 'text';
        
        // 重新检查按钮状态
        this.updateButtonState();
        
        // 触发取消事件
        if (this.eventCallback) {
            this.eventCallback({
                type: 'cancel'
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
        this.isProcessing = false;
        this.applyButton.disabled = false;
        this.applyButton.style.opacity = '1';
        this.applyButton.style.cursor = 'pointer';
        this.applyButton.style.transform = 'scale(1)';
        this.applyButton.title = '应用';
        this.applyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;
        this.applyButton.classList.remove('active');
        this.input.disabled = false;
        this.input.style.opacity = '1';
        this.input.style.cursor = 'text';
        this.updateButtonState(); // 重新检查输入内容状态，会处理提示文字
    }

    // 清空输入框
    public clearInput(): void {
        this.input.value = '';
        this.hideHint();
        this.updateButtonState();
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