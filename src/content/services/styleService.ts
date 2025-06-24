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
     * @returns 是否修改成功
     */
    static applyModification(modification: Pick<Modification, 'target' | 'property' | 'value' | 'method'>): boolean {
        try {
            switch (modification.method) {
                case 'style':
                    // 使用 style 标签方式
                    return this.modifyByCSSRule(modification);
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
     * 在Shadow DOM中应用样式修改
     * @param modification 样式修改对象
     * @param shadowRoot Shadow DOM根节点
     * @returns 是否修改成功
     */
    static applyModificationInShadow(
        modification: Pick<Modification, 'target' | 'property' | 'value' | 'method'>,
        shadowRoot: ShadowRoot
    ): boolean {
        try {
            switch (modification.method) {
                case 'style':
                    // 使用 style 标签方式
                    return this.modifyByCSSRuleInShadow(modification, shadowRoot);
                case 'DOM':
                    // 使用直接 DOM 方式
                    const elements = Array.from(shadowRoot.querySelectorAll(modification.target)) as HTMLElement[];
                    return elements.every(element => this.modifyStyle(element, modification.property, modification.value));
                default:
                    console.warn('Unknown modification method:', modification.method);
                    return false;
            }
        } catch (error) {
            console.error('Shadow DOM modification failed:', error);
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
     * @returns 是否修改成功
     */
    static modifyByCSSRule(modification: Pick<Modification, 'target' | 'property' | 'value' | 'method'>): boolean {
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
            
            return true;
        } catch (error) {
            console.error('CSS rule modification failed:', error);
            return false;
        }
    }

    /**
     * 在Shadow DOM中通过CSS规则修改样式
     * @param modification 修改对象
     * @param shadowRoot Shadow DOM根节点
     * @returns 是否修改成功
     */
    static modifyByCSSRuleInShadow(
        modification: Pick<Modification, 'target' | 'property' | 'value' | 'method'>,
        shadowRoot: ShadowRoot
    ): boolean {
        try {
            // 创建样式规则
            const styleText = `${modification.property}: ${modification.value}`;

            // 创建新的样式元素
            const styleElement = document.createElement('style');
            styleElement.textContent = `${modification.target} { ${styleText} }`;

            // 添加到Shadow DOM中
            shadowRoot.appendChild(styleElement);

            // 保存样式元素引用，用于后续撤销
            const shadowStyleElements = (shadowRoot as any).__pageEditStyleElements =
                (shadowRoot as any).__pageEditStyleElements || [];
            shadowStyleElements.push(styleElement);

            return true;
        } catch (error) {
            console.error('Shadow DOM CSS rule modification failed:', error);
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
     * 在Shadow DOM中恢复元素的原始样式
     * @param shadowRoot Shadow DOM根节点
     * @param property 样式属性
     * @returns 是否恢复成功
     */
    static restoreStyleInShadow(
        shadowRoot: ShadowRoot,
        property?: string
    ): boolean {
        try {
            // 获取Shadow DOM中的样式元素
            const shadowStyleElements = (shadowRoot as any).__pageEditStyleElements || [];

            if (property) {
                // 移除包含特定属性的样式元素
                for (let i = shadowStyleElements.length - 1; i >= 0; i--) {
                    const styleElement = shadowStyleElements[i];
                    if (styleElement.textContent?.includes(property)) {
                        styleElement.remove();
                        shadowStyleElements.splice(i, 1);
                    }
                }
            } else if (shadowStyleElements.length > 0) {
                // 移除最后一个样式元素
                const lastStyleElement = shadowStyleElements.pop();
                lastStyleElement.remove();
            } else {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Shadow DOM style restoration failed:', error);
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
            
            for (const modification of eddy.modifications) {
                const success = this.applyModification(modification);
                if (!success) {
                    allSuccess = false;
                    console.warn(`Failed to apply modification: ${JSON.stringify(modification)}`);
                }
            }
            
            return allSuccess;
        } catch (error) {
            console.error('Failed to apply eddy:', error);
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
            
            // 移除主文档中的所有样式元素
            const styleElements = (window as any).__pageEditStyleElements || [];
            console.log('[StyleService] Found', styleElements.length, 'style elements in main document');
            
            styleElements.forEach((element: HTMLStyleElement) => {
                if (element && element.parentNode) {
                    element.remove();
                }
            });
            (window as any).__pageEditStyleElements = [];
            
            // 处理Shadow DOM中的样式元素
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