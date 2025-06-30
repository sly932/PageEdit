
/**
 * 修改方法
 */
export type ModificationMethod = 'style' | 'script';

/**
 * 布局修改选项
 */
export interface LayoutOptions {
    // 弹性布局选项
    direction?: 'row' | 'column';
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    gap?: string;

    // 网格布局选项
    columns?: string;
    rows?: string;

    // 尺寸选项
    width?: string;
    height?: string;
    minWidth?: string;
    maxWidth?: string;

    // 间距选项
    margin?: string;
    padding?: string;

    // 定位选项
    top?: string;
    left?: string;
    zIndex?: string;
}

/**
 * 修改对象
 */
export interface Modification {
    id?: string;           // 可选，因为创建时可能还没有
    target: string;        // style：CSS 选择器
    property: string;      // style：样式属性
    value: string;         // style：样式值
    newTargets: string[]; // script：新建元素的名称数组
    code: string;         // script：JavaScript代码片段
    desc: string;         // script：描述
    blobUrl: string;     // script：脚本文件的blobUrl（可选）
    timestamp?: number;    // 可选，因为创建时可能还没有
    method: ModificationMethod;
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
    // 修改方法
    method: ModificationMethod;
    // 目标选择器
    target: string;
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

/**
 * 解析结果类型定义
 */
export interface ParseResult {
    // 修改列表
    modifications: Modification[];
    // 解析是否成功
    success: boolean;
    // 错误信息（如果有）
    error?: string;
} 