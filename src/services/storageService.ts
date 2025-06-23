import { Eddy } from '../types/eddy';
import { Modification } from '../types/index';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
    private static readonly STORAGE_KEY = 'eddy_eddys';

    // 保存所有 Eddy
    static async saveEddys(eddys: Eddy[]): Promise<void> {
        console.log('[StorageService] Saving eddys:', eddys.length, 'items');
        await chrome.storage.local.set({ [this.STORAGE_KEY]: eddys });
        console.log('[StorageService] Eddys saved successfully');
    }

    // 获取所有 Eddy
    static async getEddys(): Promise<Eddy[]> {
        console.log('[StorageService] Getting all eddys');
        const result = await chrome.storage.local.get(this.STORAGE_KEY);
        const eddys = result[this.STORAGE_KEY] || [];
        console.log('[StorageService] Retrieved eddys:', eddys.length, 'items');
        return eddys;
    }

    // 获取特定域名的 Eddy
    static async getEddysByDomain(domain: string): Promise<Eddy[]> {
        console.log('[StorageService] Getting eddys for domain:', domain);
        const eddys = await this.getEddys();
        const filteredEddys = eddys.filter(eddy => eddy.domain === domain);
        console.log('[StorageService] Found eddys for domain:', domain, ':', filteredEddys.length, 'items\n', filteredEddys);
        return filteredEddys;
    }

    // 获取特定域名的最近使用的 Eddy
    static async getLastUsedEddy(domain: string): Promise<Eddy | null> {
        console.log('[StorageService] Getting last used eddy for domain:', domain);
        const eddys = await this.getEddysByDomain(domain);
        
        // 如果该域名没有任何 Eddy，直接返回 null
        if (eddys.length === 0) {
            console.log('[StorageService] No eddys found for domain:', domain);
            return null;
        }
        
        // 查找 lastUsed 为 true 的 Eddy
        let lastUsedEddy = eddys.find(eddy => eddy.lastUsed);
        
        // 如果没有找到 lastUsed 为 true 的 Eddy（可能是代码错误），
        // 则将最近更新的 Eddy 设置为 lastUsed
        if (!lastUsedEddy) {
            console.log('[StorageService] No lastUsed eddy found, setting most recently updated eddy as lastUsed');
            
            // 按 updatedAt 排序，找到最近更新的 Eddy
            const sortedEddys = [...eddys].sort((a, b) => b.updatedAt - a.updatedAt);
            lastUsedEddy = sortedEddys[0];
            
            // 将该 Eddy 设置为 lastUsed
            lastUsedEddy.lastUsed = true;
            
            // 将同一域名的其他 Eddy 的 lastUsed 设为 false
            eddys.forEach(eddy => {
                if (eddy.id !== lastUsedEddy!.id) {
                    eddy.lastUsed = false;
                }
            });
            
            // 保存更新后的 Eddy 列表
            await this.saveEddys(await this.getEddys());
            
            console.log('[StorageService] Set eddy as lastUsed:', lastUsedEddy.name, '(ID:', lastUsedEddy.id, ')');
        }
        
        console.log('[StorageService] Last used eddy for domain:', domain, ':', lastUsedEddy.name, '(ID:', lastUsedEddy.id, ')');
        return lastUsedEddy;
    }

    // 创建新的 Eddy
    static async createEddy(name: string, domain: string, modifications: Modification[]): Promise<Eddy> {
        console.log('[StorageService] Creating new eddy:', name, 'for domain:', domain);
        const eddys = await this.getEddys();
        
        // 如果新 Eddy 是最近使用的，将同一域名的其他 Eddy 的 lastUsed 设为 false
        let updatedCount = 0;
        eddys.forEach(eddy => {
            if (eddy.domain === domain) {
                eddy.lastUsed = false;
                updatedCount++;
            }
        });
        if (updatedCount > 0) {
            console.log('[StorageService] Reset lastUsed for', updatedCount, 'existing eddys in domain:', domain);
        }

        const newEddy: Eddy = {
            id: uuidv4(),
            name,
            domain,
            modifications,
            lastUsed: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        eddys.push(newEddy);
        await this.saveEddys(eddys);
        
        console.log('[StorageService] New eddy created successfully:', newEddy.id);
        return newEddy;
    }

    // 更新 Eddy
    static async updateEddy(updatedEddy: Eddy): Promise<void> {
        console.log('[StorageService] Updating eddy:', updatedEddy.id, 'name:', updatedEddy.name);
        const eddys = await this.getEddys();
        const index = eddys.findIndex(e => e.id === updatedEddy.id);
        
        if (index !== -1) {
            // 如果更新为最近使用，将同一域名的其他 Eddy 的 lastUsed 设为 false
            if (updatedEddy.lastUsed) {
                let resetCount = 0;
                eddys.forEach(eddy => {
                    if (eddy.domain === updatedEddy.domain && eddy.id !== updatedEddy.id) {
                        eddy.lastUsed = false;
                        resetCount++;
                    }
                });
                if (resetCount > 0) {
                    console.log('[StorageService] Reset lastUsed for', resetCount, 'other eddys in domain:', updatedEddy.domain);
                }
            }
            
            eddys[index] = {
                ...updatedEddy,
                updatedAt: Date.now()
            };
            await this.saveEddys(eddys);
            console.log('[StorageService] Eddy updated successfully');
        } else {
            console.warn('[StorageService] Eddy not found for update:', updatedEddy.id);
        }
    }

    // 删除 Eddy
    static async deleteEddy(eddyId: string): Promise<void> {
        console.log('[StorageService] Deleting eddy:', eddyId);
        const eddys = await this.getEddys();
        const filteredEddys = eddys.filter(e => e.id !== eddyId);
        if (filteredEddys.length < eddys.length) {
            await this.saveEddys(filteredEddys);
            console.log('[StorageService] Eddy deleted successfully');
        } else {
            console.warn('[StorageService] Eddy not found for deletion:', eddyId);
        }
    }
} 