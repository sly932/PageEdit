/**
 * 脚本工具类
 * 提供与脚本处理相关的实用函数
 */

/**
 * 判断一个字符串是否是有效的IIFE（立即执行函数表达式）格式
 * @param code 要检查的代码字符串
 * @returns 如果是IIFE格式则返回true, 否则返回false
 */
export function isIIFE(code: string): boolean {
    const trimmedCode = code.trim();
    // 正则表达式，用于匹配 (function(...) { ... })(...) 或 (async function(...) { ... })(...) 等形式
    const iifeRegex = /^\s*\((async\s*)?function\s*\([^\)]*\)\s*\{[\s\S]*\}\)\s*\([^\)]*\)\s*;?\s*$/;
    return iifeRegex.test(trimmedCode);
}


/**
 * 确保给定的代码字符串被包裹在IIFE中。
 * 如果代码已经是IIFE格式，则直接返回；否则，将其包裹起来。
 * @param code 要处理的代码字符串
 * @returns 包裹在IIFE中的代码字符串
 */
export function ensureIIFE(code: string): string {
    if (isIIFE(code)) {
        return code;
    }
    // 使用换行符以增强可读性，并避免某些情况下JIT编译器可能出现的行尾分号问题
    return `(function() {\n${code}\n})();`;
} 