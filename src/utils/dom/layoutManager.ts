/**
 * 布局管理工具类
 * 提供页面布局修改的功能
 */
export class LayoutManager {
    /**
     * 修改元素的布局属性
     * @param selector - CSS 选择器
     * @param layout - 布局属性对象
     * @returns 是否修改成功
     */
    static modifyLayout(
        selector: string,
        layout: {
            display?: string;
            position?: string;
            flexDirection?: string;
            justifyContent?: string;
            alignItems?: string;
            gap?: string;
            padding?: string;
            margin?: string;
            width?: string;
            height?: string;
        }
    ): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                console.error('Element not found:', selector);
                return false;
            }

            // 应用布局属性
            Object.entries(layout).forEach(([property, value]) => {
                element.style[property as any] = value;
            });

            return true;
        } catch (error) {
            console.error('Layout modification failed:', error);
            return false;
        }
    }

    /**
     * 创建弹性布局容器
     * @param selector - CSS 选择器
     * @param options - 弹性布局选项
     * @returns 是否创建成功
     */
    static createFlexContainer(
        selector: string,
        options: {
            direction?: 'row' | 'column';
            justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
            align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
            gap?: string;
        } = {}
    ): boolean {
        return this.modifyLayout(selector, {
            display: 'flex',
            flexDirection: options.direction || 'row',
            justifyContent: options.justify || 'flex-start',
            alignItems: options.align || 'stretch',
            gap: options.gap || '0'
        });
    }

    /**
     * 创建网格布局容器
     * @param selector - CSS 选择器
     * @param options - 网格布局选项
     * @returns 是否创建成功
     */
    static createGridContainer(
        selector: string,
        options: {
            columns?: string;
            rows?: string;
            gap?: string;
        } = {}
    ): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                console.error('Element not found:', selector);
                return false;
            }

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
            console.error('Grid container creation failed:', error);
            return false;
        }
    }

    /**
     * 设置元素尺寸
     * @param selector - CSS 选择器
     * @param options - 尺寸选项
     * @returns 是否设置成功
     */
    static setElementSize(
        selector: string,
        options: {
            width?: string;
            height?: string;
            minWidth?: string;
            minHeight?: string;
            maxWidth?: string;
            maxHeight?: string;
        }
    ): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                console.error('Element not found:', selector);
                return false;
            }

            // 应用尺寸属性
            Object.entries(options).forEach(([property, value]) => {
                element.style[property as any] = value;
            });

            return true;
        } catch (error) {
            console.error('Size modification failed:', error);
            return false;
        }
    }

    /**
     * 设置元素间距
     * @param selector - CSS 选择器
     * @param options - 间距选项
     * @returns 是否设置成功
     */
    static setElementSpacing(
        selector: string,
        options: {
            margin?: string;
            padding?: string;
            gap?: string;
        }
    ): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                console.error('Element not found:', selector);
                return false;
            }

            // 应用间距属性
            Object.entries(options).forEach(([property, value]) => {
                element.style[property as any] = value;
            });

            return true;
        } catch (error) {
            console.error('Spacing modification failed:', error);
            return false;
        }
    }

    /**
     * 设置元素定位
     * @param selector - CSS 选择器
     * @param options - 定位选项
     * @returns 是否设置成功
     */
    static setElementPosition(
        selector: string,
        options: {
            position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
            top?: string;
            right?: string;
            bottom?: string;
            left?: string;
            zIndex?: string;
        }
    ): boolean {
        try {
            const element = document.querySelector(selector) as HTMLElement;
            if (!element) {
                console.error('Element not found:', selector);
                return false;
            }

            // 应用定位属性
            Object.entries(options).forEach(([property, value]) => {
                element.style[property as any] = value;
            });

            return true;
        } catch (error) {
            console.error('Position modification failed:', error);
            return false;
        }
    }
} 