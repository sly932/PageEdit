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
      const property = modification.property;
      if (property === 'length' || property === 'parentRule') {
        console.warn(`不能修改只读属性: ${property}`);
        return false;
      }
      const originalValue = (modification.element.style as any)[property];
      
      // 应用新样式
      (modification.element.style as any)[property] = modification.value;
      
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
      if (property === 'length' || property === 'parentRule') {
        console.warn(`不能恢复只读属性: ${property}`);
        return false;
      }
      (element.style as any)[property] = originalValue;
      return true;
    } catch (error) {
      console.error('Style restoration failed:', error);
      return false;
    }
  }
} 