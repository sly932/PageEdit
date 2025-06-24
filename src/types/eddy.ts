import { Modification, ModificationMethod } from './index';

export interface ModificationGroup {
    id: string; // 唯一标识符
    timestamp: number; // 创建时间
    userQuery: string; // 用户输入的查询
    modifications: Modification[]; // 该次操作的所有修改
    description?: string; // 可选的描述信息
}

export interface Eddy {
    id: string;
    name: string;
    domain: string;
    modificationGroups: ModificationGroup[]; // 分组数组
    lastUsed: boolean;
    createdAt: number;
    updatedAt: number;
    draftContent?: string;
} 