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
    type: 'apply' | 'undo' | 'cancel' | 'reset';
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
    private resetButton!: HTMLButtonElement;
    private feedback!: HTMLDivElement;
    private shadowRoot: ShadowRoot;
    private eventCallback: PanelEventCallback | null = null;
    private isProcessing: boolean = false; // 添加处理状态标记
    
    // Eddy 相关属性
    private currentEddy: Eddy | null = null;
    private isNewEddy: boolean = false;
    private titleElement!: HTMLSpanElement;
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

    constructor(shadowRoot: ShadowRoot) {
        this.shadowRoot = shadowRoot;

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
        this.resetButton = panelElements.resetButton;
        this.feedback = panelElements.feedback;
        this.titleElement = panelElements.titleElement;
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
                onSwitchEddy: (eddy: Eddy) => this.setCurrentEddy(eddy),
                onDeleteEddy: () => this.deleteCurrentEddy()
            },
            this // 传递 FloatingPanel 的引用
        );
        
        // 初始化主题
        PanelTheme.initialize(this.panel);
        
        // 设置事件监听器
        this.setupEventListeners();
        
        console.log('[FloatingPanel] Panel created successfully');
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
        this.resetButton.addEventListener('click', () => this.handleReset());
        console.log('[FloatingPanel] Event listeners attached to buttons');

        // 添加 Tooltip 事件监听器
        PanelTooltip.addTooltipEvents(this.undoButton, 'UNDO');
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
            const fullTitle = this.currentEddy ? this.currentEddy.name : 'PageEdit';
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
        if (this.eventCallback) {
            this.eventCallback({ type: 'undo' });
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
        this.feedback.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            color: white;
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
            opacity: 1;
            transition: opacity 0.3s;
            z-index: 2147483647;
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
        `;

        // 自动隐藏反馈消息
        setTimeout(() => {
            this.feedback.style.opacity = '0';
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
        if (!PanelDragHandler.getHasBeenDragged()) {
            const safePosition = PanelDragHandler.calculateSafePosition();
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

    // Eddy 相关方法
    public setCurrentEddy(eddy: Eddy, isNew: boolean = false): void {
        console.log('[FloatingPanel] Setting current eddy:', eddy.name, '(ID:', eddy.id, ')', 'isNew:', isNew);
        
        this.currentEddy = eddy;
        this.isNewEddy = isNew;
        this.hasUnsavedChanges = false; // 重置未保存更改标记
        
        // 更新 PanelEvents 模块
        PanelEvents.setCurrentEddy(eddy, isNew);
        
        // 如果是编辑现有 Eddy，加载其修改内容和草稿
        if (!isNew && eddy.modificationGroups && eddy.modificationGroups.length > 0) {
            this.loadEddyModifications(eddy);
        }
        
        // 加载草稿内容（如果有的话）
        this.loadDraftContent(eddy);
        
        // 如果不是临时Eddy，将其设置为最近使用的Eddy（后台异步执行）
        if (!isNew && !eddy.id.startsWith('temp_')) {
            this.setAsLastUsedEddy(eddy).catch(error => {
                console.error('[FloatingPanel] Error setting eddy as last used:', error);
            });
        }
    }

    private loadEddyModifications(eddy: Eddy): void {
        // 这里可以根据需要加载 Eddy 的修改内容
        // 目前保持输入内容不变，后续可以扩展
        if (eddy.modificationGroups) {
            console.log('[FloatingPanel] Loaded eddy modifications:', eddy.modificationGroups.length, 'items');
        } else {
            console.log('[FloatingPanel] No modifications found in eddy');
        }
    }

    private loadDraftContent(eddy: Eddy): void {
        // 加载草稿内容
        if (eddy.draftContent && eddy.draftContent.trim()) {
            console.log('[FloatingPanel] Loading draft content for eddy:', eddy.name);
            this.input.value = eddy.draftContent;
            this.input.style.height = 'auto';
            this.input.style.height = `${this.input.scrollHeight}px`;
            this.updateButtonState();
        } else {
            // 如果没有草稿内容，清空输入框
            console.log('[FloatingPanel] No draft content found, clearing input');
            this.clearInput();
        }
    }

    private async createNewEddy(): Promise<void> {
        try {
            // 保存当前 Eddy 的草稿（如果有的话）
            if (this.currentEddy && !this.currentEddy.id.startsWith('temp_')) {
                await this.saveDraft();
            }
            
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
                modificationGroups: [],
                lastUsed: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            console.log('[FloatingPanel] New temporary eddy created:', newEddy.name, '(ID:', newEddy.id, ')');
            
            // 设置新的 Eddy
            this.setCurrentEddy(newEddy, true);
            
            // 新建 Eddy 时会自动清空输入框（通过 loadDraftContent 方法）
        } catch (error) {
            console.error('[FloatingPanel] Error creating new eddy:', error);
        }
    }

    private async saveCurrentEddy(): Promise<void> {
        console.log('[FloatingPanel] saveCurrentEddy called, hasUnsavedChanges:', this.hasUnsavedChanges, 'currentEddy:', this.currentEddy?.name);
        
        if (!this.currentEddy) {
            console.log('[FloatingPanel] No current eddy, skipping save');
            return;
        }
        
        // 检查是否有未保存的更改（包括标题修改）
        const newName = this.titleElement.textContent?.trim() || this.currentEddy.name;
        const hasTitleChanges = newName !== this.currentEddy.name;
        const hasContentChanges = this.hasUnsavedChanges;
        
        console.log('[FloatingPanel] Changes check - hasTitleChanges:', hasTitleChanges, 'hasContentChanges:', hasContentChanges, 'newName:', newName, 'currentName:', this.currentEddy.name);
        
        if (!hasTitleChanges && !hasContentChanges) {
            console.log('[FloatingPanel] No changes detected, skipping save');
            return;
        }
        
        try {
            // 更新 Eddy 名称（如果用户编辑了标题）
            if (hasTitleChanges) {
                console.log('[FloatingPanel] Updating eddy name from', this.currentEddy.name, 'to', newName);
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
                    { modificationGroups: this.currentEddy.modificationGroups || [] }
                );
                this.currentEddy = realEddy;
                this.isNewEddy = false;
                console.log('[FloatingPanel] Temporary eddy converted to real eddy:', realEddy.id);
                // 同步 UI 层 currentEddy
                PanelEvents.setCurrentEddy(this.currentEddy, false);
            } else {
                // 更新现有的Eddy
                await StorageService.updateEddy(this.currentEddy);
            }
            
            // 重置未保存更改标记
            this.hasUnsavedChanges = false;
            PanelEvents.setHasUnsavedChanges(false);
            
            console.log('[FloatingPanel] Current eddy saved successfully:', this.currentEddy.name, '(ID:', this.currentEddy.id, ')');
        } catch (error) {
            console.error('[FloatingPanel] Error saving current eddy:', error);
        }
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

    // 草稿保存相关方法
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
        if (!this.currentEddy || this.currentEddy.id.startsWith('temp_')) {
            // 如果是临时 Eddy，不保存草稿
            return;
        }
        
        const draftContent = this.input.value.trim();
        
        try {
            await StorageService.saveEddyDraft(this.currentEddy.id, draftContent);
            console.log('[FloatingPanel] Draft saved for eddy:', this.currentEddy.name);
        } catch (error) {
            console.error('[FloatingPanel] Error saving draft:', error);
        }
    }

    private handleDeleteEddy(): void {
        if (!this.currentEddy || this.currentEddy.id.startsWith('temp_')) {
            // 如果是临时Eddy，不需要删除
            return;
        }
        
        // 显示确认对话框
        if (confirm(`Are you sure you want to delete "${this.currentEddy.name}"? This action cannot be undone.`)) {
            this.deleteCurrentEddy();
        }
    }

    private async deleteCurrentEddy(): Promise<void> {
        if (!this.currentEddy || this.currentEddy.id.startsWith('temp_')) {
            return;
        }
        
        try {
            console.log('[FloatingPanel] Deleting eddy:', this.currentEddy.name, '(ID:', this.currentEddy.id, ')');
            const domain = this.currentEddy.domain;
            // 删除Eddy
            await StorageService.deleteEddy(this.currentEddy.id);

            // 获取当前域名下所有 Eddy
            const eddys = await StorageService.getEddysByDomain(domain);
            if (eddys.length > 0) {
                // 按修改时间倒序，选择最近的
                eddys.sort((a, b) => b.updatedAt - a.updatedAt);
                const latestEddy = eddys[0];
                // 设置为 lastUsed
                latestEddy.lastUsed = true;
                await StorageService.updateEddy(latestEddy);
                // 切换到该 Eddy
                this.setCurrentEddy(latestEddy, false);
                console.log('[FloatingPanel] Switched to latest eddy:', latestEddy.name, '(ID:', latestEddy.id, ')');
            } else {
                // 没有 Eddy，新建
                await this.createNewEddy();
                console.log('[FloatingPanel] No eddy left, created new eddy');
            }
            
            console.log('[FloatingPanel] Eddy deleted successfully');
        } catch (error) {
            console.error('[FloatingPanel] Error deleting eddy:', error);
            this.showFeedback('Failed to delete eddy', 'error');
        }
    }

    public setHasUnsavedChanges(hasChanges: boolean): void {
        this.hasUnsavedChanges = hasChanges;
        console.log('[FloatingPanel] hasUnsavedChanges set to:', hasChanges);
    }
}