import { Eddy } from '../types/eddy';
import { Modification } from '../types/index';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
    private static readonly STORAGE_KEY = 'eddy_eddys';

    // 保存所有 Eddy
    static async saveEddys(eddys: Eddy[]): Promise<void> {
        await chrome.storage.local.set({ [this.STORAGE_KEY]: eddys });
    }

    // 获取所有 Eddy
    static async getEddys(): Promise<Eddy[]> {
        const result = await chrome.storage.local.get(this.STORAGE_KEY);
        return result[this.STORAGE_KEY] || [];
    }

    // 获取特定域名的 Eddy
    static async getEddysByDomain(domain: string): Promise<Eddy[]> {
        const eddys = await this.getEddys();
        return eddys.filter(eddy => eddy.domain === domain);
    }

    // 获取特定域名的最近使用的 Eddy
    static async getLastUsedEddy(domain: string): Promise<Eddy | null> {
        const eddys = await this.getEddysByDomain(domain);
        return eddys.find(eddy => eddy.lastUsed) || null;
    }

    // 创建新的 Eddy
    static async createEddy(name: string, domain: string, modifications: Modification[]): Promise<Eddy> {
        const eddys = await this.getEddys();
        
        // 如果新 Eddy 是最近使用的，将同一域名的其他 Eddy 的 lastUsed 设为 false
        eddys.forEach(eddy => {
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

        eddys.push(newEddy);
        await this.saveEddys(eddys);
        
        return newEddy;
    }

    // 更新 Eddy
    static async updateEddy(updatedEddy: Eddy): Promise<void> {
        const eddys = await this.getEddys();
        const index = eddys.findIndex(e => e.id === updatedEddy.id);
        
        if (index !== -1) {
            // 如果更新为最近使用，将同一域名的其他 Eddy 的 lastUsed 设为 false
            if (updatedEddy.lastUsed) {
                eddys.forEach(eddy => {
                    if (eddy.domain === updatedEddy.domain && eddy.id !== updatedEddy.id) {
                        eddy.lastUsed = false;
                    }
                });
            }
            
            eddys[index] = {
                ...updatedEddy,
                updatedAt: Date.now()
            };
            await this.saveEddys(eddys);
        }
    }

    // 删除 Eddy
    static async deleteEddy(eddyId: string): Promise<void> {
        const eddys = await this.getEddys();
        const filteredEddys = eddys.filter(e => e.id !== eddyId);
        await this.saveEddys(filteredEddys);
    }
} 