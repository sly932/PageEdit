# Eddy History Management Plan - 按Apply操作分组的历史记录改造

## 问题分析

### 当前问题
1. **混合的modifications**: 当前Eddy中的modifications是一个扁平的数组，多次apply操作产生的modifications混合在一起
2. **不精确的undo**: 每次undo只能撤销一个modification，而不是一次完整的apply操作
3. **历史记录不清晰**: 无法区分哪些modifications属于同一次apply操作

### 目标
1. **分组管理**: 将modifications改为list of list结构，每个子list代表一次apply操作
2. **精确undo**: 每次undo撤销一次完整的apply操作（包含多个modifications）
3. **清晰历史**: 能够清楚地追踪每次apply操作的内容

## 改造计划

### 1. 数据结构改造

#### 1.1 Eddy类型定义更新
```typescript
// 当前结构
interface Eddy {
    id: string;
    name: string;
    domain: string;
    modifications: Modification[]; // 扁平数组
    createdAt: number;
    updatedAt: number;
}

// 新结构
interface Eddy {
    id: string;
    name: string;
    domain: string;
    modificationGroups: ModificationGroup[]; // 分组数组
    createdAt: number;
    updatedAt: number;
}

interface ModificationGroup {
    id: string; // 唯一标识符
    timestamp: number; // 创建时间
    userQuery: string; // 用户输入的查询
    modifications: Modification[]; // 该次操作的所有修改
    description?: string; // 可选的描述信息
}
```

#### 1.2 样式元素管理改造
```typescript
// 当前样式元素管理
(window as any).__pageEditStyleElements = [];

// 新样式元素管理 - 按组管理
(window as any).__pageEditStyleElementGroups = [
    {
        groupId: "group_1",
        styleElements: [styleElement1, styleElement2],
        timestamp: 1234567890
    },
    {
        groupId: "group_2", 
        styleElements: [styleElement3],
        timestamp: 1234567891
    }
];
```

### 2. StyleService改造

#### 2.1 新增方法
```typescript
export class StyleService {
    // 开始一个新的修改组
    static startModificationGroup(userQuery: string): string {
        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 初始化样式元素组
        (window as any).__pageEditStyleElementGroups = 
            (window as any).__pageEditStyleElementGroups || [];
        
        (window as any).__pageEditStyleElementGroups.push({
            groupId,
            styleElements: [],
            timestamp: Date.now(),
            userQuery
        });
        
        return groupId;
    }

    // 结束当前修改组
    static endModificationGroup(): void {
        // 可以在这里添加验证逻辑
        console.log('[StyleService] Current modification group ended');
    }

    // 应用修改（更新版本）
    static applyModification(
        modification: Pick<Modification, 'target' | 'property' | 'value' | 'method'>,
        groupId?: string
    ): boolean {
        try {
            const currentGroup = this.getCurrentModificationGroup(groupId);
            if (!currentGroup) {
                console.error('[StyleService] No active modification group');
                return false;
            }

            let success = false;
            switch (modification.method) {
                case 'style':
                    success = this.modifyByCSSRule(modification, currentGroup.groupId);
                    break;
                case 'DOM':
                    const elements = Array.from(document.querySelectorAll(modification.target)) as HTMLElement[];
                    success = elements.every(element => this.modifyStyle(element, modification.property, modification.value));
                    break;
                default:
                    console.warn('Unknown modification method:', modification.method);
                    return false;
            }

            return success;
        } catch (error) {
            console.error('Modification failed:', error);
            return false;
        }
    }

    // 获取当前修改组
    private static getCurrentModificationGroup(groupId?: string): any {
        const groups = (window as any).__pageEditStyleElementGroups || [];
        if (groupId) {
            return groups.find((group: any) => group.groupId === groupId);
        }
        return groups[groups.length - 1]; // 返回最后一个组
    }

    // 撤销最后一次apply操作
    static undoLastModificationGroup(): boolean {
        try {
            const groups = (window as any).__pageEditStyleElementGroups || [];
            if (groups.length === 0) {
                return false;
            }

            const lastGroup = groups.pop();
            console.log('[StyleService] Undoing modification group:', lastGroup.groupId);

            // 移除该组的所有样式元素
            lastGroup.styleElements.forEach((element: HTMLStyleElement) => {
                if (element && element.parentNode) {
                    element.remove();
                }
            });

            return true;
        } catch (error) {
            console.error('[StyleService] Error undoing modification group:', error);
            return false;
        }
    }

    // 一键还原所有修改
    static resetAllModifications(): boolean {
        try {
            console.log('[StyleService] Resetting all modifications');
            
            const groups = (window as any).__pageEditStyleElementGroups || [];
            console.log('[StyleService] Found', groups.length, 'modification groups');
            
            // 移除所有组的样式元素
            groups.forEach((group: any) => {
                group.styleElements.forEach((element: HTMLStyleElement) => {
                    if (element && element.parentNode) {
                        element.remove();
                    }
                });
            });
            
            // 清空所有组
            (window as any).__pageEditStyleElementGroups = [];
            
            // 处理Shadow DOM中的样式元素（保持原有逻辑）
            const shadowRoots = document.querySelectorAll('*');
            let shadowStyleCount = 0;
            
            shadowRoots.forEach(element => {
                if (element.shadowRoot) {
                    const shadowStyleElements = (element.shadowRoot as any).__pageEditStyleElements || [];
                    shadowStyleCount += shadowStyleElements.length;
                    
                    shadowStyleElements.forEach((styleElement: HTMLStyleElement) => {
                        if (styleElement && styleElement.parentNode) {
                            styleElement.remove();
                        }
                    });
                    (element.shadowRoot as any).__pageEditStyleElements = [];
                }
            });
            
            console.log('[StyleService] Removed', shadowStyleCount, 'style elements from Shadow DOMs');
            console.log('[StyleService] All modifications reset successfully');
            
            return true;
        } catch (error) {
            console.error('[StyleService] Reset all modifications failed:', error);
            return false;
        }
    }
}
```

### 3. ContentManager改造

#### 3.1 handleModifyPage方法更新
```typescript
private async handleModifyPage(message: Message): Promise<void> {
    try {
        // 解析用户输入
        const parseResult = await this.parseUserInput(message.data.text);
        if (!parseResult.success) {
            throw new Error(parseResult.error || 'Failed to parse user input');
        }

        // 开始新的修改组
        const groupId = StyleService.startModificationGroup(message.data.text);
        console.log('[content] Started modification group:', groupId);

        // 应用所有修改
        for (const modification of parseResult.modifications) {
            try {
                const success = StyleService.applyModification(modification, groupId);
                if (!success) {
                    throw new Error(`Failed to apply modification: ${modification.property}`);
                }
            } catch (error) {
                console.error('Failed to apply modification:', error);
                throw error;
            }
        }

        // 结束修改组
        StyleService.endModificationGroup();
        console.log('[content] Completed modification group:', groupId);

    } catch (error) {
        console.error('Failed to handle page modification:', error);
        throw error;
    }
}
```

#### 3.2 undoLastModification方法更新
```typescript
private undoLastModification(): boolean {
    try {
        // 撤销最后一次修改组（包含多个modifications）
        return StyleService.undoLastModificationGroup();
    } catch (error) {
        console.error('[content] Error undoing modification:', error);
        return false;
    }
}
```

### 4. Eddy应用逻辑改造

#### 4.1 applyEddy方法更新
```typescript
static async applyEddy(eddy: Eddy): Promise<boolean> {
    try {
        let allSuccess = true;
        
        // 处理新的分组结构
        if (eddy.modificationGroups) {
            for (const group of eddy.modificationGroups) {
                // 开始新的修改组
                const groupId = StyleService.startModificationGroup(group.userQuery);
                
                for (const modification of group.modifications) {
                    const success = this.applyModification(modification, groupId);
                    if (!success) {
                        allSuccess = false;
                        console.warn(`Failed to apply modification: ${JSON.stringify(modification)}`);
                    }
                }
                
                // 结束修改组
                StyleService.endModificationGroup();
            }
        } else {
            // 兼容旧版本：处理扁平的modifications数组
            for (const modification of eddy.modifications) {
                const success = this.applyModification(modification);
                if (!success) {
                    allSuccess = false;
                    console.warn(`Failed to apply modification: ${JSON.stringify(modification)}`);
                }
            }
        }
        
        return allSuccess;
    } catch (error) {
        console.error('Failed to apply eddy:', error);
        return false;
    }
}
```

### 5. 数据迁移策略

#### 5.1 向后兼容
```typescript
// 在Eddy类型中添加兼容性处理
interface Eddy {
    id: string;
    name: string;
    domain: string;
    modificationGroups?: ModificationGroup[]; // 新结构
    modifications?: Modification[]; // 旧结构（兼容性）
    createdAt: number;
    updatedAt: number;
}

// 迁移函数
function migrateEddyToNewFormat(eddy: Eddy): Eddy {
    if (eddy.modificationGroups) {
        // 已经是新格式
        return eddy;
    }
    
    if (eddy.modifications && eddy.modifications.length > 0) {
        // 需要迁移：将扁平的modifications转换为单个group
        return {
            ...eddy,
            modificationGroups: [{
                id: `migrated_${eddy.id}_${Date.now()}`,
                timestamp: eddy.createdAt,
                userQuery: 'Migrated from old format',
                modifications: eddy.modifications
            }],
            modifications: undefined // 清除旧字段
        };
    }
    
    // 空Eddy
    return {
        ...eddy,
        modificationGroups: []
    };
}
```

### 6. UI改进建议

#### 6.1 历史记录显示
```typescript
// 在面板中显示修改历史
interface ModificationHistoryItem {
    groupId: string;
    timestamp: number;
    userQuery: string;
    modificationCount: number;
    description: string;
}

// 历史记录组件示例
function ModificationHistory({ eddy }: { eddy: Eddy }) {
    const historyItems: ModificationHistoryItem[] = eddy.modificationGroups?.map(group => ({
        groupId: group.id,
        timestamp: group.timestamp,
        userQuery: group.userQuery,
        modificationCount: group.modifications.length,
        description: `${group.modifications.length} modifications applied`
    })) || [];

    return (
        <div className="modification-history">
            <h3>Modification History</h3>
            {historyItems.map(item => (
                <div key={item.groupId} className="history-item">
                    <div className="history-header">
                        <span className="timestamp">
                            {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="count">{item.modificationCount} changes</span>
                    </div>
                    <div className="user-query">{item.userQuery}</div>
                </div>
            ))}
        </div>
    );
}
```

## 实施步骤

### 阶段1：数据结构改造
1. 更新Eddy类型定义
2. 实现数据迁移函数
3. 更新StyleService的样式元素管理

### 阶段2：核心逻辑改造
1. 更新StyleService的applyModification方法
2. 实现分组管理方法
3. 更新ContentManager的handleModifyPage方法

### 阶段3：Undo逻辑改造
1. 更新undoLastModification方法
2. 测试分组撤销功能
3. 确保resetAllModifications正常工作

### 阶段4：兼容性处理
1. 实现向后兼容逻辑
2. 测试旧版本Eddy的加载
3. 验证数据迁移功能

### 阶段5：测试和优化
1. 全面测试新功能
2. 性能优化
3. 错误处理完善

## 预期效果

1. **精确的undo操作**: 每次undo撤销一次完整的apply操作
2. **清晰的历史记录**: 可以追踪每次apply操作的内容和用户查询
3. **更好的用户体验**: 用户能够理解每次操作的影响范围
4. **向后兼容**: 旧版本的Eddy数据仍然可以正常使用

## 风险考虑

1. **数据迁移风险**: 需要确保旧数据能够正确迁移
2. **性能影响**: 分组管理可能带来轻微的性能开销
3. **复杂性增加**: 代码逻辑变得更加复杂，需要更多的测试
4. **存储空间**: 新的数据结构可能占用更多存储空间

## 后续优化方向

1. **可视化历史**: 在UI中显示修改历史
2. **选择性撤销**: 允许用户选择撤销特定的修改组
3. **修改组合并**: 自动合并相似的修改组
4. **性能优化**: 优化大量修改组的处理性能 