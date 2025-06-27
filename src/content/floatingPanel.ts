import { StyleService } from './services/styleService';
import { Eddy } from '../types/eddy';
import { StorageService } from '../services/storageService';
import { PanelStyles } from './panels/PanelStyles';
import { PanelTooltip } from './panels/PanelTooltip';
import { PanelTheme } from './panels/PanelTheme';
import { PanelEvents } from './panels/PanelEvents';
import { PanelDragHandler } from './panels/PanelDragHandler';
import { PanelRenderer } from './panels/PanelRenderer';

// 定义自定义事件类型
export interface PanelEvent {
    type: 'apply' | 'undo' | 'redo' | 'cancel' | 'reset' | 'new_eddy' | 'switch_eddy' | 'delete_eddy' | 'title_update' | 'toggle_eddy_enabled';
    data?: {
        text?: string;
        eddyId?: string;
        newTitle?: string;
    };
}

// 定义事件回调类型
export type PanelEventCallback = (event: PanelEvent) => void;

export class FloatingPanel {
    private panel: HTMLDivElement;
    private input!: HTMLTextAreaElement;
    private applyButton!: HTMLButtonElement;
    private undoButton!: HTMLButtonElement;
    private redoButton!: HTMLButtonElement;
    private resetButton!: HTMLButtonElement;
    private feedback!: HTMLDivElement;
    private shadowRoot: ShadowRoot;
    private eventCallback: PanelEventCallback | null = null;
    private isProcessing: boolean = false; // 添加处理状态标记
    
    // Eddy 相关属性
    private isNewEddy: boolean = false;
    private titleElement!: HTMLSpanElement;
    private eddyToggleSwitch!: HTMLButtonElement; // 新增：Eddy 启用/禁用开关
    private newEddyButton!: HTMLButtonElement;
    private deleteButton!: HTMLButtonElement;
    private hasUnsavedChanges: boolean = false; // 添加未保存更改标记
    
    // 下拉菜单相关属性
    private dropdownButton!: HTMLButtonElement;
    private dropdownMenu!: HTMLDivElement;
    private isDropdownOpen: boolean = false;

    // 草稿相关属性
    private draftSaveTimeout: NodeJS.Timeout | null = null; // 防抖定时器
    private readonly DRAFT_SAVE_DELAY = 1000; // 草稿保存延迟（毫秒）

    // 反馈消息相关属性
    private feedbackTimeoutId: NodeJS.Timeout | null = null;
    private feedbackClearTextTimeoutId: NodeJS.Timeout | null = null;

    constructor(shadowRoot: ShadowRoot) {
        this.shadowRoot = shadowRoot;
        console.log('[FloatingPanel] Initializing FloatingPanel...');

        // 先初始化 Tooltip
        PanelTooltip.initialize(this.shadowRoot);
        
        // 初始化各个模块
        PanelRenderer.initialize(shadowRoot);
        
        // 注入样式
        PanelStyles.injectStyles(shadowRoot);
        
        // 创建面板
        const panelElements = PanelRenderer.createPanel();
        this.panel = panelElements.panel;
        this.input = panelElements.input;
        this.applyButton = panelElements.applyButton;
        this.undoButton = panelElements.undoButton;
        this.redoButton = panelElements.redoButton;
        this.resetButton = panelElements.resetButton;
        this.feedback = panelElements.feedback;
        this.titleElement = panelElements.titleElement;
        this.eddyToggleSwitch = panelElements.eddyToggleSwitch; // 新增
        this.newEddyButton = panelElements.newEddyButton;
        this.deleteButton = panelElements.deleteButton;
        this.dropdownButton = panelElements.dropdownButton;
        this.dropdownMenu = panelElements.dropdownMenu;
        
        // 初始化拖拽功能
        PanelDragHandler.initialize(this.panel);
        
        // 初始化事件处理
        PanelEvents.initialize(
            this.panel,
            this.titleElement,
            this.dropdownButton,
            this.dropdownMenu,
            this.newEddyButton,
            this.deleteButton,
            {
                onNewEddy: () => this.createNewEddy(),
                onSaveEddy: () => this.saveCurrentEddy(),
                onSwitchEddy: (eddyId: string) => {
                    if (this.eventCallback) {
                        this.eventCallback({ type: 'switch_eddy', data: { eddyId } });
                    }
                },
                onDeleteEddy: () => this.deleteCurrentEddy(),
                onTitleUpdate: (newTitle: string) => {
                    if (this.eventCallback) {
                        this.eventCallback({ type: 'title_update', data: { newTitle } });
                    }
                    return Promise.resolve();
                }
            }
        );
        
        // 初始化主题
        PanelTheme.initialize(this.panel);
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 添加页面刷新前的事件监听器
        this.setupPageUnloadListener();

        console.log('[FloatingPanel] FloatingPanel initialized successfully');
    }

    private setupEventListeners(): void {
        console.log('[FloatingPanel] Setting up event listeners');
        
        if (!this.input || !this.applyButton || !this.undoButton || !this.resetButton) {
            console.error('[FloatingPanel] Panel elements not found');
            return;
        }

        // Add event listeners
        this.applyButton.addEventListener('click', () => this.handleApply());
        this.undoButton.addEventListener('click', () => this.handleUndo());
        this.redoButton.addEventListener('click', () => this.handleRedo());
        this.resetButton.addEventListener('click', () => this.handleReset());
        console.log('[FloatingPanel] Event listeners attached to buttons');

        // 新增：为 Eddy 开关添加事件监听
        this.eddyToggleSwitch.addEventListener('click', () => {
            if (this.eventCallback) {
                this.eventCallback({ type: 'toggle_eddy_enabled' });
            }
        });

        // 为 Eddy 开关添加动态 Tooltip
        this.eddyToggleSwitch.addEventListener('mouseenter', () => {
            // The title is dynamically set in `updateEddyToggleState`
            const tooltipText = this.eddyToggleSwitch.title;
            PanelTooltip.showTooltip(this.eddyToggleSwitch, tooltipText);
        });
        this.eddyToggleSwitch.addEventListener('mouseleave', () => PanelTooltip.hideTooltip());

        // 添加 Tooltip 事件监听器
        PanelTooltip.addTooltipEvents(this.undoButton, 'UNDO');
        PanelTooltip.addTooltipEvents(this.redoButton, 'REDO');
        PanelTooltip.addTooltipEvents(this.resetButton, 'RESET ALL');
        PanelTooltip.addTooltipEvents(this.newEddyButton, 'CREATE NEW EDDY');
        PanelTooltip.addTooltipEvents(this.dropdownButton, 'SWITCH EDDY');
        
        // 为删除按钮添加 Tooltip
        PanelTooltip.addTooltipEvents(this.deleteButton, 'DELETE');
        
        // 为主题切换按钮添加 Tooltip
        const themeToggleButton = this.shadowRoot.querySelector('.theme-toggle') as HTMLButtonElement;
        if (themeToggleButton) {
            PanelTooltip.addTooltipEvents(themeToggleButton, 'THEME');
            // 添加主题切换事件
            themeToggleButton.addEventListener('click', () => PanelTheme.toggleTheme());
        }
        
        // 为关闭按钮添加 Tooltip（从 PanelRenderer 获取）
        const closeButton = this.shadowRoot.querySelector('.close-button') as HTMLButtonElement;
        if (closeButton) {
            PanelTooltip.addTooltipEvents(closeButton, 'CLOSE');
            // 添加关闭事件
            closeButton.addEventListener('click', () => this.hide());
        }
        
        // 为标题添加动态 tooltip，显示完整标题
        this.titleElement.addEventListener('mouseenter', () => {
            const fullTitle = this.titleElement.textContent || 'PageEdit';
            PanelTooltip.showTooltip(this.titleElement, fullTitle);
        });
        this.titleElement.addEventListener('mouseleave', () => PanelTooltip.hideTooltip());
        
        // 为应用按钮添加动态 tooltip
        this.applyButton.addEventListener('mouseenter', () => {
            const tooltipText = this.isProcessing ? 'CANCEL' : 'APPLY';
            PanelTooltip.showTooltip(this.applyButton, tooltipText);
        });
        this.applyButton.addEventListener('mouseleave', () => PanelTooltip.hideTooltip());

        // Auto-resize textarea
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = `${this.input.scrollHeight}px`;
            
            // 检查输入内容，启用/禁用按钮
            this.updateButtonState();
            
            // 自动保存草稿
            this.saveDraftDebounced();
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

        // 监听主题变化事件，更新 Tooltip 样式
        document.addEventListener('themeChanged', (e: Event) => {
            const customEvent = e as CustomEvent;
            PanelTooltip.updateTheme(customEvent.detail.isDarkMode);
        });

        // 监听视口变化，当开发者工具栏打开/关闭时自动调整位置
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                if (this.panel.style.display !== 'none') {
                    if (!PanelDragHandler.getHasBeenDragged()) {
                        // 如果面板未被拖动过，使用预设的安全位置
                        const safePosition = PanelDragHandler.calculateSafePosition();
                        this.panel.style.right = safePosition.right;
                        this.panel.style.bottom = safePosition.bottom;
                    } else {
                        // 如果面板已被拖动过，调整位置以保持相对于可视区域的位置
                        PanelDragHandler.adjustPositionForViewportChange();
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

        // 立即保存草稿（清除防抖定时器并立即保存）
        if (this.draftSaveTimeout) {
            clearTimeout(this.draftSaveTimeout);
            this.draftSaveTimeout = null;
        }
        this.saveDraft();

        // 标记有未保存更改
        this.hasUnsavedChanges = true;

        // 开始处理状态
        this.isProcessing = true;
        this.applyButton.title = 'Cancel';
        this.applyButton.classList.add('processing');
        this.applyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="1"/>
        </svg>`;
        
        // 禁用输入框
        this.input.disabled = true;
        this.input.style.opacity = '0.7';
        this.input.style.cursor = 'default';

        // 更新undo/redo/reset按钮状态（禁用）
        this.updateUndoRedoButtonStates();

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
        
        // 更新undo/redo/reset按钮状态（重新启用）
        this.updateUndoRedoButtonStates();
        
        // 重新检查按钮状态
        this.updateButtonState();
        
        // 触发取消事件
        if (this.eventCallback) {
            this.eventCallback({
                type: 'cancel'
            });
        }
    }

    // 取消进行中的请求
    private cancelPendingRequests(): void {
        console.log('[FloatingPanel] Cancelling pending requests');
        
        // 重置处理状态
        this.isProcessing = false;
        
        // 重置按钮状态
        this.resetApplyButton();
        
        // 触发取消事件
        if (this.eventCallback) {
            this.eventCallback({
                type: 'cancel'
            });
        }
    }

    private handleUndo(): void {
        console.log('[FloatingPanel] Undo button clicked');
        if (this.eventCallback) {
            this.eventCallback({ type: 'undo' });
        }
    }

    private handleRedo(): void {
        console.log('[FloatingPanel] Redo button clicked');
        if (this.eventCallback) {
            this.eventCallback({ type: 'redo' });
        }
    }

    private handleReset(): void {
        console.log('[FloatingPanel] Reset button clicked');
        if (this.eventCallback) {
            this.eventCallback({ type: 'reset' });
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
        
        // 更新undo/redo/reset按钮状态
        this.updateUndoRedoButtonStates();
        
        this.updateButtonState(); // 重新检查输入内容状态，会处理提示文字
    }

    // 更新undo/redo按钮状态
    public updateUndoRedoButtonStates(): void {
        const stateInfo = StyleService.getStateInfo();
        
        // 如果正在处理LLM请求，禁用所有按钮
        if (this.isProcessing) {
            this.undoButton.disabled = true;
            this.redoButton.disabled = true;
            this.resetButton.disabled = true;
            
            // 设置按钮样式为禁用状态
            this.undoButton.style.opacity = '0.5';
            this.redoButton.style.opacity = '0.5';
            this.resetButton.style.opacity = '0.5';
            
            // 设置鼠标样式为禁止
            this.undoButton.style.cursor = 'not-allowed';
            this.redoButton.style.cursor = 'not-allowed';
            this.resetButton.style.cursor = 'not-allowed';
            
            console.log('[FloatingPanel] Buttons disabled during processing');
            return;
        }
        
        // 正常状态下的按钮管理
        this.undoButton.disabled = !stateInfo.canUndo;
        this.redoButton.disabled = !stateInfo.canRedo;
        this.resetButton.disabled = false; // reset按钮总是可用的（除了处理中）
        
        // 更新按钮样式
        this.undoButton.style.opacity = stateInfo.canUndo ? '1' : '0.5';
        this.redoButton.style.opacity = stateInfo.canRedo ? '1' : '0.5';
        this.resetButton.style.opacity = '1';
        
        // 设置鼠标样式
        this.undoButton.style.cursor = stateInfo.canUndo ? 'pointer' : 'not-allowed';
        this.redoButton.style.cursor = stateInfo.canRedo ? 'pointer' : 'not-allowed';
        this.resetButton.style.cursor = 'pointer';
    }

    // 清空输入框
    public clearInput(): void {
        this.input.value = '';
        this.hideHint();
        this.updateButtonState();
    }

    // 更新输入框内容
    public updateInputContent(content: string): void {
        this.input.value = content;
        this.input.style.height = 'auto';
        this.input.style.height = `${this.input.scrollHeight}px`;
        this.updateButtonState();
        
        console.log('[FloatingPanel] Input content updated:', content);
    }

    public showFeedback(message: string, type: 'success' | 'error'): void {
        // 清除现有的定时器，防止消息冲突
        if (this.feedbackTimeoutId) {
            clearTimeout(this.feedbackTimeoutId);
        }
        if (this.feedbackClearTextTimeoutId) {
            clearTimeout(this.feedbackClearTextTimeoutId);
        }

        this.feedback.textContent = message;
        this.feedback.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            color: white;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
            opacity: 1;
            transition: opacity 0.3s;
            z-index: 2147483647;
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // 确保元素立即显示，而不是等待下一个渲染周期
        this.feedback.style.opacity = '1';

        // 自动隐藏反馈消息
        this.feedbackTimeoutId = setTimeout(() => {
            this.feedback.style.opacity = '0';
            this.feedbackClearTextTimeoutId = setTimeout(() => {
                this.feedback.textContent = '';
            }, 300); // 对应 transition 时间
        }, 1500);
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
        if (!PanelDragHandler.getHasBeenDragged()) {
            const safePosition = PanelDragHandler.calculateSafePosition();
            this.panel.style.right = safePosition.right;
            this.panel.style.bottom = safePosition.bottom;
        }
        
        this.panel.style.display = 'block';
        
        // 更新undo/redo按钮状态
        this.updateUndoRedoButtonStates();
        
        // 延迟聚焦，确保面板已显示
        setTimeout(() => {
            this.input.focus();
        }, 100);
    }

    public hide(): void {
        console.log('[FloatingPanel] Hiding panel');
        
        // 保存草稿
        if (this.draftSaveTimeout) {
            clearTimeout(this.draftSaveTimeout);
            this.draftSaveTimeout = null;
        }
        this.saveDraft();
        
        this.panel.style.display = 'none';
    }

    // 重置面板位置到默认状态
    public resetPosition(): void {
        PanelDragHandler.resetPosition();
    }

    public destroy(): void {
        // 清理草稿保存定时器
        if (this.draftSaveTimeout) {
            clearTimeout(this.draftSaveTimeout);
            this.draftSaveTimeout = null;
        }
        
        this.panel.remove();
    }

    /**
     * Updates the panel's display to reflect the state of a given Eddy.
     * @param eddyName The name of the Eddy to display.
     * @param eddyId The ID of the Eddy.
     * @param isNew Whether this is a newly created Eddy.
     */
    public updatePanelDisplay(eddyName: string, eddyId: string, isNew: boolean = false, isEnabled: boolean = true): void {
        this.isNewEddy = isNew;

        console.log(`[FloatingPanel] Updating panel display for: ${eddyName} (ID: ${eddyId}, isNew: ${isNew}, isEnabled: ${isEnabled})`);
        
        // 更新标题
        this.updateEddyTitle(eddyName);
        if (this.titleElement) {
            this.titleElement.dataset.eddyId = eddyId;
        }

        // 更新 Eddy 开关状态
        this.updateEddyToggleState(isEnabled);
        
        // 更新按钮状态
        this.updateUndoRedoButtonStates();
        
        // 如果是新的 Eddy，清空输入框
        if (isNew) {
            this.clearInput();
        }
    }

    private loadEddyStyleElements(eddy: Eddy): void {
        // 这里可以根据需要加载 Eddy 的样式元素内容
        // 目前保持输入内容不变，后续可以扩展
        if (eddy.currentStyleElements) {
            console.log('[FloatingPanel] Loaded eddy style elements:', eddy.currentStyleElements.length, 'items');
        } else {
            console.log('[FloatingPanel] No style elements found in eddy');
        }
    }

    private async createNewEddy(): Promise<void> {
        // This logic will be moved to ContentManager.
        // For now, it just calls the event handler.
        if (this.eventCallback) {
            this.eventCallback({ type: 'new_eddy' });
        }
        console.log('[FloatingPanel] "Create New Eddy" clicked. Notifying ContentManager.');
    }

    private async saveCurrentEddy(): Promise<void> {
        // This logic is now fully in ContentManager.
        // The panel should only care about indicating the save status.
        console.log('[FloatingPanel] "Save" action triggered. Logic is in ContentManager.');
    }

    private async setAsLastUsedEddy(eddy: Eddy): Promise<void> {
        // This logic is now in ContentManager.
    }

    private saveDraftDebounced(): void {
        // 清除之前的定时器
        if (this.draftSaveTimeout) {
            clearTimeout(this.draftSaveTimeout);
        }
        
        // 设置新的定时器
        this.draftSaveTimeout = setTimeout(() => {
            this.saveDraft();
        }, this.DRAFT_SAVE_DELAY);
    }

    private async saveDraft(): Promise<void> {
        // Draft saving logic needs to be re-evaluated.
        // It should probably get the eddyId from ContentManager.
        // if (!this.currentEddy || this.isNewEddy) {
        //     return;
        // }
        // await StorageService.saveDraft(this.currentEddy.id, this.input.value);
        // console.log('[FloatingPanel] Draft saved for eddy:', this.currentEddy.id);
    }

    private handleDeleteEddy(): void {
        if (this.isNewEddy) {
            return;
        }
        // Show confirmation dialog
        const confirmed = confirm('Are you sure you want to delete this Eddy? This action cannot be undone.');
        if (confirmed) {
            this.deleteCurrentEddy();
        }
    }

    private async deleteCurrentEddy(): Promise<void> {
        // This logic is now in ContentManager.
        console.log('[FloatingPanel] "Delete" action triggered. Notifying ContentManager.');
        if (this.eventCallback) {
            this.eventCallback({ type: 'delete_eddy' });
        }
    }

    public setHasUnsavedChanges(hasChanges: boolean): void {
        this.hasUnsavedChanges = hasChanges;
    }

    private setupPageUnloadListener(): void {
        window.addEventListener('beforeunload', () => {
            if (this.hasUnsavedChanges) {
                // 这里可以调用一个同步的保存方法，如果需要的话
                // 但通常 `beforeunload` 中不允许异步操作
                console.log('[FloatingPanel] Page unloading with unsaved changes.');
            }
        });
    }

    /**
     * 更新 Eddy 标题
     * @param title 新标题
     */
    public updateEddyTitle(title: string): void {
        this.titleElement.textContent = title;
    }

    public updateEddyList(eddys: Eddy[], activeEddyId?: string): void {
        if (!this.dropdownMenu) return;

        // Sort eddies by `updatedAt` in descending order
        eddys.sort((a, b) => b.updatedAt - a.updatedAt);

        this.dropdownMenu.innerHTML = ''; // Clear previous items

        if (eddys.length === 0) {
            const noEddyItem = document.createElement('div');
            noEddyItem.textContent = 'No eddies for this domain';
            noEddyItem.className = 'dropdown-item disabled';
            this.dropdownMenu.appendChild(noEddyItem);
            return;
        }

        eddys.forEach(eddy => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.dataset.eddyId = eddy.id;

            // Highlight the active eddy
            if (eddy.id === activeEddyId) {
                item.classList.add('active');
            }

            const nameSpan = document.createElement('span');
            nameSpan.className = 'dropdown-item-name';
            nameSpan.textContent = eddy.name;
            item.appendChild(nameSpan);

            item.addEventListener('click', () => {
                if (this.eventCallback) {
                    this.eventCallback({ type: 'switch_eddy', data: { eddyId: eddy.id } });
                    this.isDropdownOpen = false;
                    this.dropdownMenu.style.display = 'none';
                    this.dropdownButton.classList.remove('open');
                }
            });

            this.dropdownMenu.appendChild(item);
        });
    }

    // 新增：更新 Eddy 启用/禁用开关的UI状态
    public updateEddyToggleState(isEnabled: boolean): void {
        if (this.eddyToggleSwitch) {
            if (isEnabled) {
                this.eddyToggleSwitch.classList.add('enabled');
                this.eddyToggleSwitch.title = 'Disable Eddy';
            } else {
                this.eddyToggleSwitch.classList.remove('enabled');
                this.eddyToggleSwitch.title = 'Enable Eddy';
            }
        }
    }
}