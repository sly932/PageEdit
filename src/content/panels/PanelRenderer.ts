import { PanelTooltip } from './PanelTooltip';
import { PanelTheme } from './PanelTheme';

// 渲染器模块
export class PanelRenderer {
    private static shadowRoot: ShadowRoot | null = null;
    
    // UI 元素引用
    private static panel: HTMLDivElement | null = null;
    private static input: HTMLTextAreaElement | null = null;
    private static applyButton: HTMLButtonElement | null = null;
    private static undoButton: HTMLButtonElement | null = null;
    private static redoButton: HTMLButtonElement | null = null;
    private static resetButton: HTMLButtonElement | null = null;
    private static feedback: HTMLDivElement | null = null;
    private static titleElement: HTMLSpanElement | null = null;
    private static newEddyButton: HTMLButtonElement | null = null;
    private static deleteButton: HTMLButtonElement | null = null;
    private static dropdownButton: HTMLButtonElement | null = null;
    private static dropdownMenu: HTMLDivElement | null = null;
    private static eddyToggleSwitch: HTMLButtonElement | null = null;

    static initialize(shadowRoot: ShadowRoot) {
        PanelRenderer.shadowRoot = shadowRoot;
    }

    static createPanel(): {
        panel: HTMLDivElement;
        input: HTMLTextAreaElement;
        applyButton: HTMLButtonElement;
        undoButton: HTMLButtonElement;
        redoButton: HTMLButtonElement;
        resetButton: HTMLButtonElement;
        feedback: HTMLDivElement;
        titleElement: HTMLSpanElement;
        eddyToggleSwitch: HTMLButtonElement;
        newEddyButton: HTMLButtonElement;
        deleteButton: HTMLButtonElement;
        dropdownButton: HTMLButtonElement;
        dropdownMenu: HTMLDivElement;
    } {
        if (!PanelRenderer.shadowRoot) {
            throw new Error('[PanelRenderer] ShadowRoot not initialized');
        }

        const panel = document.createElement('div');
        panel.id = 'pageedit-floating-panel';

        // 创建面板头部
        const header = document.createElement('div');
        header.className = 'panel-header';

        const titleElement = document.createElement('span');
        titleElement.textContent = 'PageEdit';
        titleElement.className = 'eddy-title';
        titleElement.contentEditable = 'true';
        titleElement.style.cursor = 'pointer';
        titleElement.style.minWidth = '60px';
        titleElement.style.outline = 'none';
        titleElement.style.borderRadius = '4px';
        titleElement.style.padding = '2px 4px';
        titleElement.style.transition = 'background-color 0.2s';

        // 新增：创建 Eddy 开关
        const eddyToggleSwitch = document.createElement('button');
        eddyToggleSwitch.className = 'eddy-toggle-switch';
        eddyToggleSwitch.title = 'Disable Eddy';
        // 开关的视觉样式 (圆圈) 将由 CSS 控制
        eddyToggleSwitch.innerHTML = `
            <div class="toggle-handle"></div>
        `;

        // 创建标题容器
        const titleContainer = document.createElement('div');
        titleContainer.className = 'title-container';
        titleContainer.style.display = 'flex';
        titleContainer.style.alignItems = 'center';
        titleContainer.style.gap = '4px';
        titleContainer.style.position = 'relative';

        // 创建下拉按钮
        const dropdownButton = document.createElement('button');
        dropdownButton.className = 'header-button dropdown-button';
        dropdownButton.title = 'Switch eddy';
        dropdownButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>`;

        // 创建下拉菜单
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        dropdownMenu.style.display = 'none';

        titleContainer.appendChild(titleElement);
        titleContainer.appendChild(dropdownButton);
        titleContainer.appendChild(dropdownMenu);

        // 创建第一行容器
        const headerRow1 = document.createElement('div');
        headerRow1.className = 'header-row-1';

        // 创建第二行容器
        const headerRow2 = document.createElement('div');
        headerRow2.className = 'header-row-2';

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'controls-container';

        const undoButton = document.createElement('button');
        undoButton.className = 'header-button';
        undoButton.title = 'Undo';
        undoButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>`;
        console.log('[PanelRenderer] Undo button created');

        // 创建重做按钮
        const redoButton = document.createElement('button');
        redoButton.className = 'header-button';
        redoButton.title = 'Redo';
        redoButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
        </svg>`;
        console.log('[PanelRenderer] Redo button created');

        // 创建重置按钮
        const resetButton = document.createElement('button');
        resetButton.className = 'header-button';
        resetButton.title = 'Reset all';
        resetButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>`;
        console.log('[PanelRenderer] Reset button created');

        // 创建主题切换按钮
        const themeToggleButton = document.createElement('button');
        themeToggleButton.className = 'header-button theme-toggle';
        themeToggleButton.title = 'Theme';
        themeToggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M3 12h2.25m4.227 4.773L5.636 18.364" />
        </svg>`;

        // 创建新建 Eddy 按钮
        const newEddyButton = document.createElement('button');
        newEddyButton.className = 'header-button new-eddy-button';
        newEddyButton.title = 'Create new eddy';
        newEddyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>`;

        // 创建删除 Eddy 按钮
        const deleteButton = document.createElement('button');
        deleteButton.className = 'header-button delete-button';
        deleteButton.title = 'DELETE';
        deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>`;

        const closeButtonContainer = document.createElement('div');
        closeButtonContainer.className = 'close-button-container';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'header-button close-button';
        closeButton.title = 'Close';
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>`;
        
        closeButtonContainer.appendChild(closeButton);

        // 第一行：开关 + 标题容器 + 新建 Eddy 按钮 + 删除 Eddy 按钮 + 主题切换按钮 + close 按钮
        headerRow1.appendChild(eddyToggleSwitch);
        headerRow1.appendChild(titleContainer);
        headerRow1.appendChild(newEddyButton);
        headerRow1.appendChild(deleteButton);
        headerRow1.appendChild(themeToggleButton);
        headerRow1.appendChild(closeButtonContainer);

        // 第二行：Undo 按钮
        headerRow2.appendChild(undoButton);
        headerRow2.appendChild(redoButton);
        headerRow2.appendChild(resetButton);

        header.appendChild(headerRow1);
        header.appendChild(headerRow2);

        // 创建面板内容
        const content = document.createElement('div');
        content.className = 'panel-content';

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';

        // 创建文本区域
        const input = document.createElement('textarea');
        input.className = 'panel-textarea';
        input.placeholder = 'Enjoy your edit...';
        input.rows = 1;

        // 创建应用按钮
        const applyButton = document.createElement('button');
        applyButton.className = 'apply-button';
        applyButton.title = 'Apply';
        applyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`;

        inputWrapper.appendChild(input);
        inputWrapper.appendChild(applyButton);

        content.appendChild(inputWrapper);

        // 创建反馈消息区域
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';

        panel.appendChild(header);
        panel.appendChild(content);
        panel.appendChild(feedback);

        // 设置事件监听器
        PanelRenderer.setupEventListeners(
            panel,
            closeButton,
            themeToggleButton,
            deleteButton,
            input,
            applyButton,
            undoButton,
            redoButton,
            resetButton,
            newEddyButton,
            dropdownButton,
            titleElement
        );

        PanelRenderer.shadowRoot.appendChild(panel);

        // 存储引用
        PanelRenderer.panel = panel;
        PanelRenderer.input = input;
        PanelRenderer.applyButton = applyButton;
        PanelRenderer.undoButton = undoButton;
        PanelRenderer.redoButton = redoButton;
        PanelRenderer.resetButton = resetButton;
        PanelRenderer.feedback = feedback;
        PanelRenderer.titleElement = titleElement;
        PanelRenderer.newEddyButton = newEddyButton;
        PanelRenderer.deleteButton = deleteButton;
        PanelRenderer.dropdownButton = dropdownButton;
        PanelRenderer.dropdownMenu = dropdownMenu;
        PanelRenderer.eddyToggleSwitch = eddyToggleSwitch;

        return {
            panel,
            input,
            applyButton,
            undoButton,
            redoButton,
            resetButton,
            feedback,
            titleElement,
            eddyToggleSwitch,
            newEddyButton,
            deleteButton,
            dropdownButton,
            dropdownMenu
        };
    }

    private static setupEventListeners(
        panel: HTMLDivElement,
        closeButton: HTMLButtonElement,
        themeToggleButton: HTMLButtonElement,
        deleteButton: HTMLButtonElement,
        input: HTMLTextAreaElement,
        applyButton: HTMLButtonElement,
        undoButton: HTMLButtonElement,
        redoButton: HTMLButtonElement,
        resetButton: HTMLButtonElement,
        newEddyButton: HTMLButtonElement,
        dropdownButton: HTMLButtonElement,
        titleElement: HTMLSpanElement
    ) {
        // 这些事件监听器将在 FloatingPanel 中设置具体的回调函数
        // 这里只是创建基本的 UI 结构
    }

    // 获取 UI 元素引用的静态方法
    static getPanel(): HTMLDivElement | null {
        return PanelRenderer.panel;
    }

    static getInput(): HTMLTextAreaElement | null {
        return PanelRenderer.input;
    }

    static getApplyButton(): HTMLButtonElement | null {
        return PanelRenderer.applyButton;
    }

    static getUndoButton(): HTMLButtonElement | null {
        return PanelRenderer.undoButton;
    }

    static getRedoButton(): HTMLButtonElement | null {
        return PanelRenderer.redoButton;
    }

    static getResetButton(): HTMLButtonElement | null {
        return PanelRenderer.resetButton;
    }

    static getFeedback(): HTMLDivElement | null {
        return PanelRenderer.feedback;
    }

    static getTitleElement(): HTMLSpanElement | null {
        return PanelRenderer.titleElement;
    }

    static getNewEddyButton(): HTMLButtonElement | null {
        return PanelRenderer.newEddyButton;
    }

    static getDeleteButton(): HTMLButtonElement | null {
        return PanelRenderer.deleteButton;
    }

    static getDropdownButton(): HTMLButtonElement | null {
        return PanelRenderer.dropdownButton;
    }

    static getDropdownMenu(): HTMLDivElement | null {
        return PanelRenderer.dropdownMenu;
    }
} 