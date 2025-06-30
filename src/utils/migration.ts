import { Eddy, StyleElementSnapshot } from '../types/eddy';
import { Modification } from '../types';

/**
 * 数据迁移工具
 * 将旧版本的Eddy数据转换为新格式
 */

/**
 * 迁移函数：将旧版本的Eddy转换为新格式
 * @param eddy 旧版本的Eddy对象
 * @returns 新格式的Eddy对象
 */
export function migrateEddyToNewFormat(eddy: Eddy): Eddy {
    // 如果已经是新格式，直接返回
    if (eddy.currentStyleElements !== undefined) {
        return eddy;
    }

    // 处理旧版本的modifications
    if ((eddy as any).modifications && (eddy as any).modifications.length > 0) {
        // 将modifications转换为样式元素快照
        const styleElements: StyleElementSnapshot[] = [];
        const groupedModifications = groupModificationsBySelector((eddy as any).modifications);
        
        for (const [selector, modifications] of Object.entries(groupedModifications)) {
            const cssText = generateCSSText(selector, modifications);
            const cssPropertyMap = generateCSSPropertyMap(modifications);
            const snapshot: StyleElementSnapshot = {
                id: `migrated_${eddy.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                selector,
                cssText,
                cssPropertyMap,
                timestamp: eddy.createdAt
            };
            styleElements.push(snapshot);
        }

        return {
            ...eddy,
            currentStyleElements: styleElements,
            // 清除旧字段
            modifications: undefined as any,
            modificationGroups: undefined as any
        } as Eddy;
    }

    // 处理旧版本的modificationGroups
    if ((eddy as any).modificationGroups && (eddy as any).modificationGroups.length > 0) {
        // 将modificationGroups转换为样式元素快照
        const styleElements: StyleElementSnapshot[] = [];
        const allModifications: Modification[] = [];
        
        // 收集所有modificationGroups中的modifications
        (eddy as any).modificationGroups.forEach((group: any) => {
            if (group.modifications && Array.isArray(group.modifications)) {
                allModifications.push(...group.modifications);
            }
        });
        
        if (allModifications.length > 0) {
            const groupedModifications = groupModificationsBySelector(allModifications);
            
            for (const [selector, modifications] of Object.entries(groupedModifications)) {
                const cssText = generateCSSText(selector, modifications);
                const cssPropertyMap = generateCSSPropertyMap(modifications);
                const snapshot: StyleElementSnapshot = {
                    id: `migrated_${eddy.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    selector,
                    cssText,
                    cssPropertyMap,
                    timestamp: eddy.createdAt
                };
                styleElements.push(snapshot);
            }
        }

        return {
            ...eddy,
            currentStyleElements: styleElements,
            // 清除旧字段
            modifications: undefined as any,
            modificationGroups: undefined as any
        } as Eddy;
    }

    // 空Eddy
    return {
        ...eddy,
        currentStyleElements: []
    } as Eddy;
}

/**
 * 按选择器分组modifications
 * @param modifications 修改数组
 * @returns 按选择器分组的修改
 */
function groupModificationsBySelector(modifications: Modification[]): Record<string, Modification[]> {
    const grouped: Record<string, Modification[]> = {};
    
    modifications.forEach(mod => {
        if (!grouped[mod.target]) {
            grouped[mod.target] = [];
        }
        grouped[mod.target].push(mod);
    });
    
    return grouped;
}

/**
 * 生成CSS文本
 * @param selector CSS选择器
 * @param modifications 修改数组
 * @returns CSS文本
 */
function generateCSSText(selector: string, modifications: Modification[]): string {
    const properties = modifications.map(mod => `${mod.property}: ${mod.value};`).join(' ');
    return `${selector} { ${properties} }`;
}

/**
 * 生成CSS属性映射
 * @param modifications 修改数组
 * @returns CSS属性映射
 */
function generateCSSPropertyMap(modifications: Modification[]): Record<string, string> {
    const cssPropertyMap: Record<string, string> = {};
    
    modifications.forEach(mod => {
        cssPropertyMap[mod.property] = mod.value;
    });
    
    return cssPropertyMap;
}

/**
 * 批量迁移Eddy数组
 * @param eddys Eddy数组
 * @returns 迁移后的Eddy数组
 */
export function migrateEddysToNewFormat(eddys: Eddy[]): Eddy[] {
    return eddys.map(eddy => migrateEddyToNewFormat(eddy));
}

/**
 * 检查Eddy是否需要迁移
 * @param eddy Eddy对象
 * @returns 是否需要迁移
 */
export function needsMigration(eddy: Eddy): boolean {
    return eddy.currentStyleElements === undefined;
} 