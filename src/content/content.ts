import { Message, Modification, UserInput, ElementLocation, ParseResult, ModificationMethod, StyleModification } from '../types';
import { StyleService } from './services/styleService';
import { StorageService } from '../services/storageService';
import { NLPProcessor } from '../utils/nlp/nlpProcessor';
import { FloatingBall } from './floatingBall';
import { PanelEvent } from './floatingPanel';

console.log('[content] Content script loaded at', new Date().toISOString());

let floatingBall: FloatingBall | null = null;

/**
 * Content Script的主要类
 * 处理页面修改和与popup的通信
 */
export class ContentManager {
    private currentApplyId: string | null = null;
    constructor() {
        console.log('[content] ContentManager initialized');
        // 初始化消息监听
        this.initializeMessageListener();
        // 延迟初始化页面，等待FloatingBall初始化完成
        setTimeout(() => this.initializePage(), 100);
    }

    /**
     * 初始化页面，应用保存的 Eddy
     */
    private async initializePage(): Promise<void> {
        try {
            const domain = window.location.hostname;
            console.log('[content] Initializing page for domain:', domain);
            
            // 检查FloatingBall是否已经初始化了currentEddy
            const floatingBall = (window as any).__pageEditFloatingBall;
            if (floatingBall && floatingBall.panel && floatingBall.panel.currentEddy) {
                console.log('[content] FloatingBall already has currentEddy, skipping initialization');
                return;
            }
            
            // 获取最近使用的 Eddy
            const lastUsedEddy = await StorageService.getLastUsedEddy(domain);
            
            if (lastUsedEddy) {
                console.log('[content] Found last used Eddy:', lastUsedEddy.name);
                // 应用 Eddy
                await StyleService.applyEddy(lastUsedEddy);
                console.log('[content] Successfully applied Eddy:', lastUsedEddy.name);
            } else {
                console.log('[content] No saved Eddy found for domain:', domain);
            }
        } catch (error) {
            console.error('[content] Error initializing page:', error);
        }
    }

    /**
     * 初始化消息监听器
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
            // 使用 NLPProcessor 处理用户输入
            const result = await NLPProcessor.processInput(text, htmlContext, {
                preferLLM: true,  // 优先使用 LLM
                minConfidence: 0.6 // 最小置信度
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
                    const success = StyleService.applyModification(modification);
                    if (!success) {
                        throw new Error(`Failed to apply modification: ${modification.property}`);
                    }
                } catch (error) {
                    console.error('Failed to apply modification:', error);
                    throw error;
                }
            }

            // 保存快照
            StyleService.updateSnapshot(message.data.text);

            // 更新当前Eddy的样式元素
            await this.updateCurrentEddyStyleElements();

            console.log('[content] Modification completed successfully');
            StyleService.printStateInfo();

        } catch (error) {
            console.error('Failed to handle page modification:', error);
            throw error;
        }
    }

    /**
     * 更新当前Eddy的样式元素
     */
    private async updateCurrentEddyStyleElements(): Promise<void> {
        try {
            const floatingBall = (window as any).__pageEditFloatingBall;
            if (!floatingBall || !floatingBall.panel || !floatingBall.panel.currentEddy) {
                console.warn('[content] No current eddy found, skipping style elements update');
                return;
            }

            const currentEddy = floatingBall.panel.currentEddy;
            
            // 使用StyleService.updateGlobalStateToEddy保存完整的GlobalState
            const updatedEddy = StyleService.updateGlobalStateToEddy(currentEddy);
            floatingBall.panel.currentEddy = updatedEddy;
            
            // 标记有未保存更改
            if (floatingBall.panel.setHasUnsavedChanges) {
                floatingBall.panel.setHasUnsavedChanges(true);
            }

            // 如果是临时Eddy，立即保存为真实Eddy
            if (updatedEddy.id.startsWith('temp_')) {
                console.log('[content] Converting temp eddy to real eddy during apply');
                const { StorageService } = await import('../services/storageService');
                
                // 根据query内容更新eddy名字（保留20个字符）
                const currentSnapshot = StyleService.getCurrentSnapshot();
                let newEddyName = updatedEddy.name; // 默认使用当前名字
                
                console.log('[content] Current snapshot:', currentSnapshot);
                console.log('[content] Current snapshot userQuery:', currentSnapshot?.userQuery);
                
                if (currentSnapshot && currentSnapshot.userQuery) {
                    // 使用query内容作为名字，保留20个字符
                    newEddyName = currentSnapshot.userQuery.trim().substring(0, 20);
                    if (newEddyName.length === 20) {
                        newEddyName += '...'; // 如果截断了，添加省略号
                    }
                    console.log('[content] Updated eddy name from query:', newEddyName);
                } else {
                    console.log('[content] No userQuery found in snapshot, keeping original name:', newEddyName);
                }
                
                // 创建真实的Eddy
                const realEddy = await StorageService.createEddy(
                    newEddyName,
                    updatedEddy.domain,
                    { currentStyleElements: updatedEddy.currentStyleElements }
                );
                
                // 复制多版本管理字段到真实Eddy
                realEddy.currentSnapshot = updatedEddy.currentSnapshot;
                realEddy.undoStack = updatedEddy.undoStack;
                realEddy.redoStack = updatedEddy.redoStack;
                
                // 更新FloatingPanel中的currentEddy引用
                floatingBall.panel.currentEddy = realEddy;
                floatingBall.panel.isNewEddy = false;
                
                // 同步更新PanelEvents
                if (floatingBall.panel.setCurrentEddy) {
                    floatingBall.panel.setCurrentEddy(realEddy, false);
                }
                
                console.log('[content] Temp eddy converted to real eddy:', realEddy.id, 'with name:', newEddyName);
            } else {
                // 更新现有的Eddy
                await this.saveEddyToStorage(updatedEddy);
            }

            console.log('[content] Updated eddy with GlobalState:', {
                elementsCount: updatedEddy.currentStyleElements.length,
                undoStackSize: updatedEddy.undoStack?.length || 0,
                redoStackSize: updatedEddy.redoStack?.length || 0
            });
            
            // 更新undo/redo按钮状态
            if (floatingBall) {
                floatingBall.updateUndoRedoButtonStates();
            }
        } catch (error) {
            console.error('[content] Error updating eddy style elements:', error);
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

            // 检查Eddy是否仍然是当前Eddy
            const floatingBall = (window as any).__pageEditFloatingBall;
            if (!floatingBall || !floatingBall.panel || !floatingBall.panel.currentEddy) {
                return false;
            }

            const currentEddy = floatingBall.panel.currentEddy;
            if (currentEddy.id !== eddy.id) {
                console.log('[content] Eddy changed during request, current:', currentEddy.id, 'request:', eddy.id);
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
        const floatingBall = (window as any).__pageEditFloatingBall;
        if (!floatingBall || !floatingBall.panel) {
            console.warn('[content] FloatingBall not found, cannot save current eddy');
            return;
        }
        await floatingBall.panel.saveCurrentEddy();
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
     * 处理面板事件
     * @param event 面板事件
     */
    public async handlePanelEvent(event: PanelEvent): Promise<void> {
        console.log('[content] Handling panel event:', event);

        if (!floatingBall) {
            console.error('[content] FloatingBall not initialized');
            return;
        }

        try {
            switch (event.type) {
                case 'apply':
                    if (event.data?.text) {
                        // 生成唯一applyId
                        const applyId = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                        this.currentApplyId = applyId;
                        // 创建一个类似于消息的对象
                        const message: Message = {
                            type: 'MODIFY_PAGE',
                            data: { text: event.data.text }
                        };
                        // 处理修改，传递applyId
                        await this.handleModifyPage(message, applyId);
                        if (applyId && this.currentApplyId == applyId) {
                            // 显示成功反馈
                            floatingBall.showFeedback('apply success', 'success');
                        }
                    }
                    break;
                case 'undo':
                    // 撤销最后一次修改
                    const success = await this.undoLastModification();
                    if (success) {
                        floatingBall.showFeedback('undo success', 'success');
                    } else {
                        floatingBall.showFeedback('undo failed', 'error');
                    }
                    break;
                case 'redo':
                    // 重做最后一次撤销的修改
                    const redoSuccess = await this.redoLastModification();
                    if (redoSuccess) {
                        floatingBall.showFeedback('redo success', 'success');
                    } else {
                        floatingBall.showFeedback('redo failed', 'error');
                    }
                    break;
                case 'reset':
                    // 一键还原所有修改
                    const resetSuccess = StyleService.clearAllStyleElements();
                    if (resetSuccess) {
                        // 获取当前Eddy并保存GlobalState
                        const floatingBall = (window as any).__pageEditFloatingBall;
                        if (floatingBall && floatingBall.panel && floatingBall.panel.currentEddy) {
                            const updatedEddy = StyleService.updateGlobalStateToEddy(floatingBall.panel.currentEddy);
                            floatingBall.panel.currentEddy = updatedEddy;
                            
                            // 保存到存储
                            await this.saveCurrentEddyToStorage();
                            console.log('[content] Saved GlobalState to eddy after reset');
                        }
                        // 更新输入框内容为对应的用户查询
                        this.updateInputWithSnapshotQuery();
                        
                        // 更新undo/redo按钮状态
                        floatingBall.updateUndoRedoButtonStates();
                        
                        floatingBall.showFeedback('reset eddy success', 'success');
                    } else {
                        floatingBall.showFeedback('reset eddy failed', 'error');
                    }
                    break;
                case 'cancel':
                    // 取消当前apply
                    this.currentApplyId = null;
                    break;
                default:
                    console.warn('[content] Unknown panel event type:', event.type);
            }
        } catch (error) {
            console.error('[content] Error handling panel event:', error);
            floatingBall.showFeedback('处理指令时出错', 'error');
        } finally {
            // 重置按钮状态
            floatingBall.resetApplyButton();
            // 更新undo/redo按钮状态
            floatingBall.updateUndoRedoButtonStates();
        }
    }

    /**
     * 撤销最后一次修改
     * @returns 是否成功撤销
     */
    private async undoLastModification(): Promise<boolean> {
        try {
            console.log('[content] === UNDO OPERATION START ===');
            
            const success = StyleService.undo();
            if (success) {
                // 获取当前Eddy并保存GlobalState
                const floatingBall = (window as any).__pageEditFloatingBall;
                if (floatingBall && floatingBall.panel && floatingBall.panel.currentEddy) {
                    const updatedEddy = StyleService.updateGlobalStateToEddy(floatingBall.panel.currentEddy);
                    floatingBall.panel.currentEddy = updatedEddy;
                    
                    await this.saveCurrentEddyToStorage();
                    console.log('[content] Saved GlobalState to eddy after undo');
                }
                
                // 更新输入框内容为对应的用户查询
                this.updateInputWithSnapshotQuery();
                
                // 更新undo/redo按钮状态
                if (floatingBall) {
                    floatingBall.updateUndoRedoButtonStates();
                }
                
                console.log('[content] === UNDO OPERATION SUCCESS ===');
            } else {
                console.log('[content] === UNDO OPERATION FAILED ===');
            }
            return success;
        } catch (error) {
            console.error('[content] Error undoing modification:', error);
            return false;
        }
    }

    /**
     * 重做最后一次撤销的修改
     * @returns 是否成功重做
     */
    private async redoLastModification(): Promise<boolean> {
        try {
            console.log('[content] === REDO OPERATION START ===');
            
            const success = StyleService.redo();
            if (success) {
                // 获取当前Eddy并保存GlobalState
                const floatingBall = (window as any).__pageEditFloatingBall;
                if (floatingBall && floatingBall.panel && floatingBall.panel.currentEddy) {
                    const updatedEddy = StyleService.updateGlobalStateToEddy(floatingBall.panel.currentEddy);
                    floatingBall.panel.currentEddy = updatedEddy;
                    
                    // 保存到存储
                    await this.saveCurrentEddyToStorage();  
                    console.log('[content] Saved GlobalState to eddy after redo');
                }
                
                // 更新输入框内容为对应的用户查询
                this.updateInputWithSnapshotQuery();
                
                // 更新undo/redo按钮状态
                if (floatingBall) {
                    floatingBall.updateUndoRedoButtonStates();
                }
                
                console.log('[content] === REDO OPERATION SUCCESS ===');
            } else {
                console.log('[content] === REDO OPERATION FAILED ===');
            }
            return success;
        } catch (error) {
            console.error('[content] Error redoing modification:', error);
            return false;
        }
    }

    /**
     * 根据当前快照更新输入框内容
     */
    private updateInputWithSnapshotQuery(): void {
        try {
            const floatingBall = (window as any).__pageEditFloatingBall;
            if (!floatingBall || !floatingBall.panel) {
                console.warn('[content] FloatingBall not found, cannot update input');
                return;
            }

            const currentSnapshot = StyleService.getCurrentSnapshot();
            console.log('[content] Current snapshot for input update:', currentSnapshot);
            
            if (currentSnapshot && currentSnapshot.userQuery) {
                // 更新输入框为对应的用户查询
                floatingBall.panel.updateInputContent(currentSnapshot.userQuery);
                console.log('[content] Updated input with snapshot query:', currentSnapshot.userQuery);
            } else {
                // 如果没有用户查询，清空输入框
                floatingBall.panel.updateInputContent('');
                console.log('[content] Cleared input - no user query in snapshot');
            }
        } catch (error) {
            console.error('[content] Error updating input with snapshot query:', error);
        }
    }
}

// 初始化悬浮球
function initializeFloatingBall() {
    if (!floatingBall) {
        const contentManager = new ContentManager();
        floatingBall = new FloatingBall();

        // 设置面板事件回调
        floatingBall.setPanelEventCallback(
            contentManager.handlePanelEvent.bind(contentManager)
        );
    }
}

// 页面加载完成后初始化悬浮球
window.addEventListener('load', () => {
    console.log('[content] Page loaded, initializing floating ball');
    initializeFloatingBall();
});

// 初始化ContentManager
new ContentManager(); 