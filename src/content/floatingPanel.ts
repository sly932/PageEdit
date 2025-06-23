import { StyleService } from './services/styleService';
import { Eddy } from '../types/eddy';
import { StorageService } from '../services/storageService';

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
    
    // Eddy 相关属性
    private currentEddy: Eddy | null = null;
    private isNewEddy: boolean = false;
    private titleElement!: HTMLSpanElement;
    private newEddyButton!: HTMLButtonElement;
    private hasUnsavedChanges: boolean = false; // 添加未保存更改标记
    
    // 下拉菜单相关属性
    private dropdownButton!: HTMLButtonElement;
    private dropdownMenu!: HTMLDivElement;
    private isDropdownOpen: boolean = false;

    constructor(shadowRoot: ShadowRoot) {
        console.log('[FloatingPanel] Constructor called');
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
                overflow: visible;
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
                flex-direction: column;
                padding: 12px 16px;
                background: rgba(243, 244, 246, 0.5);
                border-bottom: 1px solid rgba(229, 231, 235, 0.5);
                position: relative;
                z-index: 2;
                cursor: move;
                gap: 8px;
            }

            /* 第一行容器 */
            .header-row-1 {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: 4px;
            }

            /* 第二行容器 */
            .header-row-2 {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 4px;
                width: 100%;
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

            /* Eddy 标题编辑样式 */
            .eddy-title {
                color: rgb(55, 65, 81);
                font-weight: 500;
                font-size: 15px;
                position: relative;
                z-index: 1;
                cursor: pointer;
                min-width: 60px;
                max-width: 90px;
                outline: none;
                border-radius: 4px;
                padding: 2px 4px;
                transition: all 0.2s ease;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                user-select: text;
            }

            .eddy-title:hover {
                background-color: rgba(59, 130, 246, 0.05);
            }

            .eddy-title:focus {
                background-color: rgba(59, 130, 246, 0.1);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                cursor: text;
            }

            .eddy-title.editing {
                background-color: rgba(59, 130, 246, 0.1);
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
                cursor: text;
                border: 1px solid rgba(59, 130, 246, 0.3);
                max-width: none;
                overflow: visible;
                text-overflow: clip;
            }

            #pageedit-floating-panel.dark-mode .eddy-title {
                color: rgb(229, 231, 235);
            }

            #pageedit-floating-panel.dark-mode .eddy-title:hover {
                background-color: rgba(96, 165, 250, 0.1);
            }

            #pageedit-floating-panel.dark-mode .eddy-title:focus {
                background-color: rgba(96, 165, 250, 0.15);
                box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
            }

            #pageedit-floating-panel.dark-mode .eddy-title.editing {
                background-color: rgba(96, 165, 250, 0.15);
                box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
                border-color: rgba(96, 165, 250, 0.4);
                max-width: none;
                overflow: visible;
                text-overflow: clip;
            }

            /* 新建 Eddy 按钮特殊样式 */
            .new-eddy-button {
                color: rgb(156, 163, 175) !important;
            }

            .new-eddy-button:hover {
                background: rgba(34, 197, 94, 0.1) !important;
                color: rgb(34, 197, 94) !important;
            }

            #pageedit-floating-panel.dark-mode .new-eddy-button {
                color: rgb(156, 163, 175) !important;
            }

            #pageedit-floating-panel.dark-mode .new-eddy-button:hover {
                background: rgba(74, 222, 128, 0.1) !important;
                color: rgb(74, 222, 128) !important;
            }

            /* 关闭按钮特殊样式 */
            .close-button {
                color: rgb(156, 163, 175) !important;
            }

            .close-button:hover {
                background: rgba(239, 68, 68, 0.1) !important;
                color: rgb(239, 68, 68) !important;
            }

            #pageedit-floating-panel.dark-mode .close-button {
                color: rgb(156, 163, 175) !important;
            }

            #pageedit-floating-panel.dark-mode .close-button:hover {
                background: rgba(248, 113, 113, 0.1) !important;
                color: rgb(248, 113, 113) !important;
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

            /* 标题容器样式 */
            .title-container {
                display: flex;
                align-items: center;
                gap: 4px;
                position: relative;
                flex: 1;
                min-width: 0;
            }

            /* 控制按钮容器样式 */
            .controls-container {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-shrink: 0;
            }

            /* 下拉按钮样式 */
            .dropdown-button {
                color: rgb(156, 163, 175) !important;
                transition: transform 0.2s ease;
                position: relative;
            }

            .dropdown-button:hover {
                background: rgba(0, 0, 0, 0.05) !important;
                color: rgb(75, 85, 99) !important;
            }

            .dropdown-button.open {
                transform: rotate(180deg);
            }

            #pageedit-floating-panel.dark-mode .dropdown-button {
                color: rgb(156, 163, 175) !important;
            }

            #pageedit-floating-panel.dark-mode .dropdown-button:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                color: rgb(209, 213, 219) !important;
            }

            /* 下拉菜单样式 */
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(8px);
                z-index: 2147483648;
                max-height: 200px;
                overflow-y: auto;
                margin-top: 4px;
                min-width: 200px;
            }

            #pageedit-floating-panel.dark-mode .dropdown-menu {
                background: rgba(31, 41, 55, 0.95);
                border-color: rgba(75, 85, 99, 0.3);
            }

            .dropdown-item {
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                color: rgb(55, 65, 81);
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
            }

            .dropdown-item:last-child {
                border-bottom: none;
            }

            .dropdown-item:hover {
                background-color: rgba(59, 130, 246, 0.1);
            }

            .dropdown-item.current {
                background-color: rgba(59, 130, 246, 0.15);
                color: rgb(59, 130, 246);
                font-weight: 500;
            }

            #pageedit-floating-panel.dark-mode .dropdown-item {
                color: rgb(229, 231, 235);
                border-bottom-color: rgba(75, 85, 99, 0.3);
            }

            #pageedit-floating-panel.dark-mode .dropdown-item:hover {
                background-color: rgba(96, 165, 250, 0.1);
            }

            #pageedit-floating-panel.dark-mode .dropdown-item.current {
                background-color: rgba(96, 165, 250, 0.15);
                color: rgb(96, 165, 250);
            }

            .dropdown-item-name {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 200px;
            }

            /* 编辑时隐藏第一行工具栏 */
            .panel-header.editing .header-row-1 .header-button,
            .panel-header.editing .header-row-1 .close-button-container,
            .panel-header.editing .header-row-1 .dropdown-menu {
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
            }
        `;
        this.shadowRoot.appendChild(style);
        console.log('[FloatingPanel] Styles injected');
        
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
            console.log('[FloatingPanel] PT Mono font loaded successfully');
            // 动态添加PT Mono到placeholder样式
            const ptMonoStyle = document.createElement('style');
            ptMonoStyle.textContent = `
                .panel-textarea::placeholder {
                    font-family: 'PT Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
                }
            `;
            this.shadowRoot.appendChild(ptMonoStyle);
        } else {
            console.warn('[FloatingPanel] PT Mono font failed to load, using system monospace fonts as fallback');
        }
    }

    private createPanel(): HTMLDivElement {
        const panel = document.createElement('div');
        panel.id = 'pageedit-floating-panel';

        // 创建面板头部
        const header = document.createElement('div');
        header.className = 'panel-header';

        this.titleElement = document.createElement('span');
        this.titleElement.textContent = 'PageEdit';
        this.titleElement.className = 'eddy-title';
        this.titleElement.contentEditable = 'true';
        this.titleElement.style.cursor = 'pointer';
        this.titleElement.style.minWidth = '60px';
        this.titleElement.style.outline = 'none';
        this.titleElement.style.borderRadius = '4px';
        this.titleElement.style.padding = '2px 4px';
        this.titleElement.style.transition = 'background-color 0.2s';

        // 创建标题容器
        const titleContainer = document.createElement('div');
        titleContainer.className = 'title-container';
        titleContainer.style.display = 'flex';
        titleContainer.style.alignItems = 'center';
        titleContainer.style.gap = '4px';
        titleContainer.style.position = 'relative';

        // 创建下拉按钮
        this.dropdownButton = document.createElement('button');
        this.dropdownButton.className = 'header-button dropdown-button';
        this.dropdownButton.title = 'Switch eddy';
        this.dropdownButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>`;

        // 创建下拉菜单
        this.dropdownMenu = document.createElement('div');
        this.dropdownMenu.className = 'dropdown-menu';
        this.dropdownMenu.style.display = 'none';

        titleContainer.appendChild(this.titleElement);
        titleContainer.appendChild(this.dropdownButton);
        titleContainer.appendChild(this.dropdownMenu);
        // 注意：不在这里添加 dropdownButton 到 titleContainer

        // 创建第一行容器
        const headerRow1 = document.createElement('div');
        headerRow1.className = 'header-row-1';

        // 创建第二行容器
        const headerRow2 = document.createElement('div');
        headerRow2.className = 'header-row-2';

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'controls-container';

        this.undoButton = document.createElement('button');
        this.undoButton.className = 'header-button';
        this.undoButton.title = 'Undo';
        this.undoButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>`;
        console.log('[FloatingPanel] Undo button created');

        // 创建主题切换按钮
        const themeToggleButton = document.createElement('button');
        themeToggleButton.className = 'header-button theme-toggle';
        themeToggleButton.title = 'Theme';
        themeToggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M3 12h2.25m4.227 4.773L5.636 18.364" />
        </svg>`;

        // 创建新建 Eddy 按钮
        this.newEddyButton = document.createElement('button');
        this.newEddyButton.className = 'header-button new-eddy-button';
        this.newEddyButton.title = 'Create new eddy';
        this.newEddyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>`;

        const closeButtonContainer = document.createElement('div');
        closeButtonContainer.className = 'close-button-container';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'header-button close-button';
        closeButton.title = 'Close';
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>`;
        
        closeButtonContainer.appendChild(closeButton);

        // 第一行：标题容器 + 新建 Eddy 按钮 + 下拉框 + 工具按钮 + close 按钮
        headerRow1.appendChild(titleContainer);
        headerRow1.appendChild(this.newEddyButton);
        headerRow1.appendChild(themeToggleButton);
        headerRow1.appendChild(closeButtonContainer);

        // 第二行：Undo 按钮
        headerRow2.appendChild(this.undoButton);

        header.appendChild(headerRow1);
        header.appendChild(headerRow2);

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
        console.log('[FloatingPanel] Initializing panel');
        
        if (!this.input || !this.applyButton || !this.undoButton) {
            console.error('[FloatingPanel] Panel elements not found');
            return;
        }

        // Add event listeners
        this.applyButton.addEventListener('click', () => this.handleApply());
        this.undoButton.addEventListener('click', () => this.handleUndo());
        console.log('[FloatingPanel] Event listeners attached to buttons');

        // 添加 Tooltip 事件监听器
        this.addTooltipEvents(this.undoButton, 'UNDO');
        this.addTooltipEvents(this.newEddyButton, 'CREATE NEW EDDY');
        this.addTooltipEvents(this.dropdownButton, 'SWITCH EDDY');
        
        // 为标题添加动态 tooltip，显示完整标题
        this.titleElement.addEventListener('mouseenter', () => {
            const fullTitle = this.currentEddy ? this.currentEddy.name : 'PageEdit';
            this.showTooltip(this.titleElement, fullTitle);
        });
        this.titleElement.addEventListener('mouseleave', () => this.hideTooltip());
        
        // 设置 Eddy 相关事件处理器
        this.setupEddyEventHandlers();
        
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

        // 标记有未保存更改
        this.hasUnsavedChanges = true;

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
        console.log('[FloatingPanel] Undo button clicked');
        console.log('[FloatingPanel] Event callback exists:', !!this.eventCallback);
        // 触发撤销事件
        if (this.eventCallback) {
            console.log('[FloatingPanel] Calling event callback');
            this.eventCallback({ type: 'undo' });
        } else {
            console.warn('[FloatingPanel] No event callback set');
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
        console.log('[FloatingPanel] Toggling panel visibility');
        if (this.panel.style.display === 'none' || !this.panel.style.display) {
            this.show();
        } else {
            this.hide();
        }
    }

    public show(): void {
        console.log('[FloatingPanel] Showing panel');
        
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
        console.log('[FloatingPanel] Hiding panel');
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
        console.log('[FloatingPanel] Toggling theme');
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

    // Eddy 相关方法
    public setCurrentEddy(eddy: Eddy, isNew: boolean = false): void {
        console.log('[FloatingPanel] Setting current eddy:', eddy.name, '(ID:', eddy.id, ')', 'isNew:', isNew);
        this.currentEddy = eddy;
        this.isNewEddy = isNew;
        this.hasUnsavedChanges = false; // 重置未保存更改标记
        
        // 更新标题
        this.updateTitle();
        
        // 如果是编辑现有 Eddy，加载其修改内容
        if (!isNew && eddy.modifications.length > 0) {
            this.loadEddyModifications(eddy);
        } else {
            // 清空输入框
            this.clearInput();
        }
        
        // 如果不是临时Eddy，将其设置为最近使用的Eddy（后台异步执行）
        if (!isNew && !eddy.id.startsWith('temp_')) {
            this.setAsLastUsedEddy(eddy).catch(error => {
                console.error('[FloatingPanel] Error setting eddy as last used:', error);
            });
        }
    }

    private updateTitle(): void {
        if (this.currentEddy) {
            this.titleElement.textContent = this.currentEddy.name;
        } else {
            this.titleElement.textContent = 'PageEdit';
        }
    }

    private loadEddyModifications(eddy: Eddy): void {
        // 这里可以根据需要加载 Eddy 的修改内容
        // 目前先清空输入框，后续可以扩展
        this.clearInput();
        console.log('[FloatingPanel] Loaded eddy modifications:', eddy.modifications.length, 'items');
    }

    private async createNewEddy(): Promise<void> {
        try {
            // 保存当前 Eddy（如果有未保存更改）
            if (this.currentEddy && this.hasUnsavedChanges) {
                await this.saveCurrentEddy();
            }

            const currentDomain = window.location.hostname;
            const newEddyName = 'New Eddy';
            
            console.log('[FloatingPanel] Creating new eddy with name:', newEddyName);
            
            // 创建一个临时的Eddy对象，不立即保存到存储
            const newEddy: Eddy = {
                id: `temp_${Date.now()}`, // 临时ID
                name: newEddyName,
                domain: currentDomain,
                modifications: [],
                lastUsed: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            console.log('[FloatingPanel] New temporary eddy created:', newEddy.name, '(ID:', newEddy.id, ')');
            
            // 设置新的 Eddy
            this.setCurrentEddy(newEddy, true);
            
            // 清空输入框
            this.clearInput();
        } catch (error) {
            console.error('[FloatingPanel] Error creating new eddy:', error);
        }
    }

    private async saveCurrentEddy(): Promise<void> {
        if (!this.currentEddy || !this.hasUnsavedChanges) return;
        
        try {
            // 更新 Eddy 名称（如果用户编辑了标题）
            const newName = this.titleElement.textContent?.trim() || this.currentEddy.name;
            if (newName !== this.currentEddy.name) {
                this.currentEddy.name = newName;
            }
            
            // 设置为最近使用的Eddy
            this.currentEddy.lastUsed = true;
            
            // 如果是临时Eddy，需要先创建真实的Eddy
            if (this.isNewEddy && this.currentEddy.id.startsWith('temp_')) {
                console.log('[FloatingPanel] Converting temporary eddy to real eddy');
                const realEddy = await StorageService.createEddy(
                    this.currentEddy.name,
                    this.currentEddy.domain,
                    this.currentEddy.modifications
                );
                this.currentEddy = realEddy;
                this.isNewEddy = false;
                console.log('[FloatingPanel] Temporary eddy converted to real eddy:', realEddy.id);
            } else {
                // 更新现有的Eddy
                await StorageService.updateEddy(this.currentEddy);
            }
            
            // 重置未保存更改标记
            this.hasUnsavedChanges = false;
            
            console.log('[FloatingPanel] Current eddy saved:', this.currentEddy.name, '(ID:', this.currentEddy.id, ')');
        } catch (error) {
            console.error('[FloatingPanel] Error saving current eddy:', error);
        }
    }

    private setupEddyEventHandlers(): void {
        // 新建 Eddy 按钮事件
        this.newEddyButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.createNewEddy();
        });

        // 下拉按钮事件
        this.dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // 标题编辑事件
        this.titleElement.addEventListener('click', (e) => {
            e.stopPropagation();
            // 点击时聚焦并进入编辑状态
            this.titleElement.focus();
            this.titleElement.classList.add('editing');
            this.panel.querySelector('.panel-header')?.classList.add('editing');
            
            // 将光标移到文本末尾
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(this.titleElement);
            range.collapse(false); // 将光标移到末尾
            selection?.removeAllRanges();
            selection?.addRange(range);
        });

        this.titleElement.addEventListener('focus', () => {
            this.titleElement.classList.add('editing');
            this.panel.querySelector('.panel-header')?.classList.add('editing');
        });

        this.titleElement.addEventListener('blur', async () => {
            this.titleElement.classList.remove('editing');
            this.panel.querySelector('.panel-header')?.classList.remove('editing');
            
            // 检查标题是否被修改
            if (this.currentEddy) {
                const newName = this.titleElement.textContent?.trim() || this.currentEddy.name;
                if (newName !== this.currentEddy.name) {
                    this.hasUnsavedChanges = true;
                    await this.saveCurrentEddy();
                }
            }
        });

        // 处理中文输入法
        let isComposing = false;
        
        this.titleElement.addEventListener('compositionstart', () => {
            isComposing = true;
        });
        
        this.titleElement.addEventListener('compositionend', () => {
            isComposing = false;
        });

        this.titleElement.addEventListener('keydown', async (e) => {
            // 如果正在使用中文输入法，不处理 Enter 键
            if (isComposing) {
                return;
            }
            
            if (e.key === 'Enter') {
                e.preventDefault();
                this.titleElement.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.updateTitle(); // 恢复原名称
                this.titleElement.blur();
            }
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!this.dropdownMenu.contains(e.target as Node) && 
                !this.dropdownButton.contains(e.target as Node)) {
                this.closeDropdown();
            }
        });
    }

    // 下拉菜单相关方法
    private async toggleDropdown(): Promise<void> {
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            await this.openDropdown();
        }
    }

    private async openDropdown(): Promise<void> {
        try {
            // 加载当前域名的所有 Eddy
            const currentDomain = window.location.hostname;
            const eddys = await StorageService.getEddysByDomain(currentDomain);
            
            console.log('[FloatingPanel] Loading eddys for dropdown:', eddys.length, 'items');
            
            // 按照编辑时间倒序排序，最近编辑的在最上面
            const sortedEddys = eddys.sort((a, b) => b.updatedAt - a.updatedAt);
            
            // 清空下拉菜单
            this.dropdownMenu.innerHTML = '';
            
            if (sortedEddys.length === 0) {
                // 如果没有 Eddy，显示提示
                const noEddyItem = document.createElement('div');
                noEddyItem.className = 'dropdown-item';
                noEddyItem.style.cursor = 'default';
                noEddyItem.style.color = 'rgb(156, 163, 175)';
                noEddyItem.textContent = 'No eddys found';
                this.dropdownMenu.appendChild(noEddyItem);
            } else {
                // 添加所有 Eddy 到下拉菜单
                sortedEddys.forEach(eddy => {
                    const item = this.createDropdownItem(eddy);
                    this.dropdownMenu.appendChild(item);
                });
            }
            
            // 显示下拉菜单
            this.dropdownMenu.style.display = 'block';
            this.dropdownButton.classList.add('open');
            this.isDropdownOpen = true;
            
            console.log('[FloatingPanel] Dropdown opened with', sortedEddys.length, 'eddys');
        } catch (error) {
            console.error('[FloatingPanel] Error opening dropdown:', error);
        }
    }

    private createDropdownItem(eddy: Eddy): HTMLDivElement {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        // 如果是当前 Eddy，添加 current 类
        if (this.currentEddy && this.currentEddy.id === eddy.id) {
            item.classList.add('current');
        }
        
        // 创建名称元素
        const nameElement = document.createElement('span');
        nameElement.className = 'dropdown-item-name';
        nameElement.textContent = eddy.name;
        
        item.appendChild(nameElement);
        
        // 为下拉菜单项添加 tooltip，显示完整名称
        item.addEventListener('mouseenter', () => {
            this.showTooltip(item, eddy.name);
        });
        item.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        // 添加点击事件
        item.addEventListener('click', async () => {
            if (this.currentEddy && this.currentEddy.id === eddy.id) {
                // 如果点击的是当前 Eddy，只关闭下拉菜单
                this.closeDropdown();
                return;
            }
            
            console.log('[FloatingPanel] Switching to eddy:', eddy.name, '(ID:', eddy.id, ')');
            
            // 保存当前 Eddy（如果有未保存更改）
            if (this.currentEddy && this.hasUnsavedChanges) {
                await this.saveCurrentEddy();
            }
            
            // 切换到选中的 Eddy
            this.setCurrentEddy(eddy);
            
            // 关闭下拉菜单
            this.closeDropdown();
        });
        
        return item;
    }

    private closeDropdown(): void {
        this.dropdownMenu.style.display = 'none';
        this.dropdownButton.classList.remove('open');
        this.isDropdownOpen = false;
    }

    private async setAsLastUsedEddy(eddy: Eddy): Promise<void> {
        try {
            // 如果当前Eddy已经是lastUsed，不需要更新
            if (eddy.lastUsed) {
                return;
            }
            
            console.log('[FloatingPanel] Setting eddy as last used:', eddy.name, '(ID:', eddy.id, ')');
            
            // 设置当前Eddy为lastUsed
            eddy.lastUsed = true;
            eddy.updatedAt = Date.now();
            
            // 更新存储
            await StorageService.updateEddy(eddy);
            
            console.log('[FloatingPanel] Eddy set as last used successfully');
        } catch (error) {
            console.error('[FloatingPanel] Error setting eddy as last used:', error);
        }
    }
}