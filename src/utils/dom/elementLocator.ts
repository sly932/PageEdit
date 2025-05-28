import { ElementLocation } from '../../types';

/**
 * 元素定位工具类
 * 提供多种方式定位页面元素
 */
export class ElementLocator {
  /**
   * 通过选择器定位元素
   * @param selector CSS选择器
   * @returns 定位结果
   */
  static findBySelector(selector: string): ElementLocation {
    const element = document.querySelector(selector);
    return {
      selector,
      method: 'selector',
      confidence: element ? 1 : 0
    };
  }

  /**
   * 通过坐标位置定位元素
   * @param x X坐标
   * @param y Y坐标
   * @returns 定位结果
   */
  static findByPosition(x: number, y: number): ElementLocation {
    const element = document.elementFromPoint(x, y);
    if (!element) {
      return {
        selector: '',
        method: 'position',
        confidence: 0
      };
    }

    // 生成唯一选择器
    const selector = this.generateUniqueSelector(element as HTMLElement);
    return {
      selector,
      method: 'position',
      confidence: 0.9
    };
  }

  /**
   * 通过文本内容定位元素
   * @param text 要查找的文本
   * @returns 定位结果
   */
  static findByText(text: string): ElementLocation {
    // 使用XPath查找包含指定文本的元素
    const xpath = `//*[contains(text(), '${text}')]`;
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );

    const element = result.singleNodeValue as HTMLElement;
    if (!element) {
      return {
        selector: '',
        method: 'text',
        confidence: 0
      };
    }

    const selector = this.generateUniqueSelector(element);
    return {
      selector,
      method: 'text',
      confidence: 0.8
    };
  }

  /**
   * 为元素生成唯一的选择器
   * @param element 目标元素
   * @returns 唯一选择器
   */
  private static generateUniqueSelector(element: HTMLElement): string {
    // 如果元素有ID，直接使用ID选择器
    if (element.id) {
      return `#${element.id}`;
    }

    // 否则，构建基于类名和标签名的选择器
    const classes = Array.from(element.classList).join('.');
    const tagName = element.tagName.toLowerCase();
    return classes ? `${tagName}.${classes}` : tagName;
  }
} 