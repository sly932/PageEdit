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
     * 恢复元素的原始样式
     * @param element 目标元素
     * @param property 样式属性
     * @param originalValue 原始值
     * @param method 修改方法
     * @returns 是否恢复成功
     */
    static restoreStyle(
        element: HTMLElement,
        property: string,
        originalValue: string,
        method: ModificationMethod
    ): boolean {
        try {
            if (method === 'style') {
                // 移除对应的 style 标签
                const styleElements = (window as any).__pageEditStyleElements || [];
                for (let i = styleElements.length - 1; i >= 0; i--) {
                    const styleElement = styleElements[i];
                    if (styleElement.textContent?.includes(property)) {
                        styleElement.remove();
                        styleElements.splice(i, 1);
                    }
                }
                return true;
            } else {
                // 直接恢复 DOM 样式
                if (property === 'length' || property === 'parentRule') {
                    console.warn(`不能恢复只读属性: ${property}`);
                    return false;
                }
                (element.style as any)[property] = originalValue;
                return true;
            }
        } catch (error) {
            console.error('Style restoration failed:', error);
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
                    // 开始新的修改组
                    const groupId = this.startModificationGroup(group.userQuery);
                    
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
                return false;
            }

            const lastGroup = groups.pop();
            console.log('[StyleService] Undoing modification group:', lastGroup.groupId);

            // 移除该组的所有样式元素
            lastGroup.styleElements.forEach((element: HTMLStyleElement) => {
                if (element && element.parentNode) {
                    element.remove();
                }
            });

            return true;
        } catch (error) {
            console.error('[StyleService] Error undoing modification group:', error);
            return false;
        }
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
            
            return true;
        } catch (error) {
            console.error('[StyleService] Reset all modifications failed:', error);
            return false;
        }
    }
} 