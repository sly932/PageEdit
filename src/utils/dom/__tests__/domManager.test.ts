/**
 * DOMManager 类的测试文件
 * 这个文件包含了所有 DOM 操作方法的测试用例
 */
import { DOMManager } from '../domManager';

describe('DOMManager', () => {
    // 在每个测试用例之前运行
    beforeEach(() => {
        // 设置测试用的 HTML 结构
        // 包含一个 id 为 test 的 div，里面有一个段落和一个按钮
        document.body.innerHTML = `
            <div id="test">
                <p class="text">测试文本</p>
                <button class="btn">按钮</button>
            </div>
        `;
    });

    // 在每个测试用例之后运行
    afterEach(() => {
        // 清理测试环境，删除所有添加的 HTML
        document.body.innerHTML = '';
    });

    // 测试查找元素的功能
    describe('findElement', () => {
        // 测试用例：查找存在的元素
        it('应该能找到存在的元素', () => {
            // 使用 id 选择器查找元素
            const result = DOMManager.findElement('#test');
            
            // 验证结果
            expect(result.success).toBe(true); // 应该成功找到元素
            expect(result.element).toBeTruthy(); // 元素应该存在
        });

        // 测试用例：查找不存在的元素
        it('应该找不到不存在的元素', () => {
            // 使用不存在的 id 选择器
            const result = DOMManager.findElement('#nonexistent');
            
            // 验证结果
            expect(result.success).toBe(false); // 应该找不到元素
            expect(result.element).toBeFalsy(); // 元素应该不存在
        });
    });

    // 测试应用样式的功能
    describe('applyStyle', () => {
        // 测试用例：应用有效的样式
        it('应该能应用有效的样式', () => {
            // 尝试将背景色改为红色
            const result = DOMManager.applyStyle('#test', 'backgroundColor', 'red');
            
            // 验证结果
            expect(result.success).toBe(true); // 应该成功应用样式
            expect(result.element).toBeTruthy(); // 元素应该存在
            expect((result.element as HTMLElement).style.backgroundColor).toBe('red'); // 背景色应该是红色
        });

        // 测试用例：处理无效的选择器
        it('应该处理无效的选择器', () => {
            // 尝试给不存在的元素应用样式
            const result = DOMManager.applyStyle('#nonexistent', 'backgroundColor', 'red');
            
            // 验证结果
            expect(result.success).toBe(false); // 应该失败
        });

        // 测试用例：处理无效的样式属性
        it('应该处理无效的样式属性', () => {
            // 尝试应用一个不存在的 CSS 属性
            const result = DOMManager.applyStyle('#test', 'invalidProperty', 'value');
            
            // 验证结果
            expect(result.success).toBe(true); // 浏览器会忽略无效属性，但不会报错
        });
    });

    // 测试撤销样式的功能
    describe('undoStyle', () => {
        // 测试用例：撤销已应用的样式
        it('应该能撤销已应用的样式', () => {
            // 先应用样式
            DOMManager.applyStyle('#test', 'backgroundColor', 'red');
            
            // 然后撤销样式
            const result = DOMManager.undoStyle('#test', 'backgroundColor');
            
            // 验证结果
            expect(result.success).toBe(true); // 应该成功撤销样式
            expect((result.element as HTMLElement).style.backgroundColor).toBe(''); // 背景色应该被清除
        });

        // 测试用例：处理不存在的元素
        it('应该处理不存在的元素', () => {
            // 尝试撤销不存在元素的样式
            const result = DOMManager.undoStyle('#nonexistent', 'backgroundColor');
            
            // 验证结果
            expect(result.success).toBe(false); // 应该失败
        });
    });

    // 测试获取计算样式的功能
    describe('getComputedStyle', () => {
        // 测试用例：获取计算后的样式
        it('应该能获取计算后的样式', () => {
            // 先应用样式
            DOMManager.applyStyle('#test', 'backgroundColor', 'red');
            
            // 然后获取计算后的样式
            const result = DOMManager.getComputedStyle('#test', 'backgroundColor');
            
            // 验证结果
            expect(result.success).toBe(true); // 应该成功获取样式
            expect(result.element).toBeTruthy(); // 元素应该存在
        });

        // 测试用例：处理不存在的元素
        it('应该处理不存在的元素', () => {
            // 尝试获取不存在元素的样式
            const result = DOMManager.getComputedStyle('#nonexistent', 'backgroundColor');
            
            // 验证结果
            expect(result.success).toBe(false); // 应该失败
        });
    });

    // 测试验证 CSS 属性的功能
    describe('validateCSSProperty', () => {
        // 测试用例：验证有效的 CSS 属性
        it('应该验证有效的 CSS 属性', () => {
            // 测试有效的背景色属性
            expect(DOMManager.validateCSSProperty('backgroundColor', 'red')).toBe(true);
            // 测试有效的字体大小属性
            expect(DOMManager.validateCSSProperty('fontSize', '16px')).toBe(true);
        });

        // 测试用例：拒绝无效的 CSS 属性
        it('应该拒绝无效的 CSS 属性', () => {
            // 测试无效的属性名
            expect(DOMManager.validateCSSProperty('invalidProperty', 'value')).toBe(false);
        });
    });

    // 测试获取所有样式的功能
    describe('getAllStyles', () => {
        // 测试用例：获取元素的所有样式
        it('应该能获取元素的所有样式', () => {
            // 获取元素的所有计算样式
            const result = DOMManager.getAllStyles('#test');
            
            // 验证结果
            expect(result.success).toBe(true); // 应该成功获取样式
            expect(result.element).toBeTruthy(); // 元素应该存在
        });

        // 测试用例：处理不存在的元素
        it('应该处理不存在的元素', () => {
            // 尝试获取不存在元素的所有样式
            const result = DOMManager.getAllStyles('#nonexistent');
            
            // 验证结果
            expect(result.success).toBe(false); // 应该失败
        });
    });
}); 