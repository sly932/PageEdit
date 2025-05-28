/**
 * 修改操作的类型定义
 */
export interface Modification {
  // 修改的唯一标识
  id: string;
  // 修改的类型（样式、布局等）
  type: 'style' | 'layout';
  // 目标元素的选择器
  target: string;
  // 要修改的属性
  property: string;
  // 新的值
  value: string;
  // 修改时间戳
  timestamp: number;
}

/**
 * 用户输入的类型定义
 */
export interface UserInput {
  // 用户输入的自然语言
  text: string;
  // 输入时间戳
  timestamp: number;
}

/**
 * 消息类型定义
 */
export interface Message {
  // 消息类型
  type: 'MODIFY_PAGE' | 'UNDO' | 'REDO' | 'GET_HISTORY';
  // 消息数据
  data?: any;
}

/**
 * 样式修改的类型定义
 */
export interface StyleModification {
  // 目标元素
  element: HTMLElement;
  // 要修改的样式属性
  property: string;
  // 新的样式值
  value: string;
}

/**
 * 元素定位的类型定义
 */
export interface ElementLocation {
  // 元素选择器
  selector: string;
  // 定位方式（选择器、位置、文本等）
  method: 'selector' | 'position' | 'text';
  // 定位的置信度（0-1）
  confidence: number;
} 