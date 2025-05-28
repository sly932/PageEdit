/**
 * 测试环境设置文件
 * 这个文件在运行测试之前会被自动加载，用于设置测试环境
 */

// 模拟 window.getComputedStyle 方法
Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
        getPropertyValue: (prop: string) => {
            return '';
        }
    })
}); 