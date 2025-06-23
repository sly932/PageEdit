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
    private hasBeenDragged: boolean = false; // 跟踪面板是否已被拖动过

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
            @import url('https://fonts.googleapis.com/css2?family=PT+Mono:ital,wght@0,400;1,400&display=swap');
            
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
                font-family: 'PT Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-weight: 400;
                font-style: italic;
                letter-spacing: 0.2px;
            }

            #pageedit-floating-panel.dark-mode .panel-textarea::placeholder {
                color: #9CA3AF;
            }

            /* 深色模式 */
            #pageedit-floating-panel.dark-mode {
                background: rgba(30, 30, 30, 0.9);
                border-color: rgba(75, 85, 99, 0.3);
            }
            
            #pageedit-floating-panel.dark-mode .panel-textarea {
                background: rgba(52, 53, 55, 1);
                border-color: rgba(60, 60, 60, 1);
                color: rgb(240, 240, 240);
            }

            #pageedit-floating-panel.dark-mode .panel-header {
                background: rgba(23, 23, 23, 0.5);
                border-bottom-color: rgba(60, 60, 60, 1);
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
                pointer-events: none;
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
                display: flex;
                align-items: center;
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
                background: #8952f1; /* A nice purple from an example */
                color: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            .apply-button.active:hover {
                background: #9a6bf3;
            }

            .apply-button svg {
                width: 20px;
                height: 20px;
                color: #333; /* Arrow color */
            }

            .apply-button.active svg {
                color: white; /* White arrow when active */
            }

            /* 处理状态下的取消按钮样式 */
            .apply-button.processing {
                background: #8952f1;
                color: white;
            }

            .apply-button.processing svg {
                color: white;
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

            /* 头部按钮 (统一所有按钮样式) */
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
                position: relative;
                z-index: 3;
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

            /* 自定义 Tooltip 样式 */
            .custom-tooltip {
                position: absolute;
                background: rgba(255, 255, 255, 0.95);
                color: rgb(17, 24, 39);
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
                border: 1px solid rgba(0, 0, 0, 0.1);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .custom-tooltip.show {
                opacity: 1;
                transform: translateY(0);
            }

            /* 深色模式下的 Tooltip */
            #pageedit-floating-panel.dark-mode .custom-tooltip {
                background: rgba(31, 41, 55, 0.95);
                color: rgb(229, 231, 235);
                border-color: rgba(75, 85, 99, 0.3);
            }

            /* 系统主题适配 */
            @media (prefers-color-scheme: dark) {
                .custom-tooltip {
                    background: rgba(31, 41, 55, 0.95);
                    color: rgb(229, 231, 235);
                    border-color: rgba(75, 85, 99, 0.3);
                }
            }

            #pageedit-floating-panel.dark-mode .apply-button {
                background: #3c4043; /* Google's dark gray */
            }

            #pageedit-floating-panel.dark-mode .apply-button:hover {
                background: #4a4e51;
            }

            #pageedit-floating-panel.dark-mode .apply-button svg {
                color: #e8eaed; /* Light gray for icon */
            }
        `;
        this.shadowRoot.appendChild(style);
        console.log('[PageEdit][FloatingPanel] Styles injected');
        
        // 检测PT Mono字体是否加载成功
        this.checkAndApplyPTMonoFont();
    }

    // 检测并应用PT Mono字体
    private checkAndApplyPTMonoFont(): void {
        // 创建测试元素来检测字体是否可用
        const testElement = document.createElement('span');
        testElement.style.fontFamily = 'PT Mono, monospace';
        testElement.style.fontSize = '20px';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.style.whiteSpace = 'nowrap';
        testElement.textContent = 'abcdefghijklmnopqrstuvwxyz';
        
        document.body.appendChild(testElement);
        
        // 获取使用PT Mono的宽度
        const ptMonoWidth = testElement.offsetWidth;
        
        // 修改字体为系统等宽字体
        testElement.style.fontFamily = 'monospace';
        
        // 获取使用系统等宽字体的宽度
        const systemMonoWidth = testElement.offsetWidth;
        
        // 清理测试元素
        document.body.removeChild(testElement);
        
        // 如果宽度不同，说明PT Mono字体加载成功
        if (Math.abs(ptMonoWidth - systemMonoWidth) > 1) {
            console.log('[PageEdit][FloatingPanel] PT Mono font loaded successfully');
            // 动态添加PT Mono到placeholder样式
            const ptMonoStyle = document.createElement('style');
            ptMonoStyle.textContent = `
                .panel-textarea::placeholder {
                    font-family: 'PT Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
                }
            `;
            this.shadowRoot.appendChild(ptMonoStyle);
        } else {
            console.warn('[PageEdit][FloatingPanel] PT Mono font failed to load, using system monospace fonts as fallback');
        }
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
        this.undoButton.className = 'header-button';
        this.undoButton.title = 'Undo';
        this.undoButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>`;
        console.log('[PageEdit][FloatingPanel] Undo button created');

        // 创建主题切换按钮
        const themeToggleButton = document.createElement('button');
        themeToggleButton.className = 'header-button theme-toggle';
        themeToggleButton.title = 'Theme';
        themeToggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M3 12h2.25m4.227 4.773L5.636 18.364" />
        </svg>`;

        const closeButtonContainer = document.createElement('div');
        closeButtonContainer.className = 'close-button-container';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'header-button close-button';
        closeButton.title = 'Close';
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>`;
        
        closeButtonContainer.appendChild(closeButton);

        controlsContainer.appendChild(this.undoButton);
        controlsContainer.appendChild(themeToggleButton);
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
        this.input.placeholder = 'Enjoy your edit...';
        this.input.rows = 1;

        // 创建应用按钮
        this.applyButton = document.createElement('button');
        this.applyButton.className = 'apply-button';
        this.applyButton.title = 'Apply';
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
            // 检查是否点击的是按钮，如果是则不启动拖动
            const target = e.target as HTMLElement;
            if (target.closest('button')) {
                return;
            }
            
            // 只在头部触发拖动
            if (!header.contains(target)) return;
            
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

            // 获取可视区域的实际尺寸
            const visualViewport = window.visualViewport;
            const viewportWidth = visualViewport ? visualViewport.width : window.innerWidth;
            const viewportHeight = visualViewport ? visualViewport.height : window.innerHeight;

            // 边界检查 - 确保面板不会完全移出可视区域
            const minX = 0;
            const maxX = viewportWidth - panelWidth;
            const minY = 0;
            const maxY = viewportHeight - panelHeight;

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
                    
                    // 标记面板已被拖动过
                    this.hasBeenDragged = true;
                });
            }
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', onMouseDown);

        // Close button functionality
        closeButton.addEventListener('click', () => this.hide());
        
        // 为关闭按钮添加 Tooltip
        this.addTooltipEvents(closeButton, 'CLOSE');
        
        // 主题切换按钮功能
        themeToggleButton.addEventListener('click', () => this.toggleTheme());
        this.addTooltipEvents(themeToggleButton, 'THEME');
        
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
        console.log('[PageEdit][FloatingPanel] Event listeners attached to buttons');

        // 添加 Tooltip 事件监听器
        this.addTooltipEvents(this.undoButton, 'UNDO');
        
        // 为应用按钮添加动态 tooltip
        this.applyButton.addEventListener('mouseenter', () => {
            const tooltipText = this.isProcessing ? 'CANCEL' : 'APPLY';
            this.showTooltip(this.applyButton, tooltipText);
        });
        this.applyButton.addEventListener('mouseleave', () => this.hideTooltip());

        // Auto-resize textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = `${this.input.scrollHeight}px`;
            
            // 检查输入内容，启用/禁用按钮
            this.updateButtonState();
        });

        // Apply on Enter
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
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

        // 监听系统主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (e.matches) {
                this.panel.classList.add('dark-mode');
            } else {
                this.panel.classList.remove('dark-mode');
            }
        });

        // 监听视口变化，当开发者工具栏打开/关闭时自动调整位置
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                if (this.panel.style.display !== 'none') {
                    if (!this.hasBeenDragged) {
                        // 如果面板未被拖动过，使用预设的安全位置
                        const safePosition = this.calculateSafePosition();
                        this.panel.style.right = safePosition.right;
                        this.panel.style.bottom = safePosition.bottom;
                    } else {
                        // 如果面板已被拖动过，调整位置以保持相对于可视区域的位置
                        this.adjustPositionForViewportChange();
                    }
                }
            });
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
        if (!userInput.trim()) {
            this.showFeedback('Please enter your edit instruction', 'error');
            return;
        }

        // 开始处理状态
        this.isProcessing = true;
        this.applyButton.title = 'Cancel';
        this.applyButton.classList.add('processing');
        this.applyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <rect x="6" y="6" width="12" height="12" rx="1" fill="white"/>
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
        this.applyButton.title = 'Apply';
        this.applyButton.classList.remove('processing');
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
        console.log('[PageEdit][FloatingPanel] Undo button clicked');
        console.log('[PageEdit][FloatingPanel] Event callback exists:', !!this.eventCallback);
        // 触发撤销事件
        if (this.eventCallback) {
            console.log('[PageEdit][FloatingPanel] Calling event callback');
            this.eventCallback({ type: 'undo' });
        } else {
            console.warn('[PageEdit][FloatingPanel] No event callback set');
        }
    }

    // 重置按钮状态
    public resetApplyButton(): void {
        this.isProcessing = false;
        this.applyButton.disabled = false;
        this.applyButton.style.opacity = '1';
        this.applyButton.style.cursor = 'pointer';
        this.applyButton.style.transform = 'scale(1)';
        this.applyButton.title = 'Apply';
        this.applyButton.classList.remove('processing');
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
        
        // 只有在面板未被拖动过时才应用预设位置
        if (!this.hasBeenDragged) {
            const safePosition = this.calculateSafePosition();
            this.panel.style.right = safePosition.right;
            this.panel.style.bottom = safePosition.bottom;
        }
        
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

    // 重置面板位置到默认状态
    public resetPosition(): void {
        this.hasBeenDragged = false;
        const safePosition = this.calculateSafePosition();
        this.panel.style.right = safePosition.right;
        this.panel.style.bottom = safePosition.bottom;
        this.panel.style.left = 'auto';
        this.panel.style.top = 'auto';
        this.panel.style.transform = 'translate3d(0, 0, 0)';
    }

    public destroy(): void {
        this.panel.remove();
    }

    // 计算安全的初始位置，考虑开发者工具栏
    private calculateSafePosition(): { right: string; bottom: string } {
        // 获取可视区域的实际高度
        const visualViewport = window.visualViewport;
        const viewportHeight = visualViewport ? visualViewport.height : window.innerHeight;
        
        // 计算底部安全距离，确保不被开发者工具栏遮挡
        const safeBottom = Math.max(96, window.innerHeight - viewportHeight + 96);
        
        return {
            right: '96px',
            bottom: `${safeBottom}px`
        };
    }

    // 调整已拖动面板的位置以保持相对于可视区域的位置
    private adjustPositionForViewportChange(): void {
        const visualViewport = window.visualViewport;
        if (!visualViewport) return;

        // 获取当前面板位置
        const rect = this.panel.getBoundingClientRect();
        const currentLeft = rect.left;
        const currentTop = rect.top;

        // 计算面板相对于可视区域的位置比例
        const viewportWidth = visualViewport.width;
        const viewportHeight = visualViewport.height;
        
        // 如果面板使用left/top定位，调整位置
        if (this.panel.style.left !== 'auto' && this.panel.style.top !== 'auto') {
            // 计算新的位置，保持相对于可视区域的位置
            const newLeft = Math.min(currentLeft, viewportWidth - rect.width);
            const newTop = Math.min(currentTop, viewportHeight - rect.height);
            
            // 确保不超出可视区域边界
            const finalLeft = Math.max(0, newLeft);
            const finalTop = Math.max(0, newTop);
            
            this.panel.style.left = `${finalLeft}px`;
            this.panel.style.top = `${finalTop}px`;
        }
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
        
        // 根据当前主题状态设置样式
        const isDarkMode = this.panel.classList.contains('dark-mode');
        if (isDarkMode) {
            tooltip.style.background = 'rgba(31, 41, 55, 0.95)';
            tooltip.style.color = 'rgb(229, 231, 235)';
            tooltip.style.borderColor = 'rgba(75, 85, 99, 0.3)';
        } else {
            tooltip.style.background = 'rgba(255, 255, 255, 0.95)';
            tooltip.style.color = 'rgb(17, 24, 39)';
            tooltip.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        }
        
        this.shadowRoot.appendChild(tooltip);
        
        // 使用更简单的位置计算方式
        const rect = element.getBoundingClientRect();
        
        // 先设置为右下角位置
        tooltip.style.position = 'fixed';
        tooltip.style.left = `${rect.right}px`;
        tooltip.style.top = `${rect.bottom}px`;
        tooltip.style.transform = 'translateX(4px) translateY(4px)';
        
        // 立即显示 tooltip 以获取其尺寸
        tooltip.classList.add('show');
        
        // 获取tooltip的尺寸
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 检查是否超出右边界
        if (tooltipRect.right > viewportWidth) {
            // 如果超出右边界，改为显示在左侧
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.transform = 'translateX(-4px) translateY(4px)';
        }
        
        // 检查是否超出下边界
        if (tooltipRect.bottom > viewportHeight) {
            // 如果超出下边界，改为显示在上方
            tooltip.style.top = `${rect.top}px`;
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

    private toggleTheme(): void {
        console.log('[PageEdit][FloatingPanel] Toggling theme');
        const isDarkMode = this.panel.classList.contains('dark-mode');
        
        if (isDarkMode) {
            this.panel.classList.remove('dark-mode');
        } else {
            this.panel.classList.add('dark-mode');
        }
        
        // 如果当前有显示的tooltip，更新其样式
        const currentTooltip = (this as any).currentTooltip;
        if (currentTooltip) {
            const newIsDarkMode = this.panel.classList.contains('dark-mode');
            if (newIsDarkMode) {
                currentTooltip.style.background = 'rgba(31, 41, 55, 0.95)';
                currentTooltip.style.color = 'rgb(229, 231, 235)';
                currentTooltip.style.borderColor = 'rgba(75, 85, 99, 0.3)';
            } else {
                currentTooltip.style.background = 'rgba(255, 255, 255, 0.95)';
                currentTooltip.style.color = 'rgb(17, 24, 39)';
                currentTooltip.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            }
        }
    }
}