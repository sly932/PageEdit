import { ModificationMethod } from './index';

export interface Eddy {
    id: string;
    name: string;
    domain: string;
    modifications: Modification[];
    lastUsed: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface Modification {
    target: string;      // CSS 选择器
    property: string;    // 样式属性
    value: string;       // 样式值
    method: ModificationMethod;  // 修改方法
} 