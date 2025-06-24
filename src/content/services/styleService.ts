import { StyleModification, ModificationMethod, Modification } from '../../types';
import { Eddy } from '../../types/eddy';

/**
 * 样式修改服务
 * 处理页面元素的样式修改
 */
export class StyleService {
    /**
     * 根据修改方法应用样式
     * @param modification 样式修改对象
     * @param groupId 可选的修改组ID
     * @returns 是否修改成功
     */
    static applyModification(
        modification: Pick<Modification, 'target' | 'property' | 'value' | 'method'>,
        groupId?: string
    ): boolean {
        try {
            switch (modification.method) {
                case 'style':
                    // 使用 style 标签方式
                    return this.modifyByCSSRule(modification, groupId);
                case 'DOM':
                    // 使用直接 DOM 方式
                    const elements = Array.from(document.querySelectorAll(modification.target)) as HTMLElement[];
                    return elements.every(element => this.modifyStyle(element, modification.property, modification.value));
                default:
                    console.warn('Unknown modification method:', modification.method);
                    return false;
            }
        } catch (error) {
            console.error('Modification failed:', error);
            return false;
        }
    }

    /**
     * 直接修改元素样式
     * @param element 目标元素
     * @param property 样式属性
     * @param value 样式值
     * @returns 是否修改成功
     */
    static modifyStyle(element: HTMLElement, property: string, value: string): boolean {
        try {
            // 保存原始样式
            if (property === 'length' || property === 'parentRule') {
                console.warn(`不能修改只读属性: ${property}`);
                return false;
            }
            
            // 应用新样式
            (element.style as any)[property] = value;
            
            // 返回修改是否成功
            return true;
        } catch (error) {
            console.error('Style modification failed:', error);
            return false;
        }
    }

    /**
     * 通过添加类名修改样式
     * @param element 目标元素
     * @param className 要添加的类名
     * @returns 是否修改成功
     */
    static modifyByClass(element: HTMLElement, className: string): boolean {
        try {
            // 验证输入
            if (!element || !className) {
                console.warn('Invalid element or class name');
                return false;
            }

            // 将单个类名转换为数组
            const classNames = Array.isArray(className) ? className : [className];

            // 过滤掉空字符串和已存在的类名
            const validClassNames = classNames.filter(name => 
                name && typeof name === 'string' && !element.classList.contains(name)
            );

            // 添加有效的类名
            validClassNames.forEach(name => element.classList.add(name));
            
            return true;
        } catch (error) {
            console.error('Class modification failed:', error);
            return false;
        }
    }

    /**
     * 通过CSS规则修改样式
     * @param modification 修改对象
     * @param groupId 可选的修改组ID
     * @returns 是否修改成功
     */
    static modifyByCSSRule(
        modification: Pick<Modification, 'target' | 'property' | 'value' | 'method'>,
        groupId?: string
    ): boolean {
        try {
            // 创建样式规则
            const styleText = `${modification.property}: ${modification.value}`;

            // 创建新的样式元素
            const styleElement = document.createElement('style');
            styleElement.textContent = `${modification.target} { ${styleText} }`;
            
            // 添加到文档中
            document.head.appendChild(styleElement);
            
            // 保存样式元素引用，用于后续撤销
            (window as any).__pageEditStyleElements = 
                (window as any).__pageEditStyleElements || [];
            (window as any).__pageEditStyleElements.push(styleElement);
            
            // 添加到分组管理
            if (groupId) {
                const groups = (window as any).__pageEditStyleElementGroups || [];
                const group = groups.find((g: any) => g.groupId === groupId);
                if (group) {
                    group.styleElements.push(styleElement);
                } else {
                    console.warn(`Group ${groupId} not found`);
                }
            }
            
            return true;
        } catch (error) {
            console.error('CSS rule modification failed:', error);
            return false;
        }
    }

    /**
     * 应用 Eddy 中的所有修改
     * @param eddy Eddy 对象
     * @returns 是否全部修改成功
     */
    static async applyEddy(eddy: Eddy): Promise<boolean> {
        try {
            let allSuccess = true;
            
            // 处理分组结构
            if (eddy.modificationGroups) {
                for (const group of eddy.modificationGroups) {
                    // 判断 group 是否有 id，有则使用现有的，没有则新建
                    let groupId: string;
                    if (group.id) {
                        groupId = group.id;
                        
                        // 手动创建修改组（不调用 startModificationGroup，避免生成新 ID）
                        (window as any).__pageEditStyleElementGroups = 
                            (window as any).__pageEditStyleElementGroups || [];
                        
                        (window as any).__pageEditStyleElementGroups.push({
                            groupId: groupId,
                            styleElements: [],
                            timestamp: group.timestamp,
                            userQuery: group.userQuery
                        });
                    } else {
                        // 如果没有 id，则新建一个
                        groupId = this.startModificationGroup(group.userQuery);
                        // 将新生成的 ID 赋值给当前的 group
                        group.id = groupId;
                    }
                    
                    for (const modification of group.modifications) {
                        const success = this.applyModification(modification, groupId);
                        if (!success) {
                            allSuccess = false;
                            console.warn(`Failed to apply modification: ${JSON.stringify(modification)}`);
                        }
                    }
                    
                    // 结束修改组
                    this.endModificationGroup();
                }
            }
            
            return allSuccess;
        } catch (error) {
            console.error('Failed to apply eddy:', error);
            return false;
        }
    }

    /**
     * 开始一个新的修改组
     * @param userQuery 用户输入的查询
     * @returns 修改组ID
     */
    static startModificationGroup(userQuery: string): string {
        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 初始化样式元素组
        (window as any).__pageEditStyleElementGroups = 
            (window as any).__pageEditStyleElementGroups || [];
        
        (window as any).__pageEditStyleElementGroups.push({
            groupId,
            styleElements: [],
            timestamp: Date.now(),
            userQuery
        });
        
        console.log('[StyleService] Started modification group:', groupId);
        return groupId;
    }

    /**
     * 结束当前修改组
     */
    static endModificationGroup(): void {
        console.log('[StyleService] Current modification group ended');
    }

    /**
     * 获取当前修改组
     * @param groupId 可选的组ID
     * @returns 当前修改组对象
     */
    private static getCurrentModificationGroup(groupId?: string): any {
        const groups = (window as any).__pageEditStyleElementGroups || [];
        if (groupId) {
            return groups.find((group: any) => group.groupId === groupId);
        }
        return groups[groups.length - 1]; // 返回最后一个组
    }

    /**
     * 撤销最后一次apply操作
     * @returns 是否撤销成功
     */
    static undoLastModificationGroup(): boolean {
        try {
            const groups = (window as any).__pageEditStyleElementGroups || [];
            if (groups.length === 0) {
                console.log('[StyleService] Undo stack is empty, nothing to undo');
                this.printStackStatus();
                return false;
            }

            const lastGroup = groups.pop();
            console.log('[StyleService] Undoing modification group:', lastGroup.groupId);

            // 从当前Eddy中获取对应的modifications
            const currentEddy = (window as any).__pageEditCurrentEddy;
            let modifications = [];
            
            if (currentEddy && currentEddy.modificationGroups) {
                const eddyGroup = currentEddy.modificationGroups.find((g: any) => g.id === lastGroup.groupId);
                
                if (eddyGroup && eddyGroup.modifications) {
                    modifications = eddyGroup.modifications;
                } else {
                    console.warn('[StyleService] No modifications found in eddy group');
                }
            } else {
                console.warn('[StyleService] No current eddy or modificationGroups');
            }

            // 创建完整的组信息，包含modifications
            const completeGroup = {
                ...lastGroup,
                modifications: modifications
            };
            
            console.log('[StyleService] Complete group to be added to redo stack:', completeGroup);

            // 将撤销的组添加到redo栈
            this.addToRedoStack(completeGroup);

            // 移除该组的所有样式元素
            lastGroup.styleElements.forEach((element: HTMLStyleElement) => {
                if (element && element.parentNode) {
                    element.remove();
                }
            });

            // 打印堆栈状态
            console.log('[StyleService] === UNDO OPERATION COMPLETED ===');
            this.printStackStatus();

            return true;
        } catch (error) {
            console.error('[StyleService] Error undoing modification group:', error);
            return false;
        }
    }

    /**
     * 重做最后一次撤销的操作
     * @returns 是否重做成功
     */
    static redoLastModificationGroup(): boolean {
        try {
            const redoStack = (window as any).__pageEditRedoStack || [];
            if (redoStack.length === 0) {
                console.log('[StyleService] Redo stack is empty, nothing to redo');
                this.printStackStatus();
                return false;
            }

            const redoGroup = redoStack.pop();
            console.log('[StyleService] Redoing modification group:', redoGroup.groupId);

            // 检查modifications是否存在
            if (!redoGroup.modifications) {
                console.error('[StyleService] Redo group missing modifications property:', redoGroup);
                return false;
            }

            if (!Array.isArray(redoGroup.modifications)) {
                console.error('[StyleService] Redo group modifications is not an array:', redoGroup.modifications);
                return false;
            }

            if (redoGroup.modifications.length === 0) {
                console.error('[StyleService] Redo group modifications array is empty');
                return false;
            }

            // 重新创建样式元素
            const newStyleElements = this.recreateStyleElements(redoGroup.modifications);
            
            // 重新应用该组的所有样式元素
            const groups = (window as any).__pageEditStyleElementGroups || [];
            const restoredGroup = {
                ...redoGroup,
                styleElements: newStyleElements
            };
            groups.push(restoredGroup);

            // 打印堆栈状态
            console.log('[StyleService] === REDO OPERATION COMPLETED ===');
            this.printStackStatus();

            return true;
        } catch (error) {
            console.error('[StyleService] Error redoing modification group:', error);
            return false;
        }
    }

    /**
     * 打印当前undo和redo堆栈的详细状态
     */
    public static printStackStatus(): void {
        const groups = (window as any).__pageEditStyleElementGroups || [];
        const redoStack = (window as any).__pageEditRedoStack || [];
        
        console.log('[StyleService] ===== STACK STATUS =====');
        console.log('[StyleService] UNDO STACK (modificationGroups):', groups);
        console.log('[StyleService] REDO STACK:', redoStack);
        console.log('[StyleService] ========================');
    }

    /**
     * 添加修改组到redo栈
     * @param group 要添加的修改组
     */
    private static addToRedoStack(group: any): void {
        (window as any).__pageEditRedoStack = (window as any).__pageEditRedoStack || [];
        (window as any).__pageEditRedoStack.push(group);
        console.log('[StyleService] Added to redo stack:', group.groupId);
    }

    /**
     * 重新创建样式元素
     * @param modifications 修改列表
     * @returns 重新创建的样式元素数组
     */
    private static recreateStyleElements(modifications: any[]): HTMLStyleElement[] {
        console.log('[StyleService] Recreating style elements for', modifications.length, 'modifications');
        console.log('[StyleService] Modifications data:', modifications);
        
        // 额外的安全检查
        if (!modifications || !Array.isArray(modifications)) {
            console.error('[StyleService] Invalid modifications parameter:', modifications);
            return [];
        }
        
        const styleElements = modifications.map((modification, index) => {
            // console.log(`[StyleService] Creating style element ${index + 1}:`, modification);
            
            // 检查modification对象是否完整
            if (!modification || !modification.target || !modification.property || !modification.value) {
                console.error(`[StyleService] Invalid modification at index ${index}:`, modification);
                return null;
            }
            
            const styleElement = document.createElement('style');
            const cssText = `${modification.target} { ${modification.property}: ${modification.value}; }`;
            styleElement.textContent = cssText;
            
            // console.log(`[StyleService] CSS text: ${cssText}`);
            
            document.head.appendChild(styleElement);
            // console.log(`[StyleService] Style element ${index + 1} added to DOM`);
            
            return styleElement;
        }).filter(element => element !== null); // 过滤掉null值
        
        console.log('[StyleService] Created', styleElements.length, 'style elements');
        return styleElements;
    }

    /**
     * 清空redo栈
     * 通常在用户进行新的apply操作时调用
     */
    static clearRedoStack(): void {
        (window as any).__pageEditRedoStack = [];
        console.log('[StyleService] Redo stack cleared');
    }

    /**
     * 获取redo栈状态
     * @returns redo栈是否为空
     */
    static isRedoStackEmpty(): boolean {
        const redoStack = (window as any).__pageEditRedoStack || [];
        return redoStack.length === 0;
    }

    /**
     * 获取undo栈状态
     * @returns undo栈是否为空
     */
    static isUndoStackEmpty(): boolean {
        const groups = (window as any).__pageEditStyleElementGroups || [];
        return groups.length === 0;
    }

    /**
     * 一键还原所有修改
     * 移除所有通过PageEdit添加的样式元素
     * @returns 是否还原成功
     */
    static resetAllModifications(): boolean {
        try {
            console.log('[StyleService] Resetting all modifications');
            
            // 使用分组结构
            const groups = (window as any).__pageEditStyleElementGroups || [];
            console.log('[StyleService] Found', groups.length, 'modification groups');
            
            // 移除所有组的样式元素
            groups.forEach((group: any) => {
                group.styleElements.forEach((element: HTMLStyleElement) => {
                    if (element && element.parentNode) {
                        element.remove();
                    }
                });
            });
            
            // 清空所有组
            (window as any).__pageEditStyleElementGroups = [];
            
            // 处理Shadow DOM中的样式元素（保持原有逻辑）
            const shadowRoots = document.querySelectorAll('*');
            let shadowStyleCount = 0;
            
            shadowRoots.forEach(element => {
                if (element.shadowRoot) {
                    const shadowStyleElements = (element.shadowRoot as any).__pageEditStyleElements || [];
                    shadowStyleCount += shadowStyleElements.length;
                    
                    shadowStyleElements.forEach((styleElement: HTMLStyleElement) => {
                        if (styleElement && styleElement.parentNode) {
                            styleElement.remove();
                        }
                    });
                    (element.shadowRoot as any).__pageEditStyleElements = [];
                }
            });
            
            console.log('[StyleService] Removed', shadowStyleCount, 'style elements from Shadow DOMs');
            console.log('[StyleService] All modifications reset successfully');
            
            console.log('[StyleService] === RESET OPERATION COMPLETED ===');
            this.printStackStatus();
            
            return true;
        } catch (error) {
            console.error('[StyleService] Reset all modifications failed:', error);
            return false;
        }
    }
} 