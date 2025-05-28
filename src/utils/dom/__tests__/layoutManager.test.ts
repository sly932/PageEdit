/**
 * LayoutManager 类的测试文件
 * 这个文件包含了所有布局操作方法的测试用例
 */
import { LayoutManager } from '../layoutManager';

describe('LayoutManager', () => {
    // 在每个测试用例之前运行
    beforeEach(() => {
        // 设置测试用的 HTML 结构
        document.body.innerHTML = `
            <div id="container">
                <div class="item">Item 1</div>
                <div class="item">Item 2</div>
                <div class="item">Item 3</div>
            </div>
        `;
    });

    // 在每个测试用例之后运行
    afterEach(() => {
        // 清理测试环境
        document.body.innerHTML = '';
    });

    // 测试修改布局功能
    describe('modifyLayout', () => {
        it('应该能修改元素的布局属性', () => {
            const result = LayoutManager.modifyLayout('#container', {
                display: 'flex',
                gap: '10px',
                padding: '20px'
            });

            expect(result).toBe(true);
            const element = document.querySelector('#container') as HTMLElement;
            expect(element.style.display).toBe('flex');
            expect(element.style.gap).toBe('10px');
            expect(element.style.padding).toBe('20px');
        });

        it('应该处理不存在的元素', () => {
            const result = LayoutManager.modifyLayout('#nonexistent', {
                display: 'flex'
            });

            expect(result).toBe(false);
        });
    });

    // 测试创建弹性布局容器
    describe('createFlexContainer', () => {
        it('应该能创建弹性布局容器', () => {
            const result = LayoutManager.createFlexContainer('#container', {
                direction: 'row',
                justify: 'center',
                align: 'center',
                gap: '10px'
            });

            expect(result).toBe(true);
            const element = document.querySelector('#container') as HTMLElement;
            expect(element.style.display).toBe('flex');
            expect(element.style.flexDirection).toBe('row');
            expect(element.style.justifyContent).toBe('center');
            expect(element.style.alignItems).toBe('center');
            expect(element.style.gap).toBe('10px');
        });

        it('应该使用默认值创建弹性布局容器', () => {
            const result = LayoutManager.createFlexContainer('#container');

            expect(result).toBe(true);
            const element = document.querySelector('#container') as HTMLElement;
            expect(element.style.display).toBe('flex');
            expect(element.style.flexDirection).toBe('row');
            expect(element.style.justifyContent).toBe('flex-start');
            expect(element.style.alignItems).toBe('stretch');
            expect(element.style.gap).toBe('0');
        });
    });

    // 测试创建网格布局容器
    describe('createGridContainer', () => {
        it('应该能创建网格布局容器', () => {
            const result = LayoutManager.createGridContainer('#container', {
                columns: 'repeat(3, 1fr)',
                rows: 'auto',
                gap: '10px'
            });

            expect(result).toBe(true);
            const element = document.querySelector('#container') as HTMLElement;
            expect(element.style.display).toBe('grid');
            expect(element.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
            expect(element.style.gridTemplateRows).toBe('auto');
            expect(element.style.gap).toBe('10px');
        });

        it('应该使用部分选项创建网格布局容器', () => {
            const result = LayoutManager.createGridContainer('#container', {
                columns: 'repeat(2, 1fr)'
            });

            expect(result).toBe(true);
            const element = document.querySelector('#container') as HTMLElement;
            expect(element.style.display).toBe('grid');
            expect(element.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
        });
    });

    // 测试设置元素尺寸
    describe('setElementSize', () => {
        it('应该能设置元素的尺寸', () => {
            const result = LayoutManager.setElementSize('#container', {
                width: '100%',
                height: '200px',
                minWidth: '300px',
                maxWidth: '800px'
            });

            expect(result).toBe(true);
            const element = document.querySelector('#container') as HTMLElement;
            expect(element.style.width).toBe('100%');
            expect(element.style.height).toBe('200px');
            expect(element.style.minWidth).toBe('300px');
            expect(element.style.maxWidth).toBe('800px');
        });
    });

    // 测试设置元素间距
    describe('setElementSpacing', () => {
        it('应该能设置元素的间距', () => {
            const result = LayoutManager.setElementSpacing('#container', {
                margin: '20px',
                padding: '10px',
                gap: '15px'
            });

            expect(result).toBe(true);
            const element = document.querySelector('#container') as HTMLElement;
            expect(element.style.margin).toBe('20px');
            expect(element.style.padding).toBe('10px');
            expect(element.style.gap).toBe('15px');
        });
    });

    // 测试设置元素定位
    describe('setElementPosition', () => {
        it('应该能设置元素的定位', () => {
            const result = LayoutManager.setElementPosition('#container', {
                position: 'relative',
                top: '10px',
                left: '20px',
                zIndex: '1'
            });

            expect(result).toBe(true);
            const element = document.querySelector('#container') as HTMLElement;
            expect(element.style.position).toBe('relative');
            expect(element.style.top).toBe('10px');
            expect(element.style.left).toBe('20px');
            expect(element.style.zIndex).toBe('1');
        });
    });
}); 