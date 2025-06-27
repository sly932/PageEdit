import { Modification, ModificationMethod } from './index';

// 样式元素快照
export interface StyleElementSnapshot {
    id: string; // 唯一标识符
    selector: string; // CSS选择器
    cssText: string; // 完整的CSS文本
    timestamp: number; // 创建时间
}

// 新的Snapshot类，包含样式元素和用户查询
export interface Snapshot {
    id: string; // 唯一标识符
    elements: StyleElementSnapshot[]; // 样式元素快照数组
    userQuery?: string; // 对应的用户查询（可选）
    timestamp: number; // 创建时间
}

// 全局状态管理
export interface GlobalStyleState {
    currentSnapshot: Snapshot | null; // 当前快照
    undoStack: Snapshot[]; // undo栈，每个元素是一个完整的快照
    redoStack: Snapshot[]; // redo栈，每个元素是一个完整的快照
}

export interface Eddy {
    id: string;
    name: string;
    domain: string;
    currentStyleElements: StyleElementSnapshot[]; // 当前应用的样式元素快照（保持向后兼容）
    lastUsed: boolean;
    createdAt: number;
    updatedAt: number;
    draftContent?: string;
    
    // 新增：多版本管理字段
    currentSnapshot?: Snapshot | null; // 当前快照
    undoStack?: Snapshot[]; // 撤销栈
    redoStack?: Snapshot[]; // 重做栈
    isEnabled?: boolean; // 新增字段：此 Eddy 是否启用。设为可选以兼容旧数据。
} 