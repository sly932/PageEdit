import { StyleModification } from '../../types';

/**
 * 样式修改工具类
 * 提供多种方式修改元素样式
 */
export class StyleModifier {
  /**
   * 直接修改元素样式
   * @param modification 样式修改对象
   * @returns 是否修改成功
   */
  static modifyStyle(modification: StyleModification): boolean {
    try {
      // 保存原始样式
      const originalValue = modification.element.style[modification.property];
      
      // 应用新样式
      modification.element.style[modification.property] = modification.value;
      
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
      element.classList.add(className);
      return true;
    } catch (error) {
      console.error('Class modification failed:', error);
      return false;
    }
  }

  /**
   * 通过CSS规则修改样式
   * @param selector 选择器
   * @param styles 样式对象
   * @returns 是否修改成功
   */
  static modifyByCSSRule(selector: string, styles: Record<string, string>): boolean {
    try {
      // 创建样式规则
      const styleText = Object.entries(styles)
        .map(([property, value]) => `${property}: ${value}`)
        .join('; ');

      // 创建新的样式元素
      const styleElement = document.createElement('style');
      styleElement.textContent = `${selector} { ${styleText} }`;
      
      // 添加到文档中
      document.head.appendChild(styleElement);
      
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
   * @returns 是否恢复成功
   */
  static restoreStyle(
    element: HTMLElement,
    property: string,
    originalValue: string
  ): boolean {
    try {
      element.style[property] = originalValue;
      return true;
    } catch (error) {
      console.error('Style restoration failed:', error);
      return false;
    }
  }
} 