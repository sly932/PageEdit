/**
 * DOM 操作工具类
 * 这个类提供了在网页上查找和修改元素的方法
 */
export class DOMManager {
    /**
     * 查找页面上的元素
     * @param selector - CSS 选择器，例如 '#id' 或 '.class'
     * @returns 包含查找结果的对象，success 表示是否找到元素，element 是找到的元素
     */
    static findElement(selector: string): { success: boolean; element: Element | null } {
        try {
            const element = document.querySelector(selector);
            return {
                success: !!element,
                element
            };
        } catch (error) {
            console.error('查找元素时出错:', error);
            return { success: false, element: null };
        }
    }

    /**
     * 给元素应用样式
     * @param selector - CSS 选择器
     * @param property - CSS 属性名，例如 'backgroundColor'
     * @param value - CSS 属性值，例如 'red' 或 '16px'
     * @returns 包含操作结果的对象
     */
    static applyStyle(
        selector: string,
        property: string,
        value: string
    ): { success: boolean; element: HTMLElement | null } {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                return { success: false, element: null };
            }

            // 验证 CSS 属性是否有效
            if (!this.validateCSSProperty(property, value)) {
                console.warn(`无效的 CSS 属性: ${property}: ${value}`);
            }

            // 应用样式
            element.style[property as any] = value;
            return { success: true, element };
        } catch (error) {
            console.error('应用样式时出错:', error);
            return { success: false, element: null };
        }
    }

    /**
     * 撤销已应用的样式
     * @param selector - CSS 选择器
     * @param property - 要撤销的 CSS 属性名
     * @returns 包含操作结果的对象
     */
    static undoStyle(
        selector: string,
        property: string
    ): { success: boolean; element: HTMLElement | null } {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                return { success: false, element: null };
            }

            // 清除样式
            element.style[property as any] = '';
            return { success: true, element };
        } catch (error) {
            console.error('撤销样式时出错:', error);
            return { success: false, element: null };
        }
    }

    /**
     * 获取元素的计算样式
     * @param selector - CSS 选择器
     * @param property - 要获取的 CSS 属性名
     * @returns 包含样式值的对象
     */
    static getComputedStyle(
        selector: string,
        property: string
    ): { success: boolean; value: string | null; element: HTMLElement | null } {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                return { success: false, value: null, element: null };
            }

            // 获取计算后的样式值
            const computedStyle = window.getComputedStyle(element);
            const value = computedStyle.getPropertyValue(property);
            return { success: true, value, element };
        } catch (error) {
            console.error('获取计算样式时出错:', error);
            return { success: false, value: null, element: null };
        }
    }

    /**
     * 验证 CSS 属性是否有效
     * @param property - CSS 属性名
     * @param value - CSS 属性值
     * @returns 属性是否有效
     */
    static validateCSSProperty(property: string, value: string): boolean {
        // 检查 property 是否是 HTMLElement.style 的原生属性
        const testElem = document.createElement('div');
        if (!(property in testElem.style)) {
            return false;
        }
        // 进一步检查值是否被浏览器接受
        testElem.style[property as any] = value;
        return testElem.style[property as any] === value;
    }

    /**
     * 获取元素的所有样式
     * @param selector - CSS 选择器
     * @returns 包含所有样式的对象
     */
    static getAllStyles(
        selector: string
    ): { success: boolean; styles: Record<string, string> | null; element: HTMLElement | null } {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                return { success: false, styles: null, element: null };
            }

            // 获取所有计算后的样式
            const computedStyle = window.getComputedStyle(element);
            const styles: Record<string, string> = {};
            
            // 遍历所有样式属性
            for (let i = 0; i < computedStyle.length; i++) {
                const property = computedStyle[i];
                styles[property] = computedStyle.getPropertyValue(property);
            }

            return { success: true, styles, element };
        } catch (error) {
            console.error('获取所有样式时出错:', error);
            return { success: false, styles: null, element: null };
        }
    }
} 