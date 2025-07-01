import { Message, Modification, UserInput, ElementLocation, ParseResult, ModificationMethod, StyleModification } from '../types';
import { Eddy } from '../types/eddy';
import { StyleService } from './services/styleService';
import { StorageService } from '../services/storageService';
import { QueryProcessor } from './QueryProcessor';
import { FloatingBall } from './floatingBall';
import { PanelEvent } from './floatingPanel';

console.log('[content] Content script loaded at', new Date().toISOString());

export class ContentManager {
    private currentApplyId: string | null = null;
    private currentEddy: Eddy | null = null;
    private domainEddys: Eddy[] = [];
    private floatingBall: FloatingBall | null = null;
    private originHtml: string = ''; // 记录网页原始HTML版本

    public setFloatingBall(ball: FloatingBall): void {
        this.floatingBall = ball;
    }

    /**
     * 获取网页原始HTML版本
     * @returns 原始HTML字符串
     */
    public getOriginHtml(): string {
        return this.originHtml;
    }

    /**
     * 检查是否已记录原始HTML
     * @returns 是否已记录
     */
    public hasOriginHtml(): boolean {
        return this.originHtml.length > 0;
    }

    constructor() {
        console.log('[content] ContentManager initialized');
        this.initializeTabId();
        this.initializePage();
        this.initializeMessageListener();
        this.initializeStorageListener();

        // 为 window 添加一个属性，方便从 devtools 访问
        (window as any).__CONTENT_MANAGER__ = this;
    }

    /**
     * 初始化tab ID，从background script获取当前标签页ID
     */
    private initializeTabId(): void {
        console.log('[content] Initializing tab ID');
        chrome.runtime.sendMessage({ type: 'GET_TAB_ID' }, (response) => {
            if (response && response.tabId) {
                (window as any).__pageEditTabId = response.tabId;
                console.log('[content] Tab ID initialized:', response.tabId);
            } else {
                console.error('[content] Failed to get tab ID:', response?.error || 'Unknown error');
            }
        });
    }

    /**
     * 初始化页面，应用保存的 Eddy
     */
    private async initializePage(): Promise<void> {
        console.log('[content] Initializing page content script');
        
        // 记录原始HTML版本
        this.originHtml = document.documentElement.outerHTML;
        console.log('[content] Original HTML captured, length:', this.originHtml.length);
        
        const { StorageService } = await import('../services/storageService');
        const domain = window.location.hostname;
        
        try {
            this.domainEddys = await StorageService.getEddysByDomain(domain);
            await this.loadLatestEddy(domain);

            // After initialization, update the panel's eddy list.
            // If a new eddy was created, the panel display is already updated in handleNewEddy.
            if (this.floatingBall) {
                if (this.currentEddy && !this.currentEddy.id.startsWith('temp_')) {
                    const isEnabled = this.currentEddy.isEnabled ?? true;
                    this.floatingBall.updatePanelDisplay(this.currentEddy.name, this.currentEddy.id, false, isEnabled);
                    this.floatingBall.updateViewOriginalButtonState(isEnabled);
                }
                this.floatingBall.updateEddyList(this.domainEddys, this.currentEddy?.id);
            }
        } catch (error) {
            console.error('[content] Error initializing page:', error);
            this.currentEddy = null;
        }
    }

    /**
     * 初始化消息监听器，监听来自background的信息（主要是配置同步，这部分还没有开发，后期会开发）
     */
    private initializeMessageListener(): void {
        console.log('[content] Initializing message listener');
        chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
            console.log('[content] Received message:', message, 'from:', sender);
            // 不再立即 sendResponse
            switch (message.type) {
                case 'MODIFY_PAGE':
                    console.log('[content] Handling MODIFY_PAGE message');
                    this.handleModifyPage(message)
                        .then(() => {
                            console.log('[content] Modification completed successfully');
                            sendResponse({ success: true });
                        })
                        .catch(error => {
                            console.error('[content] Error handling MODIFY_PAGE:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                    return true; // 保持消息通道开放
                default:
                    console.warn('[content] Unknown message type:', message.type);
                    sendResponse({ success: false, error: 'Unknown message type' });
                    return true;
            }
        });
    }

    private initializeStorageListener(): void {
        console.log('[ContentManager] Initializing storage listener');
        chrome.storage.onChanged.addListener((changes, namespace) => {
            // 我们只关心 'local' 存储区域的变化
            if (namespace !== 'local') {
                return;
            }
            
            // 检查我们关心的 'eddy_eddys' key 是否发生了变化
            const storageKey = 'eddy_eddys'; // 从 StorageService 获取或硬编码
            if (changes[storageKey]) {
                console.log('[ContentManager] Storage change detected for eddys. Refreshing state.');
                this.handleStorageChange();
            }
        });
    }

    private async handleStorageChange(): Promise<void> {
        console.log('[ContentManager] Handling storage change...');
        const { StorageService } = await import('../services/storageService');
        const domain = window.location.hostname;

        // 1. 获取最新的 Eddy 列表
        this.domainEddys = await StorageService.getEddysByDomain(domain);

        // 2. 检查当前 Eddy 是否仍然存在
        const currentId = this.currentEddy?.id;
        const currentEddyStillExists = currentId ? this.domainEddys.some(e => e.id === currentId) : false;

        if (currentEddyStillExists) {
            // 3a. 如果存在，更新 currentEddy 的引用为新列表中的对象
            console.log('[ContentManager] Current eddy still exists. Updating its reference.');
            this.currentEddy = this.domainEddys.find(e => e.id === currentId)!;
            // 注意：这里我们不重新应用样式，因为样式修改只应该由当前标签页发起
        } else {
            // 3b. 如果不存在，加载最新的 Eddy
            console.log('[ContentManager] Current eddy was deleted or is no longer available. Loading latest.');
            await this.loadLatestEddy(domain);
        }
        
        // 4. 更新 UI
        if (this.floatingBall && this.currentEddy) {
            const isEnabled = this.currentEddy.isEnabled ?? true;
            this.floatingBall.updatePanelDisplay(this.currentEddy.name, this.currentEddy.id, false, isEnabled);
            this.floatingBall.updateViewOriginalButtonState(isEnabled);
            this.floatingBall.updateEddyList(this.domainEddys, this.currentEddy?.id); // Update the dropdown list
            this.floatingBall.setHasUnsavedChanges(false);
        }
    }

    private async loadLatestEddy(domain: string): Promise<void> {
        let recentEddy = this.domainEddys.find(e => e.lastUsed);
        if (!recentEddy && this.domainEddys.length > 0) {
            // Fallback: sort by updatedAt if no eddy is explicitly marked as lastUsed
            this.domainEddys.sort((a, b) => b.updatedAt - a.updatedAt);
            recentEddy = this.domainEddys[0];
        }

        if (recentEddy) {
            console.log('[content] Loading most recent eddy:', recentEddy.name);
            this.currentEddy = recentEddy;
            
            // 恢复Eddy状态到StyleService
            const isEnabled = recentEddy.isEnabled ?? true;
            await StyleService.restoreFromEddy(recentEddy, { applyToDOM: isEnabled });

        } else {
            console.log('[content] No eddys found for this domain. Creating a new temporary one.');
            // If no eddies exist at all, create a new temporary one.
            await this.handleNewEddy(null);
        }

        // 4. 更新UI（例如，去掉未保存状态的提示）
        if (this.floatingBall && this.currentEddy) {
            const isEnabled = this.currentEddy.isEnabled ?? true;
            this.floatingBall.updatePanelDisplay(this.currentEddy.name, this.currentEddy.id, false, isEnabled);
            this.floatingBall.updateViewOriginalButtonState(isEnabled);
            this.floatingBall.updateEddyList(this.domainEddys, this.currentEddy?.id); // Update the dropdown list
            this.floatingBall.setHasUnsavedChanges(false);
        }
    }

    /**
     * 解析用户输入
     * @param text 用户输入的自然语言
     * @returns 解析结果
     */
    private async parseUserInput(text: string): Promise<ParseResult> {
        console.log('[content] Parsing user input:', text);
        try {
            // 获取当前页面的HTML内容
            const htmlContext = document.documentElement.outerHTML;
            // console.log('[content] HTML context:', htmlContext);

            // 记录开始时间
            const startTime = Date.now();
            // 使用 QueryProcessor 处理用户输入
            const result = await QueryProcessor.processInput(text, htmlContext, {
                minConfidence: 0.5 // 最小置信度
            });
            // 记录结束时间
            const endTime = Date.now();
            console.log('[content] Processed result:', result);
            console.log('[content] LLM Time taken:', (endTime - startTime) / 1000, 's');
            return result;
        } catch (error) {
            console.error('[content] Error parsing user input:', error);
            return {
                modifications: [],
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * 处理页面修改请求
     * @param message 修改消息
     * @param applyId 本次apply的唯一ID
     */
    private async handleModifyPage(message: Message, applyId?: string): Promise<void> {
        try {
            

            // 解析用户输入
            const parseResult = await this.parseUserInput(message.data.text);
            
            // 检查applyId是否仍然有效
            if (applyId && this.currentApplyId !== applyId) {
                console.log('[content] Apply已被取消，本次结果丢弃');
                return;
            }
            
            if (!parseResult.success || !parseResult.modifications || parseResult.modifications.length === 0) {
                throw new Error(parseResult.error || 'No valid modifications found');
            }


            // 应用所有修改
            for (const modification of parseResult.modifications) {
                try {
                    const success = await StyleService.applyModification(modification);
                    if (!success) {
                        throw new Error(`Failed to apply modification: ${modification.property}`);
                    }
                } catch (error) {
                    console.error('Failed to apply modification:', error);
                    throw error;
                }
            }

            // 保存快照，记录用户查询
            StyleService.updateSnapshot(message.data.text);

            // 保存当前 Eddy 的所有状态
            await this.saveCurrentEddyToStorage();

            console.log('[content] Modification completed successfully and saved.');
            StyleService.printStateInfo();

        } catch (error) {
            console.error('Failed to handle page modification:', error);
            throw error;
        } finally {
            // Ensure the button is reset after the operation is complete
            if (this.floatingBall) {
                this.floatingBall.resetApplyButton();
            }
        }
    }

    /**
     * 检查Eddy是否仍然有效
     * @param eddy Eddy对象
     * @returns 是否有效
     */
    private isEddyValid(eddy: any): boolean {
        try {
            // 检查Eddy是否仍然存在
            if (!eddy || !eddy.id) {
                return false;
            }

            if (!this.currentEddy) {
                return false;
            }

            if (this.currentEddy.id !== eddy.id) {
                console.log('[content] Eddy changed during request, current:', this.currentEddy.id, 'request:', eddy.id);
                return false;
            }

            return true;
        } catch (error) {
            console.error('[content] Error checking eddy validity:', error);
            return false;
        }
    }

    /**
     * 保存当前Eddy到存储
     */
    private async saveCurrentEddyToStorage(): Promise<void> {
        if (!this.currentEddy) {
            console.warn('[content] No current eddy to save');
            return;
        }

        // 1. 从 StyleService 同步最新状态
        this.currentEddy = StyleService.updateGlobalStateToEddy(this.currentEddy);
        
        const { StorageService } = await import('../services/storageService');

        // 2. 检查 Eddy 是否为临时对象
        if (this.currentEddy.id.startsWith('temp_')) {
            console.log('[ContentManager] Converting temporary eddy to real eddy.');
            
            // a. 根据 query 内容更新 eddy 名字
            const currentSnapshot = StyleService.getCurrentSnapshot();
            let newEddyName = this.currentEddy.name; // Default name

            if (currentSnapshot && currentSnapshot.userQuery) {
                const fullQuery = currentSnapshot.userQuery.trim();
                newEddyName = fullQuery.substring(0, 10);
                if (fullQuery.length > 10) {
                    newEddyName += '...';
                }
                console.log(`[ContentManager] New eddy name from query: "${newEddyName}"`);
            } else {
                console.log('[ContentManager] No userQuery found in snapshot, using default name:', newEddyName);
            }
            
            // b. 调用 createEddy 创建一个基础的真实 Eddy
            // StorageService 内部会处理 lastUsed 标志
            const realEddy = await StorageService.createEddy(
                newEddyName, 
                this.currentEddy.domain
            );
            
            // c. 将版本控制信息从临时 Eddy 复制到真实 Eddy
            realEddy.currentSnapshot = this.currentEddy.currentSnapshot;
            realEddy.undoStack = this.currentEddy.undoStack;
            realEddy.redoStack = this.currentEddy.redoStack;

            // d. 用返回的真实 Eddy 替换当前 Eddy
            this.currentEddy = realEddy; 
            
            // e. 更新 domainEddys 列表
            this.domainEddys.push(this.currentEddy);
            
            console.log('[ContentManager] Temporary eddy converted to real eddy with id:', realEddy.id);
            
            // f. 再次保存，以持久化版本控制信息
            await StorageService.updateEddy(this.currentEddy);
            
        } else {
            // 3. 如果不是临时对象，正常更新
            await StorageService.updateEddy(this.currentEddy);
        }

        // 4. 更新UI（例如，去掉未保存状态的提示）
        if (this.floatingBall && this.currentEddy) {
            const isEnabled = this.currentEddy.isEnabled ?? true;
            this.floatingBall.updatePanelDisplay(this.currentEddy.name, this.currentEddy.id, false, isEnabled);
            this.floatingBall.updateViewOriginalButtonState(isEnabled);
            this.floatingBall.updateEddyList(this.domainEddys, this.currentEddy?.id); // Update the dropdown list
            this.floatingBall.setHasUnsavedChanges(false);
        }
    }
        

    /**
     * 保存 Eddy 到存储
     * @param eddy Eddy 对象
     */
    private async saveEddyToStorage(eddy: any): Promise<void> {
        try {
            // 导入 StorageService
            const { StorageService } = await import('../services/storageService');
            
            // 更新 Eddy 的更新时间
            eddy.updatedAt = Date.now();
            
            // 保存到存储
            await StorageService.updateEddy(eddy);
            
            console.log('[content] Eddy saved to storage:', eddy.name, '(ID:', eddy.id, ')');
        } catch (error) {
            console.error('[content] Error saving eddy to storage:', error);
        }
    }

    /**
     * 处理应用修改事件
     * @param payload 事件负载，包含用户输入的文本
     */
    private async handleApplyModificationEvent(payload: { text: string }): Promise<void> {
        if (!this.currentEddy) {
            this.floatingBall?.showFeedback('No active Eddy. Cannot apply changes.', 'error');
            return;
        }

        // Auto-enable eddy if it's disabled
        await this.ensureEddyIsEnabled();

        const applyId = `apply_${Date.now()}`;
        this.currentApplyId = applyId;

        try {
            // 异步处理页面修改
            this.handleModifyPage({
                type: 'MODIFY_PAGE',
                data: { text: payload.text }
            }, applyId);
            
            // 更新UI - 这里可以添加一个明确的加载状态
            // if (this.floatingBall) {
            //     this.floatingBall.showLoadingState(); 
            // }

        } catch (error) {
            console.error('[content] Error handling apply event:', error);
            // if (this.floatingBall) {
            //     this.floatingBall.hideLoadingState();
            // }
        }
    }

    /**
     * 处理面板事件
     * @param event 面板事件
     */
    public async handlePanelEvent(event: PanelEvent): Promise<void> {
        console.log('[content] Handling panel event:', event);

        if (!this.floatingBall) {
            console.error('[content] FloatingBall not initialized for ContentManager');
            return;
        }

        try {
            switch (event.type) {
                case 'apply':
                    if (event.data?.text) {
                        // Note: We don't await this because handleModifyPage will reset the button itself
                        this.handleApplyModificationEvent(event.data as { text: string });
                    }
                    break;
                case 'undo':
                    await this.undoLastModification();
                    break;
                case 'redo':
                    await this.redoLastModification();
                    break;
                case 'reset':
                    await this.resetStateAndSaveToStorage();
                    break;
                case 'new_eddy':
                    await this.handleNewEddy(event.data);
                    break;
                case 'switch_eddy':
                    if (event.data?.eddyId) {
                        await this.handleSwitchEddy(event.data.eddyId);
                    }
                    break;
                case 'delete_eddy':
                    await this.handleDeleteEddy();
                    break;
                case 'title_update':
                    if (event.data?.newTitle) {
                        await this.handleTitleUpdate(event.data.newTitle);
                    }
                    break;
                case 'cancel':
                    this.currentApplyId = null; // 取消正在进行的 apply
                    break;
                case 'toggle_eddy_enabled':
                    await this.handleToggleEddyEnabled();
                    break;
                case 'view_original_style':
                    if (this.currentEddy?.isEnabled) {
                        StyleService.clearAllAppliedStyles();
                    }
                    break;
                case 'restore_eddy_style':
                    if (this.currentEddy?.isEnabled) {
                        await StyleService.reapplyAllAppliedStyles();
                    }
                    break;
                default:
                    console.warn(`[ContentManager] Unknown panel event type: ${(event as any).type}`);
            }
        } catch (error) {
            console.error('[content] Error handling panel event:', error);
            this.floatingBall.showFeedback('处理指令时出错', 'error');
        } finally {
            // The 'apply' button is reset by handleModifyPage, other buttons are handled here.
            if (event.type !== 'apply') {
                this.floatingBall.resetApplyButton();
                this.floatingBall.updateUndoRedoButtonStates();
            }
        }
    }

    /**
     * 撤销最后一次修改
     * @returns 是否成功撤销
     */
    private async undoLastModification(): Promise<boolean> {
        // Auto-enable eddy if it's disabled
        await this.ensureEddyIsEnabled();

        // 恢复原始样式
        // const parser = new DOMParser();
        // const originalDoc = parser.parseFromString(this.getOriginHtml(), 'text/html');
        // // 只替换内容部分，不替换整个html元素
        // document.documentElement.innerHTML = originalDoc.documentElement.innerHTML;

        const success = await StyleService.undo();
        if (success) {
            await this.saveCurrentEddyToStorage();
            
            this.updateInputWithSnapshotQuery();
            
            console.log('[content] === UNDO OPERATION SUCCESS ===');
        } else {
            console.log('[content] === UNDO OPERATION FAILED ===');
        }
        return success;
    }

    /**
     * 重做最后一次撤销的修改
     * @returns 是否成功重做
     */
    private async redoLastModification(): Promise<boolean> {
        // Auto-enable eddy if it's disabled
        await this.ensureEddyIsEnabled();

        const success = await StyleService.redo();
        if (success) {
            await this.saveCurrentEddyToStorage();
            
            this.updateInputWithSnapshotQuery();
            
            console.log('[content] === REDO OPERATION SUCCESS ===');
        } else {
            console.log('[content] === REDO OPERATION FAILED ===');
        }
        return success;
    }

    /**
     * 根据当前快照更新输入框内容
     */
    private updateInputWithSnapshotQuery(): void {
        try {
            if (!this.floatingBall) {
                console.warn('[content] FloatingBall not found, cannot update input');
                return;
            }

            const currentSnapshot = StyleService.getCurrentSnapshot();
            console.log('[content] Current snapshot for input update:', currentSnapshot);
            
            if (currentSnapshot && currentSnapshot.userQuery) {
                this.floatingBall.updateInputContent(currentSnapshot.userQuery);
                console.log('[content] Updated input with snapshot query:', currentSnapshot.userQuery);
            } else {
                this.floatingBall.updateInputContent('');
                console.log('[content] Cleared input - no user query in snapshot');
            }
        } catch (error) {
            console.error('[content] Error updating input with snapshot query:', error);
        }
    }

    private async handleNewEddy(data: any): Promise<void> {
        const tempEddy: Eddy = {
            id: `temp_${Date.now()}`,
            name: 'New Unsaved Eddy',
            domain: window.location.hostname,
            lastUsed: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            currentSnapshot: null,
            undoStack: [],
            redoStack: [],
            isEnabled: true
        };
        this.currentEddy = tempEddy;
        StyleService.clearState(); // Clear any existing styles from previous eddy

        if (this.floatingBall) {
            this.floatingBall.updatePanelDisplay(this.currentEddy.name, this.currentEddy.id, true, true);
            this.floatingBall.updateViewOriginalButtonState(true);
            this.floatingBall.clearInput();
            this.floatingBall.updateUndoRedoButtonStates();
        }
    }

    private async handleSwitchEddy(eddyId: string): Promise<void> {
        console.log(`[ContentManager] Switching to eddy: ${eddyId}`);
        const targetEddy = this.domainEddys.find(e => e.id === eddyId);

        if (!targetEddy) {
            console.error(`[ContentManager] Eddy with ID ${eddyId} not found.`);
            this.floatingBall?.showFeedback('Could not switch Eddy.', 'error');
            return;
        }

        this.currentEddy = targetEddy;
        
        // Always restore state, only apply to DOM if enabled.
        const isEnabled = this.currentEddy.isEnabled ?? true;
        await StyleService.restoreFromEddy(this.currentEddy, { applyToDOM: isEnabled });

        if (this.floatingBall) {
            this.floatingBall.updatePanelDisplay(this.currentEddy.name, this.currentEddy.id, false, isEnabled);
            this.floatingBall.updateViewOriginalButtonState(isEnabled);
            this.floatingBall.updateInputContent(this.currentEddy.draftContent || '');
            this.floatingBall.updateUndoRedoButtonStates();
        }
        
        // Set this eddy as the last used one
        this.currentEddy.lastUsed = true;
        await StorageService.updateEddy(this.currentEddy);

        console.log(`[ContentManager] Switched to ${this.currentEddy.name}`);
    }

    private async handleDeleteEddy(): Promise<void> {
        try {
            if (!this.currentEddy) {
                console.warn('[ContentManager] No eddy to delete.');
                return;
            }

            const eddyToDeleteId = this.currentEddy.id;
            console.log(`[ContentManager] Deleting eddy with ID: ${eddyToDeleteId}`);

            const { StorageService } = await import('../services/storageService');
            await StorageService.deleteEddy(eddyToDeleteId);

            // Update the local list of eddies
            this.domainEddys = this.domainEddys.filter(e => e.id !== eddyToDeleteId);
            
            // Clear the current eddy from the manager
            this.currentEddy = null;
            
            // Reset style service state completely
            this.resetState();

            // Update the UI with the new list
            if (this.floatingBall) {
                this.floatingBall.updateEddyList(this.domainEddys, undefined);
            }

            // Load the most recently used eddy for this domain, or create a new one
            const eddies = this.domainEddys; // Use the updated local list
            if (eddies.length > 0) {
                let nextEddy = eddies.find(e => e.lastUsed);
                if (!nextEddy) {
                    // Fallback: sort by updatedAt if no eddy is explicitly marked as lastUsed
                    eddies.sort((a, b) => b.updatedAt - a.updatedAt);
                    nextEddy = eddies[0];
                }

                if (nextEddy) {
                    await this.handleSwitchEddy(nextEddy.id);
                } else {
                    // This case should ideally not happen if eddies exist
                    await this.handleNewEddy(null);
                }
            } else {
                // If no eddies are left, create a new temporary one
                console.log('[ContentManager] No eddies left in this domain. Creating a new one.');
                await this.handleNewEddy(null);
            }

            // The call to handleSwitchEddy or handleNewEddy already handles resetting
            // and loading the correct state. No further reset is needed here.
            this.floatingBall?.showFeedback('delete success', 'success');
        } catch (error) {
            console.error('[ContentManager] Error deleting eddy:', error);
        }
    }

    /**
     * 重置状态，不保存到存储
     */
    private resetState(): void {
        // This reset does NOT save to storage.
        // It's for situations where we need a clean slate without persisting,
        // like after deleting an eddy.
        StyleService.clearState();
        if (this.floatingBall) {
            this.updateInputWithSnapshotQuery(); // This will clear the input
            this.floatingBall.updateUndoRedoButtonStates();
        }
    }

    private async resetStateAndSaveToStorage(): Promise<void> {
        try {
            // 1. Reset StyleService state by moving undo stack to redo stack
            StyleService.resetState();

            // 2. Save current Eddy to storage
            await this.saveCurrentEddyToStorage();

            // 3. Update input with snapshot query
            this.updateInputWithSnapshotQuery();

            // 4. Update UI
            if (this.floatingBall) {
                this.floatingBall.showFeedback('Reset eddy success', 'success');
            }
        } catch (error) {
            console.error('[ContentManager] Error resetting state:', error);
            if (this.floatingBall) {
                this.floatingBall.showFeedback('Error resetting eddy', 'error');
            }
        }
    }

    private async handleTitleUpdate(newTitle: string): Promise<void> {
        if (!this.currentEddy) {
            console.warn('[ContentManager] Cannot update title, no current Eddy.');
            return;
        }

        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle) {
            console.warn('[ContentManager] Title cannot be empty. Reverting.');
            // Revert the title in the UI
            if (this.floatingBall && this.currentEddy) {
                const isEnabled = this.currentEddy.isEnabled ?? true;
                this.floatingBall.updatePanelDisplay(this.currentEddy.name, this.currentEddy.id, false, isEnabled);
            }
            return;
        }

        if (this.currentEddy.name === trimmedTitle) {
            console.log('[ContentManager] Title is unchanged, skipping update.');
            return;
        }
        
        try {
            this.currentEddy.name = trimmedTitle;
            this.currentEddy.lastUsed = true; // Mark as most recently used
            await this.saveCurrentEddyToStorage();
            console.log(`[ContentManager] Eddy title updated to "${trimmedTitle}" and saved.`);
            
            if (this.floatingBall) {
                const isEnabled = this.currentEddy.isEnabled ?? true;
                this.floatingBall.updatePanelDisplay(this.currentEddy.name, this.currentEddy.id, false, isEnabled);
                this.floatingBall.updateViewOriginalButtonState(isEnabled);
                this.floatingBall.showFeedback('Title updated.', 'success');
            }
        } catch (error) {
            console.error('[ContentManager] Error updating title:', error);
            if (this.floatingBall) {
                this.floatingBall.showFeedback('Error updating title', 'error');
            }
        }
    }

    private async handleToggleEddyEnabled(): Promise<void> {
        if (!this.currentEddy) return;

        // Default to true if isEnabled is undefined, then toggle
        const currentState = this.currentEddy.isEnabled ?? true;
        const newState = !currentState;
        this.currentEddy.isEnabled = newState;

        console.log(`[ContentManager] Toggling Eddy "${this.currentEddy.name}" to ${newState ? 'ENABLED' : 'DISABLED'}`);

        if (newState) {
            await StyleService.reapplyAllAppliedStyles();
        } else {
            StyleService.clearAllStyleAndScriptFromDOM();
        }

        this.floatingBall?.updateEddyToggleState(newState);
        this.floatingBall?.updateViewOriginalButtonState(newState);
        await this.saveCurrentEddyToStorage();
    }

    /**
     * Ensures the current Eddy is enabled. If not, it enables it,
     * updates the UI, and saves the state.
     */
    private async ensureEddyIsEnabled(): Promise<void> {
        if (this.currentEddy && (this.currentEddy.isEnabled === false)) {
            console.log('[ContentManager] Auto-enabling eddy due to user action.');
            this.currentEddy.isEnabled = true;
            this.floatingBall?.updateEddyToggleState(true);
            this.floatingBall?.updateViewOriginalButtonState(true);
            // We don't need to re-apply styles here, as the calling function (apply, undo, redo) will do that.
            await this.saveCurrentEddyToStorage();
        }
    }
}

// --- Initialization ---

// 单例模式，确保只有一个 ContentManager 和 FloatingBall 实例
class Main {
    private static instance: Main;
    private contentManager: ContentManager;
    private floatingBall: FloatingBall;

    private constructor() {
        console.log('[content] Initializing PageEdit main instance...');
        this.contentManager = new ContentManager();
        this.floatingBall = new FloatingBall();

        // 注入 FloatingBall 实例到 ContentManager
        this.contentManager.setFloatingBall(this.floatingBall);

        // 绑定事件回调，将 Panel 的事件转发给 ContentManager
        this.floatingBall.setPanelEventCallback(
            this.contentManager.handlePanelEvent.bind(this.contentManager)
        );
        console.log('[content] Panel event callback set.');
    }

    public static getInstance(): Main {
        if (!Main.instance) {
            Main.instance = new Main();
        }
        return Main.instance;
    }
}

// 确保在 DOM 加载后执行，但不需要等待所有资源（如图片）
function onDomReady() {
    console.log('[content] DOM ready, initializing main components.');
    Main.getInstance();
}

// 使用 DOMContentLoaded 替代 load 事件，可以更快地初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDomReady);
} else {
    onDomReady();
} 