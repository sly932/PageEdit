import { LayoutOptions } from '../../types';

/**
 * 布局服务
 * 处理页面元素的布局修改
 */
export class LayoutService {
    /**
     * 创建 Flex 容器
     * @param selector 选择器
     * @param options Flex 布局选项
     * @returns 是否创建成功
     */
    static createFlexContainer(selector: string, options: LayoutOptions): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) return false;

            element.style.display = 'flex';
            if (options.direction) {
                element.style.flexDirection = options.direction;
            }
            if (options.justify) {
                element.style.justifyContent = options.justify;
            }
            if (options.align) {
                element.style.alignItems = options.align;
            }
            if (options.gap) {
                element.style.gap = options.gap;
            }

            return true;
        } catch (error) {
            console.error('Failed to create flex container:', error);
            return false;
        }
    }

    /**
     * 创建 Grid 容器
     * @param selector 选择器
     * @param options Grid 布局选项
     * @returns 是否创建成功
     */
    static createGridContainer(selector: string, options: LayoutOptions): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) return false;

            element.style.display = 'grid';
            if (options.columns) {
                element.style.gridTemplateColumns = options.columns;
            }
            if (options.rows) {
                element.style.gridTemplateRows = options.rows;
            }
            if (options.gap) {
                element.style.gap = options.gap;
            }

            return true;
        } catch (error) {
            console.error('Failed to create grid container:', error);
            return false;
        }
    }

    /**
     * 设置元素尺寸
     * @param selector 选择器
     * @param options 尺寸选项
     * @returns 是否设置成功
     */
    static setElementSize(selector: string, options: {
        width?: string;
        height?: string;
        minWidth?: string;
        maxWidth?: string;
    }): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) return false;

            if (options.width) {
                element.style.width = options.width;
            }
            if (options.height) {
                element.style.height = options.height;
            }
            if (options.minWidth) {
                element.style.minWidth = options.minWidth;
            }
            if (options.maxWidth) {
                element.style.maxWidth = options.maxWidth;
            }

            return true;
        } catch (error) {
            console.error('Failed to set element size:', error);
            return false;
        }
    }

    /**
     * 设置元素间距
     * @param selector 选择器
     * @param options 间距选项
     * @returns 是否设置成功
     */
    static setElementSpacing(selector: string, options: {
        margin?: string;
        padding?: string;
        gap?: string;
    }): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) return false;

            if (options.margin) {
                element.style.margin = options.margin;
            }
            if (options.padding) {
                element.style.padding = options.padding;
            }
            if (options.gap) {
                element.style.gap = options.gap;
            }

            return true;
        } catch (error) {
            console.error('Failed to set element spacing:', error);
            return false;
        }
    }

    /**
     * 设置元素位置
     * @param selector 选择器
     * @param options 位置选项
     * @returns 是否设置成功
     */
    static setElementPosition(selector: string, options: {
        position: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
        top?: string;
        left?: string;
        zIndex?: string;
    }): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) return false;

            element.style.position = options.position;
            if (options.top) {
                element.style.top = options.top;
            }
            if (options.left) {
                element.style.left = options.left;
            }
            if (options.zIndex) {
                element.style.zIndex = options.zIndex;
            }

            return true;
        } catch (error) {
            console.error('Failed to set element position:', error);
            return false;
        }
    }
} 