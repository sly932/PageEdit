import { Eddy, Modification } from '../types/eddy';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
    private static readonly STORAGE_KEY = 'edith_eddies';

    // 保存所有 Eddy
    static async saveEddies(eddies: Eddy[]): Promise<void> {
        await chrome.storage.local.set({ [this.STORAGE_KEY]: eddies });
    }

    // 获取所有 Eddy
    static async getEddies(): Promise<Eddy[]> {
        const result = await chrome.storage.local.get(this.STORAGE_KEY);
        return result[this.STORAGE_KEY] || [];
    }

    // 获取特定域名的 Eddy
    static async getEddiesByDomain(domain: string): Promise<Eddy[]> {
        const eddies = await this.getEddies();
        return eddies.filter(eddy => eddy.domain === domain);
    }

    // 获取特定域名的最近使用的 Eddy
    static async getLastUsedEddy(domain: string): Promise<Eddy | null> {
        const eddies = await this.getEddiesByDomain(domain);
        return eddies.find(eddy => eddy.lastUsed) || null;
    }

    // 创建新的 Eddy
    static async createEddy(name: string, domain: string, modifications: Modification[]): Promise<Eddy> {
        const eddies = await this.getEddies();
        
        // 如果新 Eddy 是最近使用的，将同一域名的其他 Eddy 的 lastUsed 设为 false
        eddies.forEach(eddy => {
            if (eddy.domain === domain) {
                eddy.lastUsed = false;
            }
        });

        const newEddy: Eddy = {
            id: uuidv4(),
            name,
            domain,
            modifications,
            lastUsed: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        eddies.push(newEddy);
        await this.saveEddies(eddies);
        
        return newEddy;
    }

    // 更新 Eddy
    static async updateEddy(updatedEddy: Eddy): Promise<void> {
        const eddies = await this.getEddies();
        const index = eddies.findIndex(e => e.id === updatedEddy.id);
        
        if (index !== -1) {
            // 如果更新为最近使用，将同一域名的其他 Eddy 的 lastUsed 设为 false
            if (updatedEddy.lastUsed) {
                eddies.forEach(eddy => {
                    if (eddy.domain === updatedEddy.domain && eddy.id !== updatedEddy.id) {
                        eddy.lastUsed = false;
                    }
                });
            }
            
            eddies[index] = {
                ...updatedEddy,
                updatedAt: Date.now()
            };
            await this.saveEddies(eddies);
        }
    }

    // 删除 Eddy
    static async deleteEddy(eddyId: string): Promise<void> {
        const eddies = await this.getEddies();
        const filteredEddies = eddies.filter(e => e.id !== eddyId);
        await this.saveEddies(filteredEddies);
    }
} 