import { Modification, ModificationMethod } from './index';

// 样式元素快照
export interface StyleElementSnapshot {
    id: string; // 唯一标识符
    selector: string; // CSS选择器
    cssText: string; // 完整的CSS文本
    timestamp: number; // 创建时间
}

// 全局状态管理
export interface GlobalStyleState {
    currentElements: StyleElementSnapshot[]; // 当前应用的样式元素
    undoStack: StyleElementSnapshot[][]; // undo栈，每个元素是一个完整的快照
    redoStack: StyleElementSnapshot[][]; // redo栈，每个元素是一个完整的快照
}

export interface Eddy {
    id: string;
    name: string;
    domain: string;
    currentStyleElements: StyleElementSnapshot[]; // 当前应用的样式元素快照
    lastUsed: boolean;
    createdAt: number;
    updatedAt: number;
    draftContent?: string;
} 